export const regions = [
  {
    id: 'la',
    name: 'Louisiana',
    center: [29.7, -90.5],
    bounds: { north: 30.7, south: 28.3, west: -93.7, east: -89.0 },
    zoom: 9,
    presets: [
      { name: 'Venice', north: 29.35, south: 29.15, west: -89.55, east: -89.25, minZoom: 15, maxZoom: 16 },
      { name: 'Delacroix', north: 29.92, south: 29.78, west: -89.93, east: -89.72, minZoom: 15, maxZoom: 16 },
      { name: 'Grand Isle', north: 29.28, south: 29.12, west: -90.18, east: -89.96, minZoom: 15, maxZoom: 16 },
      { name: 'Calcasieu', north: 30.08, south: 29.85, west: -93.35, east: -93.12, minZoom: 15, maxZoom: 16 }
    ],
    // Using Esri World Imagery for detailed marsh tiles; DOTD endpoint returns 404s.
    tileUrl: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
    tileAttribution: 'Imagery © USGS',
    offlineTileCap: 8000
  },
  {
    id: 'template',
    name: 'New Region (configure)',
    center: [30, -90],
    bounds: { north: 31, south: 29, west: -91, east: -89 },
    zoom: 8,
    presets: [],
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileAttribution: '© OpenStreetMap',
    offlineTileCap: 5000
  }
];

export const getRegionById = (id) => regions.find((r) => r.id === id) || regions[0];




