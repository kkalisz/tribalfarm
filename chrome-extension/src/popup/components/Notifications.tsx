import React from 'react';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onDismiss }) => {
  return (
    <div className="notifications-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type}`}
          onClick={() => onDismiss(notification.id)}
        >
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={() => onDismiss(notification.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};