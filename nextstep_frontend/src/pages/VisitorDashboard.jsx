import React, { useState } from 'react';
import api from '../api';
import '../assets/styles/dashboard.css';
import { useNavigate } from 'react-router-dom';

const VisitorDashboard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard'); // Redirect to main dashboard after login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="minimal-dashboard">
      {/* Logo in top left */}
      <div className="dashboard-logo">
        <img src="/logo.png" alt="Company Logo" />
      </div>

      {/* Login Card in bottom right */}
      <div className="login-card">
        <h2>Welcome Back</h2>
        {error && <div className="login-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>
        <div className="signup-link">
          Don't have an account? <a href="/signup">Sign up here</a>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;