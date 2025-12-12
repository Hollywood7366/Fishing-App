import React, { useState } from 'react';
import { useLocationData } from '../contexts/LocationDataContext';
import LocationList from '../components/location/LocationList';
import GoogleMapView from '../components/location/GoogleMapView';
import Card from '../components/common/Card';

// Define filter options
const DEPTH_OPTIONS = [
  { value: 'all', label: 'All Depths' },
  { value: 'shallow', label: 'Shallow (0-4 ft)' },
  { value: 'medium', label: 'Medium (4-10 ft)' },
  { value: 'deep', label: 'Deep (10+ ft)' }
];

const STRUCTURE_OPTIONS = [
  { value: 'all', label: 'All Structure' },
  { value: 'oyster-reefs', label: '🦪 Oyster Reefs' },
  { value: 'grass-flats', label: '🌿 Grass Flats' },
  { value: 'marsh-edge', label: '🌾 Marsh Edge' },
  { value: 'mud-bottom', label: '🟤 Mud Bottom' },
  { value: 'sandy-bottom', label: '🏖️ Sandy Bottom' },
  { value: 'bridge-pilings', label: '🌉 Bridge Pilings' },
  { value: 'rock-jetties', label: '🪨 Rock Jetties' },
  { value: 'pier-pilings', label: '🎣 Pier Pilings' },
  { value: 'channel-edge', label: '📐 Channel Edge' },
  { value: 'shell-reefs', label: '🐚 Shell Reefs' },
  { value: 'cypress-trees', label: '🌲 Cypress Trees' },
  { value: 'lily-pads', label: '🌸 Lily Pads' }
];

const ACCESS_OPTIONS = [
  { value: 'all', label: 'All Access Types' },
  { value: 'boat', label: '🚤 Boat' },
  { value: 'kayak', label: '🛶 Kayak' },
  { value: 'wade', label: '🚶 Wade Fishing' },
  { value: 'pier', label: '🎣 Pier' },
  { value: 'bank', label: '🏕️ Bank' },
  { value: 'surf', label: '🌊 Surf' }
];

const Locations = () => {
  const { getRegions, getAllLocations } = useLocationData();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name' or 'score'
  
  // Structure & depth filters
  const [depthFilter, setDepthFilter] = useState('all');
  const [structureFilter, setStructureFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const regions = getRegions();
  const locations = getAllLocations();
  
  // Group locations by region for the dropdown
  const locationsByRegion = {};
  locations.forEach(loc => {
    if (!locationsByRegion[loc.region]) {
      locationsByRegion[loc.region] = [];
    }
    locationsByRegion[loc.region].push(loc);
  });

  // Apply filters for map view
  const getFilteredLocations = () => {
    let filtered = selectedLocationId 
      ? locations.filter(l => l.id === selectedLocationId)
      : selectedRegion === 'all' 
        ? locations 
        : locations.filter(l => l.region === selectedRegion);
    
    // Apply depth filter
    if (depthFilter !== 'all') {
      filtered = filtered.filter(l => l.depth === depthFilter);
    }
    
    // Apply structure filter
    if (structureFilter !== 'all') {
      filtered = filtered.filter(l => l.structure?.includes(structureFilter));
    }
    
    // Apply access filter
    if (accessFilter !== 'all') {
      filtered = filtered.filter(l => l.access?.includes(accessFilter));
    }
    
    return filtered;
  };

  // Count active filters
  const activeFilterCount = [depthFilter, structureFilter, accessFilter].filter(f => f !== 'all').length;

  // Clear all advanced filters
  const clearAdvancedFilters = () => {
    setDepthFilter('all');
    setStructureFilter('all');
    setAccessFilter('all');
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer'
  };

  const labelStyle = {
    display: 'block', 
    fontSize: '13px', 
    fontWeight: '600', 
    marginBottom: '6px',
    color: 'var(--text-primary)'
  };
  
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>Fishing Locations</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Explore {locations.length} fishing spots across South Louisiana
        </p>
      </div>
      
      {/* Filters and Controls */}
      <Card style={{ marginBottom: '20px' }}>
        {/* Basic Filters Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {/* Location Dropdown */}
          <div>
            <label style={labelStyle}>📍 Location</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              style={selectStyle}
            >
              <option value="">All Locations</option>
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
          </div>
          
          {/* Region Filter */}
          <div>
            <label style={labelStyle}>🗺️ Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={selectStyle}
            >
              {regions.map(region => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
          
          {/* Sort */}
          <div>
            <label style={labelStyle}>📊 Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={selectStyle}
            >
              <option value="name">Name</option>
              <option value="score">Current Score</option>
            </select>
          </div>
        </div>

        {/* Toggle Advanced Filters */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: activeFilterCount > 0 ? 'var(--primary-color)' : 'var(--text-secondary)',
            fontWeight: activeFilterCount > 0 ? '600' : '400',
            marginBottom: showAdvancedFilters ? '16px' : '0'
          }}
        >
          🎯 Structure & Depth Filters
          {activeFilterCount > 0 && (
            <span style={{
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '12px'
            }}>
              {activeFilterCount}
            </span>
          )}
          <span style={{ marginLeft: '4px' }}>{showAdvancedFilters ? '▲' : '▼'}</span>
        </button>

        {/* Advanced Filters - Structure & Depth */}
        {showAdvancedFilters && (
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Filter by Structure & Access
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAdvancedFilters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px'
            }}>
              {/* Depth Filter */}
              <div>
                <label style={labelStyle}>🌊 Depth</label>
                <select
                  value={depthFilter}
                  onChange={(e) => setDepthFilter(e.target.value)}
                  style={{
                    ...selectStyle,
                    backgroundColor: depthFilter !== 'all' ? '#e0f2fe' : 'white'
                  }}
                >
                  {DEPTH_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Structure Filter */}
              <div>
                <label style={labelStyle}>🏗️ Structure</label>
                <select
                  value={structureFilter}
                  onChange={(e) => setStructureFilter(e.target.value)}
                  style={{
                    ...selectStyle,
                    backgroundColor: structureFilter !== 'all' ? '#dcfce7' : 'white'
                  }}
                >
                  {STRUCTURE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Access Filter */}
              <div>
                <label style={labelStyle}>🚶 Access</label>
                <select
                  value={accessFilter}
                  onChange={(e) => setAccessFilter(e.target.value)}
                  style={{
                    ...selectStyle,
                    backgroundColor: accessFilter !== 'all' ? '#fef3c7' : 'white'
                  }}
                >
                  {ACCESS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginRight: '8px' }}>
                Quick filters:
              </span>
              {[
                { label: '🦪 Oyster', struct: 'oyster-reefs' },
                { label: '🌿 Grass', struct: 'grass-flats' },
                { label: '🌉 Bridge', struct: 'bridge-pilings' },
                { label: '🚶 Wade', access: 'wade' }
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (chip.struct) setStructureFilter(chip.struct);
                    if (chip.access) setAccessFilter(chip.access);
                  }}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 
                      (chip.struct && structureFilter === chip.struct) || 
                      (chip.access && accessFilter === chip.access) 
                        ? 'var(--primary-color)' : 'white',
                    color: 
                      (chip.struct && structureFilter === chip.struct) || 
                      (chip.access && accessFilter === chip.access) 
                        ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    marginRight: '6px',
                    marginTop: '4px'
                  }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode('list')}
            className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
          >
            📋 List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`btn ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
          >
            🗺️ Map View
          </button>
        </div>
      </Card>
      
      {/* Content */}
      {viewMode === 'list' ? (
        <LocationList 
          selectedLocationId={selectedLocationId}
          selectedRegion={selectedRegion}
          sortBy={sortBy}
          depthFilter={depthFilter}
          structureFilter={structureFilter}
          accessFilter={accessFilter}
        />
      ) : (
        <GoogleMapView locations={getFilteredLocations()} />
      )}
    </div>
  );
};

export default Locations;
