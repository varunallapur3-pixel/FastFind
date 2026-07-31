import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { X, Lock, Mail, User as UserIcon, Zap, CheckCircle } from 'lucide-react';

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
        const user = await api.signup(name, email, password);
        onLoginSuccess(user);
      } else {
        if (!email || !password) throw new Error('Please enter email and password');
        const user = await api.login(email, password);
        onLoginSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const user = await api.login('operator99@findfast.ai', 'demo1234');
    onLoginSuccess(user);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#131313] border border-[#00dbe9]/50 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,219,233,0.3)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-[#849495] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-[#00dbe9] fill-[#00dbe9]" />
          <h2 className="font-headline font-bold text-xl text-[#00dbe9] tracking-wider uppercase">
            FINDFAST AI AUTHENTICATION
          </h2>
        </div>
        <p className="text-xs font-mono text-[#849495] mb-6">
          Access saved locations, search history, and neural preference routing.
        </p>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-[#1c1b1b] p-1 mb-6 border border-white/10 font-mono text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              !isSignUp ? 'bg-[#00dbe9] text-[#00363a]' : 'text-[#849495] hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              isSignUp ? 'bg-[#00dbe9] text-[#00363a]' : 'text-[#849495] hover:text-white'
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-xs font-mono text-red-400 mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-mono text-xs">
          {isSignUp && (
            <div>
              <label className="text-[#849495] block mb-1">OPERATOR NAME</label>
              <div className="flex items-center bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#00dbe9]">
                <UserIcon className="w-4 h-4 text-[#00dbe9] mr-2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.G. ALEX VANCE"
                  className="bg-transparent border-none outline-none w-full text-[#e5e2e1] focus:ring-0 uppercase"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[#849495] block mb-1">EMAIL ADDRESS</label>
            <div className="flex items-center bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#00dbe9]">
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

          <div>
            <label className="text-[#849495] block mb-1">PASSWORD</label>
            <div className="flex items-center bg-[#1c1b1b] border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#00dbe9]">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#00dbe9] hover:bg-white text-[#00363a] font-headline font-bold text-sm tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(0,219,233,0.4)] mt-2"
          >
            {loading ? 'PROCESSING...' : isSignUp ? 'CREATE OPERATOR ID' : 'AUTHENTICATE'}
          </button>
        </form>

        {/* Demo Quick Fill */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-[#a9f900]/10 hover:bg-[#a9f900]/20 text-[#a9f900] border border-[#a9f900]/30 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>ONE-CLICK DEMO AUTH (OPERATOR 99)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
