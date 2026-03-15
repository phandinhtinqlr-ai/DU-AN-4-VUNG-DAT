import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

const provider = new GoogleAuthProvider();

export const authService = {
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create default profile for new user (as Editor)
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          role: 'editor',
          status: 'Active',
          department: 'Chưa phân bổ',
          createdAt: new Date().toISOString()
        };
        
        // Special case for the admin email
        if (user.email === 'phandinhtinqlr@gmail.com') {
          newProfile.role = 'admin';
        }
        
        await setDoc(docRef, newProfile);
        return newProfile;
      }
      
      const profile = docSnap.data() as UserProfile;
      if (profile.status === 'Locked') {
        await signOut(auth);
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Manager.');
      }
      
      return profile;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async logout() {
    await signOut(auth);
  },

  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};
