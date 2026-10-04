import type {
  ChargingConnector,
  ChargingStation,
  ConnectorType,
  PricingInfo,
} from '@/types';

/** Subset of the Open Charge Map v3 POI response that we read. */
export interface OcmConnection {
  ID?: number;
  ConnectionTypeID?: number;
  ConnectionType?: { ID?: number; Title?: string | null; FormalName?: string | null } | null;
  LevelID?: number | null;
  PowerKW?: number | null;
  StatusTypeID?: number | null;
  StatusType?: { IsOperational?: boolean | null; Title?: string | null } | null;
  Quantity?: number | null;
}

export interface OcmPoi {
  ID: number;
  UsageCost?: string | null;
  StatusTypeID?: number | null;
  StatusType?: { IsOperational?: boolean | null; Title?: string | null } | null;
  OperatorInfo?: { Title?: string | null } | null;
  UsageType?: { Title?: string | null } | null;
  AddressInfo?: {
    Title?: string | null;
    AddressLine1?: string | null;
    AddressLine2?: string | null;
    Town?: string | null;
    StateOrProvince?: string | null;
    Postcode?: string | null;
    Country?: { Title?: string | null } | null;
    Latitude?: number | null;
    Longitude?: number | null;
  } | null;
  Connections?: OcmConnection[] | null;
}

// Open Charge Map reference data IDs for connection types.
const CONNECTION_TYPE_BY_ID: Record<number, ConnectorType> = {
  1: 'Type1', // J1772
  2: 'CHAdeMO',
  25: 'Type2', // socket
  1036: 'Type2', // tethered
  32: 'CCS1',
  33: 'CCS2',
  27: 'Tesla_Supercharger', // Tesla (Roadster/legacy)
  30: 'Tesla_Supercharger', // Tesla (Model S/X)
  8: 'Tesla_Supercharger', // Tesla (older listings)
};

function connectorTypeFromTitle(title: string): ConnectorType | null {
  const t = title.toLowerCase();
  if (t.includes('tesla')) return 'Tesla_Supercharger';
  if (t.includes('chademo')) return 'CHAdeMO';
  if (t.includes('ccs') || t.includes('combo')) {
    return t.includes('type 2') || t.includes('iec') ? 'CCS2' : 'CCS1';
  }
  if (t.includes('type 2') || t.includes('mennekes')) return 'Type2';
  if (t.includes('type 1') || t.includes('j1772')) return 'Type1';
  return null;
}

export function mapConnectorType(conn: OcmConnection): ConnectorType | null {
  const id = conn.ConnectionTypeID ?? conn.ConnectionType?.ID;
  if (id !== undefined && CONNECTION_TYPE_BY_ID[id]) {
    return CONNECTION_TYPE_BY_ID[id];
  }
  const title = conn.ConnectionType?.Title || conn.ConnectionType?.FormalName;
  return title ? connectorTypeFromTitle(title) : null;
}

function connectorPower(conn: OcmConnection): number {
  if (typeof conn.PowerKW === 'number' && conn.PowerKW > 0) return conn.PowerKW;
  // Fall back to typical values per charging level when power is not listed.
  switch (conn.LevelID) {
    case 1:
      return 1.4;
    case 3:
      return 50;
    default:
      return 7;
  }
}

function connectorStatus(conn: OcmConnection): ChargingConnector['status'] {
  if (conn.StatusType?.IsOperational === false) return 'out_of_order';
  if (conn.StatusTypeID === 10 || conn.StatusTypeID === 20 || conn.StatusTypeID === 210) {
    return 'out_of_order';
  }
  return 'available';
}

/**
 * Open Charge Map only provides pricing as free text. Extract what we can and
 * leave the rest undefined so the UI can show that the price is unknown.
 */
export function parseUsageCost(usageCost: string | null | undefined): PricingInfo {
  const pricing: PricingInfo = { currency: 'USD' };
  if (!usageCost) return pricing;

  const text = usageCost.trim();
  if (/^(free|no charge|gratis)\b/i.test(text) && !/\d/.test(text)) {
    pricing.energyRate = 0;
    return pricing;
  }

  if (text.includes('€')) pricing.currency = 'EUR';
  else if (text.includes('£')) pricing.currency = 'GBP';

  const perKwh = text.match(/[$€£]\s*(\d+(?:[.,]\d+)?)\s*(?:\/|per)\s*kwh/i);
  if (perKwh) pricing.energyRate = parseFloat(perKwh[1].replace(',', '.'));

  const perMin = text.match(/[$€£]\s*(\d+(?:[.,]\d+)?)\s*(?:\/|per)\s*min/i);
  if (perMin) pricing.timeRate = parseFloat(perMin[1].replace(',', '.'));

  const session = text.match(/[$€£]\s*(\d+(?:[.,]\d+)?)\s*(?:\/|per)\s*(?:session|charge)/i);
  if (session) pricing.sessionFee = parseFloat(session[1].replace(',', '.'));

  return pricing;
}

function formatAddress(info: NonNullable<OcmPoi['AddressInfo']>): string {
  const parts = [
    info.AddressLine1,
    info.AddressLine2,
    info.Town,
    [info.StateOrProvince, info.Postcode].filter(Boolean).join(' '),
  ]
    .map((p) => (p ? p.trim() : ''))
    .filter(Boolean);
  return parts.join(', ') || 'Address not listed';
}

/** Map one Open Charge Map POI to a ChargingStation. Returns null if unusable. */
export function mapOcmPoi(poi: OcmPoi): ChargingStation | null {
  const info = poi.AddressInfo;
  if (!info || typeof info.Latitude !== 'number' || typeof info.Longitude !== 'number') {
    return null;
  }

  const connectors: ChargingConnector[] = [];
  (poi.Connections ?? []).forEach((conn, index) => {
    const type = mapConnectorType(conn);
    if (!type) return;
    connectors.push({
      id: `ocm-${poi.ID}-${conn.ID ?? index}`,
      type,
      power: connectorPower(conn),
      status: connectorStatus(conn),
    });
  });
  if (connectors.length === 0) return null;

  let availability: ChargingStation['availability'] = 'unknown';
  if (poi.StatusType?.IsOperational === false) availability = 'out_of_order';
  else if (poi.StatusType?.IsOperational === true || poi.StatusTypeID === 50) {
    availability = 'available';
  }

  return {
    id: `ocm-${poi.ID}`,
    name: info.Title?.trim() || 'Charging station',
    address: formatAddress(info),
    latitude: info.Latitude,
    longitude: info.Longitude,
    provider: poi.OperatorInfo?.Title?.trim() || 'Unknown operator',
    connectors,
    amenities: [],
    pricing: parseUsageCost(poi.UsageCost),
    availability,
  };
}

export function mapOcmResponse(pois: unknown): ChargingStation[] {
  if (!Array.isArray(pois)) return [];
  return pois
    .map((p) => mapOcmPoi(p as OcmPoi))
    .filter((s): s is ChargingStation => s !== null);
}
