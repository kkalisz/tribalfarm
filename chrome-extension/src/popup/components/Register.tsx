import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';

interface RegisterProps {
  onShowLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onShowLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { showNotification } = useNotifications();

  const validateForm = () => {
    if (!username || !email || !password) {
      showNotification('Please fill in all fields', 'warning');
      return false;
    }
    if (!email.includes('@')) {
      showNotification('Please enter a valid email address', 'warning');
      return false;
    }
    if (password.length < 6) {
      showNotification('Password must be at least 6 characters long', 'warning');
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // TODO: Implement actual registration logic
      console.log('Register attempt with:', { username, email, password });
      showNotification('Registration successful! Please log in.', 'success');
      onShowLogin(); // Redirect to login after successful registration
    } catch (err) {
      showNotification('Registration failed. Please try again.', 'error');
    }
  };

  return (
    <div className="auth-container visible">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="regUsername">Username</label>
          <input
            type="text"
            id="regUsername"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="regEmail">Email</label>
          <input
            type="email"
            id="regEmail"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="regPassword">Password</label>
          <input
            type="password"
            id="regPassword"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="button">Register</button>
        <p>Already have an account? <a href="#" onClick={onShowLogin}>Login</a></p>
      </form>
    </div>
  );
};
