import React, { useState, useEffect } from 'react';
import { Place, Coords } from '../types';
import { getGoogleMapsDirUrl } from '../utils/geo';
import { Navigation, Star, MapPin, Clock, X, Zap, ExternalLink, ShieldCheck } from 'lucide-react';

interface AutoNavigateModalProps {
  place: Place;
  userCoords?: Coords;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#131313] border-2 border-[#00dbe9] rounded-2xl p-6 shadow-[0_0_50px_rgba(0,219,233,0.5)] overflow-hidden">
        {/* Top Scanline */}
        <div className="scanline" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-[#849495] hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className="px-3 py-1 rounded-full bg-[#a9f900] text-[#223600] font-mono text-[11px] font-bold tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(169,249,0,0.5)]">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>#1 HIGHEST RATED MATCH</span>
          </div>
          <span className="text-xs font-mono text-[#00dbe9]">GOOGLE MAPS READY</span>
        </div>

        {/* Title */}
        <h2 className="font-headline font-bold text-2xl text-[#e5e2e1] mb-1">
          {place.name}
        </h2>

        {/* Rating and Distance HUD */}
        <div className="flex items-center gap-3 mb-4 text-xs font-mono">
          <div className="flex items-center gap-1 text-[#a9f900] font-bold">
            <Star className="w-4 h-4 fill-current text-[#a9f900]" />
            <span className="text-sm">{place.rating}</span>
            <span className="text-[#849495]">({place.totalReviews} reviews)</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-[#849495]" />
          <div className="flex items-center gap-1 text-[#00dbe9]">
            <MapPin className="w-3.5 h-3.5" />
            <span>{place.distanceKm ?? place.distanceMiles} km</span>
          </div>
          <span className="w-1 h-1 rounded-full bg-[#849495]" />
          <div className="flex items-center gap-1 text-[#fface8]">
            <Clock className="w-3.5 h-3.5" />
            <span>{place.durationMins} mins ETA</span>
          </div>
        </div>

        {/* Image Preview */}
        <div className="relative h-44 rounded-xl overflow-hidden mb-4 border border-white/10 group">
          <img
            src={place.image}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md font-mono text-[10px] text-[#b9cacb] border border-white/10">
              {place.address}
            </span>
            <span className="px-2.5 py-1 rounded bg-[#a9f900]/20 text-[#a9f900] font-mono text-[10px] font-bold border border-[#a9f900]/40">
              OPEN NOW
            </span>
          </div>
        </div>

        {/* AI Recommendation Summary */}
        <div className="p-3.5 rounded-xl bg-[#1c1b1b] border border-white/10 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#00dbe9] mb-1">
            <ShieldCheck className="w-4 h-4 text-[#00dbe9]" />
            <span>AI TOP RATED HIGHLIGHT</span>
          </div>
          <p className="text-xs text-[#b9cacb] leading-relaxed">
            "{place.aiSummary}"
          </p>
        </div>

        {/* Auto Navigation Timer Status */}
        {autoNavActive && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/30 mb-4">
            <span className="text-xs font-mono text-[#00dbe9] animate-pulse">
              Opening Google Maps navigation in <strong className="text-[#a9f900] text-sm">{countdown}s</strong>...
            </span>
            <button
              onClick={() => setAutoNavActive(false)}
              className="text-[11px] font-mono text-[#849495] hover:text-white underline cursor-pointer"
            >
              PAUSE TIMER
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Direct Google Maps Navigation Button */}
          <button
            onClick={openGoogleMapsNav}
            className="w-full flex items-center justify-center gap-2 bg-[#a9f900] hover:bg-white text-[#223600] font-headline font-bold text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(169,249,0,0.5)] active:scale-95 transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>NAVIGATE IN GOOGLE MAPS</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewDetails(place)}
              className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#e5e2e1] border border-white/15 font-mono text-xs py-3 rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              <span>DETAILS</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#849495] border border-white/15 font-mono text-xs py-3 rounded-xl active:scale-95 transition-all cursor-pointer"
            >
              <span>DISMISS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
