import { 
  startAuthentication, 
  startRegistration,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
} from '@simplewebauthn/browser';

interface PasskeyError extends Error {
  code?: string;
  details?: any;
}

interface VerificationResponse {
  verified: boolean;
  error?: string;
  userId?: string;
}

const fetchWithTimeout = async (url: string, options: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const passkeyService = {
  apiUrl: '/.netlify/functions/passkey-authenticate',

  isPasskeyAvailable(): boolean {
    try {
      return window.PublicKeyCredential !== undefined &&
             window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== undefined;
    } catch (error) {
      console.error('Error checking passkey availability:', error);
      return false;
    }
  },

  async checkPasskeySupport(): Promise<boolean> {
    try {
      const available = this.isPasskeyAvailable();
      if (!available) {
        return false;
      }
      return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      console.error('Error checking platform authenticator:', error);
      return false;
    }
  },

  async registerPasskey(userId: string, username: string): Promise<boolean> {
    try {
      console.log('Starting passkey registration for:', { userId, username });
      
      const supported = await this.checkPasskeySupport();
      if (!supported) {
        throw this.createError('PASSKEY_NOT_SUPPORTED', 'Platform authenticator not supported');
      }
      
      const options = await this.getRegistrationOptions(userId, username);
      console.log('Registration options received:', options);
      
      const registrationResponse = await this.createCredential(options);
      console.log('Browser registration response:', registrationResponse);
      
      const verification = await this.verifyRegistration(userId, registrationResponse);
      console.log('Registration verification result:', verification);

      return verification.verified;
    } catch (error) {
      console.error('Registration error:', error);
      throw this.handleError(error);
    }
  },

  async getAuthenticationOptions(): Promise<PublicKeyCredentialRequestOptionsJSON> {
    try {
      console.log('Getting authentication options');
      
      const response = await fetch(`${this.apiUrl}/authenticate/options`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get authentication options:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw this.createError('OPTIONS_ERROR', `Failed to get authentication options: ${response.status}`);
      }

      const options = await response.json();
      console.log('Received authentication options:', options);
      return options;
    } catch (error) {
      console.error('Error in getAuthenticationOptions:', error);
      throw this.handleError(error);
    }
  },

  async authenticateWithPasskey(): Promise<{ userId: string; verified: boolean }> {
    try {
      console.log('Starting passkey authentication');
      
      const supported = await this.checkPasskeySupport();
      if (!supported) {
        throw this.createError('PASSKEY_NOT_SUPPORTED', 'Platform authenticator not supported');
      }

      const options = await this.getAuthenticationOptions();
      const authResponse = await startAuthentication(options);
      
      const verificationResponse = await fetch(`${this.apiUrl}/authenticate/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ authentication: authResponse })
      });

      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        throw this.createError('VERIFICATION_ERROR', `Authentication verification failed: ${errorText}`);
      }

      const result = await verificationResponse.json();
      return result;
    } catch (error) {
      console.error('Authentication error:', error);
      throw this.handleError(error);
    }
  },

  getRegistrationOptions(userId: string, username: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    return fetch(`${this.apiUrl}/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, username })
    }).then(response => {
      if (!response.ok) {
        return response.text().then(error => {
          throw this.createError('OPTIONS_ERROR', 'Failed to get registration options', error);
        });
      }
      return response.json();
    });
  },

  createCredential(options: PublicKeyCredentialCreationOptionsJSON): Promise<RegistrationResponseJSON> {
    try {
      return startRegistration(options);
    } catch (error) {
      throw this.createError('CREDENTIAL_ERROR', 'Failed to create credential', error);
    }
  },

  verifyRegistration(userId: string, registration: RegistrationResponseJSON): Promise<VerificationResponse> {
    return fetch(`${this.apiUrl}/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, registration })
    }).then(response => {
      if (!response.ok) {
        return response.text().then(error => {
          throw this.createError('VERIFICATION_ERROR', 'Failed to verify registration', error);
        });
      }
      return response.json();
    });
  },

  createError(code: string, message: string, details?: any): PasskeyError {
    const error = new Error(message) as PasskeyError;
    error.code = code;
    error.details = details;
    return error;
  },

  handleError(error: any): PasskeyError {
    if (error.code && error.message) {
      return error as PasskeyError;
    }
    
    if (error.name === 'NotAllowedError') {
      return this.createError('USER_CANCELLED', 'Operation cancelled by user');
    }
    if (error.name === 'SecurityError') {
      return this.createError('SECURITY_ERROR', 'Security error occurred');
    }
    
    return this.createError('UNKNOWN_ERROR', error.message || 'An unknown error occurred', error);
  }
};

export { passkeyService };