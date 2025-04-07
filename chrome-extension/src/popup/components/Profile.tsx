import React from 'react';

interface ProfileProps {
  onLogout: () => void;
  username?: string;
  email?: string;
}

export const Profile: React.FC<ProfileProps> = ({ onLogout, username, email }) => {
  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <div id="profileInfo">
        {username && (
          <div className="form-group">
            <label>Username:</label>
            <div>{username}</div>
          </div>
        )}
        {email && (
          <div className="form-group">
            <label>Email:</label>
            <div>{email}</div>
          </div>
        )}
      </div>
      <button onClick={onLogout} className="button">Logout</button>
    </div>
  );
};