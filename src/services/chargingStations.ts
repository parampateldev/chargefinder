import { ChargingStation, UserLocation, EVModel, SearchFilters } from '@/types';

// Tiny offline fallback, only used when /api/charging-stations fails.
// Positions are offset from the searched location so the sample is visible.
function buildFallbackStations(location: UserLocation): ChargingStation[] {
  return [
    {
      id: 'sample-1',
      name: 'Sample station (live data unavailable)',
      address: 'Near your search location',
      latitude: location.latitude + 0.01,
      longitude: location.longitude + 0.01,
      provider: 'Sample',
      connectors: [
        { id: 'sample-1-a', type: 'CCS1', power: 150, status: 'available' },
        { id: 'sample-1-b', type: 'Type2', power: 11, status: 'available' },
      ],
      amenities: [],
      pricing: { energyRate: 0.35, currency: 'USD' },
      availability: 'unknown',
    },
    {
      id: 'sample-2',
      name: 'Sample station 2 (live data unavailable)',
      address: 'Near your search location',
      latitude: location.latitude - 0.01,
      longitude: location.longitude - 0.008,
      provider: 'Sample',
      connectors: [
        { id: 'sample-2-a', type: 'Tesla_Supercharger', power: 250, status: 'available' },
        { id: 'sample-2-b', type: 'CHAdeMO', power: 50, status: 'available' },
      ],
      amenities: [],
      pricing: { energyRate: 0.3, currency: 'USD' },
      availability: 'unknown',
    },
  ];
}

export class ChargingStationService {
  static async findNearbyStations(
    location: UserLocation,
    userCar: EVModel,
    filters: SearchFilters
  ): Promise<ChargingStation[]> {
    let stations: ChargingStation[];
    try {
      stations = await this.fetchStations(location, filters.maxDistance);
    } catch (error) {
      console.error('Falling back to sample stations:', error);
      stations = buildFallbackStations(location);
    }

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
      // Stations with unknown pricing go last.
      const aCost = a.estimatedCost ?? Number.POSITIVE_INFINITY;
      const bCost = b.estimatedCost ?? Number.POSITIVE_INFINITY;
      if (aCost !== bCost) {
        return aCost - bCost;
      }
      return (a.distance || 0) - (b.distance || 0);
    });

    return stations;
  }

  private static async fetchStations(
    location: UserLocation,
    maxDistance: number
  ): Promise<ChargingStation[]> {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      distance: String(maxDistance),
    });
    const response = await fetch(`/api/charging-stations?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Charging station API returned ${response.status}`);
    }
    const data = (await response.json()) as { stations?: ChargingStation[] };
    return data.stations ?? [];
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

  private static calculateEstimatedCost(station: ChargingStation, userCar: EVModel): number | undefined {
    // Find the best connector for the user's car
    const compatibleConnector = station.connectors
      .filter(connector => userCar.connectorTypes.includes(connector.type))
      .sort((a, b) => b.power - a.power)[0];

    // Unknown pricing: no estimate. A rate of 0 means the station is free.
    if (!compatibleConnector || station.pricing.energyRate === undefined) {
      return undefined;
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
}
