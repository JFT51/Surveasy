import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Loader, 
  X,
  Database,
  Zap,
  Shield
} from 'lucide-react';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useNotifications();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-danger-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary-600" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-primary-600 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      case 'processing':
        return 'bg-primary-50 border-primary-200 text-primary-800';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-800';
    }
  };

  const getProgressBar = (notification) => {
    if (notification.type !== 'processing' || !notification.progress) return null;
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>{notification.progressText || 'Verwerking...'}</span>
          <span>{notification.progress}%</span>
        </div>
        <div className="w-full bg-primary-200 rounded-full h-1.5">
          <div 
            className="bg-primary-600 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${notification.progress}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const getDataQualityBadge = (notification) => {
    if (!notification.dataQuality) return null;

    const badges = {
      complete: { icon: Shield, text: 'Volledige Data', color: 'success' },
      partial: { icon: Database, text: 'Gedeeltelijke Data', color: 'warning' },
    };

    const badge = badges[notification.dataQuality];
    if (!badge) return null;

    const Icon = badge.icon;
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 bg-${badge.color}-100 text-${badge.color}-700`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </div>
    );
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            ${getNotificationStyles(notification.type)}
            border rounded-xl p-4 shadow-large backdrop-blur-sm
            animate-slide-in-right transform transition-all duration-300 ease-out
            hover:shadow-glow-lg
          `}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">
                    {notification.title}
                  </h4>
                  <p className="text-sm mt-1 opacity-90">
                    {notification.message}
                  </p>
                  
                  {getProgressBar(notification)}
                  {getDataQualityBadge(notification)}
                  
                  {notification.actions && (
                    <div className="mt-3 flex space-x-2">
                      {notification.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={action.onClick}
                          className="text-xs font-medium underline hover:no-underline transition-all"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {!notification.persistent && (
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Auto-dismiss progress bar */}
          {!notification.persistent && notification.duration && (
            <div className="mt-3 w-full bg-black bg-opacity-10 rounded-full h-0.5 overflow-hidden">
              <div 
                className="h-full bg-current opacity-60 rounded-full animate-pulse"
                style={{
                  animation: `shrink ${notification.duration}ms linear forwards`
                }}
              ></div>
            </div>
          )}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default NotificationSystem;
