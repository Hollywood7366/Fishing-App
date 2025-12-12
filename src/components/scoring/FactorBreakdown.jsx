import React from 'react';
import { getRating, getFactorExplanation } from '../../services/scoringEngine';

const FactorBreakdown = ({ factors }) => {
  const factorNames = {
    tide: 'Tide',
    wind: 'Wind',
    timeOfDay: 'Time of Day',
    moon: 'Moon Phase',
    barometer: 'Barometric Pressure',
    waterTemp: 'Water Temperature',
    salinity: 'Salinity',
    season: 'Season'
  };
  
  const factorIcons = {
    tide: '🌊',
    wind: '💨',
    timeOfDay: '🕐',
    moon: '🌙',
    barometer: '🔽',
    waterTemp: '🌡️',
    salinity: '💧',
    season: '📅'
  };
  
  const getBarColor = (score) => {
    if (score >= 80) return '#1976d2';
    if (score >= 65) return '#43a047';
    if (score >= 50) return '#fb8c00';
    return '#e53935';
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Object.entries(factors).map(([key, score]) => {
        const rating = getRating(score);
        const explanation = getFactorExplanation(key, score);
        
        return (
          <div key={key}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{factorIcons[key]}</span>
                <span style={{ fontWeight: '500', fontSize: '15px' }}>
                  {factorNames[key] || key}
                </span>
              </div>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '16px',
                color: getBarColor(score)
              }}>
                {score}
              </span>
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${score}%`,
                height: '100%',
                backgroundColor: getBarColor(score),
                transition: 'width 0.5s ease',
                borderRadius: '4px'
              }}></div>
            </div>
            
            {/* Explanation */}
            <p style={{ 
              margin: '6px 0 0 0', 
              fontSize: '13px', 
              color: 'var(--text-secondary)',
              fontStyle: 'italic'
            }}>
              {explanation}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default FactorBreakdown;







