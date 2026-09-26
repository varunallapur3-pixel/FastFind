import React from 'react';
import { SearchX, MapPinOff, RefreshCw, Compass, ArrowRight } from 'lucide-react';
import { SEARCH_RADIUS_KM } from '../config/maps';

interface EmptyStateProps {
  type: 'no_results' | 'location_denied' | 'no_favorites';
  searchQuery?: string;
  currentRadius?: number;
  onResetFilters?: () => void;
  onExpandRadius?: () => void;
  onResyncGPS?: () => void;
  onFocusSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  searchQuery,
  currentRadius = SEARCH_RADIUS_KM,
  onResetFilters,
  onExpandRadius,
  onResyncGPS,
  onFocusSearch,
}) => {
  if (type === 'location_denied') {
    return (
      <div className="py-12 px-6 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-lg mx-auto shadow-card my-6">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
          <MapPinOff className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1.5">
          Location Access Required
        </h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          FastFind requires location permissions to discover places near you. Please enable location access in your browser settings.
        </p>
        {onResyncGPS && (
          <button
            onClick={onResyncGPS}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all shadow-subtle flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Enable & Re-sync GPS</span>
          </button>
        )}
      </div>
    );
  }

  if (type === 'no_favorites') {
    return (
      <div className="py-12 px-6 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-lg mx-auto shadow-card my-6">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100 mb-1.5">
          No saved places yet
        </h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Save places to quickly find them later. Click the heart icon on any place card to save it.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12 px-6 rounded-2xl bg-[#111827] border border-slate-800 text-center max-w-lg mx-auto shadow-card my-6">
      <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-3">
        <SearchX className="w-6 h-6" />
      </div>

      <h3 className="text-base font-bold text-slate-100 mb-1">
        No places found nearby
      </h3>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        We couldn't find any matching places {searchQuery ? `for "${searchQuery}"` : ''} within {currentRadius || 4} km.
      </p>

      {/* Advice items */}
      <div className="bg-slate-800/60 rounded-xl p-3 text-left mb-5 border border-slate-800 space-y-1.5 text-xs text-slate-300">
        <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">Try the following:</span>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span>Search using a different keyword</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span>Expand your search radius</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span>Select another place category</span>
        </div>
      </div>

      {/* Recovery buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {onFocusSearch && (
          <button
            onClick={onFocusSearch}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-all shadow-subtle flex items-center gap-1.5 cursor-pointer"
          >
            <span>Try another search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {onExpandRadius && (
          <button
            onClick={onExpandRadius}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Increase radius
          </button>
        )}

        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 font-medium text-xs transition-all cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>
    </div>
  );
};
