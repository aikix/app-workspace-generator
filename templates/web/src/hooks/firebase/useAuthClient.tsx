"use client";

/**
 * Client-side Firebase Authentication Hook
 *
 * Provides real-time auth state and user information.
 * Use in Client Components only.
 */

import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export function useAuthClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase auth is configured
    if (!auth) {
      setError('Firebase is not configured. Please set up your .env.local file.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}

