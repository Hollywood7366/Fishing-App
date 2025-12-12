import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLocationData } from '../../contexts/LocationDataContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAllLocations, getRegions } = useLocationData();
  
  const allLocations = getAllLocations();
  const regions = getRegions();
  
  const isActive = (path) => location.pathname === path;
  
  // Group locations by region for the dropdown
  const locationsByRegion = {};
  allLocations.forEach(loc => {
    if (!locationsByRegion[loc.region]) {
      locationsByRegion[loc.region] = [];
    }
    locationsByRegion[loc.region].push(loc);
  });
  
  const handleLocationSelect = (locationId) => {
    if (locationId) {
      navigate(`/location/${locationId}`);
    }
  };

  const handleNavClick = (path) => {
    navigate(path);
  };
  
  return (
    <header className="app-header">
      <div className="app-surface app-bar">
        <div className="brand" onClick={() => navigate('/')}>
          <div className="brand-mark">🎣</div>
          <div>
            <div className="brand-title">The Daily Limit</div>
            <div className="brand-subtitle">AI South Louisiana Guide</div>
          </div>
        </div>
        
        <div className="header-actions">
          <select
            className="location-picker"
            onChange={(e) => handleLocationSelect(e.target.value)}
            defaultValue=""
          >
            <option value="">Quick jump to a location</option>
            {regions.filter(r => r !== 'all').map(region => (
              <optgroup key={region} label={region}>
                {locationsByRegion[region]?.sort((a, b) => a.name.localeCompare(b.name)).map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          
          <nav className="nav-links">
            <button onClick={() => handleNavClick('/')} className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Dashboard
            </button>
            <button onClick={() => handleNavClick('/locations')} className={`nav-link ${isActive('/locations') ? 'active' : ''}`}>
              Locations
            </button>
            <button onClick={() => handleNavClick('/map')} className={`nav-link ${isActive('/map') ? 'active' : ''}`}>
              Map
            </button>
            <button onClick={() => handleNavClick('/forecast')} className={`nav-link ${isActive('/forecast') ? 'active' : ''}`}>
              Forecast
            </button>
            <button onClick={() => handleNavClick('/catches')} className={`nav-link ${isActive('/catches') ? 'active' : ''}`}>
              Catches
            </button>
            <button onClick={() => handleNavClick('/my-spots')} className={`nav-link ${isActive('/my-spots') ? 'active' : ''}`}>
              My Spots
            </button>
            <button onClick={() => handleNavClick('/preferences')} className={`nav-link ${isActive('/preferences') ? 'active' : ''}`}>
              Preferences
            </button>
          </nav>
        </div>
      </div>
      
      <div className="app-surface app-header-subtext">
        <p>
          Built for serious inshore anglers: precision forecasts, location intel, and tide-aware scoring at a glance.
        </p>
      </div>
    </header>
  );
};

export default Header;
