# ChargeFinder

Find EV charging stations near you and compare estimated charging costs for your car.

Live site: [parampateldev.github.io/chargefinder](https://parampateldev.github.io/chargefinder/)

## Data sources

- [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api) for address search (free, no key)
- [OpenStreetMap Overpass](https://overpass-api.de/) for charging stations when no Open Charge Map key is set
- Optional [Open Charge Map](https://openchargemap.org/) when `NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY` is provided at build time
- Map tiles from OpenStreetMap via Leaflet

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/chargefinder](http://localhost:3000/chargefinder).

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_OPEN_CHARGE_MAP_API_KEY`.

## Static build

```bash
npm run build
```

Output goes to `out/` and is deployed to GitHub Pages by `.github/workflows/deploy-pages.yml`.

## Notes

OpenStreetMap stations often omit prices, so estimated cost may show as unknown. Open Charge Map can include parsed $/kWh text when a free API key is configured as a repo secret named `OPEN_CHARGE_MAP_API_KEY`.
