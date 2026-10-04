import { ChargingStation, UserLocation, EVModel, SearchFilters } from '@/types';
import { mapOcmResponse } from '@/lib/openChargeMap';
import { fetchStationsFromOverpass } from '@/lib/overpassStations';

// Tiny offline fallback, only used when live station lookups fail.
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

async function fetchFromOpenChargeMap(
  location: UserLocation,
  maxDistance: number
): Promise<ChargingStation[]> {
  const apiKey = process.env.NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY;
  if (!apiKey) {
    throw new Error('No Open Charge Map key configured');
  }

  const url = new URL('https://api.openchargemap.io/v3/poi/');
  url.searchParams.set('output', 'json');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('distance', String(Math.min(maxDistance, 500)));
  url.searchParams.set('distanceunit', 'KM');
  url.searchParams.set('maxresults', '200');
  url.searchParams.set('compact', 'false');
  url.searchParams.set('verbose', 'false');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-API-Key': apiKey,
    },
  });
  if (!res.ok) {
    throw new Error(`Open Charge Map returned ${res.status}`);
  }
  return mapOcmResponse(await res.json());
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

    stations = stations.filter(station =>
      station.connectors.some(connector =>
        userCar.connectorTypes.includes(connector.type) &&
        connector.power >= filters.minPower
      )
    );

    if (filters.connectorTypes.length > 0) {
      stations = stations.filter(station =>
        station.connectors.some(connector =>
          filters.connectorTypes.includes(connector.type)
        )
      );
    }

    if (filters.amenities.length > 0) {
      stations = stations.filter(station =>
        filters.amenities.every(amenity =>
          station.amenities.includes(amenity)
        )
      );
    }

    if (filters.maxPricePerKwh !== undefined) {
      stations = stations.filter(station =>
        !station.pricing.energyRate || station.pricing.energyRate <= filters.maxPricePerKwh!
      );
    }

    stations.forEach(station => {
      station.estimatedCost = this.calculateEstimatedCost(station, userCar);
    });

    stations.sort((a, b) => {
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
    // Prefer Open Charge Map when a free public key was baked in at build time.
    if (process.env.NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY) {
      try {
        return await fetchFromOpenChargeMap(location, maxDistance);
      } catch (error) {
        console.warn('Open Charge Map failed, trying OpenStreetMap Overpass:', error);
      }
    }

    return fetchStationsFromOverpass(
      location.latitude,
      location.longitude,
      maxDistance
    );
  }

  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
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
    const compatibleConnector = station.connectors
      .filter(connector => userCar.connectorTypes.includes(connector.type))
      .sort((a, b) => b.power - a.power)[0];

    if (!compatibleConnector || station.pricing.energyRate === undefined) {
      return undefined;
    }

    const chargingTimeHours = userCar.batteryCapacity / compatibleConnector.power;
    let cost = 0;

    if (station.pricing.energyRate) {
      cost += userCar.batteryCapacity * station.pricing.energyRate;
    }
    if (station.pricing.timeRate) {
      cost += chargingTimeHours * 60 * station.pricing.timeRate;
    }
    if (station.pricing.sessionFee) {
      cost += station.pricing.sessionFee;
    }

    return cost;
  }
}
