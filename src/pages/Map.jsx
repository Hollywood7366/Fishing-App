import React, { useState } from 'react';
import Card from '../components/common/Card';
// Map page disabled: offline maps now handled in native app.

const MapPage = () => {
  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '28px' }}>Marsh Map</h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Web map disabled. Use the mobile app for offline maps.</p>
      </div>
      <Card>
        <div style={{ padding: '16px', color: 'var(--text-secondary)' }}>
          Offline maps with zone cards now live in the mobile app (RN/Expo) and store tiles in permanent device storage. This web map was disabled to avoid confusion.
        </div>
      </Card>
    </div>
  );
};

export default MapPage;

