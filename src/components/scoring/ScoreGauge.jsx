import React from 'react';
import { getRating, getRatingDisplay, getRatingColor, getScoreReasons } from '../../services/scoringEngine';

const ScoreGauge = ({ score, size = 'large', showLabel = true, scoreData = null, showReasons = false }) => {
  const rating = getRating(score);
  const ratingDisplay = getRatingDisplay(rating);
  
  // Get reasons if scoreData is provided
  const reasons = showReasons && scoreData ? getScoreReasons(scoreData, scoreData.conditions) : [];
  
  const sizes = {
    small: { width: 60, height: 60, fontSize: '18px' },
    medium: { width: 100, height: 100, fontSize: '28px' },
    large: { width: 140, height: 140, fontSize: '36px' }
  };
  
  const dimensions = sizes[size] || sizes.large;
  
  // Calculate color based on score
  const getColor = () => {
    if (score >= 80) return '#1976d2';
    if (score >= 65) return '#43a047';
    if (score >= 50) return '#fb8c00';
    return '#e53935';
  };
  
  const color = getColor();
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: '8px'
    }}>
      <div style={{ position: 'relative', ...dimensions }}>
        <svg 
          width={dimensions.width} 
          height={dimensions.height} 
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r="45"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="8"
          />
          {/* Score circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.height / 2}
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Score text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: dimensions.fontSize,
          fontWeight: '700',
          color: color
        }}>
          {score}
        </div>
      </div>
      {showLabel && (
        <div style={{ textAlign: 'center' }}>
          <div className={`badge-${rating}`}>
            {ratingDisplay}
          </div>
        </div>
      )}
      
      {/* Show reasons if enabled */}
      {showReasons && reasons.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f5f7fb',
          borderRadius: '8px',
          maxWidth: '300px',
          width: '100%'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            {rating === 'excellent' || rating === 'good' ? 'Why it should fish well:' : 'Why it may be tough right now:'}
          </div>
          {reasons.map((reason, index) => (
            <div key={index} style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              marginBottom: '6px',
              lineHeight: '1.4',
              paddingLeft: '4px'
            }}>
              {reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreGauge;


