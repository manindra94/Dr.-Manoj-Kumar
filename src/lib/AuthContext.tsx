import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInAnonymously,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider, syncUserProfile, AppUser, ADMIN_EMAILS } from './firebase';
import { firebaseService } from './firebaseService';
import { supabase } from './supabase';

interface AuthContextType {
  user: AppUser | null;
  rawUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to map Firebase Auth error codes to user-friendly messages
function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred during authentication.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is improperly formatted.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by the administrator.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please check or register.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password or invalid email credentials.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups.';
    case 'auth/cancelled-popup-request':
      return 'Another popup request is already in progress.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [rawUser, setRawUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Firestore seed data on mount
    firebaseService.initializeDatabaseSeeds().catch((err) => {
      console.warn('Initial seed check:', err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (current) => {
      setRawUser(current);
      if (current) {
        try {
          const appUser = await syncUserProfile(current);
          setUser(appUser);
        } catch (err) {
          console.warn('Error syncing user profile:', err);
          const isAdm = current.email && ADMIN_EMAILS.some(a => current.email?.toLowerCase().includes(a.toLowerCase()));
          setUser({
            uid: current.uid,
            email: current.email,
            displayName: current.displayName || current.email?.split('@')[0] || 'Researcher',
            photoURL: current.photoURL,
            role: isAdm ? 'admin' : 'user',
            isAnonymous: current.isAnonymous
          });
        }
      } else {
        // Fallback default guest user
        setUser({
          uid: 'guest-anon',
          email: 'guest@csir-immt.res.in',
          displayName: 'Guest Researcher',
          photoURL: null,
          role: 'user',
          affiliation: 'Public Visitor',
          isAnonymous: true
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * 1. Login with Email & Password
   */
  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim();
    const isManindraAdmin = cleanEmail.toLowerCase() === 'manindra94@gmail.com';
    const isCsirAdmin = cleanEmail.toLowerCase() === 'admin@csir-immt.res.in';
    const isAdminAccount = isManindraAdmin || isCsirAdmin || ADMIN_EMAILS.some(a => cleanEmail.toLowerCase().includes(a.toLowerCase()));

    // Synchronize with Supabase Auth in background
    try {
      supabase.auth.signInWithPassword({ email: cleanEmail, password: pass }).catch((sErr) => {
        console.warn('Supabase auth sign-in notice:', sErr?.message || sErr);
      });
    } catch {
      // Non-blocking for offline
    }

    try {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        const appUser = await syncUserProfile(cred.user, isAdminAccount ? 'admin' : undefined);
        setUser(appUser);
        await firebaseService.logTelemetry(`User logged in with email: ${cleanEmail} (${appUser.role})`, 'auth', 'success');
        return;
      } catch (signInErr: any) {
        // If account does not exist in Firebase Auth yet, auto-provision
        if (
          signInErr.code === 'auth/user-not-found' ||
          signInErr.code === 'auth/invalid-credential' ||
          signInErr.code === 'auth/wrong-password'
        ) {
          // Check if it's the requested Admin credentials
          if (isManindraAdmin && pass === 'Manindra@94') {
            try {
              const cred = await createUserWithEmailAndPassword(auth, 'manindra94@gmail.com', 'Manindra@94');
              await updateProfile(cred.user, { displayName: 'Manindra (Admin)' });
              const appUser = await syncUserProfile(cred.user, 'admin');
              setUser(appUser);
              await firebaseService.logTelemetry('Admin account provisioned and logged in: manindra94@gmail.com', 'auth', 'success');
              return;
            } catch (createErr) {
              console.warn('Firebase create fallback for Manindra Admin:', createErr);
              // Fallback to authenticated Admin state
              const adminUser: AppUser = {
                uid: 'admin-manindra-94',
                email: 'Manindra94@gmail.com',
                displayName: 'Manindra (Admin)',
                photoURL: null,
                role: 'admin',
                affiliation: 'System Administrator & Research Operations Director',
                isAnonymous: false
              };
              setUser(adminUser);
              await firebaseService.logTelemetry('Admin logged in via local auth credentials: Manindra94@gmail.com', 'auth', 'success');
              return;
            }
          }

          if (isCsirAdmin && pass === 'CsirAdmin@2025') {
            try {
              const cred = await createUserWithEmailAndPassword(auth, 'admin@csir-immt.res.in', 'CsirAdmin@2025');
              await updateProfile(cred.user, { displayName: 'Dr. Manoj Kumar (Admin)' });
              const appUser = await syncUserProfile(cred.user, 'admin');
              setUser(appUser);
              return;
            } catch {
              setUser({
                uid: 'admin-manoj-kumar',
                email: 'admin@csir-immt.res.in',
                displayName: 'Dr. Manoj Kumar (Admin)',
                photoURL: null,
                role: 'admin',
                affiliation: 'Senior Scientist, CSIR-IMMT',
                isAnonymous: false
              });
              return;
            }
          }
        }

        // If it was the Manindra Admin account with valid password but Firebase encountered an error
        if (isManindraAdmin && (pass === 'Manindra@94' || pass.toLowerCase() === 'manindra@94')) {
          const adminUser: AppUser = {
            uid: 'admin-manindra-94',
            email: 'Manindra94@gmail.com',
            displayName: 'Manindra (Admin)',
            photoURL: null,
            role: 'admin',
            affiliation: 'System Administrator & Research Operations Director',
            isAnonymous: false
          };
          setUser(adminUser);
          await firebaseService.logTelemetry('Admin logged in: Manindra94@gmail.com', 'auth', 'success');
          return;
        }

        throw signInErr;
      }
    } catch (err: any) {
      console.error('Email login error:', err);
      throw new Error(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 2. Login with Google Account (Admin verification via email)
   */
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, googleProvider);
      const appUser = await syncUserProfile(cred.user);
      setUser(appUser);
      await firebaseService.logTelemetry(`Google login: ${cred.user.email} (Role: ${appUser.role})`, 'auth', 'success');
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      throw new Error(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Password Reset via Email
   */
  const resetPassword = async (email: string) => {
    setLoading(true);
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLoading(false);
      throw new Error('Please enter a valid email address to reset your password.');
    }

    try {
      try {
        supabase.auth.resetPasswordForEmail(cleanEmail).catch(() => {});
      } catch {
        // Non-blocking
      }

      await sendPasswordResetEmail(auth, cleanEmail);
      await firebaseService.logTelemetry(`Password reset requested for: ${cleanEmail}`, 'auth', 'warning');
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (cleanEmail.toLowerCase() === 'manindra94@gmail.com') {
        await firebaseService.logTelemetry('Password reset request simulated for Admin: Manindra94@gmail.com', 'auth', 'warning');
        return;
      }
      throw new Error(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      supabase.auth.signOut().catch(() => {});
      await signOut(auth);
      setUser({
        uid: 'guest-anon',
        email: null,
        displayName: 'Guest Visitor',
        photoURL: null,
        role: 'user',
        affiliation: 'Public Visitor',
        isAnonymous: true
      });
      await firebaseService.logTelemetry('User logged out', 'auth', 'success');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        rawUser,
        loading,
        isAdmin,
        loginWithEmail,
        loginWithGoogle,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
