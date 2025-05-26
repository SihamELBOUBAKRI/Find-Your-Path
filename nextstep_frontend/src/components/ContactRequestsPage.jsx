import React, { useState, useEffect } from 'react';
import api from '../api';
import '../assets/styles/ContactRequestsPage.css';
import PageLoading from '../pages/loading/loading';
import { ErrorAlert } from '../pages/alerts';

const ContactRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from localStorage or API
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Option 1: Get from localStorage if you store it there
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setCurrentUserId(user.id);
        } else {
          // Option 2: Fetch current user from API
          const response = await api.get('/me');
          setCurrentUserId(response.data.id);
        }
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchContactRequests = async () => {
    if (!currentUserId) return;
    
    try {
      setLoading(true);
      setShowError(false);
      const response = await api.get('/contact-requests');
      
      // Filter requests where receiver_id matches current user's ID
      const filteredRequests = response.data.data.filter(
        request => request.receiver_id === currentUserId
      );
      
      setRequests(filteredRequests);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error fetching contact requests';
      setError(errorMessage);
      setShowError(true);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      setLoading(true);
      await api.post(`/contact-requests/${requestId}/respond`, { status });
      fetchContactRequests(); // Refresh the list after responding
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error responding to request';
      setError(errorMessage);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchContactRequests();
    }
  }, [currentUserId]);

  if (!currentUserId || loading) return <PageLoading text="Loading contact requests..." />;

  return (
    <div className="contact-requests-container">
      <h2>Contact Requests</h2>
      
      {showError && (
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(false)} 
        />
      )}
      
      {requests.length === 0 ? (
        <p className="no-requests">You have no pending contact requests</p>
      ) : (
        <div className="requests-list">
          {requests.map(request => {
            const sender = request.sender || {};
            return (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <div className="user-avatar">
                    {sender.avatar ? (
                      <img src={sender.avatar} alt={sender.name || 'User'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(sender.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="request-details">
                    <h4>{sender.name || 'Unknown User'}</h4>
                    <p className="request-message">
                      {request.initial_message || 'No message provided'}
                    </p>
                    <p className="request-date">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="request-actions">
                  <button 
                    className="accept-button"
                    onClick={() => respondToRequest(request.id, 'accepted')}
                    disabled={loading}
                  >
                    Accept
                  </button>
                  <button 
                    className="decline-button"
                    onClick={() => respondToRequest(request.id, 'rejected')}
                    disabled={loading}
                  >
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactRequestsPage;