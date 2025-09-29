'use client';

import { useState } from 'react';
import { EVModel } from '@/types';
import { EV_MODELS } from '@/data/evModels';
import { ChevronDown, Car } from 'lucide-react';

interface CarSelectorProps {
  selectedCar: EVModel | null;
  onCarSelect: (car: EVModel) => void;
}

export default function CarSelector({ selectedCar, onCarSelect }: CarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCars = EV_MODELS.filter(car =>
    car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    car.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Car className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700">
            {selectedCar ? `${selectedCar.manufacturer} ${selectedCar.name}` : 'Select your EV model'}
          </span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search for your EV model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCars.length > 0 ? (
              filteredCars.map((car) => (
                <button
                  key={car.id}
                  onClick={() => {
                    onCarSelect(car);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{car.manufacturer} {car.name}</div>
                  <div className="text-sm text-gray-500">
                    {car.batteryCapacity}kWh • {car.connectorTypes.join(', ')}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-gray-500 text-center">No cars found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}