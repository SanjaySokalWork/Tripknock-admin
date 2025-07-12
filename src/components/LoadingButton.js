import React from 'react';
import { CircularProgress } from '@mui/material';

const LoadingButton = ({ 
  children, 
  loading = false, 
  loadingText = 'Loading...', 
  disabled = false, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'medium',
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500 border border-secondary-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const spinnerSizes = {
    small: 14,
    medium: 16,
    large: 20
  };

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={finalClassName}
      {...props}
    >
      {loading && (
        <CircularProgress 
          size={spinnerSizes[size]} 
          color="inherit" 
          thickness={4}
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
};

export default LoadingButton;