import {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} from '@simplewebauthn/server';
import type {
    GenerateRegistrationOptionsOpts,
    VerifyRegistrationResponseOpts,
    AuthenticatorDevice,
    VerifiedRegistrationResponse,
    VerifiedAuthenticationResponse
} from '@simplewebauthn/server';
import { firebasePasskeyService } from './firebase-passkey';

interface AuthenticatorData {
    credentialID: string;
    credentialPublicKey: Uint8Array;
    counter: number;
    transports: string[];
    userId: string; // Add userId to the authenticator data
}

class PasskeyService {
    private rpID: string;
    private rpName: string;
    private origin: string;
    private db: typeof firebasePasskeyService;

    constructor(rpID: string, origin: string) {
        this.rpID = rpID;
        this.rpName = 'CoinConnect';
        this.origin = origin;
        this.db = firebasePasskeyService;
        console.log('PasskeyService initialized with:', { rpID, origin });
    }

    async generateRegistrationOptions(userId: string, username: string) {
        try {
            console.log('Generating registration options for:', { userId, username });

            const options = await generateRegistrationOptions({
                rpName: this.rpName,
                rpID: this.rpID,
                userID: userId,
                userName: username,
                attestationType: 'none',
                authenticatorSelection: {
                    residentKey: 'required',
                    userVerification: 'preferred',
                    authenticatorAttachment: 'platform'
                }
            });

            // Save the challenge for later verification
            await this.db.saveCurrentChallenge(userId, options.challenge);

            console.log('Registration options generated:', options);
            return options;
        } catch (error) {
            console.error('Error generating registration options:', error);
            throw error;
        }
    }

    async verifyRegistration(userId: string, registration: any) {
        try {
            console.log('Verifying registration for:', userId);
            const expectedChallenge = await this.db.getCurrentChallenge(userId);

            if (!expectedChallenge) {
                console.error('No challenge found for user:', userId);
                throw new Error('No challenge found');
            }

            console.log('Verification params:', {
                response: registration,
                expectedChallenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID
            });

            const verification = await verifyRegistrationResponse({
                response: registration,
                expectedChallenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID
            });

            console.log('Verification result:', verification);

            if (verification.verified && verification.registrationInfo) {
                const authenticator: AuthenticatorData = {
                    credentialID: Buffer.from(registration.rawId, 'base64url').toString('base64'),
                    credentialPublicKey: verification.registrationInfo.credentialPublicKey,
                    counter: verification.registrationInfo.counter || 0,
                    transports: registration.response.transports || [],
                    userId // Add userId to the authenticator data
                };

                await this.db.saveAuthenticator(userId, authenticator);
                return { verified: true };
            }

            return { verified: false };
        } catch (error) {
            console.error('Registration verification error:', error);
            if (error.message.includes('RP ID')) {
                return {
                    verified: false,
                    error: 'Invalid domain configuration. Please check your environment settings.'
                };
            }
            return { verified: false, error: error.message };
        }
    }

    async generateAuthenticationOptions() {
        try {
            // Get all authenticators to allow specific credentials
            const options = await generateAuthenticationOptions({
                rpID: this.rpID,
                userVerification: 'preferred',
                timeout: 60000 // Add reasonable timeout
            });

            await this.db.saveCurrentChallenge('authentication', options.challenge);
            console.log('Authentication options generated:', options);
            return options;
        } catch (error) {
            console.error('Error generating authentication options:', error);
            throw error;
        }
    }
    

    async verifyAuthentication(authentication: any) {
        try {
            console.log('Verifying authentication:', authentication);
            const expectedChallenge = await this.db.getCurrentChallenge('authentication');

            if (!expectedChallenge) {
                throw new Error('No challenge found');
            }

            const credentialID = Buffer.from(authentication.rawId, 'base64url').toString('base64');
            const authenticator = await this.db.getAuthenticatorByCredentialID(credentialID);

            if (!authenticator) {
                throw new Error('Authenticator not found');
            }

            const verification = await verifyAuthenticationResponse({
                response: authentication,
                expectedChallenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
                authenticator,
                requireUserVerification: true
            });

            if (verification.verified) {
                await this.db.updateAuthenticatorCounter(
                    credentialID,
                    verification.authenticationInfo.newCounter
                );
                return {
                    verified: true,
                    userId: authenticator.userId
                };
            }

            return { verified: false };
        } catch (error) {
            console.error('Authentication verification error:', error);
            throw error;
        }
    }
}

export default PasskeyService;