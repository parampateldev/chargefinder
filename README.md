# ChargeFinder

A web app for finding EV charging stations near you and comparing estimated charging costs for your car.

ChargeFinder uses two free, open data sources:

- [Nominatim](https://nominatim.org/) (OpenStreetMap) for address search and reverse geocoding.
- [Open Charge Map](https://openchargemap.org/) for charging station data.

Map tiles come from OpenStreetMap and are drawn with Leaflet.

## Features

- Pick your EV model and filter out stations with incompatible connectors.
- Search by browser location or by typing an address, city, or ZIP code.
- Filter by distance, minimum power, and maximum price per kWh.
- View results on a map or as a list.
- Estimated charging cost for a full battery, when the station publishes a price.

## Tech stack

- Next.js 15 (App Router) with TypeScript
- Tailwind CSS
- Leaflet and react-leaflet
- Lucide React icons

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm

### Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

Copy `.env.example` to `.env.local` and set:

| Variable | Purpose |
| --- | --- |
| `OPEN_CHARGE_MAP_API_KEY` | Free Open Charge Map key. Request one from your account page on [openchargemap.org](https://openchargemap.org/). Open Charge Map may reject requests that do not include a key. |
| `NOMINATIM_USER_AGENT` | Identifies your app to Nominatim, as required by the [usage policy](https://operations.osmfoundation.org/policies/nominatim/). Use a name and contact address, for example `ChargeFinder/1.0 (you@example.com)`. |

Both variables are read on the server only. They are never sent to the browser.

If the charging station request fails, the app shows two clearly labeled sample stations so the interface still works.

## API routes

- `GET /api/geocode?q=<text>` returns matching places for an address or place name.
- `GET /api/geocode?lat=<lat>&lon=<lon>` returns the address for a coordinate.
- `GET /api/charging-stations?latitude=<lat>&longitude=<lon>&distance=<km>` returns nearby stations mapped to the app's `ChargingStation` type.

Geocoding responses are cached for a day and station responses for five minutes, which keeps usage within Nominatim's policy of at most one request per second.

## Project layout

- `src/app/api` holds the Next.js route handlers.
- `src/lib/openChargeMap.ts` converts Open Charge Map JSON to `ChargingStation`.
- `src/services/chargingStations.ts` fetches stations, then applies filtering, sorting, and cost estimates.
- `src/components` holds the UI components.

## Data limits

Open Charge Map publishes pricing only as free text, so ChargeFinder parses simple formats such as `$0.35/kWh`. When no price can be read, the station shows "Price unknown" and is sorted after stations with a known price. Real-time availability is not provided by the free data, so stations are marked available only when they are listed as operational.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.

## License

MIT

## Attribution

Station data from Open Charge Map and geocoding data from OpenStreetMap contributors (ODbL).
