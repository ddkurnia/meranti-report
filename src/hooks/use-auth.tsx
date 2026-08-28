'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseClientConfigured } from '@/lib/firebase/client';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Fetch with Firebase ID token automatically attached */
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseClientConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && db) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...(userDoc.data() as Record<string, unknown>) } as User);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseClientConfigured) {
      throw new Error('Firebase is not configured. Please set up your environment variables.');
    }
    const credential = await signInWithEmailAndPassword(auth!, email, password);
    if (db) {
      const userDoc = await getDoc(doc(db, 'users', credential.user.uid));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...(userDoc.data() as Record<string, unknown>) } as User);
      }
    }
  };

  const signOut = async () => {
    if (!isFirebaseClientConfigured || !auth) return;
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const fetchWithAuth = useCallback(async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!firebaseUser) {
      return fetch(input, init);
    }
    try {
      const token = await firebaseUser.getIdToken();
      const headers = new Headers(init?.headers);
      headers.set('Authorization', `Bearer ${token}`);
      if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
      return fetch(input, { ...init, headers });
    } catch {
      return fetch(input, init);
    }
  }, [firebaseUser]);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signIn, signOut, fetchWithAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
