import React, { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import SpotForm from '../components/spots/SpotForm';
import { 
  loadUserSpots, 
  addUserSpot, 
  updateUserSpot, 
  deleteUserSpot,
  getUserSpotStats 
} from '../utils/localStorage';

const getStructureLabel = (structure) => {
  const labels = {
    'oyster-reefs': '🦪 Oyster',
    'grass-flats': '🌿 Grass',
    'marsh-edge': '🌾 Marsh',
    'mud-bottom': '🟤 Mud',
    'sandy-bottom': '🏖️ Sand',
    'bridge-pilings': '🌉 Bridge',
    'rock-jetties': '🪨 Jetties',
    'pier-pilings': '🎣 Pier',
    'channel-edge': '📐 Channel',
    'shell-reefs': '🐚 Shell',
    'cypress-trees': '🌲 Cypress',
    'lily-pads': '🌸 Lily Pads'
  };
  return labels[structure] || structure;
};

const getDepthLabel = (depth) => {
  const labels = {
    'shallow': 'Shallow',
    'medium': 'Medium',
    'deep': 'Deep'
  };
  return labels[depth] || depth;
};

const getDepthColor = (depth) => {
  const colors = {
    'shallow': '#22c55e',
    'medium': '#3b82f6',
    'deep': '#6366f1'
  };
  return colors[depth] || '#6b7280';
};

const getAccessLabel = (access) => {
  const labels = {
    'boat': '🚤 Boat',
    'kayak': '🛶 Kayak',
    'wade': '🚶 Wade',
    'pier': '🎣 Pier',
    'bank': '🏕️ Bank',
    'surf': '🌊 Surf'
  };
  return labels[access] || access;
};

const MySpots = () => {
  const [spots, setSpots] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [filterStructure, setFilterStructure] = useState('all');
  const [filterDepth, setFilterDepth] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    refreshSpots();
  }, []);

  const refreshSpots = () => {
    setSpots(loadUserSpots());
    setStats(getUserSpotStats());
  };

  const handleAddSpot = (spotData) => {
    addUserSpot(spotData);
    refreshSpots();
    setShowAddForm(false);
  };

  const handleUpdateSpot = (spotData) => {
    if (editingSpot) {
      updateUserSpot(editingSpot.id, spotData);
      refreshSpots();
      setEditingSpot(null);
    }
  };

  const handleDeleteSpot = (spotId) => {
    if (window.confirm('Are you sure you want to delete this spot?')) {
      deleteUserSpot(spotId);
      refreshSpots();
    }
  };

  // Filter spots
  let filteredSpots = spots;
  if (filterStructure !== 'all') {
    filteredSpots = filteredSpots.filter(s => s.structure?.includes(filterStructure));
  }
  if (filterDepth !== 'all') {
    filteredSpots = filteredSpots.filter(s => s.depth === filterDepth);
  }
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredSpots = filteredSpots.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.parentLocationName?.toLowerCase().includes(term) ||
      s.notes?.toLowerCase().includes(term)
    );
  }

  return (
    <div className="container" style={{ paddingTop: '24px', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>📍 My Spots</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Your personal fishing spots with structure and depth info
          </p>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingSpot(null); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ➕ Add Spot
        </button>
      </div>

      {/* Stats Summary */}
      {stats && stats.totalSpots > 0 && (
        <Card style={{ marginBottom: '20px', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)' }}>
                {stats.totalSpots}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Total Spots</div>
            </div>
            {Object.keys(stats.byStructure).length > 0 && (
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Top Structure</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {Object.entries(stats.byStructure)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([struct, count]) => (
                      <span key={struct} style={{
                        padding: '2px 8px',
                        fontSize: '12px',
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '10px'
                      }}>
                        {getStructureLabel(struct)} ({count})
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingSpot) && (
        <Card style={{ marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>
            {editingSpot ? '✏️ Edit Spot' : '➕ Add New Spot'}
          </h3>
          <SpotForm
            onSubmit={editingSpot ? handleUpdateSpot : handleAddSpot}
            initialData={editingSpot}
            onCancel={() => { setShowAddForm(false); setEditingSpot(null); }}
          />
        </Card>
      )}

      {/* Filters */}
      {spots.length > 0 && (
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                🔍 Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search spots..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                🏗️ Structure
              </label>
              <select
                value={filterStructure}
                onChange={(e) => setFilterStructure(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Structure</option>
                <option value="oyster-reefs">🦪 Oyster Reefs</option>
                <option value="grass-flats">🌿 Grass Flats</option>
                <option value="marsh-edge">🌾 Marsh Edge</option>
                <option value="bridge-pilings">🌉 Bridge Pilings</option>
                <option value="rock-jetties">🪨 Rock Jetties</option>
                <option value="channel-edge">📐 Channel Edge</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                🌊 Depth
              </label>
              <select
                value={filterDepth}
                onChange={(e) => setFilterDepth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  fontSize: '14px'
                }}
              >
                <option value="all">All Depths</option>
                <option value="shallow">Shallow (0-4 ft)</option>
                <option value="medium">Medium (4-10 ft)</option>
                <option value="deep">Deep (10+ ft)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Spots List */}
      {filteredSpots.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
          {spots.length === 0 ? (
            <>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No spots yet</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                Start building your personal fishing spot database
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
              >
                ➕ Add Your First Spot
              </button>
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No spots match your filters</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Try adjusting your search or filters
              </p>
            </>
          )}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredSpots.map(spot => (
            <Card key={spot.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{spot.name}</h3>
                    {spot.isPrivate && (
                      <span title="Private spot" style={{ fontSize: '14px' }}>🔒</span>
                    )}
                  </div>
                  
                  {spot.parentLocationName && (
                    <p style={{ 
                      margin: '4px 0', 
                      fontSize: '14px', 
                      color: 'var(--text-secondary)',
                      fontWeight: '500'
                    }}>
                      📍 {spot.parentLocationName} • {spot.region}
                    </p>
                  )}

                  {/* Depth & Coordinates */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '8px',
                    fontSize: '13px',
                    flexWrap: 'wrap'
                  }}>
                    {spot.depth && (
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 10px',
                        backgroundColor: `${getDepthColor(spot.depth)}15`,
                        color: getDepthColor(spot.depth),
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}>
                        🌊 {getDepthLabel(spot.depth)}
                        {spot.depthFeet && ` (${spot.depthFeet} ft)`}
                      </span>
                    )}
                    {spot.lat && spot.lng && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        🛰️ {spot.lat.toFixed(4)}, {spot.lng.toFixed(4)}
                      </span>
                    )}
                  </div>

                  {/* Structure Tags */}
                  {spot.structure && spot.structure.length > 0 && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {spot.structure.map(struct => (
                        <span 
                          key={struct}
                          style={{
                            fontSize: '11px',
                            padding: '3px 8px',
                            backgroundColor: '#e8f5e9',
                            color: '#2e7d32',
                            borderRadius: '10px'
                          }}
                        >
                          {getStructureLabel(struct)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Access */}
                  {spot.access && spot.access.length > 0 && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Access: {spot.access.map(a => getAccessLabel(a)).join(', ')}
                    </div>
                  )}

                  {/* Notes */}
                  {spot.notes && (
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      fontSize: '13px', 
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      "{spot.notes}"
                    </p>
                  )}

                  {/* Date */}
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '11px', 
                    color: '#9ca3af'
                  }}>
                    Added {new Date(spot.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => { setEditingSpot(spot); setShowAddForm(false); }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSpot(spot.id)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️ Delete
                  </button>
                  {spot.lat && spot.lng && (
                    <a
                      href={`https://www.google.com/maps?q=${spot.lat},${spot.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        fontSize: '13px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        textDecoration: 'none',
                        textAlign: 'center'
                      }}
                    >
                      🗺️ Map
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySpots;






