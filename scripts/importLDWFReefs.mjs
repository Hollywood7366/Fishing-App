/**
 * Import LDWF Artificial Reef KML into JSON seed.
 * Usage:
 *   LDWF_REEF_KML_URL="https://example.com/reef_sites.kml" node scripts/importLDWFReefs.mjs
 *
 * Writes to: src/data/publicReefs.json
 *
 * Note: Requires Node 18+ (built-in fetch). Keep input to publicly available LDWF data only.
 */

import { writeFileSync } from 'fs';
import { mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const KML_URL = process.env.LDWF_REEF_KML_URL;

if (!KML_URL) {
  console.error('LDWF_REEF_KML_URL is required. Example: https://www.wlf.louisiana.gov/.../reef_sites.kml');
  process.exit(1);
}

const areaBuckets = [
  { name: 'Grand Isle', latMin: 28.5, latMax: 29.5, lngMin: -90.7, lngMax: -89.7 },
  { name: 'Venice', latMin: 28.5, latMax: 29.5, lngMin: -90.9, lngMax: -89.9 },
  { name: 'Calcasieu', latMin: 29.5, latMax: 30.2, lngMin: -93.6, lngMax: -93.0 },
  { name: 'Lake Pontchartrain', latMin: 29.8, latMax: 30.4, lngMin: -90.5, lngMax: -89.8 },
  { name: 'Cocodrie', latMin: 28.8, latMax: 29.4, lngMin: -91.5, lngMax: -90.8 },
  { name: 'Vermilion', latMin: 29.0, latMax: 29.8, lngMin: -92.4, lngMax: -91.5 },
  { name: 'Marsh Island', latMin: 29.3, latMax: 29.8, lngMin: -92.3, lngMax: -91.8 },
  { name: 'Atchafalaya', latMin: 29.2, latMax: 30.0, lngMin: -91.8, lngMax: -91.0 }
];

const bucketArea = (lat, lng) => {
  const match = areaBuckets.find(
    (b) => lat >= b.latMin && lat <= b.latMax && lng >= b.lngMin && lng <= b.lngMax
  );
  return match ? match.name : 'Louisiana Coast';
};

const parseKmlPlacemarks = (kmlText) => {
  const placemarkRegex = /<Placemark[^>]*>([\\s\\S]*?)<\\/Placemark>/gi;
  const nameRegex = /<name>([\\s\\S]*?)<\\/name>/i;
  const coordRegex = /<coordinates>([\\s\\S]*?)<\\/coordinates>/i;

  const spots = [];
  let match;
  while ((match = placemarkRegex.exec(kmlText)) !== null) {
    const block = match[1];
    const nameMatch = block.match(nameRegex);
    const coordMatch = block.match(coordRegex);
    if (!coordMatch) continue;
    const coordText = coordMatch[1].trim().split(/\\s+/)[0];
    const parts = coordText.split(',');
    if (parts.length < 2) continue;
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    const name = nameMatch ? nameMatch[1].trim() : 'LDWF Reef';
    const area = bucketArea(lat, lng);

    spots.push({
      id: `reef-${spots.length + 1}`,
      name,
      area,
      type: 'artificial_reef',
      source: 'LDWF Artificial Reef Program',
      lat,
      lng,
      knownFor: 'Artificial reef',
      access: 'Boat access required'
    });
  }
  return spots;
};

const run = async () => {
  console.log(`Downloading KML from ${KML_URL}`);
  const resp = await fetch(KML_URL);
  if (!resp.ok) {
    throw new Error(`Failed to download KML: ${resp.status} ${resp.statusText}`);
  }
  const text = await resp.text();
  const spots = parseKmlPlacemarks(text);
  console.log(`Parsed ${spots.length} reef spots`);

  const outDir = resolve('src/data');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, 'publicReefs.json');
  writeFileSync(outPath, JSON.stringify(spots, null, 2));
  console.log(`Wrote ${spots.length} spots to ${outPath}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});






