import { db } from '../../config/firebase';
import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';

interface PasskeyCredential {
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  transports?: AuthenticatorTransport[];
  userId: string;
  createdAt: Date;
}

class PasskeyFirebaseService {
  private readonly COLLECTION = 'passkeys';

  async saveCredential(credential: PasskeyCredential) {
    try {
      const docRef = doc(collection(db, this.COLLECTION), credential.credentialID);
      await setDoc(docRef, {
        ...credential,
        createdAt: new Date()
      });
      return credential.credentialID;
    } catch (error) {
      console.error('Error saving passkey:', error);
      throw new Error('Failed to save passkey');
    }
  }

  async getCredentialsByUser(userId: string) {
    try {
      const q = query(collection(db, this.COLLECTION), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as PasskeyCredential);
    } catch (error) {
      console.error('Error getting passkeys:', error);
      throw new Error('Failed to get passkeys');
    }
  }
}

export const passkeyFirebase = new PasskeyFirebaseService();