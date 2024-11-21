import { db, auth } from '../../config/firebase.ts';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  name: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
  hasPasskey: boolean;
}

class UserService {
  async createUser(name: string, phoneNumber: string): Promise<UserProfile> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userProfile = {
      uid: user.uid,
      name,
      phoneNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      hasPasskey: false
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return {
      ...userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: new Date()
    });
  }

  async getUser(uid: string): Promise<UserProfile | null> {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data() as UserProfile : null;
  }
}

export const userService = new UserService(); 