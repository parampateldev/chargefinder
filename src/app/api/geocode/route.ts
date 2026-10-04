import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
}

function userAgent(): string {
  return process.env.NOMINATIM_USER_AGENT || 'ChargeFinder/1.0 (self-hosted)';
}

async function nominatim(path: string, params: Record<string, string>) {
  const url = new URL(`${NOMINATIM_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url, {
    headers: { 'User-Agent': userAgent(), Accept: 'application/json' },
    next: { revalidate: 86400 },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get('q')?.trim();
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');

  try {
    if (q) {
      const res = await nominatim('/search', { format: 'jsonv2', q, limit: '5' });
      if (!res.ok) {
        return NextResponse.json({ error: 'Geocoding service error' }, { status: 502 });
      }
      const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
      const results: GeocodeResult[] = data.map((r) => ({
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        address: r.display_name,
      }));
      return NextResponse.json({ results });
    }

    if (latParam !== null && lonParam !== null) {
      const lat = Number(latParam);
      const lon = Number(lonParam);
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        return NextResponse.json({ error: 'Invalid lat or lon' }, { status: 400 });
      }
      const res = await nominatim('/reverse', {
        format: 'jsonv2',
        lat: String(lat),
        lon: String(lon),
      });
      if (!res.ok) {
        return NextResponse.json({ error: 'Geocoding service error' }, { status: 502 });
      }
      const data = (await res.json()) as { display_name?: string; error?: string };
      if (!data.display_name) {
        return NextResponse.json({ results: [] });
      }
      return NextResponse.json({
        results: [{ latitude: lat, longitude: lon, address: data.display_name }],
      });
    }

    return NextResponse.json(
      { error: 'Provide either q, or both lat and lon' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Geocode request failed:', error);
    return NextResponse.json({ error: 'Geocoding service unreachable' }, { status: 502 });
  }
}
