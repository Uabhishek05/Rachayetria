import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firebaseAuth, firestore } from '@/lib/firebase';
import type { AgeBracket, AppUser, UserRole } from '@/types/domain';

const ADMIN_EMAILS = ['uabhishek2005@gmail.com'];

function normalizeEmail(email?: string | null) {
  return (email ?? '').trim().toLowerCase();
}

export function resolveRoleForEmail(email?: string | null): UserRole {
  return ADMIN_EMAILS.includes(normalizeEmail(email)) ? 'admin' : 'user';
}

const toAppUser = (uid: string, data: Partial<AppUser>): AppUser => ({
  uid,
  email: data.email ?? '',
  displayName: data.displayName ?? 'Reader',
  photoURL: data.photoURL,
  role: data.role ?? 'user',
  ageBracket: data.ageBracket ?? 'adult',
  subscriptionTier: data.subscriptionTier ?? 'free',
  genrePreferences: data.genrePreferences ?? [],
});

export async function upsertUserProfileFromAuth(payload: {
  uid: string;
  email: string;
  displayName: string;
}) {
  await setDoc(
    doc(firestore, 'users', payload.uid),
    {
      email: payload.email,
      displayName: payload.displayName,
      role: resolveRoleForEmail(payload.email),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function signUpWithEmail(payload: {
  email: string;
  password: string;
  displayName: string;
  ageBracket: AgeBracket;
  genrePreferences?: string[];
}) {
  const normalizedEmail = normalizeEmail(payload.email);
  const credential = await createUserWithEmailAndPassword(
    firebaseAuth,
    normalizedEmail,
    payload.password,
  );

  await updateProfile(credential.user, { displayName: payload.displayName });
  await setDoc(doc(firestore, 'users', credential.user.uid), {
    email: normalizedEmail,
    displayName: payload.displayName,
    role: resolveRoleForEmail(normalizedEmail),
    ageBracket: payload.ageBracket,
    genrePreferences: payload.genrePreferences ?? [],
    subscriptionTier: 'free',
    createdAt: serverTimestamp(),
  });

  return credential.user;
}

export async function signInWithEmail(payload: { email: string; password: string }) {
  const normalizedEmail = normalizeEmail(payload.email);
  const credential = await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, payload.password);
  try {
    await upsertUserProfileFromAuth({
      uid: credential.user.uid,
      email: credential.user.email ?? normalizedEmail,
      displayName: credential.user.displayName ?? 'Reader',
    });
  } catch {
    // Auth should not fail if Firestore profile sync is blocked by rules.
  }
  return credential.user;
}

export async function signOutUser() {
  await signOut(firebaseAuth);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(firestore, 'users', uid));
  if (snapshot.exists() === false) {
    return null;
  }
  return toAppUser(uid, snapshot.data() as Partial<AppUser>);
}
