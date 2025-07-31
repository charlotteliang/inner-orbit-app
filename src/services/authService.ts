import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { app } from '../config/firebase';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export class AuthService {
  static async signInWithGoogle(): Promise<AuthUser> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked. Please allow pop-ups for this site.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/operation-not-allowed':
        return 'Google sign-in is not enabled. Please contact support.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred during sign-in. Please try again.';
    }
  }
} 