import React, { createContext, useContext, useCallback, useState } from 'react';
import { Notification } from '../components/Notifications';

interface NotificationContextType {
  showNotification: (message: string, type: Notification['type'], duration?: number) => void;
  dismissNotification: (id: string) => void;
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: Notification['type'], duration = 3000) => {
    const id = Date.now().toString();
    const notification: Notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, dismissNotification, notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};