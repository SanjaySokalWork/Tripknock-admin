'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const Toast = ({ notification, onRemove }) => {
  useEffect(() => {
    if (notification.autoHide) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10B981',
          color: 'white',
          borderLeftColor: '#059669'
        };
      case 'error':
        return {
          backgroundColor: '#EF4444',
          color: 'white',
          borderLeftColor: '#DC2626'
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          color: 'white',
          borderLeftColor: '#D97706'
        };
      case 'info':
        return {
          backgroundColor: '#3B82F6',
          color: 'white',
          borderLeftColor: '#2563EB'
        };
      default:
        return {
          backgroundColor: '#6B7280',
          color: 'white',
          borderLeftColor: '#4B5563'
        };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  return (
    <div 
      className="flex items-center justify-between p-4 mb-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] border-l-4 transform transition-all duration-300"
      style={{
        animation: 'slideIn 0.3s ease-out',
        ...getTypeStyles(notification.type)
      }}
    >
      <div className="flex items-center">
        <span className="text-xl mr-3 font-bold">
          {getIcon(notification.type)}
        </span>
        <span className="text-sm font-medium">
          {notification.message}
        </span>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="ml-4 text-white hover:text-gray-200 font-bold text-lg"
      >
        ×
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success', autoHide = true, duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type,
      autoHide,
      duration
    };
    
    setNotifications(prev => [...prev, notification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const showSuccess = useCallback((message, autoHide = false) => {
    return addNotification(message, 'success', autoHide, 5000);
  }, [addNotification]);
  
  const showError = useCallback((message, autoHide = false) => {
    return addNotification(message, 'error', autoHide, 7000);
  }, [addNotification]);
  
  const showWarning = useCallback((message, autoHide = false) => {
    return addNotification(message, 'warning', autoHide, 6000);
  }, [addNotification]);
  
  const showInfo = useCallback((message, autoHide = false) => {
    return addNotification(message, 'info', autoHide, 4000);
  }, [addNotification]);

  // Test function for debugging
  const testNotification = useCallback(() => {
    showSuccess('Test notification is working!');
  }, [showSuccess]);

  const contextValue = useCallback(() => ({
    addNotification, 
    removeNotification, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    testNotification
  }), [addNotification, removeNotification, showSuccess, showError, showWarning, showInfo, testNotification]);

  return (
    <NotificationContext.Provider value={contextValue()}>
      {children}
      
      {/* Toast Container - Fixed position with high z-index */}
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          pointerEvents: 'none'
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      </div>

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}; 