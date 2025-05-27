import React, { createContext, useContext, useReducer, useCallback } from 'react';

const NotificationContext = createContext();

const initialState = {
  notifications: []
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: []
      };
    
    default:
      return state;
  }
};

export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      duration: 5000, // Default 5 seconds
      ...notification
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    // Auto-remove notification after duration (unless persistent)
    if (!newNotification.persistent) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Convenience methods for different notification types
  const success = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      title: 'Succes',
      message,
      ...options
    });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      title: 'Fout',
      message,
      duration: 8000, // Errors stay longer
      ...options
    });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      title: 'Waarschuwing',
      message,
      duration: 6000,
      ...options
    });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      title: 'Informatie',
      message,
      ...options
    });
  }, [addNotification]);

  const processing = useCallback((message, options = {}) => {
    return addNotification({
      type: 'processing',
      title: 'Verwerking',
      message,
      persistent: true, // Processing notifications don't auto-dismiss
      ...options
    });
  }, [addNotification]);

  const dataQuality = useCallback((type, details = {}) => {
    const messages = {
      complete: {
        title: 'Volledige Data Verwerkt',
        message: 'Alle bestanden zijn succesvol verwerkt met echte AI-analyse.',
        type: 'success'
      },
      partial: {
        title: 'Gedeeltelijke Data Verwerking',
        message: 'Sommige bestanden konden niet volledig worden verwerkt. Resultaten zijn gebaseerd op beschikbare data.',
        type: 'warning'
      },
      mock: {
        title: 'Demo Modus Actief',
        message: 'Resultaten zijn gebaseerd op voorbeelddata voor demonstratiedoeleinden.',
        type: 'info'
      }
    };

    const notification = messages[type];
    if (notification) {
      return addNotification({
        ...notification,
        ...details
      });
    }
  }, [addNotification]);

  const value = {
    notifications: state.notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    processing,
    dataQuality
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
