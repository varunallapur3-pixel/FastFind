import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Navigation } from 'lucide-react';

import { CategoryId } from '../types';

interface SearchHUDProps {
  onSearch: (query: string) => void;
  currentQuery: string;
  selectedCategory?: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onAutoNavigateTopRated: (query: string) => void;
}

export const SearchHUD: React.FC<SearchHUDProps> = ({
  onSearch,
  currentQuery,
  onSelectCategory,
  onAutoNavigateTopRated,
}) => {
  const [inputValue, setInputValue] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

  // Global CMD+K shortcut to focus search input
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAutoNavigateTopRated(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
    onSelectCategory('all');
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-8">
      {/* Glow aura */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#00dbe9] via-[#a9f900] to-[#ffcaed] rounded-xl blur-md opacity-25 group-focus-within:opacity-60 transition duration-500" />

      {/* Input container */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-[#131313]/90 backdrop-blur-2xl rounded-xl border border-white/15 px-4 py-3 focus-within:border-[#00dbe9] focus-within:shadow-[0_0_25px_rgba(0,219,233,0.3)] transition-all gap-3"
      >
        <Search className="w-5 h-5 text-[#00dbe9] shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            onSearch(val);
          }}
          placeholder="SEARCH ANY PLACE (e.g. 'Cafe', 'Dentist', 'EV Charging')..."
          className="bg-transparent border-none outline-none w-full font-mono text-sm text-[#00dbe9] placeholder:text-[#849495] focus:ring-0 uppercase tracking-wide"
        />

        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md hover:bg-white/10 text-[#849495] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Auto-navigate to top rated trigger button */}
        <button
          type="button"
          onClick={() => onAutoNavigateTopRated(inputValue || 'all')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#a9f900] hover:bg-white text-[#223600] font-headline font-bold text-xs shadow-[0_0_15px_rgba(169,249,0,0.4)] active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Auto-Navigate to #1 Top Rated Place"
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">TOP MATCH NAV</span>
          <span className="sm:hidden">NAV</span>
        </button>

        {/* Shortcut Badge */}
        <kbd className="hidden md:flex items-center gap-0.5 font-mono text-[10px] px-2 py-1 bg-[#1c1b1b] rounded border border-white/10 text-[#849495] shrink-0">
          <Sparkles className="w-3 h-3 text-[#00dbe9]" />
          <span>CMD+K</span>
        </kbd>
      </form>
    </div>
  );
};
