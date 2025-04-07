import React, { useState } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { Notifications } from './components/Notifications';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import './styles/notifications.css';
import {OverlayManager} from "../content/overlayManager";

type View = 'login' | 'register' | 'profile';

interface User {
  username: string;
  email: string;
}

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('login');
  const [user, setUser] = useState<User | null>(null);
  const { notifications, dismissNotification } = useNotifications();

  const handleShowRegister = () => {
    OverlayManager.getInstance().showOverlay("1", {
      duration: 0, message: "", targetElement: undefined, title: "elo"

    })
    setCurrentView('register');
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  return (
    <>
      <Notifications
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      {user ? (
        <Profile
          username={user.username}
          email={user.email}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {currentView === 'login' && (
            <Login onShowRegister={handleShowRegister} />
          )}
          {currentView === 'register' && (
            <Register onShowLogin={handleShowLogin} />
          )}
        </>
      )}
    </>
  );
};

export const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
};
