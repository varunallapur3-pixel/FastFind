import React, { useEffect, useRef, useState } from 'react';
import { Place } from '../types';
import { getDirections } from '../services/googleDirections';
import L from 'leaflet';

interface InteractiveMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  onStartNavigation: (place: Place) => void;
  userCoords?: { lat: number; lng: number };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  onStartNavigation,
  userCoords = { lat: 16.8302, lng: 75.7100 },
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.LayerGroup | null>(null);
  const polylineLayer = useRef<L.Polyline | null>(null);
  const [routeEta, setRouteEta] = useState<string | null>(null);

  // Initialize Map & recenter when GPS changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 14,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMap.current = map;
      markersGroup.current = L.layerGroup().addTo(map);
    } else {
      leafletMap.current.panTo([userCoords.lat, userCoords.lng]);
    }
  }, [userCoords.lat, userCoords.lng]);

  // Update markers
  useEffect(() => {
    const map = leafletMap.current;
    const group = markersGroup.current;
    if (!map || !group) return;

    group.clearLayers();

    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="relative w-6 h-6 flex items-center justify-center">
        <div class="absolute inset-0 bg-[#00dbe9] rounded-full animate-ping opacity-75"></div>
        <div class="relative w-4 h-4 bg-[#00dbe9] rounded-full border-2 border-white shadow-[0_0_15px_#00dbe9]"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
      .bindPopup('<strong style="color: #00dbe9;">YOUR LOCATION</strong>')
      .addTo(group);

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isTop = place.isTopMatch || place.rating >= 4.5;
      const markerColor = isSelected ? '#a9f900' : isTop ? '#00dbe9' : '#b9cacb';

      const iconHtml = `<div class="relative group cursor-pointer">
        <div class="w-8 h-8 rounded-full bg-[#131313] flex items-center justify-center transform transition-transform hover:scale-125" style="border: 2px solid ${markerColor}; box-shadow: 0 0 15px ${markerColor};">
          <span style="color: ${markerColor}; font-size: 10px; font-weight: bold;">${place.rating}</span>
        </div>
      </div>`;

      const customIcon = L.divIcon({
        className: 'custom-place-marker',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([place.coords.lat, place.coords.lng], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-mono text-xs';
      popupContent.innerHTML = `
        <div style="font-weight: bold; color: ${markerColor}; font-size: 14px;">${place.name}</div>
        <div style="color: #849495; margin-bottom: 6px;">★ ${place.rating} • ${place.distanceKm} km away</div>
        <button id="nav-btn-${place.id}" style="width: 100%; background: #00dbe9; color: #00363a; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">
          NAVIGATE NOW
        </button>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onSelectPlace(place);
        setTimeout(() => {
          const btn = document.getElementById(`nav-btn-${place.id}`);
          if (btn) btn.onclick = () => onStartNavigation(place);
        }, 100);
      });

      marker.addTo(group);
    });
  }, [places, selectedPlace, userCoords.lat, userCoords.lng, onSelectPlace, onStartNavigation]);

  // Draw Google Directions route for selected place
  useEffect(() => {
    const map = leafletMap.current;
    if (!map || !selectedPlace) return;

    if (polylineLayer.current) {
      map.removeLayer(polylineLayer.current);
      polylineLayer.current = null;
    }

    let cancelled = false;

    getDirections(userCoords, selectedPlace.coords).then((route) => {
      if (cancelled || !leafletMap.current) return;

      const latlngs: L.LatLngExpression[] = route?.path?.length
        ? route.path.map((p) => [p.lat, p.lng] as L.LatLngExpression)
        : [
            [userCoords.lat, userCoords.lng],
            [selectedPlace.coords.lat, selectedPlace.coords.lng],
          ];

      polylineLayer.current = L.polyline(latlngs, {
        color: '#a9f900',
        weight: 5,
        opacity: 0.9,
      }).addTo(map);

      map.fitBounds(polylineLayer.current.getBounds(), { padding: [40, 40] });

      if (route) {
        setRouteEta(`${route.durationText} • ${route.distanceText}`);
      } else {
        setRouteEta(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedPlace, userCoords]);

  return (
    <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl">
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-[#050505]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-[#00dbe9]">
        <span className="w-2 h-2 rounded-full bg-[#a9f900] animate-pulse" />
        <span>LIVE MAP • {places.length} PLACES WITHIN 4KM (4000M)</span>
      </div>

      {routeEta && selectedPlace && (
        <div className="absolute top-4 right-4 z-[400] bg-[#a9f900]/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#a9f900]/40 font-mono text-xs text-[#a9f900]">
          {selectedPlace.name}: {routeEta}
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
