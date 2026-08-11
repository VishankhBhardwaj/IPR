import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${isLoading ? 'loading' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle className="path" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        </svg>
      )}
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default Button;
