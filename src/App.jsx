import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import { LocationDataProvider } from './contexts/LocationDataContext';
import { ChatProvider } from './contexts/ChatContext';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import SpotDetail from './pages/SpotDetail';
import Forecast from './pages/Forecast';
import Preferences from './pages/Preferences';
import CatchLog from './pages/CatchLog';
import MySpots from './pages/MySpots';
import NotFound from './pages/NotFound';
import ScoreLoader from './components/location/ScoreLoader';
import ChatWidget from './components/chat/ChatWidget';
import MapPage from './pages/Map';

function App() {
  return (
    <Router>
      <UserPreferencesProvider>
        <LocationDataProvider>
          <ChatProvider>
            <ScoreLoader />
            <div className="app-shell">
              <Header />
              <main className="app-main">
                <div className="app-surface">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/locations" element={<Locations />} />
                    <Route path="/location/:id" element={<SpotDetail />} />
                    <Route path="/forecast" element={<Forecast />} />
                    <Route path="/catches" element={<CatchLog />} />
                    <Route path="/my-spots" element={<MySpots />} />
                    <Route path="/preferences" element={<Preferences />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
              <footer className="app-footer">
                <div className="app-surface">
                  <p className="footer-title">
                    The Daily Limit • AI South Louisiana Fishing Guide
                  </p>
                  <p className="footer-meta">
                    Data sources: NOAA Tides & Currents, NOAA NWS Marine Weather, NOAA CO-OPS
                  </p>
                </div>
              </footer>
            </div>
            <ChatWidget />
          </ChatProvider>
        </LocationDataProvider>
      </UserPreferencesProvider>
    </Router>
  );
}

export default App;
