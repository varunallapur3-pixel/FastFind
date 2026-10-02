import React, { useState } from 'react';
import { SearchFilter } from '../types';
import { Filter, Clock, X, SlidersHorizontal, Check, MapPin } from 'lucide-react';
import { DEFAULT_RADIUS_KM, MIN_RADIUS_KM, MAX_RADIUS_KM, RADIUS_STEP_KM, PRESET_RADII, normalizeRadius } from '../config/maps';

import { resolveSearchIntent } from '../utils/searchIntent';

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
  const [showCustomSlider, setShowCustomSlider] = useState(false);

  const activeRadiusKm = normalizeRadius(filter.maxDistanceKm);
  const intent = resolveSearchIntent(filter.query, filter.category);

  const activeFiltersCount =
    (filter.minRating > 0 ? 1 : 0) +
    (filter.openNow ? 1 : 0) +
    (activeRadiusKm !== DEFAULT_RADIUS_KM ? 1 : 0) +
    (filter.sortBy !== 'rating' ? 1 : 0);

  const formatCountLabel = (count: number, radiusKm: number) => {
    const label = intent.isGenericText && intent.query && intent.query !== 'places'
      ? `matching "${intent.query}"`
      : intent.categoryLabel;

    if (count === 0) return `No ${label.toLowerCase()} found within ${radiusKm} km`;
    if (count === 1) return `1 ${label.slice(-1) === 's' ? label.slice(0, -1) : label} within ${radiusKm} km`;
    return `${count} ${label} within ${radiusKm} km`;
  };

  return (
    <div className="mb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Desktop & Mobile Main Toolbar */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        {/* Left side info: Radius badge + Count label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
            <SlidersHorizontal className="w-4 h-4 text-brand-400" />
            <span>Filters</span>
          </div>

          <span className="hidden sm:inline-block text-slate-700">|</span>

          {/* Active Radius Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>Within {activeRadiusKm} km</span>
          </div>

          {/* Dynamic Natural Language Count */}
          <span className="text-xs font-medium text-slate-300 hidden sm:inline-block">
            ({formatCountLabel(totalResults, activeRadiusKm)})
          </span>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer active:scale-95 transition-all"
            aria-label="Open filter settings"
          >
            <Filter className="w-4 h-4 text-brand-400" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onChangeFilter({ sortBy: filter.sortBy === 'rating' ? 'distance' : 'rating' })}
            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer active:scale-95 transition-all"
          >
            Sort: {filter.sortBy === 'rating' ? '★ Rating' : '📍 Nearest'}
          </button>
        </div>

        {/* Desktop Filter Options */}
        <div className="hidden md:flex flex-wrap items-center gap-3">
          {/* Distance / Radius Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl text-xs border border-slate-800">
            <span className="text-slate-400 pl-2 pr-1 font-medium text-[11px] uppercase">Radius</span>
            {PRESET_RADII.map((radiusVal) => (
              <button
                key={radiusVal}
                onClick={() => {
                  setShowCustomSlider(false);
                  onChangeFilter({ maxDistanceKm: radiusVal });
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeRadiusKm === radiusVal && !showCustomSlider
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {radiusVal} km
              </button>
            ))}

            <button
              onClick={() => setShowCustomSlider(!showCustomSlider)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                showCustomSlider || !PRESET_RADII.includes(activeRadiusKm)
                  ? 'bg-brand-600 text-white shadow-subtle'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom
            </button>
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

          {/* Sort By Toggle */}
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

      {/* Custom Slider Popover Bar (Desktop) */}
      {showCustomSlider && (
        <div className="hidden md:flex items-center gap-4 mt-3 p-3.5 bg-[#111827] border border-slate-800 rounded-2xl animate-fade-in text-xs">
          <span className="font-semibold text-slate-300">Custom Radius:</span>
          <input
            type="range"
            min={MIN_RADIUS_KM}
            max={MAX_RADIUS_KM}
            step={RADIUS_STEP_KM}
            value={activeRadiusKm}
            onChange={(e) => onChangeFilter({ maxDistanceKm: parseFloat(e.target.value) })}
            className="flex-1 accent-brand-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <span className="font-bold text-brand-400 text-sm min-w-[60px] text-right">
            {activeRadiusKm} km
          </span>
        </div>
      )}

      {/* Mobile Drawer (Bottom Sheet) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/70 backdrop-blur-sm animate-fade-in md:hidden">
          <div className="bg-[#111827] rounded-t-3xl border-t border-slate-800 p-6 shadow-elevated space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Filter className="w-5 h-5 text-brand-400" />
                <span>Radius & Search Filters</span>
              </h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Distance / Radius Selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Search Radius
                </label>
                <span className="text-xs font-bold text-brand-400">Within {activeRadiusKm} km</span>
              </div>

              {/* Slider for mobile */}
              <div className="mb-4 bg-slate-800/60 p-3 rounded-2xl border border-slate-800">
                <input
                  type="range"
                  min={MIN_RADIUS_KM}
                  max={MAX_RADIUS_KM}
                  step={RADIUS_STEP_KM}
                  value={activeRadiusKm}
                  onChange={(e) => onChangeFilter({ maxDistanceKm: parseFloat(e.target.value) })}
                  className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-700 rounded-lg mb-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{MIN_RADIUS_KM} km</span>
                  <span>Default (4 km)</span>
                  <span>{MAX_RADIUS_KM} km</span>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {PRESET_RADII.map((r) => (
                  <button
                    key={r}
                    onClick={() => onChangeFilter({ maxDistanceKm: r })}
                    className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
                      activeRadiusKm === r
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Rating */}
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
                    className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
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
                Sort Results By
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onChangeFilter({ sortBy: 'rating' })}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    filter.sortBy === 'rating'
                      ? 'bg-slate-100 text-slate-900 border-slate-100'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300'
                  }`}
                >
                  ★ Highest Rated
                </button>
                <button
                  onClick={() => onChangeFilter({ sortBy: 'distance' })}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-colors cursor-pointer ${
                    filter.sortBy === 'distance'
                      ? 'bg-slate-100 text-slate-900 border-slate-100'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300'
                  }`}
                >
                  📍 Nearest Distance
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2 pb-4">
              <button
                onClick={() => {
                  onChangeFilter({
                    minRating: 0,
                    maxDistanceKm: DEFAULT_RADIUS_KM,
                    openNow: false,
                    sortBy: 'rating',
                  });
                }}
                className="flex-1 min-h-[44px] py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm rounded-xl transition-all cursor-pointer text-center"
              >
                Reset Default (4km)
              </button>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 min-h-[44px] py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer text-center"
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
