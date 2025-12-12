import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon = null,
  className = ''
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const widthClass = fullWidth ? 'btn-full-width' : '';
  
  return (
    <button
      type={type}
      className={`${baseClass} ${variantClass} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={fullWidth ? { width: '100%' } : {}}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;







