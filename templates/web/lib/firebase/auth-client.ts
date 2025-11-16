/**
 * Firebase Authentication Client Utilities
 *
 * IMPORTANT: Firebase CLI cannot automatically enable auth providers.
 *
 * TODO: Complete authentication setup in Firebase Console:
 *
 * 1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT_ID/authentication/providers
 *
 * 2. Enable Google Sign-In:
 *    - Click "Google" provider
 *    - Toggle "Enable"
 *    - Add support email
 *    - Save
 *
 * 3. Enable Email Link (Passwordless):
 *    - Click "Email/Password" provider
 *    - Toggle "Enable"
 *    - Toggle "Email link (passwordless sign-in)"
 *    - Save
 *
 * 4. Add Authorized Domains:
 *    - Add your production domain(s)
 *    - localhost is pre-authorized for development
 */

import { auth } from './config';
import {
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
} from 'firebase/auth';

/**
 * Sign in with Google using popup
 */
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return { user: result.user, error: null };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return { user: null, error: error instanceof Error ? error.message : 'Failed to sign in with Google' };
  }
}

/**
 * Send sign-in link to email
 */
export async function sendEmailSignInLink(email: string) {
  try {
    const actionCodeSettings = {
      url: window.location.origin + '/login/verify',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailForSignIn', email);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending email link:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email link',
    };
  }
}

/**
 * Verify and complete email link sign-in
 */
export async function verifyEmailSignInLink() {
  try {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');

      if (!email) {
        // User opened the link on a different device
        email = window.prompt('Please provide your email for confirmation');
      }

      if (!email) {
        throw new Error('Email is required');
      }

      const result = await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');

      return { user: result.user, error: null };
    }

    return { user: null, error: 'Invalid sign-in link' };
  } catch (error) {
    console.error('Email link verification error:', error);
    return {
      user: null,
      error: error instanceof Error ? error.message : 'Failed to verify email link',
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign out',
    };
  }
}

