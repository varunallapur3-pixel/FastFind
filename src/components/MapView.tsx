import React, { useEffect, useRef, useState } from 'react';
import { Place } from '../types';
import { getDirections } from '../services/googleDirections';
import { getGoogleMapsDirUrl } from '../utils/geo';
import L from 'leaflet';
import { MapPin, Navigation, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  selectedPlace: Place | null;
  hoveredPlace?: Place | null;
  onSelectPlace: (place: Place) => void;
  userCoords?: { lat: number; lng: number } | null;
  heightClass?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  selectedPlace,
  hoveredPlace,
  onSelectPlace,
  userCoords,
  heightClass = 'h-full',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);
  const polylineLayer = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ duration: string; distance: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || !userCoords) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMap.current = map;
      markersGroup.current = L.layerGroup().addTo(map);
    } else {
      leafletMap.current.panTo([userCoords.lat, userCoords.lng]);
    }
  }, [userCoords?.lat, userCoords?.lng]);

  // Update Place Markers & Synchronized Hover/Selected state
  useEffect(() => {
    const map = leafletMap.current;
    const group = markersGroup.current;
    if (!map || !group || !userCoords) return;

    group.clearLayers();

    // User Location Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="relative w-6 h-6 flex items-center justify-center">
        <div class="absolute inset-0 bg-brand-500 rounded-full animate-ping opacity-75"></div>
        <div class="relative w-4 h-4 bg-brand-600 rounded-full border-2 border-white shadow-md"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .bindPopup('<strong style="color: #0275c8;">Your Location</strong>')
      .addTo(group);

    // Place Markers
    places.slice(0, 20).forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isHovered = hoveredPlace?.id === place.id;

      let bgColor = 'bg-slate-900 text-white';
      let borderStyle = 'border-slate-700';

      if (isSelected) {
        bgColor = 'bg-brand-600 text-white scale-125 z-50';
        borderStyle = 'border-white ring-2 ring-brand-500 shadow-lg';
      } else if (isHovered) {
        bgColor = 'bg-slate-800 text-brand-400 scale-110';
        borderStyle = 'border-brand-500 shadow-md';
      } else if (place.isTopMatch) {
        bgColor = 'bg-emerald-600 text-white';
        borderStyle = 'border-white';
      }

      const iconHtml = `<div class="relative group cursor-pointer">
        <div class="px-2.5 py-1 rounded-full ${bgColor} border ${borderStyle} flex items-center gap-1 text-xs font-bold shadow-subtle transition-all">
          <span>★ ${place.rating}</span>
        </div>
      </div>`;

      const customIcon = L.divIcon({
        className: 'custom-place-marker',
        html: iconHtml,
        iconSize: [40, 26],
        iconAnchor: [20, 13],
      });

      const marker = L.marker([place.coords.lat, place.coords.lng], { icon: customIcon });

      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-1 font-sans text-xs';
      popupDiv.innerHTML = `
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;">${place.name}</div>
        <div style="color: #64748b; margin-bottom: 8px;">★ ${place.rating} (${place.totalReviews}) • ${place.distanceKm} km</div>
        <div style="display: flex; gap: 6px;">
          <button id="map-popup-nav-${place.id}" style="flex: 1; background: #0275c8; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 600; cursor: pointer;">
            Directions
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);
      marker.on('click', () => {
        onSelectPlace(place);
        setTimeout(() => {
          const navBtn = document.getElementById(`map-popup-nav-${place.id}`);
          if (navBtn) {
            navBtn.onclick = () => {
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
          }
        }, 100);
      });

      marker.addTo(group);
    });
  }, [places, selectedPlace, hoveredPlace, userCoords?.lat, userCoords?.lng, onSelectPlace]);

  // Render Directions Polyline for Selected Place
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !selectedPlace || !userCoords) return;

    if (polylineLayer.current) {
      map.removeLayer(polylineLayer.current);
      polylineLayer.current = null;
    }

    let isCancelled = false;

    getDirections(userCoords, selectedPlace.coords).then((route) => {
      if (isCancelled || !leafletMap.current || !userCoords) return;

      const latlngs: L.LatLngExpression[] = route?.path?.length
        ? route.path.map((p) => [p.lat, p.lng] as L.LatLngExpression)
        : [
            [userCoords.lat, userCoords.lng],
            [selectedPlace.coords.lat, selectedPlace.coords.lng],
          ];

      polylineLayer.current = L.polyline(latlngs, {
        color: '#0275c8',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(polylineLayer.current.getBounds(), { padding: [40, 40] });

      if (route) {
        setRouteInfo({ duration: route.durationText, distance: route.distanceText });
      } else {
        setRouteInfo(null);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedPlace, userCoords]);

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card bg-slate-900 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-32px)]' : heightClass
      }`}
    >
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-subtle">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live Map • {places.length} Places</span>
      </div>

      {/* Route Info Badge */}
      {routeInfo && selectedPlace && (
        <div className="absolute top-4 left-48 z-[400] hidden sm:flex items-center gap-2 bg-brand-600 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold shadow-subtle">
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span>{selectedPlace.name}: {routeInfo.duration} ({routeInfo.distance})</span>
        </div>
      )}

      {/* Expand Fullscreen Button */}
      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-4 right-4 z-[400] p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 shadow-subtle cursor-pointer"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Leaflet Canvas Container */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
