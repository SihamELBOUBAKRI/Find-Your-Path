import React, { useState } from 'react';
import api from '../../api';
import './forgot_reset_password.css';
import { useNavigate } from 'react-router-dom';
import PageLoading from '../../pages/loading/loading'; // Import the loading component

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading text="Sending reset link..." />;
  }

  return (
    <div className="forgot-password-container">
      <h2>Reset Password</h2>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group-p">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button className='pasbutton' type="submit" disabled={loading}>
          Send Reset Link
        </button>
      </form>
      
      <div className="back-to-login">
        <a href="/login">Back to Login</a>
      </div>
    </div>
  );
};

export default ForgotPassword;