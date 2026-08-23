import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  Firestore
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore with specific database ID if present
const databaseId = (firebaseConfigJson as { firestoreDatabaseId?: string }).firestoreDatabaseId;
export const firestore: Firestore = databaseId && databaseId !== '(default)'
  ? getFirestore(app, databaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user' | 'guest';
  affiliation?: string;
  isAnonymous?: boolean;
}

export const ADMIN_EMAILS = [
  'admin@csir-immt.res.in',
  'manoj.kumar@csir-immt.res.in',
  'manindra94@gmail.com'
];

/**
 * Determine user role from user object and Firestore document
 */
export async function fetchUserRole(user: User): Promise<'admin' | 'user'> {
  if (!user.email) return 'user';
  if (ADMIN_EMAILS.some((adm) => user.email?.toLowerCase().includes(adm.toLowerCase()))) {
    return 'admin';
  }
  try {
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    if (userDoc.exists() && userDoc.data().role) {
      return userDoc.data().role;
    }
  } catch (e) {
    console.warn('Could not fetch user document for role:', e);
  }
  return 'user';
}

/**
 * Sync user profile to Firestore
 */
export async function syncUserProfile(user: User, roleOverride?: 'admin' | 'user'): Promise<AppUser> {
  const role = roleOverride || (await fetchUserRole(user));
  const userRef = doc(firestore, 'users', user.uid);
  const appUser: AppUser = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Researcher',
    photoURL: user.photoURL,
    role,
    isAnonymous: user.isAnonymous,
    affiliation: role === 'admin' ? 'CSIR-IMMT Senior Scientist' : 'Research Scholar / Visitor'
  };

  try {
    await setDoc(userRef, {
      ...appUser,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving user profile to Firestore:', err);
  }

  return appUser;
}
