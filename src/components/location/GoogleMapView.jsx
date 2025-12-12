import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationData } from '../../contexts/LocationDataContext';

const GoogleMapView = ({ locations = [] }) => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const labelOverlaysRef = useRef([]);
  const infoWindowRef = useRef(null);
  const { getLocationScore } = useLocationData();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);

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

  // Get rating text
  const getRatingText = (locationId) => {
    const scoreData = getLocationScore(locationId);
    if (!scoreData) return 'Loading...';
    return `${scoreData.overall}/100 - ${scoreData.rating}`;
  };

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Check for API key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setError('no-key');
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setMapLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      setError('load-error');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => {
        if (marker.setMap) marker.setMap(null);
      });
      markersRef.current = [];
      // Cleanup label overlays
      labelOverlaysRef.current.forEach(overlay => {
        if (overlay.setMap) overlay.setMap(null);
      });
      labelOverlaysRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && locations.length > 0) {
      updateMarkers();
    }
  }, [locations]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Center on South Louisiana
    const center = { lat: 29.7, lng: -90.5 };

    // Custom LA DOTD imagery as a map type
    const laImagery = new window.google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return `https://maps.dotd.la.gov/imagery/rest/services/Imagery/Louisiana_Imagery_Service/MapServer/tile/${zoom}/${coord.y}/${coord.x}`;
      },
      tileSize: new window.google.maps.Size(256, 256),
      maxZoom: 19,
      minZoom: 5,
      name: 'LA Imagery',
      alt: 'Louisiana DOTD Imagery'
    });

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 9,
      mapTypeId: 'ladotd', // Default to LA DOTD imagery
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['ladotd', 'satellite', 'roadmap', 'hybrid']
      },
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [] // No custom styles needed for satellite
    });

    map.mapTypes.set('ladotd', laImagery);
    mapInstanceRef.current = map;
    infoWindowRef.current = new window.google.maps.InfoWindow();

    // Add markers for all locations
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) return;

    // Custom HTML overlay class for labels with configurable positioning
    // Define this inside updateMarkers so Google Maps is guaranteed to be loaded
    class LabelOverlay extends window.google.maps.OverlayView {
      constructor(markerPosition, text, offsetX = 0, offsetY = -60) {
        super();
        this.markerPosition = markerPosition;
        this.text = text;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.div = null;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.cssText = `
          position: absolute;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          pointer-events: none;
          z-index: 1000;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.3);
          text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        `;
        this.div.textContent = this.text;
        
        const panes = this.getPanes();
        if (panes && panes.overlayMouseTarget) {
          panes.overlayMouseTarget.appendChild(this.div);
        }
      }

      draw() {
        const overlayProjection = this.getProjection();
        if (!overlayProjection || !this.div) return;
        
        const markerPixel = overlayProjection.fromLatLngToDivPixel(this.markerPosition);
        if (!markerPixel) return;

        // Position the label with the calculated offset
        let left = markerPixel.x + this.offsetX;
        let top = markerPixel.y + this.offsetY;
        
        // Adjust transform based on position
        let transform = '';
        if (this.offsetX === 0) {
          // Centered horizontally (top or bottom)
          transform = 'translateX(-50%)';
        }
        if (this.offsetY === 0) {
          // Centered vertically (left or right)
          transform = transform ? transform + ' translateY(-50%)' : 'translateY(-50%)';
        }

        this.div.style.transform = transform || 'none';
        this.div.style.left = left + 'px';
        this.div.style.top = top + 'px';
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
        }
        this.div = null;
      }
    }

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (marker.setMap) marker.setMap(null);
    });
    markersRef.current = [];
    
    // Clear existing label overlays
    labelOverlaysRef.current.forEach(overlay => {
      if (overlay.setMap) overlay.setMap(null);
    });
    labelOverlaysRef.current = [];

    // First, create all markers and store their data
    const markerData = locations.map(location => {
      const color = getMarkerColor(location.id);
      
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 3
      };

      const marker = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: mapInstanceRef.current,
        title: location.name,
        icon: icon,
        animation: window.google.maps.Animation.DROP,
        zIndex: 1
      });

      // Add click listener
      marker.addListener('click', () => {
        const scoreData = getLocationScore(location.id);
        const content = `
          <div style="padding: 12px; max-width: 300px;">
            <h3 style="margin: 0 0 8px 0; color: #212121; font-size: 18px;">${location.name}</h3>
            <p style="margin: 0 0 8px 0; color: #757575; font-size: 14px;">${location.region}</p>
            ${location.description ? `<p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.4;">${location.description}</p>` : ''}
            ${scoreData ? `
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="font-size: 32px; font-weight: bold; color: ${color};">${scoreData.overall}</div>
                <div style="background: ${color}20; color: ${color}; padding: 4px 12px; border-radius: 12px; font-weight: 600;">
                  ${scoreData.rating.toUpperCase()}
                </div>
              </div>
            ` : ''}
            <button 
              onclick="window.location.href='/location/${location.id}'" 
              style="
                background: #1976d2; 
                color: white; 
                border: none; 
                padding: 10px 20px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                width: 100%;
              "
            >
              View Details
            </button>
          </div>
        `;

        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      return {
        marker,
        location,
        color,
        position: new window.google.maps.LatLng(location.lat, location.lng)
      };
    });

    markersRef.current = markerData.map(data => data.marker);

    // Create labels with smart positioning - use alternating positions to reduce overlaps
    const labelOverlays = [];
    markerData.forEach((data, index) => {
      // Alternate between top, right, bottom, left positions to reduce overlaps
      const positionIndex = index % 4;
      let offsetX = 0;
      let offsetY = -60; // Default to top
      
      switch(positionIndex) {
        case 0: // Top
          offsetX = 0;
          offsetY = -60;
          break;
        case 1: // Right
          offsetX = 60;
          offsetY = 0;
          break;
        case 2: // Bottom
          offsetX = 0;
          offsetY = 60;
          break;
        case 3: // Left
          offsetX = -60;
          offsetY = 0;
          break;
      }
      
      const labelOverlay = new LabelOverlay(
        data.position,
        data.location.name,
        offsetX,
        offsetY
      );
      labelOverlay.setMap(mapInstanceRef.current);
      labelOverlays.push(labelOverlay);
    });
    
    labelOverlaysRef.current = labelOverlays;

    // Fit bounds to show all markers
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend({ lat: location.lat, lng: location.lng });
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  };


  // Error/No API Key view
  if (error === 'no-key') {
    return (
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#856404' }}>🗺️ Google Maps API Key Required</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.6' }}>
          To see satellite imagery and interactive maps, you need a free Google Maps API key.
        </p>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '16px', 
          borderRadius: '8px',
          textAlign: 'left',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Setup Instructions:</h4>
          <ol style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px' }}>
            <li>Go to <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
            <li>Create a project (free)</li>
            <li>Enable "Maps JavaScript API"</li>
            <li>Create credentials → API Key</li>
            <li>Copy your API key</li>
            <li>Create a <code>.env</code> file in your project root</li>
            <li>Add: <code>VITE_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
            <li>Restart the dev server: <code>npm run dev</code></li>
          </ol>
        </div>
        <p style={{ fontSize: '13px', color: '#856404', fontStyle: 'italic' }}>
          Google Maps is free for up to $200/month usage (~28,000 map loads)
        </p>
      </div>
    );
  }

  if (error === 'load-error') {
    return (
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c2c7',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#842029' }}>Error Loading Google Maps</h3>
        <p style={{ margin: 0, fontSize: '14px' }}>
          There was an error loading Google Maps. Please check your API key and try again.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '13px',
        zIndex: 10
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
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#757575' }}>
          Base map: LA DOTD imagery (or Google types)
        </div>
      </div>

      <p style={{ 
        marginTop: '12px', 
        fontSize: '13px', 
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        🛰️ Satellite View • Click markers for details • Toggle map types in top-right corner
      </p>
    </div>
  );
};

export default GoogleMapView;

