import { ChargingStation, UserLocation, EVModel, SearchFilters } from '@/types';

// Mock data for demonstration - in a real app, this would come from various APIs
const MOCK_STATIONS: ChargingStation[] = [
  {
    id: 'station-1',
    name: 'Tesla Supercharger - Downtown',
    address: '123 Main St, Downtown, CA 90210',
    latitude: 34.0522,
    longitude: -118.2437,
    provider: 'Tesla',
    connectors: [
      { id: 'conn-1', type: 'Tesla_Supercharger', power: 250, status: 'available' }
    ],
    amenities: ['Restrooms', 'Food', 'WiFi'],
    pricing: { energyRate: 0.28, currency: 'USD' },
    availability: 'available'
  },
  {
    id: 'station-2',
    name: 'ChargePoint Station',
    address: '456 Oak Ave, Midtown, CA 90211',
    latitude: 34.0523,
    longitude: -118.2438,
    provider: 'ChargePoint',
    connectors: [
      { id: 'conn-2', type: 'CCS1', power: 150, status: 'available' },
      { id: 'conn-3', type: 'Type2', power: 11, status: 'available' }
    ],
    amenities: ['Restrooms', 'Coffee'],
    pricing: { energyRate: 0.32, sessionFee: 1.0, currency: 'USD' },
    availability: 'available'
  },
  {
    id: 'station-3',
    name: 'EVgo Fast Charging',
    address: '789 Pine St, Uptown, CA 90212',
    latitude: 34.0524,
    longitude: -118.2439,
    provider: 'EVgo',
    connectors: [
      { id: 'conn-4', type: 'CCS1', power: 100, status: 'available' },
      { id: 'conn-5', type: 'CHAdeMO', power: 50, status: 'occupied' }
    ],
    amenities: ['Restrooms', 'Shopping'],
    pricing: { energyRate: 0.35, timeRate: 0.25, currency: 'USD' },
    availability: 'available'
  },
  {
    id: 'station-4',
    name: 'Electrify America',
    address: '321 Elm St, Westside, CA 90213',
    latitude: 34.0525,
    longitude: -118.2440,
    provider: 'Electrify America',
    connectors: [
      { id: 'conn-6', type: 'CCS1', power: 150, status: 'available' },
      { id: 'conn-7', type: 'CCS1', power: 150, status: 'available' }
    ],
    amenities: ['Restrooms', 'Food', 'WiFi', 'Shopping'],
    pricing: { energyRate: 0.31, currency: 'USD' },
    availability: 'available'
  },
  {
    id: 'station-5',
    name: 'Volta Charging',
    address: '654 Maple Dr, Eastside, CA 90214',
    latitude: 34.0526,
    longitude: -118.2441,
    provider: 'Volta',
    connectors: [
      { id: 'conn-8', type: 'Type2', power: 7.2, status: 'available' }
    ],
    amenities: ['Shopping'],
    pricing: { energyRate: 0.0, currency: 'USD' }, // Free charging
    availability: 'available'
  }
];

export class ChargingStationService {
  static async findNearbyStations(
    location: UserLocation,
    userCar: EVModel,
    filters: SearchFilters
  ): Promise<ChargingStation[]> {
    // In a real implementation, this would call multiple APIs:
    // - Tesla Supercharger API
    // - ChargePoint API
    // - EVgo API
    // - Electrify America API
    // - Open Charge Map API
    // - etc.

    // For now, we'll simulate API calls with mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    let stations = [...MOCK_STATIONS];

    // Filter by distance
    stations = stations.filter(station => {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        station.latitude,
        station.longitude
      );
      station.distance = distance;
      return distance <= filters.maxDistance;
    });

    // Filter by connector compatibility
    stations = stations.filter(station =>
      station.connectors.some(connector =>
        userCar.connectorTypes.includes(connector.type) &&
        connector.power >= filters.minPower
      )
    );

    // Filter by connector types if specified
    if (filters.connectorTypes.length > 0) {
      stations = stations.filter(station =>
        station.connectors.some(connector =>
          filters.connectorTypes.includes(connector.type)
        )
      );
    }

    // Filter by amenities if specified
    if (filters.amenities.length > 0) {
      stations = stations.filter(station =>
        filters.amenities.every(amenity =>
          station.amenities.includes(amenity)
        )
      );
    }

    // Filter by max price if specified
    if (filters.maxPricePerKwh !== undefined) {
      stations = stations.filter(station =>
        !station.pricing.energyRate || station.pricing.energyRate <= filters.maxPricePerKwh!
      );
    }

    // Calculate estimated costs for user's car
    stations.forEach(station => {
      station.estimatedCost = this.calculateEstimatedCost(station, userCar);
    });

    // Sort by estimated cost (cheapest first), then by distance
    stations.sort((a, b) => {
      if (a.estimatedCost !== b.estimatedCost) {
        return (a.estimatedCost || 0) - (b.estimatedCost || 0);
      }
      return (a.distance || 0) - (b.distance || 0);
    });

    return stations;
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private static calculateEstimatedCost(station: ChargingStation, userCar: EVModel): number {
    // Find the best connector for the user's car
    const compatibleConnector = station.connectors
      .filter(connector => userCar.connectorTypes.includes(connector.type))
      .sort((a, b) => b.power - a.power)[0];

    if (!compatibleConnector || !station.pricing.energyRate) {
      return 0;
    }

    // Estimate charging time based on connector power and battery capacity
    const chargingTimeHours = userCar.batteryCapacity / compatibleConnector.power;
    
    // Calculate cost
    let cost = 0;
    
    // Energy cost
    if (station.pricing.energyRate) {
      cost += userCar.batteryCapacity * station.pricing.energyRate;
    }
    
    // Time cost
    if (station.pricing.timeRate) {
      cost += chargingTimeHours * 60 * station.pricing.timeRate;
    }
    
    // Session fee
    if (station.pricing.sessionFee) {
      cost += station.pricing.sessionFee;
    }

    return cost;
  }

  static async getStationDetails(stationId: string): Promise<ChargingStation | null> {
    // In a real implementation, this would fetch detailed info from the specific provider's API
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_STATIONS.find(station => station.id === stationId) || null;
  }
}