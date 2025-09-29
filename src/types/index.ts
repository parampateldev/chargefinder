export interface EVModel {
  id: string;
  name: string;
  manufacturer: string;
  batteryCapacity: number; // kWh
  chargingCapabilities: ChargingCapability[];
  connectorTypes: ConnectorType[];
}

export interface ChargingCapability {
  connectorType: ConnectorType;
  maxPower: number; // kW
  chargingSpeed: 'slow' | 'fast' | 'rapid' | 'ultra-rapid';
}

export type ConnectorType = 
  | 'Type1' 
  | 'Type2' 
  | 'CCS1' 
  | 'CCS2' 
  | 'CHAdeMO' 
  | 'Tesla_Supercharger'
  | 'Tesla_Destination';

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  provider: string;
  connectors: ChargingConnector[];
  amenities: string[];
  pricing: PricingInfo;
  availability: 'available' | 'occupied' | 'out_of_order' | 'unknown';
  distance?: number; // km from user location
  estimatedCost?: number; // estimated cost for user's car
}

export interface ChargingConnector {
  id: string;
  type: ConnectorType;
  power: number; // kW
  status: 'available' | 'occupied' | 'out_of_order';
  pricing?: PricingInfo;
}

export interface PricingInfo {
  sessionFee?: number; // $ per session
  energyRate?: number; // $ per kWh
  timeRate?: number; // $ per minute
  currency: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface SearchFilters {
  maxDistance: number; // km
  connectorTypes: ConnectorType[];
  minPower: number; // kW
  amenities: string[];
  maxPricePerKwh?: number;
}