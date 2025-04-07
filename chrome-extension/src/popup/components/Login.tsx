import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

interface LoginProps {
  onShowRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onShowRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { showNotification } = useNotifications();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showNotification('Please fill in all fields', 'warning');
      return;
    }
    try {
      // TODO: Implement actual login logic
      console.log('Login attempt with:', { username, password });
      showNotification('Login successful!', 'success');
    } catch (err) {
      showNotification('Login failed. Please try again.', 'error');
    }
  };

  return (
    <div className="auth-container visible">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="button">Login</button>
        <p>Don't have an account? <a href="#" onClick={onShowRegister}>Register</a></p>
      </form>
    </div>
  );
};
