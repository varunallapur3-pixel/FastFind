import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { auth, googleProvider } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Zap, Lock, Mail, CheckCircle, ShieldCheck, ArrowRight, Compass, KeyRound } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onContinueAsGuest,
}) => {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isForgotPassword) {
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }

        try {
          await sendPasswordResetEmail(auth, email);
        } catch {
          // Ignore error details to prevent email enumeration
        }
        setSuccessMsg(`If an account exists for ${email}, a password reset link has been sent.`);
        return;
      }

      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const token = await res.user.getIdToken();
        const u: User = {
          id: res.user.uid,
          name: (res.user.displayName || email.split('@')[0]).toUpperCase(),
          email: res.user.email || email,
          token,
          favorites: [],
          recentSearches: [],
        };
        onAuthSuccess(u);
      } catch (fbErr: any) {
        if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
          throw new Error('Invalid email or password. Please try again or click Forgot Password.');
        }
        if (fbErr.code === 'auth/too-many-requests') {
          throw new Error('Access temporarily disabled due to too many failed attempts. Try again later.');
        }
        throw new Error(fbErr.message || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const token = await res.user.getIdToken();
      const u: User = {
        id: res.user.uid,
        name: res.user.displayName || 'Google User',
        email: res.user.email || 'user@fastfind.app',
        avatar: res.user.photoURL || undefined,
        token,
        favorites: [],
        recentSearches: [],
      };
      onAuthSuccess(u);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in could not be completed. Please try again or continue as Guest.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-between items-center p-4 sm:p-8 relative">
      {/* Top Brand */}
      <div className="flex items-center gap-2.5 pt-6">
        <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <span className="font-extrabold text-2xl tracking-tight">
          FastFind
        </span>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-elevated my-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Account Login
            </span>
          </div>
        </div>

        <h1 className="font-bold text-2xl text-slate-900 dark:text-slate-100 mb-1">
          {isForgotPassword ? 'Reset Password' : 'Sign In to FastFind'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {isForgotPassword
            ? 'Enter your registered email to receive a password reset link.'
            : 'Enter your credentials or test with guest access.'}
        </p>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 mb-4 font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 mb-4 font-medium">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Email Address</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 focus-within:border-brand-500">
              <Mail className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-600 dark:text-slate-400 font-medium">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-3 focus-within:border-brand-500">
                <Lock className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-subtle cursor-pointer mt-1"
          >
            {loading
              ? 'Signing In...'
              : isForgotPassword
              ? 'Send Reset Email'
              : 'Sign In'}
          </button>
        </form>

        {isForgotPassword && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setError('');
                setSuccessMsg('');
              }}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* Options */}
        {!isForgotPassword && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore in Guest Mode</span>
            </button>
          </div>
        )}

        {/* Guest Footer Link */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            <span>Skip sign in & continue to discovery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="text-center font-normal text-xs text-slate-400 pb-4">
        <span>FastFind • Find what you need. Faster.</span>
      </div>
    </div>
  );
};
