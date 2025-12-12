import React from 'react';
import Card from '../common/Card';
import ScoreGauge from '../scoring/ScoreGauge';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

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
    'shallow': '0-4 ft',
    'medium': '4-10 ft',
    'deep': '10+ ft'
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
    'boat': '🚤',
    'kayak': '🛶',
    'wade': '🚶',
    'pier': '🎣',
    'bank': '🏕️',
    'surf': '🌊'
  };
  return labels[access] || access;
};

const LocationCard = ({ location, scoreData = null, onClick }) => {
  const { isFavorite, toggleFavorite } = useUserPreferences();
  const favorite = isFavorite(location.id);
  
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    toggleFavorite(location.id);
  };
  
  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>{location.name}</h3>
            <button
              onClick={handleFavoriteClick}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '0',
                lineHeight: 1
              }}
              title={favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorite ? '⭐' : '☆'}
            </button>
          </div>
          
          <p style={{ 
            margin: '4px 0', 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            fontWeight: '500'
          }}>
            {location.region}
          </p>
          
          {location.description && (
            <p style={{ 
              margin: '8px 0', 
              fontSize: '14px', 
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              {location.description}
            </p>
          )}
          
          {/* Depth & Access Quick Info */}
          {(location.depth || location.access) && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
              fontSize: '13px'
            }}>
              {location.depth && (
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  backgroundColor: `${getDepthColor(location.depth)}15`,
                  color: getDepthColor(location.depth),
                  borderRadius: '12px',
                  fontWeight: '500'
                }}>
                  🌊 {getDepthLabel(location.depth)}
                </span>
              )}
              {location.depthRange && (
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                  ({location.depthRange.min}-{location.depthRange.max} ft typical)
                </span>
              )}
              {location.access && location.access.length > 0 && (
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }} title={`Access: ${location.access.join(', ')}`}>
                  {location.access.map(a => (
                    <span key={a}>{getAccessLabel(a)}</span>
                  ))}
                </span>
              )}
            </div>
          )}
          
          {/* Structure Tags */}
          {location.structure && location.structure.length > 0 && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {location.structure.map(struct => (
                <span 
                  key={struct}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getStructureLabel(struct)}
                </span>
              ))}
            </div>
          )}
          
          {location.targetSpecies && location.targetSpecies.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                🐟 {location.targetSpecies.join(', ')}
              </p>
            </div>
          )}
          
          {location.facilities && location.facilities.length > 0 && (
            <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {location.facilities.map(facility => (
                <span 
                  key={facility}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    borderRadius: '10px'
                  }}
                >
                  {facility}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {scoreData && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ScoreGauge score={scoreData.overall} size="small" showLabel={true} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocationCard;
