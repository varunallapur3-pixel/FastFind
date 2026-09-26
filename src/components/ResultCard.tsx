import React from 'react';
import { Place } from '../types';
import { getGoogleMapsDirUrl } from '../utils/geo';
import { Star, MapPin, Navigation, Heart, ExternalLink, Clock } from 'lucide-react';

interface ResultCardProps {
  place: Place;
  isFavorite: boolean;
  isSelected?: boolean;
  userCoords?: { lat: number; lng: number } | null;
  onToggleFavorite: (id: string) => void;
  onSelectPlace: (place: Place) => void;
  onHoverPlace?: (place: Place | null) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  place,
  isFavorite,
  isSelected,
  userCoords,
  onToggleFavorite,
  onSelectPlace,
  onHoverPlace,
}) => {
  const openDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = getGoogleMapsDirUrl(
      place.name,
      place.address,
      place.coords.lat,
      place.coords.lng,
      userCoords?.lat,
      userCoords?.lng
    );
    window.open(url, '_blank');
  };

  return (
    <article
      onClick={() => onSelectPlace(place)}
      onMouseEnter={() => onHoverPlace?.(place)}
      onMouseLeave={() => onHoverPlace?.(null)}
      className={`group bg-[#111827] border rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between cursor-pointer ${
        isSelected
          ? 'border-brand-500 bg-slate-800/80 shadow-glow-primary ring-1 ring-brand-500'
          : 'border-slate-800 hover:border-slate-700 shadow-card hover:shadow-elevated'
      }`}
    >
      <div>
        {/* Thumbnail Image */}
        <div className="relative h-40 w-full overflow-hidden bg-slate-800">
          <img
            src={place.image}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

          {/* Category Tag */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-slate-200 font-medium text-[10px] px-2.5 py-1 rounded-full border border-white/10 uppercase tracking-wider">
            {place.categoryLabel}
          </div>

          {/* Distance & Duration */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>{place.distanceKm} km away</span>
            </span>
            <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>~{place.durationMins} mins</span>
            </span>
          </div>
        </div>

        {/* Card Content Body */}
        <div className="p-4 sm:p-5">
          {/* Business Name */}
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1 mb-1">
            {place.name}
          </h3>

          {/* Rating & Distance Line (Matching ASCII: ★ 4.8 · 1.2 km) */}
          <div className="flex items-center gap-2 mb-2 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{place.rating}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-medium">{place.distanceKm} km</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-500 font-normal">({place.totalReviews} reviews)</span>
          </div>

          {/* Address */}
          <p className="text-xs text-slate-400 mb-2 line-clamp-1">
            {place.address}
          </p>

          {/* Open Status Indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                place.openStatus
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  place.openStatus ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              {place.openStatus ? 'Open now' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Row: [Directions] [♡] */}
      <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={openDirections}
          className="flex-1 flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-subtle active:scale-95 transition-all cursor-pointer"
          title="Open directions in Google Maps"
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span>Directions</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(place.id);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-xl border active:scale-90 transition-all cursor-pointer shrink-0 ${
            isFavorite
              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title={isFavorite ? 'Remove from saved' : 'Save place'}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'currentColor'}`} />
        </button>
      </div>
    </article>
  );
};
