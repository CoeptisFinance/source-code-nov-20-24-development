import { auth } from '../../config/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

class FirebaseAuthService {
    async sendVerificationCode(phoneNumber: string) {
        try {
            // Initialize reCAPTCHA verifier
            if (!window.recaptchaVerifier) {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible'
                });
            }

            const formattedNumber = this.formatPhoneNumber(phoneNumber);
            return await signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier);
        } catch (error) {
            console.error('Error sending code:', error);
            throw error;
        }
    }

    private formatPhoneNumber(phone: string): string {
        const cleaned = phone.replace(/\D/g, '');
        return `+1${cleaned.slice(-10)}`;
    }
}

export const firebaseAuth = new FirebaseAuthService();