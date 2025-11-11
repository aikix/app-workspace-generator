import { create } from 'zustand';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Auth Store (Zustand)
 *
 * Manages Firebase authentication state with Zustand.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useAuthStore } from '@/stores/useAuthStore';
 * import { useEffect } from 'react';
 *
 * export default function ProfilePage() {
 *   const { user, loading, signOut } = useAuthStore();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Not signed in</div>;
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user.email}!</p>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Initialize auth listener in root layout
 * 'use client';
 *
 * import { useAuthStore } from '@/stores/useAuthStore';
 * import { useEffect } from 'react';
 *
 * export default function RootLayout({ children }) {
 *   const { setUser, setLoading } = useAuthStore();
 *
 *   useEffect(() => {
 *     const unsubscribe = onAuthStateChanged(auth, (user) => {
 *       setUser(user);
 *       setLoading(false);
 *     });
 *
 *     return () => unsubscribe();
 *   }, [setUser, setLoading]);
 *
 *   return <html><body>{children}</body></html>;
 * }
 * ```
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  signInWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
}));

// Initialize auth state listener
// Call this in your root layout or _app file
export function initializeAuthListener() {
  return onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(false);
  });
}
