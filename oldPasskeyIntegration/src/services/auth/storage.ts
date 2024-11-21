import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    serverTimestamp
  } from 'firebase/firestore';
  import { db } from '../../config/firebase';
  import { isoBase64URL } from '@simplewebauthn/server/helpers';
  
  class AuthStorage {
    constructor() {
      console.log('AuthStorage initialized');
    }
  
    async saveAuthenticator(userId: string, authenticator: {
      credentialID: string;
      credentialPublicKey: string;
      counter: number;
      transports?: AuthenticatorTransport[];
    }): Promise<void> {
      try {
        console.log('Saving authenticator to database:', { userId, authenticator });
        const docRef = doc(db, 'authenticators', authenticator.credentialID);
        await setDoc(docRef, {
          userId,
          ...authenticator,
          timestamp: serverTimestamp()
        });
        console.log('Authenticator saved successfully to:', docRef.path);
      } catch (error) {
        console.error('Error saving authenticator:', error);
        throw error;
      }
    }
  
    async getAuthenticatorByCredentialID(credentialID: string) {
      try {
        const normalizedCredentialID = isoBase64URL.fromBuffer(
          isoBase64URL.toBuffer(credentialID)
        );
        const docRef = doc(db, 'authenticators', normalizedCredentialID);
        const authenticatorDoc = await getDoc(docRef);
        return authenticatorDoc.exists() ? authenticatorDoc.data() : null;
      } catch (error) {
        console.error('Error getting authenticator:', error);
        throw error;
      }
    }
  
    async saveCurrentChallenge(userId: string, challenge: string): Promise<void> {
      try {
        await setDoc(doc(db, 'challenges', userId), {
          challenge,
          timestamp: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error('Error saving challenge:', error);
        throw error;
      }
    }
  
    async getCurrentChallenge(userId: string): Promise<string | null> {
      try {
        const challengeDoc = await getDoc(doc(db, 'challenges', userId));
        if (!challengeDoc.exists()) return null;
  
        const data = challengeDoc.data();
        const timestamp = data.timestamp?.toDate();
        
        if (!timestamp || Date.now() - timestamp.getTime() > 5 * 60 * 1000) {
          return null;
        }
  
        return data.challenge;
      } catch (error) {
        console.error('Error getting challenge:', error);
        throw error;
      }
    }
  }
  
  export const authStorage = new AuthStorage();