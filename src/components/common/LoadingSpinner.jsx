import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = null }) => {
  const sizeClasses = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' }
  };

  const style = sizeClasses[size] || sizeClasses.medium;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div className="loading-spinner" style={style}></div>
      {text && <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;







