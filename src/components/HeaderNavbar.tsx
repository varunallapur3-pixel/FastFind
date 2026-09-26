import React, { useState, useRef, useEffect } from 'react';
import { User, ActiveView } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Zap, Heart, User as UserIcon, Sun, Moon, LogOut, MapPin, RefreshCw, ChevronDown, Search } from 'lucide-react';

interface HeaderNavbarProps {
  user: User | null;
  activeView: ActiveView;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  locationLabel?: string;
  onRequestGPS?: () => void;
  onSelectCityLocation?: (cityName: string) => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  user,
  activeView,
  onOpenAuth,
  onLogout,
  onGoHome,
  onOpenFavorites,
  favoritesCount,
  locationLabel,
  onRequestGPS,
  onSelectCityLocation,
}) => {
  const { isDark, setTheme } = useTheme();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [customCityInput, setCustomCityInput] = useState('');
  const locationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCityInput.trim() && onSelectCityLocation) {
      onSelectCityLocation(customCityInput.trim());
      setShowLocationDropdown(false);
      setCustomCityInput('');
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 text-white backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Location */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                FastFind
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
              </span>
            </div>
          </button>

          {/* Interactive Current Location Selector */}
          <div ref={locationRef} className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-slate-700/90 text-xs font-medium text-slate-200 transition-colors border border-slate-700/80 cursor-pointer"
              title="Click to change location or re-sync GPS"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {locationLabel || 'Detecting location...'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Location Dropdown Sheet */}
            {showLocationDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-[#111827] border border-slate-800 rounded-2xl shadow-elevated p-3 z-50 animate-fade-in text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">Set Location</span>
                  <button
                    onClick={() => {
                      onRequestGPS?.();
                      setShowLocationDropdown(false);
                    }}
                    className="flex items-center gap-1 text-brand-400 hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-sync GPS</span>
                  </button>
                </div>

                <form onSubmit={handleCustomCitySubmit} className="space-y-2">
                  <div className="flex items-center bg-slate-800 rounded-xl px-2.5 py-1.5 border border-slate-700">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={customCityInput}
                      onChange={(e) => setCustomCityInput(e.target.value)}
                      placeholder="Enter city (e.g. Bagalkote, Bengaluru)"
                      className="bg-transparent border-none outline-none w-full text-slate-100 placeholder:text-slate-500 text-xs focus:ring-0"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium transition-colors cursor-pointer text-center"
                  >
                    Set Location
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right Nav Controls */}
        <div className="flex items-center gap-2.5">
          {/* Saved Favorites Pill */}
          <button
            onClick={onOpenFavorites}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              activeView === 'favorites'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-slate-800/60 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title="Saved Places"
          >
            <Heart
              className={`w-4 h-4 ${
                favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
              }`}
            />
            <span className="hidden sm:inline">Saved</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-slate-800/60 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Profile User Dropdown / Sign in */}
          {user ? (
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center border-2 border-brand-400 hover:scale-105 transition-transform cursor-pointer shadow-subtle"
                title={user.name}
              >
                {getUserInitials(user.name)}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#111827] border border-slate-800 rounded-2xl shadow-elevated p-2 z-50 animate-fade-in text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-100 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-subtle transition-all cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
