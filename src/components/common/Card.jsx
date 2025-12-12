import React from 'react';

const Card = ({ 
  children, 
  title = null, 
  subtitle = null,
  actions = null,
  onClick = null,
  className = '',
  style = {}
}) => {
  const cardClass = onClick ? 'card card-clickable' : 'card';
  
  return (
    <div 
      className={`${cardClass} ${className}`}
      onClick={onClick}
      style={{
        ...style,
        ...(onClick ? { cursor: 'pointer', transition: 'transform 0.2s' } : {})
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'translateY(-2px)')}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {(title || actions) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: subtitle || children ? '12px' : 0
        }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;







