import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/dashboard.css';
import api from '../api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try to get user data using the token
        const response = await api.get('/me');
        setUser(response.data.user);
      } catch (error) {
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.name || 'User'}!</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </header>
      
      <main className="dashboard-content">
        <section className="user-profile">
          {user?.avatar && (
            <img src={user.avatar} alt="Profile" className="profile-avatar" />
          )}
          <h2>Your Profile</h2>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
          {user?.bio && <p>Bio: {user.bio}</p>}
        </section>
        
        {/* Add more dashboard sections as needed */}
      </main>
    </div>
  );
};

export default Dashboard;