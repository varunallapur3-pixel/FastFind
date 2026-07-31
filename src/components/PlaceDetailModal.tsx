import React from 'react';
import { Place } from '../types';
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
  Users,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: Place;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onStartNavigation: (place: Place) => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  isFavorite,
  onClose,
  onToggleFavorite,
  onStartNavigation,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#131313] border border-white/15 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,219,233,0.3)] my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-[#849495] hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 md:h-80 w-full overflow-hidden">
          <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#131313]/40 to-transparent" />

          {/* Favorite Trigger */}
          <button
            onClick={() => onToggleFavorite(place.id)}
            className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white transition-all active:scale-90"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-[#fface8] text-[#fface8]' : 'text-white'
              }`}
            />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#a9f900] text-[#223600] font-mono text-[10px] font-bold uppercase">
                {place.categoryLabel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00dbe9]/20 text-[#00dbe9] font-mono text-[10px] border border-[#00dbe9]/30">
                {place.openHours}
              </span>
            </div>
            <h1 className="font-headline font-bold text-3xl text-white drop-shadow-md">
              {place.name}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Key Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#1c1b1b] border border-white/10 text-center font-mono">
            <div>
              <span className="text-[10px] text-[#849495] uppercase block">RATING</span>
              <div className="flex items-center justify-center gap-1 text-[#a9f900] font-bold text-lg">
                <Star className="w-4 h-4 fill-current" />
                <span>{place.rating}</span>
              </div>
            </div>
            <div className="border-x border-white/10">
              <span className="text-[10px] text-[#849495] uppercase block">DISTANCE</span>
              <div className="flex items-center justify-center gap-1 text-[#00dbe9] font-bold text-lg">
                <MapPin className="w-4 h-4" />
                <span>{place.distanceMiles} mi</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#849495] uppercase block">ESTIMATED ETA</span>
              <div className="flex items-center justify-center gap-1 text-[#fface8] font-bold text-lg">
                <Clock className="w-4 h-4" />
                <span>{place.durationMins} m</span>
              </div>
            </div>
          </div>

          {/* AI Insights & Summary */}
          <div className="p-4 rounded-xl bg-[#00dbe9]/5 border border-[#00dbe9]/30">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#00dbe9]">
              <ShieldCheck className="w-4 h-4 text-[#00dbe9]" />
              <span className="font-bold">AI REAL-TIME INTELLIGENCE SUMMARY</span>
            </div>
            <p className="text-sm text-[#e5e2e1] leading-relaxed mb-3">
              "{place.aiSummary}"
            </p>
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded bg-[#201f1f] text-[11px] font-mono text-[#b9cacb] border border-white/5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Crowd Density Gauge */}
          <div className="p-4 rounded-xl bg-[#1c1b1b] border border-white/10">
            <div className="flex justify-between items-center mb-2 font-mono text-xs">
              <span className="text-[#849495] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#a9f900]" /> CROWD DENSITY METER
              </span>
              <span className="text-[#a9f900] font-bold">
                {place.crowdDensity}% (LOW DENSITY)
              </span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#a9f900] h-full rounded-full transition-all"
                style={{ width: `${place.crowdDensity}%` }}
              />
            </div>
          </div>

          {/* Features List */}
          <div>
            <h3 className="font-mono text-xs text-[#849495] uppercase tracking-wider mb-2">
              KEY AMENITIES & FEATURES
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {place.features.map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-xs font-mono text-[#b9cacb]">
                  <CheckCircle2 className="w-4 h-4 text-[#00dbe9] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact & Location */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            <a
              href={`tel:${place.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#00dbe9] border border-white/10 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{place.phone}</span>
            </a>
            <a
              href={place.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-[#00dbe9] border border-white/10 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>VISIT WEBSITE</span>
            </a>
          </div>

          {/* Action Triggers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <button
              onClick={() => {
                const mapsUrl = getGoogleMapsDirUrl(place.name, place.address, place.coords.lat, place.coords.lng);
                window.open(mapsUrl, '_blank');
              }}
              className="flex items-center justify-center gap-2 bg-[#a9f900] hover:bg-white text-[#223600] font-headline font-bold text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(169,249,0,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-current" />
              <span>GOOGLE MAPS NAV</span>
            </button>

            <button
              onClick={() => onStartNavigation(place)}
              className="flex items-center justify-center gap-2 bg-[#00dbe9] hover:bg-white text-[#00363a] font-headline font-bold text-sm py-4 rounded-xl shadow-[0_0_20px_rgba(0,219,233,0.4)] active:scale-95 transition-all cursor-pointer"
            >
              <span>IN-APP MAP HUD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
