import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const {
    user,
    isAdmin,
    loginWithEmail,
    loginWithGoogle,
    resetPassword,
    logout
  } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthMode('login');
      setError(null);
      setSuccessMsg(null);
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Email & Password / Forgot Password Submit
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'forgot_password') {
        await resetPassword(email);
        setSuccessMsg(`Password reset link sent to ${email}! Please check your inbox.`);
      } else {
        await loginWithEmail(email, password);
        setSuccessMsg('Admin credentials authenticated successfully!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setError(err.message || 'Admin authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Auth Submit
  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    try {
      await loginWithGoogle();
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or encountered an issue.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d1c2d] border border-[#ffc640]/50 shadow-[0_0_40px_rgba(255,198,64,0.15)] p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header with Close */}
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3.5">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
              {authMode === 'forgot_password' ? (
                <>
                  <KeyRound className="w-5 h-5 text-[#ffc640]" />
                  <span className="text-[#ffc640]">Admin Password Recovery</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-[#ffc640]" />
                  <span className="text-[#ffc640]">Administrative CMS Sign In</span>
                </>
              )}
            </h2>
            <p className="text-xs font-mono text-[#c6c6cd]">
              {authMode === 'forgot_password'
                ? 'Send password reset instructions to your administrator email'
                : 'Dr. Manoj Kumar / CSIR-IMMT Portfolio CMS Portal'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2b3c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-3 rounded-xl bg-[#ffc640]/10 border border-[#ffc640]/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#ffc640]">
              <ShieldCheck className="w-4 h-4" />
              <span>Full Website Management Access</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ffc640]/20 text-[#ffc640] border border-[#ffc640]/40 font-bold">
              CMS ADMIN
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Authorized administrator credentials allow editing biography, publications, blogs, gallery items, scientometrics, and database settings.
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-mono flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Method 1: Google Auth Button */}
        {authMode !== 'forgot_password' && (
          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 active:bg-slate-200 text-[#1f1f1f] font-sans font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-md group disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign In with Google (Admin)</span>
            </button>
          </div>
        )}

        {/* Divider */}
        {authMode !== 'forgot_password' && (
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-[#1c2b3c] w-full" />
            <span className="bg-[#0d1c2d] px-3 font-mono text-[10px] uppercase text-[#c6c6cd] absolute">
              Or with Admin Credentials
            </span>
          </div>
        )}

        {/* Method 2: Email & Password / Password Reset Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-[#c6c6cd] mb-1">
              ADMIN EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manindra94@gmail.com / admin@csir-immt.res.in"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#122131] border border-[#1c2b3c] focus:border-[#ffc640] text-[#d4e4fa] outline-none"
              />
            </div>
          </div>

          {authMode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[#c6c6cd]">PASSWORD</label>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot_password');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] text-[#ffc640] hover:underline font-mono flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot password?</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (min. 6 characters)"
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-[#122131] border border-[#1c2b3c] focus:border-[#ffc640] text-[#d4e4fa] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className="w-full py-2.5 rounded-xl font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : authMode === 'forgot_password' ? (
              <KeyRound className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>
              {authMode === 'forgot_password'
                ? 'Send Password Reset Link'
                : 'Sign In as Administrator'}
            </span>
          </button>
        </form>

        {/* Back to Login link when in Forgot Password */}
        {authMode === 'forgot_password' && (
          <div className="pt-2 border-t border-[#1c2b3c] flex items-center justify-between text-xs font-mono">
            <span className="text-[#c6c6cd]">Remembered your password?</span>
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className="text-[#ffc640] hover:underline font-bold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Sign In</span>
            </button>
          </div>
        )}

        {/* Current Active Account Session Card (if signed in) */}
        {user && !user.isAnonymous && (
          <div className="p-3 rounded-xl bg-[#122131] border border-[#1c2b3c] flex items-center justify-between text-xs font-mono">
            <div className="truncate">
              <div className="text-[#d4e4fa] font-bold truncate">{user.displayName || user.email}</div>
              <div className="text-[10px] text-[#ffc640]">Status: {isAdmin ? 'ADMINISTRATOR' : 'AUTHENTICATED'}</div>
            </div>
            <button
              onClick={logout}
              className="px-2.5 py-1 rounded bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 text-[11px] flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
