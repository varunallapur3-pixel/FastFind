import React, { useState } from 'react';
import { SearchFilter } from '../types';
import { Filter, Clock, X, SlidersHorizontal, Check } from 'lucide-react';
import { SEARCH_RADIUS_KM } from '../config/maps';

interface FilterBarProps {
  filter: SearchFilter;
  onChangeFilter: (newFilter: Partial<SearchFilter>) => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  totalResults,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const activeFiltersCount =
    (filter.minRating > 0 ? 1 : 0) +
    (filter.openNow ? 1 : 0) +
    (filter.maxDistanceKm !== SEARCH_RADIUS_KM ? 1 : 0) +
    (filter.sortBy !== 'rating' ? 1 : 0);

  const formatCountLabel = (count: number) => {
    if (count === 0) return 'No places found';
    if (count === 1) return '1 place near you';
    return `${count} places near you`;
  };

  return (
    <div className="mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Desktop Toolbar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        {/* Left side info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            <span>Filters & Sort</span>
          </div>

          <span className="hidden sm:inline-block text-slate-700">|</span>

          {/* Dynamic Natural Language Count (Section 14 requirement) */}
          <span className="text-xs font-medium text-slate-300">
            {formatCountLabel(totalResults)}
          </span>
        </div>

        {/* Mobile Filter & Sort Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeFilter({ sortBy: filter.sortBy === 'rating' ? 'distance' : 'rating' })}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 cursor-pointer"
          >
            Sort: {filter.sortBy === 'rating' ? 'Rating' : 'Nearest'}
          </button>
        </div>

        {/* Desktop Controls (Wraps naturally) */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {/* Distance Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs border border-slate-800">
            <span className="text-slate-400 pl-2 pr-1 font-medium text-[11px] uppercase">Radius</span>
            {[
              { label: '< 1 km', value: 1 },
              { label: `< ${SEARCH_RADIUS_KM} km`, value: SEARCH_RADIUS_KM },
              { label: '< 5 km', value: 5 },
              { label: '< 10 km', value: 10 },
              { label: 'All', value: 0 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onChangeFilter({ maxDistanceKm: item.value })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter.maxDistanceKm === item.value
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs border border-slate-800">
            <span className="text-slate-400 pl-2 pr-1 font-medium text-[11px] uppercase">Rating</span>
            {[
              { label: 'All', value: 0 },
              { label: '4.0+ ★', value: 4.0 },
              { label: '4.5+ ★', value: 4.5 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => onChangeFilter({ minRating: item.value })}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filter.minRating === item.value
                    ? 'bg-amber-500 text-white shadow-subtle'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Open Now Toggle */}
          <button
            onClick={() => onChangeFilter({ openNow: !filter.openNow })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
              filter.openNow
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Open Now</span>
            {filter.openNow && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs border border-slate-800">
            <span className="text-slate-400 pl-2 pr-1 font-medium text-[11px] uppercase">Sort</span>
            <button
              onClick={() => onChangeFilter({ sortBy: 'rating' })}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter.sortBy === 'rating'
                  ? 'bg-slate-100 text-slate-900 shadow-subtle font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Highest Rated
            </button>
            <button
              onClick={() => onChangeFilter({ sortBy: 'distance' })}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter.sortBy === 'distance'
                  ? 'bg-slate-100 text-slate-900 shadow-subtle font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Nearest
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/70 backdrop-blur-sm animate-fade-in md:hidden">
          <div className="bg-[#111827] rounded-t-3xl border-t border-slate-800 p-6 shadow-elevated space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Filter className="w-5 h-5 text-brand-400" />
                <span>Filters & Preferences</span>
              </h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Distance */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Maximum Distance
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '< 1 km', value: 1 },
                  { label: `< ${SEARCH_RADIUS_KM} km`, value: SEARCH_RADIUS_KM },
                  { label: '< 5 km', value: 5 },
                  { label: '< 10 km', value: 10 },
                  { label: 'All', value: 0 },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => onChangeFilter({ maxDistanceKm: item.value })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                      filter.maxDistanceKm === item.value
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Minimum Rating
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'All Ratings', value: 0 },
                  { label: '4.0+ ★', value: 4.0 },
                  { label: '4.5+ ★', value: 4.5 },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => onChangeFilter({ minRating: item.value })}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                      filter.minRating === item.value
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Sort Order
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeFilter({ sortBy: 'rating' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                    filter.sortBy === 'rating'
                      ? 'bg-slate-100 text-slate-900 font-semibold border-slate-100'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300'
                  }`}
                >
                  ★ Highest Rated
                </button>
                <button
                  onClick={() => onChangeFilter({ sortBy: 'distance' })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium border text-center transition-colors cursor-pointer ${
                    filter.sortBy === 'distance'
                      ? 'bg-slate-100 text-slate-900 font-semibold border-slate-100'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300'
                  }`}
                >
                  Nearest Distance
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onChangeFilter({
                    minRating: 0,
                    maxDistanceKm: SEARCH_RADIUS_KM,
                    openNow: false,
                    sortBy: 'rating',
                  });
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
