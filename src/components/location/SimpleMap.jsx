import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationData } from '../../contexts/LocationDataContext';

const SimpleMap = ({ locations = [] }) => {
  const navigate = useNavigate();
  const { getLocationScore } = useLocationData();
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // South Louisiana bounds
  const mapBounds = {
    minLat: 29.0,
    maxLat: 30.5,
    minLng: -93.5,
    maxLng: -89.0
  };
  
  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat, lng, width, height) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * width;
    const y = height - ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * height;
    return { x, y };
  };
  
  const mapWidth = 800;
  const mapHeight = 600;
  
  // Get marker color based on score
  const getMarkerColor = (locationId) => {
    const scoreData = getLocationScore(locationId);
    if (!scoreData) return '#757575';
    
    const score = scoreData.overall;
    if (score >= 80) return '#1976d2'; // Excellent - blue
    if (score >= 65) return '#43a047'; // Good - green
    if (score >= 50) return '#fb8c00'; // Fair - orange
    return '#e53935'; // Poor - red
  };
  
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };
  
  const handleViewDetails = () => {
    if (selectedLocation) {
      navigate(`/location/${selectedLocation.id}`);
    }
  };
  
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      {/* Map Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '75%', // 4:3 aspect ratio
        backgroundColor: '#b3d9ff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Water background */}
          <rect width={mapWidth} height={mapHeight} fill="#b3d9ff" />
          
          {/* Land areas (simplified Louisiana shape) */}
          <rect x="0" y="0" width={mapWidth} height={mapHeight * 0.6} fill="#e8f5e9" opacity="0.7" />
          
          {/* Grid lines */}
          {[...Array(5)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(i + 1) * (mapHeight / 6)}
              x2={mapWidth}
              y2={(i + 1) * (mapHeight / 6)}
              stroke="#cccccc"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * (mapWidth / 6)}
              y1="0"
              x2={(i + 1) * (mapWidth / 6)}
              y2={mapHeight}
              stroke="#cccccc"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Location markers */}
          {locations.map(location => {
            const { x, y } = latLngToPixel(location.lat, location.lng, mapWidth, mapHeight);
            const color = getMarkerColor(location.id);
            const isSelected = selectedLocation?.id === location.id;
            
            return (
              <g key={location.id}>
                {/* Marker shadow */}
                <circle
                  cx={x}
                  cy={y + 2}
                  r={isSelected ? 14 : 10}
                  fill="black"
                  opacity="0.2"
                />
                {/* Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 12 : 8}
                  fill={color}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleMarkerClick(location)}
                >
                  <title>{location.name}</title>
                </circle>
                
                {/* Label for selected */}
                {isSelected && (
                  <text
                    x={x}
                    y={y - 20}
                    textAnchor="middle"
                    fill="#212121"
                    fontSize="14"
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {location.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        
        {/* Legend */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          backgroundColor: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>Fishing Conditions</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1976d2' }}></div>
            <span>Excellent (80+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#43a047' }}></div>
            <span>Good (65-79)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#fb8c00' }}></div>
            <span>Fair (50-64)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e53935' }}></div>
            <span>Poor (&lt;50)</span>
          </div>
        </div>
      </div>
      
      {/* Selected Location Info */}
      {selectedLocation && (
        <div style={{
          marginTop: '16px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{selectedLocation.name}</h3>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                {selectedLocation.region}
              </p>
              {selectedLocation.description && (
                <p style={{ margin: '8px 0', fontSize: '14px', lineHeight: '1.5' }}>
                  {selectedLocation.description}
                </p>
              )}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              {(() => {
                const scoreData = getLocationScore(selectedLocation.id);
                if (scoreData) {
                  return (
                    <>
                      <div style={{ 
                        fontSize: '32px', 
                        fontWeight: '700',
                        color: getMarkerColor(selectedLocation.id)
                      }}>
                        {scoreData.overall}
                      </div>
                      <div className={`badge-${scoreData.rating}`} style={{ marginTop: '4px' }}>
                        {scoreData.rating}
                      </div>
                    </>
                  );
                }
                return <span style={{ color: 'var(--text-secondary)' }}>Loading...</span>;
              })()}
            </div>
          </div>
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={handleViewDetails} className="btn btn-primary">
              View Details
            </button>
            <button onClick={() => setSelectedLocation(null)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
      
      <p style={{ 
        marginTop: '12px', 
        fontSize: '13px', 
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        Click on any marker to view location details • Colors indicate current fishing conditions
      </p>
    </div>
  );
};

export default SimpleMap;







