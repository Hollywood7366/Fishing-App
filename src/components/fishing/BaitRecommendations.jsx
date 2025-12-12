import React, { useState } from 'react';
import Card from '../common/Card';

// Get current season
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

const BaitRecommendations = ({ species, compact = false }) => {
  const [showAllBaits, setShowAllBaits] = useState(false);
  const currentSeason = getCurrentSeason();
  
  if (!species || !species.baitsAndLures) {
    return null;
  }
  
  const { baitsAndLures } = species;
  const seasonalBaits = baitsAndLures.bySeasonAndCondition?.[currentSeason] || [];
  const topPicks = baitsAndLures.topPicks || [];
  const rigs = baitsAndLures.rigs || [];
  
  // Type icon mapping
  const getTypeIcon = (type) => {
    const icons = {
      'live': '🦐',
      'lure': '🎣',
      'soft plastic': '🪱',
      'cut bait': '🔪',
      'dead bait': '🐟',
      'natural': '🦀',
      'combo': '🔗',
      'fly': '🪰'
    };
    return icons[type] || '🎣';
  };
  
  // Get effectiveness color
  const getEffectivenessColor = (score) => {
    if (score >= 90) return '#1976d2';
    if (score >= 80) return '#43a047';
    if (score >= 70) return '#fb8c00';
    return '#757575';
  };
  
  // Compact view for smaller displays
  if (compact) {
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: 'var(--text-secondary)'
        }}>
          🎣 Top Baits for {species.name}:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {topPicks.slice(0, 3).map((bait, index) => (
            <span
              key={index}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {getTypeIcon(bait.type)} {bait.name}
            </span>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <Card 
      title={`Bait & Lure Recommendations`}
      subtitle={`Best picks for ${species.name} this ${currentSeason}`}
      style={{ marginBottom: '20px' }}
    >
      {/* Top Picks Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⭐ Top Picks
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topPicks.map((bait, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                backgroundColor: index === 0 ? '#e3f2fd' : '#f5f5f5',
                borderRadius: '8px',
                border: index === 0 ? '2px solid #1976d2' : '1px solid #e0e0e0'
              }}
            >
              <div style={{
                fontSize: '24px',
                width: '40px',
                textAlign: 'center'
              }}>
                {getTypeIcon(bait.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {bait.name}
                  {index === 0 && (
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      #1 CHOICE
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  marginTop: '4px'
                }}>
                  💡 {bait.tip}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px'
                }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                    textTransform: 'capitalize'
                  }}>
                    {bait.type}
                  </span>
                  <div style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    maxWidth: '100px'
                  }}>
                    <div style={{
                      width: `${bait.rating}%`,
                      height: '100%',
                      backgroundColor: getEffectivenessColor(bait.rating),
                      borderRadius: '2px'
                    }} />
                  </div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    color: getEffectivenessColor(bait.rating)
                  }}>
                    {bait.rating}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Seasonal Recommendations */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textTransform: 'capitalize'
        }}>
          📅 Best for {currentSeason}
        </h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '8px'
        }}>
          {(showAllBaits ? seasonalBaits : seasonalBaits.slice(0, 4)).map((bait, index) => (
            <div 
              key={index}
              style={{
                padding: '10px',
                backgroundColor: '#fafafa',
                borderRadius: '6px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '16px' }}>{getTypeIcon(bait.type)}</span>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: '500',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {bait.name}
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  flex: 1,
                  height: '4px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${bait.effectiveness}%`,
                    height: '100%',
                    backgroundColor: getEffectivenessColor(bait.effectiveness),
                    borderRadius: '2px'
                  }} />
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '600',
                  color: getEffectivenessColor(bait.effectiveness)
                }}>
                  {bait.effectiveness}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {seasonalBaits.length > 4 && (
          <button
            onClick={() => setShowAllBaits(!showAllBaits)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              fontSize: '12px',
              color: '#1976d2',
              backgroundColor: 'transparent',
              border: '1px solid #1976d2',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showAllBaits ? 'Show Less' : `Show All (${seasonalBaits.length})`}
          </button>
        )}
      </div>
      
      {/* Recommended Rigs */}
      <div>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🪢 Recommended Rigs
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rigs.slice(0, 3).map((rig, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                borderRadius: '6px'
              }}
            >
              <span style={{ 
                fontSize: '14px',
                fontWeight: '600',
                color: '#1976d2',
                minWidth: '20px'
              }}>
                {index + 1}.
              </span>
              <div>
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  {rig.name}
                </span>
                <span style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  marginLeft: '8px'
                }}>
                  — {rig.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default BaitRecommendations;






