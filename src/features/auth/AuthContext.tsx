import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { AgeBracket, AppUser } from '@/types/domain';
import { firebaseAuth } from '@/lib/firebase';
import {
  getUserProfile,
  resolveRoleForEmail,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  upsertUserProfileFromAuth,
} from './auth.service';

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (payload: { email: string; password: string }) => Promise<void>;
  signUp: (payload: {
    email: string;
    password: string;
    displayName: string;
    ageBracket: AgeBracket;
    genrePreferences?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser === null) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        await upsertUserProfileFromAuth({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Reader',
        });
      } catch {
        // Ignore Firestore profile write failure; we can still keep auth session active.
      }

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        setUser(
          profile ?? {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? 'Reader',
            role: resolveRoleForEmail(firebaseUser.email),
            ageBracket: 'adult',
            subscriptionTier: 'free',
            genrePreferences: [],
          },
        );
      } catch {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Reader',
          role: resolveRoleForEmail(firebaseUser.email),
          ageBracket: 'adult',
          subscriptionTier: 'free',
          genrePreferences: [],
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshProfile: async () => {
        const firebaseUser = firebaseAuth.currentUser;
        if (firebaseUser === null) {
          setUser(null);
          return;
        }

        const profile = await getUserProfile(firebaseUser.uid);
        setUser(
          profile ?? {
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? 'Reader',
            role: resolveRoleForEmail(firebaseUser.email),
            ageBracket: 'adult',
            subscriptionTier: 'free',
            genrePreferences: [],
          },
        );
      },
      signIn: async (payload) => {
        await signInWithEmail(payload);
      },
      signUp: async (payload) => {
        await signUpWithEmail(payload);
      },
      logout: async () => {
        await signOutUser();
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
