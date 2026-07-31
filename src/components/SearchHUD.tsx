import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Sparkles, Navigation } from 'lucide-react';

import { CategoryId } from '../types';

interface SearchHUDProps {
  onSearch: (query: string) => void;
  currentQuery: string;
  selectedCategory?: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onAutoNavigateTopRated: (query: string) => void;
  onManualSearchSubmit?: (query: string) => void;
}

export const SearchHUD: React.FC<SearchHUDProps> = ({
  onSearch,
  currentQuery,
  onSelectCategory,
  onManualSearchSubmit,
}) => {
  const [inputValue, setInputValue] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search handler (300ms)
  useEffect(() => {
    if (inputValue === currentQuery) return;
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue, currentQuery, onSearch]);

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

  const handleSubmit = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const val = inputValue.trim();
    if (onManualSearchSubmit) {
      onManualSearchSubmit(val);
    } else {
      onSearch(val);
      const target = document.getElementById('results-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 480, behavior: 'smooth' });
      }
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
            setInputValue(e.target.value);
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

        {/* Search trigger button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00dbe9] hover:bg-white text-[#00363a] font-headline font-bold text-xs shadow-[0_0_15px_rgba(0,219,233,0.4)] active:scale-95 transition-all shrink-0 cursor-pointer"
          title="Search Places Nearby"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SEARCH NEARBY</span>
          <span className="sm:hidden">SEARCH</span>
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
