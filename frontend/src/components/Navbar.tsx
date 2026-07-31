import React from 'react';
import { User } from '../types';
import { Zap, User as UserIcon, LogOut, Heart } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onGoHome,
  onOpenFavorites,
  favoritesCount,
}) => {
  return (
    <nav className="fixed top-0 w-full z-40 flex justify-between items-center px-4 md:px-8 h-16 bg-[#050505]/70 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,219,233,0.15)]">
      {/* Brand Logo */}
      <button
        onClick={onGoHome}
        className="flex items-center gap-2 active:scale-95 transition-transform duration-150 group cursor-pointer focus:outline-none"
      >
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00dbe9]/20 to-[#a9f900]/20 flex items-center justify-center border border-[#00dbe9]/40 group-hover:border-[#00dbe9] transition-colors">
          <Zap className="w-5 h-5 text-[#00dbe9] fill-[#00dbe9] group-hover:rotate-12 transition-transform" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-headline font-bold text-lg tracking-tighter text-[#00dbe9] italic">
            FINDFAST AI
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#849495] -mt-1 uppercase">
            INSTANT TOP-RATED NAV
          </span>
        </div>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Favorites button */}
        <button
          onClick={onOpenFavorites}
          className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:border-[#00dbe9]/50 text-[#b9cacb] hover:text-[#00dbe9] transition-all flex items-center gap-1.5"
          title="Saved Places"
        >
          <Heart className="w-4 h-4 text-[#fface8]" />
          <span className="hidden sm:inline text-xs font-mono">FAVORITES</span>
          {favoritesCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#fface8] text-[#3a0033]">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* User Auth Profile */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/30">
              <div className="w-2 h-2 rounded-full bg-[#a9f900] animate-pulse" />
              <span className="text-xs font-mono font-bold text-[#00dbe9] tracking-wider">
                {user.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#849495] hover:text-red-400 border border-white/10 transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#00dbe9] to-[#00f0ff] text-[#00363a] font-headline font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(0,219,233,0.6)] active:scale-95 transition-all"
          >
            <UserIcon className="w-4 h-4" />
            <span>SIGN IN</span>
          </button>
        )}
      </div>
    </nav>
  );
};
