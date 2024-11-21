import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { 
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON
} from '@simplewebauthn/typescript-types';

class PasskeyService {
  private apiUrl: string = '/.netlify/functions/passkey';

  async registerPasskey(userId: string, username: string): Promise<boolean> {
    try {
      // 1. Get registration options from server
      const optionsResponse = await fetch(`${this.apiUrl}/register/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, username })
      });
      
      if (!optionsResponse.ok) {
        const errorText = await optionsResponse.text();
        console.error('Failed to get registration options:', errorText);
        throw new Error('Failed to get registration options');
      }
      
      const options = await optionsResponse.json();

      // 2. Create credentials on device using the browser's WebAuthn API
      const registration = await startRegistration(options);

      // 3. Verify registration with server
      const verificationResponse = await fetch(`${this.apiUrl}/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          registration
        })
      });

      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        console.error('Verification failed:', errorText);
        throw new Error('Verification failed');
      }

      const { verified } = await verificationResponse.json();
      return verified;
    } catch (error) {
      console.error('Passkey registration error:', error);
      throw error;
    }
  }

  async authenticateWithPasskey(): Promise<{ userId: string; verified: boolean }> {
    try {
      const optionsResponse = await fetch(`${this.apiUrl}/authenticate/options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!optionsResponse.ok) {
        throw new Error('Failed to get authentication options');
      }

      const options = await optionsResponse.json();
      const authentication = await startAuthentication(options);

      const verificationResponse = await fetch(`${this.apiUrl}/authenticate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ authentication })
      });

      if (!verificationResponse.ok) {
        throw new Error('Authentication failed');
      }

      return await verificationResponse.json();
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  isPasskeyAvailable(): boolean {
    return window.PublicKeyCredential !== undefined;
  }
}

export const passkeyService = new PasskeyService(); 