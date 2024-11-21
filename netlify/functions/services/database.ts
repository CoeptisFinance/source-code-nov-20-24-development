class MemoryDatabase {
  private storage = new Map<string, any>();

  async saveAuthenticator(userId: string, authenticator: any) {
    const userAuths = this.storage.get(`auth_${userId}`) || [];
    userAuths.push(authenticator);
    this.storage.set(`auth_${userId}`, userAuths);
  }

  async getUserAuthenticators(userId: string) {
    return this.storage.get(`auth_${userId}`) || [];
  }

  async getAuthenticatorByCredentialID(credentialID: string) {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('auth_')) {
        const authenticators = value as any[];
        const found = authenticators.find(a => a.credentialID === credentialID);
        if (found) return found;
      }
    }
    return null;
  }

  async saveCurrentChallenge(userId: string, challenge: string) {
    this.storage.set(`challenge_${userId}`, {
      challenge,
      timestamp: new Date()
    });
  }

  async getCurrentChallenge(userId: string) {
    const data = this.storage.get(`challenge_${userId}`);
    if (!data) return null;
    return data.challenge;
  }

  async updateAuthenticatorCounter(credentialID: string, newCounter: number) {
    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith('auth_')) {
        const authenticators = value as any[];
        const auth = authenticators.find(a => a.credentialID === credentialID);
        if (auth) {
          auth.counter = newCounter;
          this.storage.set(`auth_${auth.userId}`, authenticators);
          return;
        }
      }
    }
  }
} 