export interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface OpenMeteoResult {
  name?: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
}

function formatPlace(r: OpenMeteoResult): string {
  return [r.name, r.admin1, r.country].filter(Boolean).join(", ");
}

/** Forward geocode with Open-Meteo (free, CORS-friendly, no API key). */
export async function geocodeQuery(query: string): Promise<GeocodeResult[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Geocoding failed (${res.status})`);
  }
  const data = (await res.json()) as { results?: OpenMeteoResult[] };
  return (data.results ?? []).map((r) => ({
    latitude: r.latitude,
    longitude: r.longitude,
    address: formatPlace(r),
  }));
}
