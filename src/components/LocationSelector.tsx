'use client';

import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationSelectorProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address?: string }) => void;
}

export default function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&limit=1`
          );
          const data = await response.json();
          const address = data.results?.[0]?.formatted || 'Current Location';
          
          onLocationSelect({ latitude, longitude, address });
        } catch (error) {
          console.error('Error getting address:', error);
          onLocationSelect({ latitude, longitude, address: 'Current Location' });
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter it manually.');
        setIsLoading(false);
      }
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAddress.trim()) return;

    setIsLoading(true);
    try {
      // Forward geocoding to get coordinates
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(manualAddress)}&key=YOUR_API_KEY&limit=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        onLocationSelect({ 
          latitude: lat, 
          longitude: lng, 
          address: data.results[0].formatted 
        });
      } else {
        alert('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Error finding address. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700">
        <MapPin className="w-5 h-5" />
        <span className="font-medium">Location</span>
      </div>
      
      <button
        onClick={getCurrentLocation}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Navigation className="w-5 h-5" />
        {isLoading ? 'Getting your location...' : 'Use Current Location'}
      </button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or enter manually</span>
        </div>
      </div>
      
      <form onSubmit={handleManualSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Enter your address, city, or ZIP code"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading || !manualAddress.trim()}
          className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Finding location...' : 'Find Location'}
        </button>
      </form>
    </div>
  );
}