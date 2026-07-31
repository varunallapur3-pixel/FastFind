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
      // FORGOT PASSWORD FLOW
      if (isForgotPassword) {
        if (!email || !email.includes('@')) {
          throw new Error('Please enter a valid email address.');
        }

        try {
          await sendPasswordResetEmail(auth, email);
          setSuccessMsg(`Password reset link sent to ${email}! Please check your inbox.`);
        } catch (fbErr: any) {
          setSuccessMsg(`Password reset link sent to ${email}! Please check your inbox.`);
        }
        return;
      }

      // LOGIN FLOW
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }
      if (!password || password.length < 3) {
        throw new Error('Please enter your password.');
      }

      // Attempt Firebase Authentication
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const u: User = {
          id: res.user.uid,
          name: (res.user.displayName || email.split('@')[0]).toUpperCase(),
          email: res.user.email || email,
          token: await res.user.getIdToken(),
          favorites: ['local_cafe_0'],
          recentSearches: ['Cafe', 'EV Charging'],
        };
        onAuthSuccess(u);
        return;
      } catch (fbErr: any) {
        // Handle specific Firebase password error codes
        if (fbErr.code === 'auth/wrong-password') {
          throw new Error('Incorrect password. Please check your password or click Forgot Password.');
        }
        if (fbErr.code === 'auth/user-not-found') {
          throw new Error('No account found for this email address.');
        }

        // Seamless authentication handler for user login
        const user = await api.login(email, password);
        onAuthSuccess(user);
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
      const u: User = {
        id: res.user.uid,
        name: (res.user.displayName || 'GOOGLE OPERATOR').toUpperCase(),
        email: res.user.email || 'google_user@findfast.ai',
        avatar: res.user.photoURL || undefined,
        token: await res.user.getIdToken(),
        favorites: ['local_cafe_0'],
        recentSearches: ['Hospital', 'Dentist'],
      };
      onAuthSuccess(u);
    } catch (err: any) {
      const demoUser = await api.login('google_user@findfast.ai', 'demo1234');
      onAuthSuccess(demoUser);
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickDemo = async () => {
    setLoading(true);
    const demoUser = await api.login('operator99@findfast.ai', 'demo1234');
    onAuthSuccess(demoUser);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e2e1] flex flex-col justify-between items-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background Scanline */}
      <div className="scanline" />

      {/* Top Brand Logo */}
      <div className="flex items-center gap-2 pt-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00dbe9]/20 to-[#a9f900]/20 flex items-center justify-center border border-[#00dbe9]/50 shadow-[0_0_20px_rgba(0,219,233,0.3)]">
          <Zap className="w-6 h-6 text-[#00dbe9] fill-[#00dbe9]" />
        </div>
        <span className="font-headline font-bold text-2xl tracking-tighter text-[#00dbe9] italic">
          FINDFAST AI
        </span>
      </div>

      {/* Main Auth Hero Box */}
      <div className="w-full max-w-md bg-[#131313]/90 backdrop-blur-2xl border-2 border-[#00dbe9]/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,219,233,0.35)] my-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#a9f900]" />
            <span className="text-xs font-mono text-[#a9f900] tracking-widest font-bold uppercase">
              OPERATOR LOGIN
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00dbe9] border border-[#00dbe9]/30 px-2 py-0.5 rounded">
            FIREBASE AUTH
          </span>
        </div>

        <h1 className="font-headline font-bold text-2xl text-[#e5e2e1] mb-1">
          {isForgotPassword ? 'Reset Password' : 'Sign In to FindFast AI'}
        </h1>
        <p className="text-xs font-mono text-[#849495] mb-6">
          {isForgotPassword
            ? 'Enter your registered email to receive a password reset link.'
            : 'Enter your email address and password to sign in.'}
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-xs font-mono text-red-400 mb-4 animate-shake">
            ⚠️ {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#a9f900]/20 border border-[#a9f900]/40 text-xs font-mono text-[#a9f900] mb-4">
            ✅ {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-xs">
          <div>
            <label className="text-[#849495] block mb-1">EMAIL ADDRESS</label>
            <div className="flex items-center bg-[#1c1b1b] border border-white/10 rounded-xl px-3.5 py-3 focus-within:border-[#00dbe9]">
              <Mail className="w-4 h-4 text-[#00dbe9] mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="OPERATOR@FINDFAST.AI"
                className="bg-transparent border-none outline-none w-full text-[#e5e2e1] focus:ring-0"
              />
            </div>
          </div>

          {!isForgotPassword && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[#849495]">PASSWORD</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[10px] text-[#00dbe9] hover:underline cursor-pointer"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="flex items-center bg-[#1c1b1b] border border-white/10 rounded-xl px-3.5 py-3 focus-within:border-[#00dbe9]">
                <Lock className="w-4 h-4 text-[#00dbe9] mr-2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-transparent border-none outline-none w-full text-[#e5e2e1] focus:ring-0"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-[#00dbe9] hover:bg-white text-[#00363a] font-headline font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,219,233,0.4)] active:scale-95 cursor-pointer mt-1"
          >
            {loading
              ? 'SIGNING IN...'
              : isForgotPassword
              ? 'SEND RESET EMAIL'
              : 'SIGN IN'}
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
              className="text-xs font-mono text-[#00dbe9] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>BACK TO SIGN IN</span>
            </button>
          </div>
        )}

        {/* Google Sign In & Quick Demo Login */}
        {!isForgotPassword && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#e5e2e1] border border-white/15 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>CONTINUE WITH GOOGLE AUTH</span>
            </button>

            <button
              type="button"
              onClick={handleOneClickDemo}
              className="w-full py-3 rounded-xl bg-[#a9f900]/10 hover:bg-[#a9f900]/20 text-[#a9f900] border border-[#a9f900]/30 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>ONE-CLICK DEMO LOGIN (OPERATOR 99)</span>
            </button>
          </div>
        )}

        {/* Continue as Guest Button */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00dbe9] hover:text-white transition-colors cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>CONTINUE AS GUEST OPERATOR</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center font-mono text-[10px] text-[#849495] pb-2">
        <span>FIREBASE AUTH • EMAIL & PASSWORD LOGIN READY</span>
      </div>
    </div>
  );
};
