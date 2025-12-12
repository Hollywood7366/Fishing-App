import React from 'react';

const LocationMap = ({ locations = [], onLocationClick = null }) => {
  // Note: Full Leaflet integration would require the react-leaflet library
  // This is a placeholder component that shows the structure
  
  return (
    <div style={{
      width: '100%',
      height: '500px',
      backgroundColor: '#e0e0e0',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '48px' }}>🗺️</div>
      <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Interactive Map</h3>
      <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '400px' }}>
        Map view showing {locations.length} fishing locations across South Louisiana.
        Click markers to view detailed conditions and scores.
      </p>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
        To enable the full interactive map, install react-leaflet and configure map tiles.
      </p>
      
      {/* Simple location list fallback */}
      <div style={{ 
        marginTop: '20px', 
        maxHeight: '200px', 
        overflowY: 'auto',
        width: '100%',
        maxWidth: '500px'
      }}>
        {locations.slice(0, 5).map(loc => (
          <div 
            key={loc.id}
            onClick={() => onLocationClick && onLocationClick(loc)}
            style={{
              padding: '8px',
              margin: '4px 0',
              backgroundColor: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <strong>{loc.name}</strong> - {loc.region}
          </div>
        ))}
        {locations.length > 5 && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
            ...and {locations.length - 5} more locations
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationMap;







