// Web offline tiles deprecated. Offline now handled in native app permanent storage.
// Keeping minimal stubs to avoid import breakage.

export const MAX_TILES = 0;
export const countTiles = () => 0;
export const prefetchTilesToIndexedDb = async () => {
  throw new Error('Web offline cache disabled. Use native app for offline maps.');
};
export const clearTiles = async () => {};
export const getTile = async () => null;

export default {
  prefetchTilesToIndexedDb,
  clearTiles,
  getTile,
  countTiles
};



