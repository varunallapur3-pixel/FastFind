import React from 'react';
import { ActiveView } from '../types';
import { Search, Compass, Heart, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  favoritesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeView,
  onChangeView,
  favoritesCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 md:hidden bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-elevated">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Search / Home */}
        <button
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeView === 'home' || activeView === 'results'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Home search view"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Search</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onChangeView('explore')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeView === 'explore'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Explore categories"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Explore</span>
        </button>

        {/* Saved Favorites */}
        <button
          onClick={() => onChangeView('favorites')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeView === 'favorites'
              ? 'text-rose-600 dark:text-rose-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="Saved favorite places"
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Saved</span>
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Account / Profile */}
        <button
          onClick={() => onChangeView('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors cursor-pointer ${
            activeView === 'profile'
              ? 'text-brand-600 dark:text-brand-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          aria-label="User account profile"
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Account</span>
        </button>
      </div>
    </nav>
  );
};
