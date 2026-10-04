import { NextRequest, NextResponse } from 'next/server';
import { mapOcmResponse } from '@/lib/openChargeMap';

export const runtime = 'nodejs';

const OCM_URL = 'https://api.openchargemap.io/v3/poi';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latitude = Number(searchParams.get('latitude'));
  const longitude = Number(searchParams.get('longitude'));
  const distance = Number(searchParams.get('distance') ?? '25');

  if (
    searchParams.get('latitude') === null ||
    searchParams.get('longitude') === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180 ||
    !Number.isFinite(distance) ||
    distance <= 0
  ) {
    return NextResponse.json(
      { error: 'latitude, longitude and a positive distance (km) are required' },
      { status: 400 }
    );
  }

  const url = new URL(OCM_URL);
  url.searchParams.set('output', 'json');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set('distance', String(Math.min(distance, 500)));
  url.searchParams.set('distanceunit', 'KM');
  url.searchParams.set('maxresults', '200');
  url.searchParams.set('compact', 'false');
  url.searchParams.set('verbose', 'false');

  const headers: Record<string, string> = { Accept: 'application/json' };
  const apiKey = process.env.OPEN_CHARGE_MAP_API_KEY;
  if (apiKey) {
    url.searchParams.set('key', apiKey);
    headers['X-API-Key'] = apiKey;
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 300 } });
    if (!res.ok) {
      const authProblem = res.status === 401 || res.status === 403;
      return NextResponse.json(
        {
          error: authProblem
            ? 'Open Charge Map rejected the request. Set OPEN_CHARGE_MAP_API_KEY (free key from openchargemap.org).'
            : `Open Charge Map returned status ${res.status}`,
        },
        { status: 502 }
      );
    }
    const data = await res.json();
    return NextResponse.json({ stations: mapOcmResponse(data) });
  } catch (error) {
    console.error('Open Charge Map request failed:', error);
    return NextResponse.json({ error: 'Open Charge Map unreachable' }, { status: 502 });
  }
}
