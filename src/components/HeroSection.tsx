import React from 'react';
import { SearchBar } from './SearchBar';
import { CategoryId } from '../types';
import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { SEARCH_RADIUS_KM } from '../config/maps';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  currentQuery: string;
  selectedCategory?: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  onManualSearchSubmit?: (query: string) => void;
  locationLabel?: string;
  onRequestGPS?: () => void;
  gpsLocked?: boolean;
  activeRadiusKm?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  currentQuery,
  selectedCategory,
  onSelectCategory,
  onManualSearchSubmit,
  locationLabel,
  onRequestGPS,
  activeRadiusKm = 4,
}) => {
  return (
    <section className="relative pt-6 pb-6 md:pt-10 md:pb-8 text-center max-w-4xl mx-auto px-4">
      {/* Small Product Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        <span>Location-based Instant Discovery</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3 leading-[1.15]">
        Find highly rated places near you.{' '}
        <span className="bg-gradient-to-r from-brand-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Faster.
        </span>
      </h1>

      {/* Supporting Description */}
      <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-6 font-normal leading-relaxed">
        Discover top-rated places strictly within your selected distance radius.
      </p>

      {/* Large Primary Search Box */}
      <SearchBar
        onSearch={onSearch}
        currentQuery={currentQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        onManualSearchSubmit={onManualSearchSubmit}
        locationLabel={locationLabel}
        onRequestGPS={onRequestGPS}
      />

      {/* Location / Radius Info */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span>Location: <strong className="text-slate-200 font-medium">{locationLabel || 'Detecting...'}</strong></span>
        </div>
        <span className="text-slate-700">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict {activeRadiusKm} km Radius</span>
        </div>
      </div>
    </section>
  );
};
