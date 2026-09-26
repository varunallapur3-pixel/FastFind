import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Sparkles, History, ArrowRight } from 'lucide-react';
import { CategoryId } from '../types';
import { getRecentSearches, saveRecentSearch } from '../utils/storage';

interface SearchBarProps {
  onSearch: (query: string) => void;
  currentQuery: string;
  selectedCategory?: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onManualSearchSubmit?: (query: string) => void;
  locationLabel?: string;
  onRequestGPS?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  currentQuery,
  onSelectCategory,
  onManualSearchSubmit,
  locationLabel,
  onRequestGPS,
}) => {
  const [inputValue, setInputValue] = useState(currentQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerSearch = (query: string) => {
    const val = query.trim();
    if (val) {
      const updated = saveRecentSearch(val);
      setRecentSearches(updated);
    }
    setInputValue(val);
    setIsFocused(false);
    if (onManualSearchSubmit) {
      onManualSearchSubmit(val);
    } else {
      onSearch(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    onSelectCategory('all');
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto z-30">
      {/* Search Input Container - 64-72px height */}
      <div className={`relative transition-all duration-200 rounded-2xl ${
        isFocused ? 'ring-2 ring-brand-500 shadow-glow-primary' : 'shadow-card hover:shadow-elevated'
      }`}>
        <form
          onSubmit={handleSubmit}
          className="flex items-center bg-[#111827] rounded-2xl border border-slate-800 h-16 sm:h-20 px-3 sm:px-4 gap-3 transition-colors"
        >
          {/* Search Icon */}
          <div className="pl-1 text-slate-400 shrink-0">
            <Search className="w-6 h-6 text-brand-500" />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search nearby (e.g. dentist, cafe, EV charging, hospital)..."
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-base sm:text-lg font-normal px-1 focus:ring-0"
          />

          {/* Clear Input Button */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Keyboard shortcut indicator */}
          <div className="hidden lg:flex items-center text-xs font-medium text-slate-500 shrink-0 select-none pr-1">
            <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[11px]">
              {isMac ? '⌘ K' : 'Ctrl K'}
            </kbd>
          </div>

          {/* Search Submit Button */}
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-subtle active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Floating Categorized Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#111827] border border-slate-800 rounded-2xl shadow-elevated overflow-hidden z-50 animate-fade-in p-4 text-left">
          {recentSearches.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Recent Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => triggerSearch(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-brand-500/20 hover:text-brand-300 text-xs text-slate-300 transition-colors cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Popular Search Categories
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { title: 'Dentists', query: 'Dentist' },
                { title: 'Cafes', query: 'Cafe' },
                { title: 'Restaurants', query: 'Restaurant' },
                { title: 'EV Charging', query: 'EV Charging' },
                { title: 'Hospitals', query: 'Hospital' },
                { title: 'Pharmacies', query: 'Pharmacy' },
                { title: 'Car Wash', query: 'Car Wash' },
                { title: 'Gyms', query: 'Gym' },
              ].map((cat) => (
                <button
                  key={cat.query}
                  type="button"
                  onClick={() => triggerSearch(cat.query)}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>{cat.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
