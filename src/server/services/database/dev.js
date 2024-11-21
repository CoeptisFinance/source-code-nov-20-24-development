export class DevDatabaseService {
    storage = new Map();
    async saveAuthenticator(userId, authenticator) {
        const userAuths = this.storage.get(`auth_${userId}`) || [];
        userAuths.push(authenticator);
        this.storage.set(`auth_${userId}`, userAuths);
    }
    async getUserAuthenticators(userId) {
        return this.storage.get(`auth_${userId}`) || [];
    }
    async getAuthenticatorByCredentialID(credentialID) {
        for (const [key, value] of this.storage.entries()) {
            if (key.startsWith('auth_')) {
                const authenticators = value;
                const found = authenticators.find(a => a.credentialID === credentialID);
                if (found)
                    return found;
            }
        }
        return null;
    }
    async saveCurrentChallenge(userId, challenge) {
        this.storage.set(`challenge_${userId}`, {
            challenge,
            timestamp: new Date()
        });
    }
    async getCurrentChallenge(userId) {
        const data = this.storage.get(`challenge_${userId}`);
        if (!data)
            return null;
        return data.challenge;
    }
    async updateAuthenticatorCounter(credentialID, newCounter) {
        for (const [key, value] of this.storage.entries()) {
            if (key.startsWith('auth_')) {
                const authenticators = value;
                const auth = authenticators.find(a => a.credentialID === credentialID);
                if (auth) {
                    auth.counter = newCounter;
                    return;
                }
            }
        }
    }
}
export const db = new DevDatabaseService();
