import type { ChargingConnector, ChargingStation, ConnectorType } from "@/types";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function parseSocketTypes(tags: Record<string, string>): ChargingConnector[] {
  const connectors: ChargingConnector[] = [];
  const push = (type: ConnectorType, power: number, key: string) => {
    connectors.push({
      id: key,
      type,
      power,
      status: "available",
    });
  };

  const power =
    Number(tags["socket:type2:output"] || tags["socket:ccs:output"] || tags.capacity || 0) ||
    Number(tags.maxpower || 0) ||
    22;

  if (tags["socket:type2"] || tags["socket:type2_combo"]) {
    push("Type2", power || 22, "type2");
  }
  if (tags["socket:type2_combo"] || tags["socket:ccs"] || tags["socket:ccs_type2"]) {
    push("CCS2", power || 50, "ccs2");
  }
  if (tags["socket:chademo"]) {
    push("CHAdeMO", power || 50, "chademo");
  }
  if (tags["socket:type1"] || tags["socket:type1_combo"]) {
    push("Type1", power || 7, "type1");
  }
  if (tags["socket:type1_combo"] || tags["socket:ccs_type1"]) {
    push("CCS1", power || 50, "ccs1");
  }
  if (tags["socket:tesla_supercharger"] || tags["socket:tesla_standard"] || /tesla/i.test(tags.brand || tags.operator || "")) {
    push("Tesla_Supercharger", power || 150, "tesla");
  }

  // If OSM has no socket tags, offer common US/EU types so filters still work.
  if (connectors.length === 0) {
    push("CCS1", 50, "ccs1-default");
    push("Type1", 7, "type1-default");
    push("Type2", 22, "type2-default");
  }

  return connectors;
}

function mapElement(el: OverpassElement): ChargingStation | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (typeof lat !== "number" || typeof lon !== "number") return null;
  const tags = el.tags ?? {};
  const name = tags.name || tags.operator || tags.brand || "Charging station";
  const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:state"]]
    .filter(Boolean)
    .join(" ") || "Address not listed";

  return {
    id: `osm-${el.type}-${el.id}`,
    name,
    address,
    latitude: lat,
    longitude: lon,
    provider: tags.operator || tags.network || tags.brand || "OpenStreetMap",
    connectors: parseSocketTypes(tags),
    amenities: [],
    pricing: { currency: "USD" },
    availability: tags.access === "no" ? "out_of_order" : "available",
  };
}

/**
 * Free, no-key charging station lookup via the Overpass API (OpenStreetMap).
 * Pricing is usually missing; location and connector tags are the main value.
 */
export async function fetchStationsFromOverpass(
  latitude: number,
  longitude: number,
  distanceKm: number
): Promise<ChargingStation[]> {
  const radius = Math.min(Math.max(distanceKm, 1), 50) * 1000;
  const query = `
[out:json][timeout:25];
(
  node["amenity"="charging_station"](around:${radius},${latitude},${longitude});
  way["amenity"="charging_station"](around:${radius},${latitude},${longitude});
);
out center tags;
`.trim();

  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (!res.ok) {
        lastError = new Error(`Overpass ${res.status}`);
        continue;
      }
      const data = (await res.json()) as { elements?: OverpassElement[] };
      return (data.elements ?? [])
        .map(mapElement)
        .filter((s): s is ChargingStation => s !== null);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Overpass unreachable");
}
