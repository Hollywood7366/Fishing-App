import * as FileSystem from 'expo-file-system';
import { ZONE_MAX_TILES } from './zones';

export const TILE_BASE = 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile';
const MAP_ROOT = `${FileSystem.documentDirectory}maps/offline`;

const deg2rad = (deg) => deg * (Math.PI / 180);
const latLngToTile = (lat, lng, zoom) => {
  const latRad = deg2rad(lat);
  const n = 2 ** zoom;
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
};

export const countTiles = (bbox) => {
  let count = 0;
  for (let z = bbox.minZoom; z <= bbox.maxZoom; z++) {
    const nw = latLngToTile(bbox.north, bbox.west, z);
    const se = latLngToTile(bbox.south, bbox.east, z);
    const minX = Math.min(nw.x, se.x);
    const maxX = Math.max(nw.x, se.x);
    const minY = Math.min(nw.y, se.y);
    const maxY = Math.max(nw.y, se.y);
    count += (maxX - minX + 1) * (maxY - minY + 1);
  }
  return count;
};

export const estimateSizeKB = (tileCount, avgTileKB = 20) => tileCount * avgTileKB;

const ensureDirAsync = async (dir) => {
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

const markDoNotBackupIOS = async (dir) => {
  try {
    await FileSystem.setInfoAsync(dir, { ios: { isExcludedFromBackup: true } });
  } catch {
    // ignore if not supported
  }
};

const tilePath = (z, x, y) => `${MAP_ROOT}/${z}/${x}/${y}.png`;
const tileUrl = (z, x, y) => `${TILE_BASE}/${z}/${y}/${x}`;

export const getLocalTileUriIfExists = async (z, x, y) => {
  const path = tilePath(z, x, y);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) return `file://${path}`;
  return null;
};

export const getTileUri = async (z, x, y) => {
  const local = await getLocalTileUriIfExists(z, x, y);
  return local || tileUrl(z, x, y);
};

const buildTileList = (bbox) => {
  const tiles = [];
  for (let z = bbox.minZoom; z <= bbox.maxZoom; z++) {
    const nw = latLngToTile(bbox.north, bbox.west, z);
    const se = latLngToTile(bbox.south, bbox.east, z);
    const minX = Math.min(nw.x, se.x);
    const maxX = Math.max(nw.x, se.x);
    const minY = Math.min(nw.y, se.y);
    const maxY = Math.max(nw.y, se.y);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ z, x, y });
      }
    }
  }
  return tiles;
};

export const downloadZone = async (bbox, { onStatus, onProgress, signal } = {}) => {
  const estimated = countTiles(bbox);
  if (estimated > ZONE_MAX_TILES) {
    throw new Error(`Area too large: ${estimated} tiles (max ${ZONE_MAX_TILES}).`);
  }

  const tiles = buildTileList(bbox);
  await ensureDirAsync(MAP_ROOT);
  await markDoNotBackupIOS(MAP_ROOT);

  let done = 0;
  onStatus?.(`Caching ${tiles.length} tiles...`);
  onProgress?.({ done, total: tiles.length });

  for (const tile of tiles) {
    if (signal?.aborted) throw new Error('Download cancelled');
    const dest = tilePath(tile.z, tile.x, tile.y);
    const dir = dest.substring(0, dest.lastIndexOf('/'));
    await ensureDirAsync(dir);
    const remote = tileUrl(tile.z, tile.x, tile.y);
    try {
      await FileSystem.downloadAsync(remote, dest);
    } catch {
      // ignore individual failures
    }
    done += 1;
    if (done % 50 === 0 || done === tiles.length) {
      onProgress?.({ done, total: tiles.length });
    }
  }
  onStatus?.('Caching complete.');
};

export const deleteZone = async (zoneId) => {
  const dir = `${MAP_ROOT}/${zoneId}`;
  const info = await FileSystem.getInfoAsync(dir);
  if (info.exists) {
    await FileSystem.deleteAsync(dir, { idempotent: true });
  }
};




