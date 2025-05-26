import React, { useEffect, useState } from 'react';
import api from '../api';
import '../assets/styles/visitordashboard.css';
import { useNavigate } from 'react-router-dom';
import PageLoading from './loading/loading'; // Import your loading component
import logoGif from '../assets/images/logo.gif';

const VisitorDashboard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect based on user role
      switch(response.data.user.role) {
        case 'mentor':
          navigate('/mentor-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        case 'student':
        default:
          navigate('/student-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  const queryParams = new URLSearchParams(window.location.search);
  if (queryParams.get('reset_success') === 'true') {
    // Show success message
    alert('Password reset successful! Please login with your new password');
    
    // Optional: Clear the query param
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

  if (loading) {
    return <PageLoading text="Authenticating..." />;
  }

  return (
    <div className="minimal-dashboard">
      <div className="platform-logo-cont">
        <img src={logoGif} alt="Next Sep Logo" className="platform-logo" />
        <div className="platform-title-cont">
          <h1 className="platform-title">Next Sep</h1>
          <span className="platform-tagline">Student Guidance Platform</span>
        </div>
      </div>

      <div className="platform-text">
        Next Step - We guide you today, so you can lead tomorrow
      </div>


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
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="signup-link">
          Don't have an account? <a href="/signup">Sign up here</a>
        </div>
        <div className="forgot-password-link">
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;