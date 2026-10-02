import React, { useState } from 'react';
import { User } from '../types';
import { auth, googleProvider } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from 'firebase/auth';
import { X, Lock, Mail, User as UserIcon, Zap, Compass } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name || !email || !password) throw new Error('Please fill all required fields');
        if (password.length < 6) throw new Error('Password must be at least 6 characters long');
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (res.user) {
          await updateProfile(res.user, { displayName: name });
        }
        const token = await res.user.getIdToken();
        const u: User = {
          id: res.user.uid,
          name: name.toUpperCase(),
          email: res.user.email || email,
          token,
          favorites: [],
          recentSearches: [],
        };
        onLoginSuccess(u);
      } else {
        if (!email || !password) throw new Error('Please enter email and password');
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
        onLoginSuccess(u);
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account already exists with this email address.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-elevated">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <h2 className="font-bold text-xl text-slate-900 dark:text-slate-100">
            Sign In to FastFind
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Access saved favorite places, personalized search settings, and fast routing.
        </p>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              !isSignUp ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-subtle' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              isSignUp ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-subtle' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isSignUp && (
            <div>
              <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Your Name</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus-within:border-brand-500">
                <UserIcon className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Vance"
                  className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Email Address</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus-within:border-brand-500">
              <Mail className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-600 dark:text-slate-400 font-medium block mb-1">Password</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus-within:border-brand-500">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-subtle cursor-pointer mt-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Guest Mode */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-brand-500" />
            <span>Continue as Guest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
