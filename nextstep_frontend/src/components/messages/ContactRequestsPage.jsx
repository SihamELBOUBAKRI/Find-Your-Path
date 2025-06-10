import React, { useState, useEffect } from 'react';
import api from '../../api';
import '../../assets/styles/ContactRequestsPage.css';
import PageLoading from '../../pages/loading/loading';
import { ErrorAlert } from '../../pages/alerts';

const ContactRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [filters, setFilters] = useState({
    type: 'received', // Default to received requests
    status: 'pending', // Default to pending status
    search: ''
  });

  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      setShowError(false);
      
      // Use the my-contact-requests endpoint with query parameters
      const response = await api.get('/my-contact-requests', {
        params: filters
      });
      setRequests(response.data.data.data);
      
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchContactRequests();
  }, [filters]); // Refetch when filters change

  if (loading) return <PageLoading text="Loading contact requests..." />;

  return (
    <div className="contact-requests-container">
      <h2>Contact Requests</h2>
      
      {/* Filter Controls */}
      <div className="request-filters">
        <div className="filter-group">
          <label>Request Type:</label>
          <select 
            name="type" 
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="received">Received</option>
            <option value="sent">Sent</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            name="status" 
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            name="search"
            placeholder="Search messages..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
      </div>
      
      {showError && (
        <ErrorAlert 
          message={error} 
          onClose={() => setShowError(false)} 
        />
      )}
      
      {requests.length === 0 ? (
        <p className="no-requests">No contact requests match your criteria</p>
      ) : (
        <div className="requests-list">
          {requests.map(request => {
            const sender = request.sender || {};
            const receiver = request.receiver || {};
            const isReceived = request.receiver_id === request.currentUserId;
            const otherUser = isReceived ? sender : receiver;
            
            return (
              <div key={request.id} className="request-item">
                <div className="request-info">
                  <div className="user-avatar">
                    {otherUser.avatar ? (
                      <img src={otherUser.avatar} alt={otherUser.name || 'User'} />
                    ) : (
                      <div className="avatar-placeholder">
                        {(otherUser.name || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="request-details">
                    <h4>{otherUser.name || 'Unknown User'}</h4>
                    <p className="request-message">
                      {request.initial_message || 'No message provided'}
                    </p>
                    <p className="request-date">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                    <p className="request-status">
                      Status: <span className={`status-${request.status}`}>{request.status}</span>
                    </p>
                  </div>
                </div>
                
                {request.status === 'pending' && isReceived && (
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactRequestsPage;