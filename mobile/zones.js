// Predefined Louisiana fishing hubs for one-tap offline downloads.
// BBoxes are tuned to stay under ~8k tiles at zoom 15–16.

export const ZONE_MAX_TILES = 8000;

export const zones = [
  {
    id: 'venice',
    name: 'Venice',
    north: 29.35,
    south: 29.15,
    west: -89.55,
    east: -89.25,
    minZoom: 15,
    maxZoom: 16,
    photo: 'https://placehold.co/600x400?text=Venice'
  },
  {
    id: 'grand-isle',
    name: 'Grand Isle',
    north: 29.28,
    south: 29.12,
    west: -90.18,
    east: -89.96,
    minZoom: 15,
    maxZoom: 16,
    photo: 'https://placehold.co/600x400?text=Grand+Isle'
  },
  {
    id: 'hopedale-delacroix',
    name: 'Hopedale / Delacroix',
    north: 29.92,
    south: 29.78,
    west: -89.93,
    east: -89.72,
    minZoom: 15,
    maxZoom: 16,
    photo: 'https://placehold.co/600x400?text=Hopedale+Delacroix'
  },
  {
    id: 'big-lake',
    name: 'Big Lake (Calcasieu)',
    north: 30.08,
    south: 29.85,
    west: -93.35,
    east: -93.12,
    minZoom: 15,
    maxZoom: 16,
    photo: 'https://placehold.co/600x400?text=Big+Lake'
  },
  {
    id: 'cocodrie',
    name: 'Cocodrie',
    north: 29.33,
    south: 29.15,
    west: -90.95,
    east: -90.65,
    minZoom: 15,
    maxZoom: 16,
    photo: 'https://placehold.co/600x400?text=Cocodrie'
  }
];

export const getZoneById = (id) => zones.find((z) => z.id === id);




