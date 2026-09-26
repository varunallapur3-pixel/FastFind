import React, { useState, useEffect } from 'react';
import { Place, Coords } from '../types';
import { getGoogleMapsDirUrl } from '../utils/geo';
import { Navigation, Star, MapPin, Clock, X, Zap, ExternalLink, ShieldCheck } from 'lucide-react';

interface AutoNavigateModalProps {
  place: Place;
  userCoords?: Coords | null;
  onClose: () => void;
  onViewDetails: (place: Place) => void;
}

export const AutoNavigateModal: React.FC<AutoNavigateModalProps> = ({
  place,
  userCoords,
  onClose,
  onViewDetails,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [autoNavActive, setAutoNavActive] = useState(true);

  const openGoogleMapsNav = () => {
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

  useEffect(() => {
    if (!autoNavActive) return;

    if (countdown === 0) {
      openGoogleMapsNav();
      onClose();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, autoNavActive, onClose, place]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-elevated">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Top Rated Match</span>
          </div>
          <span className="text-xs text-slate-500">Google Maps Ready</span>
        </div>

        {/* Title */}
        <h2 className="font-bold text-2xl text-slate-900 dark:text-slate-100 mb-1">
          {place.name}
        </h2>

        {/* Rating and Distance HUD */}
        <div className="flex items-center gap-3 mb-4 text-xs">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm">{place.rating}</span>
            <span className="text-slate-500 font-normal">({place.totalReviews} reviews)</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{place.distanceKm} km</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>~{place.durationMins} mins ETA</span>
          </div>
        </div>

        {/* Image Preview */}
        <div className="relative h-44 rounded-2xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-xs text-white">
              {place.address}
            </span>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Why this match?</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            "{place.aiSummary}"
          </p>
        </div>

        {/* Timer status */}
        {autoNavActive && (
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 mb-4 text-xs font-medium">
            <span>
              Opening navigation in <strong className="text-brand-600 dark:text-brand-400 font-bold text-sm">{countdown}s</strong>...
            </span>
            <button
              onClick={() => setAutoNavActive(false)}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
            >
              Pause
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={openGoogleMapsNav}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm py-3 rounded-xl shadow-subtle transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>Navigate in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(place)}
              className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
            >
              View Details
            </button>

            <button
              onClick={onClose}
              className="py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 font-medium text-xs rounded-xl transition-all cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
