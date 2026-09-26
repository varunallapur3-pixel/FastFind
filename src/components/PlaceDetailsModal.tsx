import React, { useState } from 'react';
import { Place, Coords } from '../types';
import { getGoogleMapsDirUrl } from '../utils/geo';
import {
  X,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  Heart,
  Share2,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';

interface PlaceDetailsModalProps {
  place: Place;
  userCoords?: Coords | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  userCoords,
  isFavorite,
  onClose,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState(false);

  const openDirections = () => {
    const mapsUrl = getGoogleMapsDirUrl(
      place.name,
      place.address,
      place.coords.lat,
      place.coords.lng,
      userCoords?.lat,
      userCoords?.lng
    );
    window.open(mapsUrl, '_blank');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-elevated my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-900 transition-colors cursor-pointer"
          title="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Photo Banner */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />

          {/* Favorite & Share Bar */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(place.id)}
              className="p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 text-white transition-all active:scale-90 cursor-pointer"
              title={isFavorite ? 'Remove favorite' : 'Save favorite'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 text-white transition-all active:scale-90 cursor-pointer flex items-center gap-1.5 text-xs font-medium px-3"
              title="Share place"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>

          {/* Place Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-brand-600 text-white font-semibold text-xs uppercase tracking-wider">
                {place.categoryLabel}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  place.openStatus
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {place.openStatus ? 'Open Now' : 'Closed'}
              </span>
            </div>
            <h1 className="font-extrabold text-2xl sm:text-3xl drop-shadow-sm">
              {place.name}
            </h1>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>{place.address}</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-center font-sans">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Rating
              </span>
              <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-lg">
                <Star className="w-4 h-4 fill-current" />
                <span>{place.rating}</span>
                <span className="text-xs font-normal text-slate-500">({place.totalReviews})</span>
              </div>
            </div>

            <div className="border-x border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Distance
              </span>
              <div className="flex items-center justify-center gap-1 text-brand-600 dark:text-brand-400 font-extrabold text-lg">
                <MapPin className="w-4 h-4" />
                <span>{place.distanceKm} km</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                ETA
              </span>
              <div className="flex items-center justify-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold text-lg">
                <Clock className="w-4 h-4" />
                <span>~{place.durationMins}m</span>
              </div>
            </div>
          </div>

          {/* AI Recommendation Summary */}
          <div className="p-4 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/20">
            <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-brand-700 dark:text-brand-300">
              <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Smart Recommendation Summary</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              "{place.aiSummary}"
            </p>
          </div>

          {/* Features */}
          {place.features && place.features.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Key Features & Amenities
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {place.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Links */}
          <div className="flex flex-wrap gap-3 pt-2">
            {place.phone && (
              <a
                href={`tel:${place.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-500" />
                <span>{place.phone}</span>
              </a>
            )}

            {place.website && (
              <a
                href={place.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-500" />
                <span>Visit Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>

          {/* Navigation Primary Action */}
          <div className="pt-2">
            <button
              onClick={openDirections}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3.5 rounded-2xl shadow-subtle active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>Get Directions in Google Maps</span>
              <ExternalLink className="w-4 h-4 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
