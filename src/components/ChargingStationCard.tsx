'use client';

import { ChargingStation } from '@/types';
import { MapPin, Zap, DollarSign, Clock, Wifi, Coffee, ShoppingBag, Car } from 'lucide-react';

interface ChargingStationCardProps {
  station: ChargingStation;
  onSelect: (station: ChargingStation) => void;
}

export default function ChargingStationCard({ station, onSelect }: ChargingStationCardProps) {
  const getConnectorIcon = (type: string) => {
    switch (type) {
      case 'Tesla_Supercharger':
        return '⚡';
      case 'CCS1':
      case 'CCS2':
        return '🔌';
      case 'CHAdeMO':
        return '🔋';
      case 'Type1':
      case 'Type2':
        return '🔌';
      default:
        return '⚡';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'food':
      case 'coffee':
        return <Coffee className="w-4 h-4" />;
      case 'shopping':
        return <ShoppingBag className="w-4 h-4" />;
      case 'restrooms':
        return <Car className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'Price unknown';
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const formatDistance = (distance: number | undefined) => {
    if (distance === undefined) return '';
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect(station)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{station.name}</h3>
          <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            <span>{station.address}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {formatPrice(station.estimatedCost)}
          </div>
          <div className="text-sm text-gray-500">
            {formatDistance(station.distance)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-700">{station.provider}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          station.availability === 'available' 
            ? 'bg-green-100 text-green-800' 
            : station.availability === 'occupied'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {station.availability.replace('_', ' ')}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {station.connectors.map((connector) => (
            <div key={connector.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
              <span>{getConnectorIcon(connector.type)}</span>
              <span>{connector.type}</span>
              <span className="text-gray-600">({connector.power}kW)</span>
            </div>
          ))}
        </div>
      </div>

      {station.pricing.energyRate !== undefined && (
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>${station.pricing.energyRate.toFixed(2)}/kWh</span>
          </div>
          {station.pricing.timeRate && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>${station.pricing.timeRate.toFixed(2)}/min</span>
            </div>
          )}
          {station.pricing.sessionFee && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>${station.pricing.sessionFee.toFixed(2)} session</span>
            </div>
          )}
        </div>
      )}

      {station.amenities.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Amenities:</span>
          {station.amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}