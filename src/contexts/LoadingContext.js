'use client';

import React, { createContext, useContext, useState } from 'react';
import { Backdrop, CircularProgress, Typography } from '@mui/material';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const setLoading = (key, isLoading, message = '') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
    
    if (isLoading && message) {
      setLoadingMessage(message);
    }
  };

  const isLoading = (key) => {
    return loadingStates[key] || false;
  };

  const showGlobalLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setGlobalLoading(true);
  };

  const hideGlobalLoading = () => {
    setGlobalLoading(false);
    setLoadingMessage('');
  };

  const hasAnyLoading = () => {
    return globalLoading || Object.values(loadingStates).some(loading => loading);
  };

  return (
    <LoadingContext.Provider 
      value={{ 
        setLoading, 
        isLoading, 
        showGlobalLoading, 
        hideGlobalLoading, 
        hasAnyLoading,
        globalLoading 
      }}
    >
      {children}
      
      {/* Global Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          flexDirection: 'column',
          gap: 2
        }}
        open={globalLoading}
      >
        <CircularProgress color="inherit" size={60} />
        {loadingMessage && (
          <Typography variant="h6" component="div">
            {loadingMessage}
          </Typography>
        )}
      </Backdrop>
    </LoadingContext.Provider>
  );
}; 