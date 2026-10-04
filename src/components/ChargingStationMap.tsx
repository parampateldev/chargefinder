'use client';

import { useEffect, useRef } from 'react';
import { ChargingStation } from '@/types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCost(cost: number | undefined): string {
  if (cost === undefined) return 'Price unknown';
  if (cost === 0) return 'Free';
  return `$${cost.toFixed(2)}`;
}

interface ChargingStationMapProps {
  stations: ChargingStation[];
  userLocation?: { latitude: number; longitude: number };
  selectedStation?: ChargingStation;
  onStationSelect: (station: ChargingStation) => void;
}

export default function ChargingStationMap({ 
  stations, 
  userLocation, 
  selectedStation, 
  onStationSelect 
}: ChargingStationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const DEFAULT_CENTER: L.LatLngTuple = [34.0522, -118.2437];

  // Create the map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initialCenter: L.LatLngTuple = userLocation
      ? [userLocation.latitude, userLocation.longitude]
      : DEFAULT_CENTER;
    const map = L.map(mapRef.current).setView(initialCenter, 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      userMarkerRef.current = null;
      markersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show the user marker and center on it when the location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }
    if (!userLocation) return;

    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(map)
      .bindPopup('Your Location');
    map.setView([userLocation.latitude, userLocation.longitude], map.getZoom());
  }, [userLocation]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add station markers
    stations.forEach(station => {
      const isSelected = selectedStation?.id === station.id;
      const isAvailable = station.availability === 'available';
      
      const stationIcon = L.divIcon({
        className: 'station-marker',
        html: `<div style="
          background-color: ${isSelected ? '#ef4444' : isAvailable ? '#10b981' : '#f59e0b'};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">⚡</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${escapeHtml(station.name)}</h3>
            <p class="text-xs text-gray-600">${escapeHtml(station.address)}</p>
            <p class="text-xs text-green-600 font-medium">${escapeHtml(formatCost(station.estimatedCost))}</p>
          </div>
        `)
        .on('click', () => onStationSelect(station));

      markersRef.current.push(marker);
    });

    // Fit the view to the stations, keeping the user's location at the center
    const map = mapInstanceRef.current;
    if (stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(st => [st.latitude, st.longitude] as L.LatLngTuple));
      if (userLocation) {
        const { latitude, longitude } = userLocation;
        bounds.extend([latitude, longitude]);
        // Mirror each station through the user's position so the user stays centered
        stations.forEach(st => {
          bounds.extend([2 * latitude - st.latitude, 2 * longitude - st.longitude]);
        });
      }
      map.fitBounds(bounds.pad(0.1), { maxZoom: 15 });
    } else if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  }, [stations, selectedStation, onStationSelect, userLocation]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}