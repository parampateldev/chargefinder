'use client';

import { useState } from 'react';
import { EVModel, UserLocation, ChargingStation, SearchFilters } from '@/types';
import CarSelector from '@/components/CarSelector';
import LocationSelector from '@/components/LocationSelector';
import ChargingStationCard from '@/components/ChargingStationCard';
import ChargingStationMap from '@/components/ChargingStationMap';
import { ChargingStationService } from '@/services/chargingStations';
import { Zap, Map, List, Filter, Search } from 'lucide-react';

export default function Home() {
  const [selectedCar, setSelectedCar] = useState<EVModel | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    maxDistance: 50,
    connectorTypes: [],
    minPower: 0,
    amenities: [],
    maxPricePerKwh: undefined
  });

  const handleSearch = async () => {
    if (!selectedCar || !userLocation) {
      alert('Please select your car and location first');
      return;
    }

    setIsLoading(true);
    try {
      const foundStations = await ChargingStationService.findNearbyStations(
        userLocation,
        selectedCar,
        filters
      );
      setStations(foundStations);
    } catch (error) {
      console.error('Error searching for stations:', error);
      alert('Error searching for charging stations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const canSearch = selectedCar && userLocation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ChargeFinder</h1>
                <p className="text-sm text-gray-600">Find the cheapest EV charging stations near you</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Map className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Find Charging Stations</h2>
              
              {/* Car Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your EV
                </label>
                <CarSelector 
                  selectedCar={selectedCar} 
                  onCarSelect={setSelectedCar} 
                />
              </div>

              {/* Location Selection */}
              <div>
                <LocationSelector onLocationSelect={setUserLocation} />
              </div>

              {/* Filters */}
              <div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                {showFilters && (
                  <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Max Distance: {filters.maxDistance} km
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="200"
                        value={filters.maxDistance}
                        onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Min Power: {filters.minPower} kW
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="250"
                        value={filters.minPower}
                        onChange={(e) => setFilters({...filters, minPower: parseInt(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Max Price per kWh: ${filters.maxPricePerKwh || 'No limit'}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={filters.maxPricePerKwh || 1}
                        onChange={(e) => setFilters({...filters, maxPricePerKwh: parseFloat(e.target.value)})}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={!canSearch || isLoading}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Search className="w-5 h-5" />
                {isLoading ? 'Searching...' : 'Find Charging Stations'}
              </button>

              {/* Results Summary */}
              {stations.length > 0 && (
                <div className="text-sm text-gray-600">
                  Found {stations.length} charging station{stations.length !== 1 ? 's' : ''}
                  {stations.length > 0 && (
                    <div className="mt-1">
                      Cheapest: ${stations[0].estimatedCost?.toFixed(2) || 'Free'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {stations.length === 0 && !isLoading ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ready to find charging stations?
                </h3>
                <p className="text-gray-600">
                  Select your EV model and location to get started
                </p>
              </div>
            ) : isLoading ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Searching for charging stations...</p>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <ChargingStationMap
                  stations={stations}
                  userLocation={userLocation || undefined}
                  selectedStation={selectedStation}
                  onStationSelect={setSelectedStation}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {stations.map((station) => (
                  <ChargingStationCard
                    key={station.id}
                    station={station}
                    onSelect={setSelectedStation}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
