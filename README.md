# South Louisiana Fishing App

A comprehensive fishing conditions app that helps anglers find the best fishing spots in South Louisiana based on real-time tides, weather, moon phases, and more.

## Features

- **Smart Scoring System**: Evaluates 8+ factors including tides, wind, moon phase, barometric pressure, water temperature, and more
- **7-Day Forecast**: Plan your fishing trips in advance
- **Species-Specific Recommendations**: Get targeted advice for Redfish, Speckled Trout, Flounder, and more
- **Interactive Satellite Map**: View fishing locations on Google Maps with color-coded conditions (requires free API key)
- **User Preferences**: Save favorite spots and species, get personalized recommendations
- **Notifications**: Get alerted when conditions are optimal at your favorite spots
- **Share Forecasts**: Share conditions with fishing buddies via links

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Setting Up Google Maps (Required for Map View)

To enable the interactive satellite map:

1. Get a free API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Enable "Maps JavaScript API" for your project
3. Create a `.env` file in the project root:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```
4. **Important:** Restart the dev server after creating/editing `.env`
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed setup guide.

### Build for Production

```bash
npm run build
```

## Tech Stack

- React 18 with Hooks
- React Router for navigation
- Google Maps JavaScript API for satellite imagery
- Recharts for data visualization
- NOAA Tides & Currents API (tides)
- NOAA National Weather Service API (marine weather - primary)
- NOAA CO-OPS API (water temperature & salinity)
- OpenWeatherMap API (optional backup for weather)
- Astronomical calculations for moon phases

## Future Plans

- Convert to React Native for iOS and Android
- Backend integration for cross-device sync
- Catch logging and historical data
- Community features

## License

MIT


