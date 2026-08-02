import React from 'react';
import { ActiveView, Coords } from '../types';
import { Search, Compass, Heart, Bell, User as UserIcon } from 'lucide-react';

interface BottomHUDProps {
  activeView: ActiveView;
  onChangeView: (view: ActiveView) => void;
  favoritesCount: number;
  userCoords?: Coords | null;
  locationLabel?: string;
}

export const BottomHUD: React.FC<BottomHUDProps> = ({
  activeView,
  onChangeView,
  favoritesCount,
  userCoords,
  locationLabel,
}) => {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-40">
      {/* Status Bar */}
      <div className="w-full h-7 bg-[#0a0a0a]/90 backdrop-blur-md flex items-center justify-center border-t border-white/5 font-mono text-[10px] text-[#a9f900] tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#a9f900] pulse-green" />
          <span>
            GPS LOCKED: {locationLabel || 'LIVE POSITION'}{' '}
            {userCoords ? `(LAT ${userCoords.lat.toFixed(4)}, LNG ${userCoords.lng.toFixed(4)})` : ''}
          </span>
        </div>
      </div>

      {/* Nav Shell */}
      <div className="w-full bg-[#050505]/75 backdrop-blur-2xl flex justify-around items-center h-16 px-4 border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        {/* Search */}
        <button
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeView === 'home' || activeView === 'results'
              ? 'text-[#00dbe9] drop-shadow-[0_0_8px_rgba(0,219,233,0.8)] scale-110'
              : 'text-[#849495] hover:text-white'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="font-mono text-[10px] mt-1">SEARCH</span>
        </button>

        {/* Explore */}
        <button
          onClick={() => onChangeView('explore')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeView === 'explore'
              ? 'text-[#00dbe9] drop-shadow-[0_0_8px_rgba(0,219,233,0.8)] scale-110'
              : 'text-[#849495] hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="font-mono text-[10px] mt-1">EXPLORE</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => onChangeView('favorites')}
          className={`relative flex flex-col items-center justify-center transition-all ${
            activeView === 'favorites'
              ? 'text-[#fface8] drop-shadow-[0_0_8px_rgba(255,172,232,0.8)] scale-110'
              : 'text-[#849495] hover:text-white'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="font-mono text-[10px] mt-1">FAVORITES</span>
          {favoritesCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-[#fface8] text-[#3a0033] font-mono text-[9px] font-bold flex items-center justify-center">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Alerts */}
        <button
          onClick={() => onChangeView('alerts')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeView === 'alerts'
              ? 'text-[#a9f900] drop-shadow-[0_0_8px_rgba(169,249,0,0.8)] scale-110'
              : 'text-[#849495] hover:text-white'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="font-mono text-[10px] mt-1 font-bold">ALERTS</span>
        </button>
      </div>
    </footer>
  );
};
