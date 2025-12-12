import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import { getSolunarData, formatSolunarTime } from '../../services/solunarService';

const BiteTimePredictions = ({ lat, lng, compact = false }) => {
  const [solunarData, setSolunarData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    if (lat && lng) {
      const data = getSolunarData(new Date(), lat, lng);
      setSolunarData(data);
    }
    
    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      if (lat && lng) {
        setSolunarData(getSolunarData(new Date(), lat, lng));
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [lat, lng]);
  
  if (!solunarData) {
    return null;
  }
  
  const { windows, sunTimes, activeWindow, nextPeriod, dayRating, summary } = solunarData;
  
  // Get rating color
  const getRatingColor = (rating) => {
    if (rating >= 90) return '#1976d2';
    if (rating >= 80) return '#43a047';
    if (rating >= 70) return '#fb8c00';
    return '#757575';
  };
  
  // Get period badge style
  const getPeriodStyle = (period) => {
    if (period.isActive) {
      return {
        backgroundColor: '#e3f2fd',
        border: '2px solid #1976d2',
        animation: 'pulse 2s infinite'
      };
    }
    if (period.isPast) {
      return {
        backgroundColor: '#f5f5f5',
        opacity: 0.6
      };
    }
    return {
      backgroundColor: '#fafafa',
      border: '1px solid #e0e0e0'
    };
  };
  
  // Compact view
  if (compact) {
    return (
      <div style={{ marginTop: '12px' }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: '600', 
          marginBottom: '8px',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⏰ Bite Times Today
          <span style={{
            fontSize: '11px',
            padding: '2px 6px',
            backgroundColor: getRatingColor(dayRating),
            color: 'white',
            borderRadius: '4px'
          }}>
            {dayRating}% Day
          </span>
        </div>
        
        {activeWindow ? (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '6px',
            border: '2px solid #1976d2',
            fontSize: '13px'
          }}>
            🎣 <strong>NOW:</strong> {activeWindow.name} until {formatSolunarTime(activeWindow.end)}
          </div>
        ) : nextPeriod ? (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            ⏳ Next: <strong>{nextPeriod.period.name}</strong> in {nextPeriod.text}
          </div>
        ) : (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            No more feeding periods today
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Card 
      title="Bite Time Predictions"
      subtitle="Solunar feeding windows"
      style={{ marginBottom: '20px' }}
    >
      {/* Day Summary */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: activeWindow ? '#e3f2fd' : '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '16px',
        border: activeWindow ? '2px solid #1976d2' : '1px solid #e0e0e0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>{summary}</span>
          <span style={{
            fontSize: '12px',
            padding: '4px 8px',
            backgroundColor: getRatingColor(dayRating),
            color: 'white',
            borderRadius: '12px',
            fontWeight: '600'
          }}>
            {dayRating}% Day Rating
          </span>
        </div>
        
        {activeWindow && (
          <div style={{
            fontSize: '13px',
            color: '#1976d2',
            fontWeight: '500'
          }}>
            🎣 Active now: {activeWindow.name} ({formatSolunarTime(activeWindow.start)} - {formatSolunarTime(activeWindow.end)})
          </div>
        )}
      </div>
      
      {/* Sun Times Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px',
        backgroundColor: '#fff8e1',
        borderRadius: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px' }}>🌅</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sunrise</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatSolunarTime(sunTimes.sunrise)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px' }}>☀️</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Solar Noon</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatSolunarTime(sunTimes.solarNoon)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px' }}>🌇</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sunset</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatSolunarTime(sunTimes.sunset)}</div>
        </div>
      </div>
      
      {/* Feeding Periods Timeline */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Today's Feeding Windows
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {windows.filter(w => !w.isPast || w.isActive).slice(0, 6).map((period, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: '8px',
                ...getPeriodStyle(period)
              }}
            >
              <div style={{ 
                fontSize: '20px',
                width: '30px',
                textAlign: 'center'
              }}>
                {period.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    color: period.isActive ? '#1976d2' : 'inherit'
                  }}>
                    {period.label || period.name}
                  </span>
                  
                  {period.isActive && (
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: '500',
                      animation: 'pulse 2s infinite'
                    }}>
                      NOW
                    </span>
                  )}
                  
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    backgroundColor: period.type === 'major' ? '#1976d2' : 
                                    period.type === 'golden' ? '#ff9800' : '#757575',
                    color: 'white',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {period.type}
                  </span>
                </div>
                
                <div style={{ 
                  fontSize: '13px', 
                  color: 'var(--text-secondary)',
                  marginTop: '2px'
                }}>
                  {formatSolunarTime(period.start)} - {formatSolunarTime(period.end)}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: getRatingColor(period.rating)
                }}>
                  {period.rating}%
                </div>
                <div style={{
                  width: '50px',
                  height: '4px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginTop: '4px'
                }}>
                  <div style={{
                    width: `${period.rating}%`,
                    height: '100%',
                    backgroundColor: getRatingColor(period.rating),
                    borderRadius: '2px'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        fontSize: '11px',
        color: 'var(--text-secondary)',
        borderTop: '1px solid #e0e0e0',
        paddingTop: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#1976d2',
            borderRadius: '2px'
          }} />
          Major (2hr)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#757575',
            borderRadius: '2px'
          }} />
          Minor (1hr)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#ff9800',
            borderRadius: '2px'
          }} />
          Golden Hour
        </div>
      </div>
      
      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </Card>
  );
};

export default BiteTimePredictions;






