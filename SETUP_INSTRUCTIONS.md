# Setup Instructions for South Louisiana Fishing App

## Prerequisites

Before you can run this app, you need to install Node.js on your system.

### Installing Node.js (Windows)

1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS (Long Term Support) version
3. Run the installer and follow the prompts
4. Restart your terminal/command prompt after installation

### Verify Installation

Open a terminal and run:
```bash
node --version
npm --version
```

Both commands should return version numbers.

## Running the App

### 1. Install Dependencies

Open a terminal in the project directory (`C:\Users\19852\Desktop\Fishing App`) and run:

```bash
npm install
```

This will install all required packages (React, Vite, routing, etc.)

### 2. Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:3000` and should open automatically in your browser.

### 3. Set Up Google Maps API (Required for Map View)

To see the interactive satellite map with fishing locations:

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project (free)
3. Enable "Maps JavaScript API" for your project
4. Go to Credentials → Create credentials → API Key
5. Copy your API key
6. Create a `.env` file in the project root (if not already created)
7. Add your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
8. **IMPORTANT:** Restart the development server after creating/editing the `.env` file:
   - Press `Ctrl+C` in the terminal to stop the server
   - Run `npm run dev` again
9. Navigate to Locations → Map View to see the interactive map!

**Note:** Google Maps is free for up to $200/month usage (~28,000 map loads)

### 4. Weather & Marine Data

The app uses **free NOAA APIs** for all weather and marine data:
- **NOAA National Weather Service** - Real-time weather conditions (primary)
- **NOAA CO-OPS** - Actual water temperature and salinity data
- **NOAA Tides & Currents** - Tide predictions

**All NOAA APIs are free and require no API keys!** The app automatically fetches live data.

#### Optional: OpenWeatherMap Backup

If NOAA Marine Weather is unavailable, the app can use OpenWeatherMap as a backup:
1. Get a free API key from [openweathermap.org](https://openweathermap.org/api)
2. Add to your `.env` file:
   ```
   VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```
3. Restart the dev server

**Fallback order:** NOAA Marine Weather → OpenWeatherMap (if configured) → Mock Data

## Building for Production

To create a production build:

```bash
npm run build
```

The optimized files will be in the `dist` folder.

## Features

✅ **Dashboard** - Quick overview of top fishing spots and conditions
✅ **Locations** - Browse 18+ pre-loaded South Louisiana fishing locations
✅ **Spot Details** - Detailed conditions and scoring for each location
✅ **7-Day Forecast** - Plan ahead with extended forecasts
✅ **User Preferences** - Select target species and customize settings
✅ **Notifications** - Get alerts when conditions are excellent
✅ **Mobile Responsive** - Works great on phones and tablets
✅ **Offline-Capable** - Uses localStorage for preferences

## Scoring System

The app scores fishing conditions (0-100) based on 8 factors:

- **Tide Phase** (30%) - Incoming/outgoing/slack tide
- **Wind** (20%) - Speed and direction
- **Time of Day** (10%) - Dawn/dusk are prime
- **Moon Phase** (15%) - New/full moons are best
- **Barometric Pressure** (10%) - Stable pressure is optimal
- **Water Temperature** (10%) - Species-specific preferences
- **Salinity** (5%) - Matches location water type
- **Season** - Affects overall multiplier

## Tech Stack

- React 18 with Hooks
- Vite (fast build tool)
- React Router (navigation)
- Context API (state management)
- NOAA Tides & Currents API (real tide data)
- NOAA National Weather Service API (marine weather data)
- NOAA CO-OPS API (water temperature & salinity)
- Astronomical calculations for moon phases

## Future Enhancements

- Convert to React Native for iOS/Android apps
- Add interactive Leaflet maps
- Catch logging and history
- Community features (reports, photos)
- Backend for cross-device sync

## Troubleshooting

**"npm is not recognized"**
- Node.js is not installed or not in your PATH. Reinstall Node.js.

**Port 3000 already in use**
- Another app is using port 3000. The app will prompt to use a different port, or kill the other process.

**Mock data showing instead of real data**
- The app uses NOAA APIs which are free and don't require API keys. If you see mock data, check your internet connection or browser console for API errors.

## Support

For issues or questions, check:
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [NOAA Tides API](https://api.tidesandcurrents.noaa.gov/api/prod/)

Enjoy fishing! 🎣


