import React, { useState, useEffect, useRef } from 'react';
import { Place, NavigationStep, Coords } from '../types';
import { getGoogleMapsDirUrl } from '../utils/geo';
import L from 'leaflet';
import { Navigation, ArrowUp, Flag, X, Volume2, Gauge, ExternalLink, ShieldCheck } from 'lucide-react';

interface LiveNavigationOverlayProps {
  place: Place;
  userCoords: Coords;
  onEndNavigation: () => void;
  onArrived: () => void;
}

export const LiveNavigationOverlay: React.FC<LiveNavigationOverlayProps> = ({
  place,
  userCoords,
  onEndNavigation,
  onArrived,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);

  const [progressPercent, setProgressPercent] = useState(15);
  const [speedKmh, setSpeedKmh] = useState(32);

  const googleMapsUrl = getGoogleMapsDirUrl(
    place.name,
    place.address,
    place.coords.lat,
    place.coords.lng,
    userCoords.lat,
    userCoords.lng
  );

  const steps: NavigationStep[] = [
    {
      id: 1,
      instruction: `Head towards ${place.name} (${place.address})`,
      distance: `${place.distanceKm || 0.8} km`,
      duration: `${place.durationMins || 3} min`,
      icon: 'arrow-up',
    },
    {
      id: 2,
      instruction: `Turn onto ${place.address}`,
      distance: '200 m',
      duration: '30 sec',
      icon: 'corner-right',
    },
    {
      id: 3,
      instruction: `Arrive at ${place.name}`,
      distance: '50 m',
      duration: '10 sec',
      icon: 'flag',
    },
  ];

  // Initialize Map inside Live Navigation HUD
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      // User Position Marker
      const userIcon = L.divIcon({
        className: 'custom-user-nav-marker',
        html: `<div class="relative w-8 h-8 flex items-center justify-center">
          <div class="absolute inset-0 bg-[#00dbe9] rounded-full animate-ping opacity-75"></div>
          <div class="relative w-5 h-5 bg-[#00dbe9] rounded-full border-2 border-white shadow-[0_0_20px_#00dbe9]"></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);

      // Destination Marker
      const destIcon = L.divIcon({
        className: 'custom-dest-nav-marker',
        html: `<div class="relative w-8 h-8 rounded-full bg-[#131313] border-2 border-[#a9f900] flex items-center justify-center shadow-[0_0_20px_#a9f900]">
          <span class="text-xs font-mono font-bold text-[#a9f900]">★</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([place.coords.lat, place.coords.lng], { icon: destIcon }).addTo(map);

      // Route Polyline
      L.polyline(
        [
          [userCoords.lat, userCoords.lng],
          [place.coords.lat, place.coords.lng],
        ],
        {
          color: '#a9f900',
          weight: 5,
          opacity: 0.9,
          dashArray: '10, 10',
        }
      ).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds([
        [userCoords.lat, userCoords.lng],
        [place.coords.lat, place.coords.lng],
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });

      leafletMap.current = map;
    }
  }, [userCoords, place]);

  // Simulate active progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onArrived();
          return 100;
        }
        return prev + 10;
      });

      setSpeedKmh(28 + Math.floor(Math.random() * 8));
    }, 2500);

    return () => clearInterval(interval);
  }, [onArrived]);

  const currentStep = steps[0];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-xl flex flex-col justify-between p-4 md:p-8 animate-fadeIn">
      {/* Top Header HUD */}
      <div className="flex justify-between items-center bg-[#131313] border border-[#00dbe9]/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,219,233,0.3)] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#a9f900] text-[#223600] flex items-center justify-center animate-pulse shrink-0">
            <ArrowUp className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#a9f900] uppercase tracking-widest block font-bold">
              NEXT MANEUVER ({currentStep.distance})
            </span>
            <h3 className="font-headline font-bold text-base md:text-lg text-[#e5e2e1] line-clamp-1">
              {currentStep.instruction}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Direct Google Maps Trigger */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#a9f900] text-[#223600] font-headline font-bold text-xs hover:bg-white shadow-[0_0_15px_rgba(169,249,0,0.5)] transition-all cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">OPEN IN GOOGLE MAPS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => alert(`Audio turn guidance enabled for ${place.name}`)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#00dbe9] border border-white/10"
            title="Audio Guidance"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            onClick={onEndNavigation}
            className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 cursor-pointer"
            title="Exit Route"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Middle Interactive Leaflet Map HUD */}
      <div className="relative flex-1 my-4 rounded-2xl overflow-hidden glass-card border border-[#00dbe9]/30">
        <div className="scanline" />

        {/* Real Leaflet Map Container */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Speedometer Overlay */}
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-3 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <Gauge className="w-5 h-5 text-[#a9f900]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#849495]">SPEED</span>
            <span className="font-headline font-bold text-lg text-[#a9f900]">
              {speedKmh} <span className="text-xs font-mono text-[#849495]">KM/H</span>
            </span>
          </div>
        </div>

        {/* Bottom Destination Floating Card */}
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 z-[400] p-4 rounded-2xl bg-[#0e0e0e]/95 border border-[#00dbe9]/50 shadow-[0_0_30px_rgba(0,219,233,0.4)] backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-[#a9f900] uppercase font-bold tracking-wider">
              LIVE NAVIGATION ACTIVE
            </span>
          </div>
          <h2 className="font-headline font-bold text-xl text-[#e5e2e1]">{place.name}</h2>
          <p className="text-xs font-mono text-[#b9cacb] mb-3">{place.address}</p>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10 mb-2">
            <div
              className="bg-gradient-to-r from-[#00dbe9] to-[#a9f900] h-full rounded-full transition-all duration-700 shadow-[0_0_15px_#a9f900]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#849495]">
            <span>START</span>
            <span className="text-[#a9f900] font-bold">{progressPercent}% COMPLETED</span>
            <span>{place.durationMins || 3} MINS</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Controls */}
      <div className="bg-[#131313] border border-white/10 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#00dbe9]">
          <ShieldCheck className="w-4 h-4 text-[#a9f900]" />
          <span>GPS ACCURACY LOCKED TO YOUR LOCATION</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-xl bg-[#a9f900] text-[#223600] font-headline font-bold text-xs hover:bg-white transition-all shadow-[0_0_20px_rgba(169,249,0,0.4)] flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-4 h-4 fill-current" />
            <span>OPEN IN GOOGLE MAPS</span>
          </a>

          <button
            onClick={onEndNavigation}
            className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs border border-white/10 transition-all cursor-pointer"
          >
            END ROUTE
          </button>
        </div>
      </div>
    </div>
  );
};
