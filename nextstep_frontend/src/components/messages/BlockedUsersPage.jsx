import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../assets/styles/BlockedUsersPage.css';

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        const response = await api.get('/blocked-users');
        setBlockedUsers(response.data.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching blocked users');
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const unblockUser = async (userId) => {
    try {
      await api.delete(`/blocked-users/${userId}`);
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error unblocking user');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="blocked-users-container">
      <h2>Blocked Users</h2>
      
      {blockedUsers.length === 0 ? (
        <p>You haven't blocked any users</p>
      ) : (
        <ul className="blocked-users-list">
          {blockedUsers.map(user => (
            <li key={user.id} className="blocked-user-item">
              <div className="user-info">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar" />
                ) : (
                  <div className="avatar-placeholder">{user.name.charAt(0)}</div>
                )}
                <div>
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
              </div>
              <button 
                className="unblock-button"
                onClick={() => unblockUser(user.id)}
              >
                Unblock
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BlockedUsersPage;