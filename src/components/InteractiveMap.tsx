import React, { useEffect, useRef } from 'react';
import { Place } from '../types';
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

  // Initialize Map & Recenter when GPS coordinates change
  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMap.current) {
      const map = L.map(mapRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 14,
        zoomControl: false,
      });

      // Dark Mode Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Custom Zoom Control
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      leafletMap.current = map;
      markersGroup.current = L.layerGroup().addTo(map);
    } else {
      leafletMap.current.panTo([userCoords.lat, userCoords.lng]);
    }
  }, [userCoords.lat, userCoords.lng]);

  // Update Markers & Polyline
  useEffect(() => {
    const map = leafletMap.current;
    const group = markersGroup.current;
    if (!map || !group) return;

    group.clearLayers();

    // User Location Marker (Pulse Blue)
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
      .bindPopup('<strong style="color: #00dbe9;">YOUR GPS LOCATION</strong><br>Downtown Core Perimeter')
      .addTo(group);

    // Place Markers
    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const isTop = place.rating >= 4.9 || place.isTopMatch;

      const markerColor = isSelected ? '#a9f900' : isTop ? '#00dbe9' : '#b9cacb';

      const iconHtml = `<div class="relative group cursor-pointer">
        <div class="w-8 h-8 rounded-full bg-[#131313] flex items-center justify-center transform transition-transform hover:scale-125" style="border: 2px solid ${markerColor}; box-shadow: 0 0 15px ${markerColor};">
          <span className="text-[10px] font-mono font-bold" style="color: ${markerColor};">${place.rating}</span>
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
        <div style="color: #849495; margin-bottom: 6px;">★ ${place.rating} • ${place.distanceMiles} miles away</div>
        <button id="nav-btn-${place.id}" style="width: 100%; background: #00dbe9; color: #00363a; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">
          NAVIGATE NOW
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectPlace(place);
        setTimeout(() => {
          const btn = document.getElementById(`nav-btn-${place.id}`);
          if (btn) {
            btn.onclick = () => onStartNavigation(place);
          }
        }, 100);
      });

      marker.addTo(group);
    });

    // Draw Route Polyline if Selected Place exists
    if (polylineLayer.current) {
      map.removeLayer(polylineLayer.current);
      polylineLayer.current = null;
    }

    if (selectedPlace) {
      const latlngs: L.LatLngExpression[] = [
        [userCoords.lat, userCoords.lng],
        [selectedPlace.coords.lat, selectedPlace.coords.lng],
      ];

      polylineLayer.current = L.polyline(latlngs, {
        color: '#a9f900',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map);

      // Pan to fit route bounds
      map.panTo([selectedPlace.coords.lat, selectedPlace.coords.lng]);
    }
  }, [places, selectedPlace, userCoords.lat, userCoords.lng, onSelectPlace, onStartNavigation]);

  return (
    <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden glass-card border border-white/10 shadow-2xl">
      {/* Top Map HUD overlay */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-[#050505]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-[#00dbe9]">
        <span className="w-2 h-2 rounded-full bg-[#a9f900] animate-pulse" />
        <span>LIVE MAP ACTIVE ({places.length} NODES)</span>
      </div>

      {/* Map Element Container */}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};
