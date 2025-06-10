import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiSend, FiMessageSquare, FiUsers, FiUserPlus, FiUserCheck, FiClock } from 'react-icons/fi';
import api from '../api';
import '../assets/styles/ConnectionsPage.css';

const ConnectionsPage = () => {
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all users
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data.data);
        
        // Fetch user's connections and requests
        const connectionsResponse = await api.get('/my-contact-requests', {
          params: { type: 'received', status: 'accepted' }
        });
        setConnections(connectionsResponse.data.data);
        
        const pendingResponse = await api.get('/my-contact-requests', {
          params: { type: 'sent', status: 'pending' }
        });
        setPendingRequests(pendingResponse.data.data);
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Error loading connections');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sendConnectionRequest = async (receiverId) => {
    try {
      const response = await api.post('/contact-requests', {
        receiver_id: receiverId,
        initial_message: messageContent || 'I would like to connect with you'
      });
      
      setPendingRequests(prev => [...prev, response.data.data]);
      setMessageContent('');
      setSelectedUser(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending connection request');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading connections...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="connections-container">
      <div className="connections-header">
        <h1>Connect with Others</h1>
        <p>Build your professional network and find mentors</p>
      </div>

      <div className="connections-tabs">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <FiUser className="tab-icon" />
          Browse Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <FiUsers className="tab-icon" />
          My Connections ({connections.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FiClock className="tab-icon" />
          Pending Requests ({pendingRequests.length})
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="browse-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="users-grid">
            {filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      <FiUser />
                    </div>
                  )}
                </div>
                
                <div className="user-info">
                    <h3>{user.name}</h3>
                    {user.personality_type && (
                        <span className="personality-badge">
                        {user.personality_type.name} {/* Access the name property */}
                        </span>
                    )}
                    {user.bio && <p className="user-bio">{user.bio}</p>}
                    
                    <div className="user-stats">
                        <span>{user.recommended_major || 'Undecided major'}</span>
                    </div>
                </div>
                
                <div className="user-actions">
                  <button 
                    className="connect-btn"
                    onClick={() => setSelectedUser(user)}
                  >
                    <FiUserPlus /> Connect
                  </button>
                  <button 
                    className="message-btn"
                    onClick={() => navigate(`/student-dashboard/messages/${user.id}`)}
                  >
                    <FiMessageSquare /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="connections-list">
          {connections.length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <h3>No connections yet</h3>
              <p>Start connecting with other users to build your network</p>
            </div>
          ) : (
            connections.map(connection => (
              <div key={connection.id} className="connection-item">
                <div className="connection-user">
                  <div className="avatar">
                    {connection.sender.avatar ? (
                      <img src={connection.sender.avatar} alt={connection.sender.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        <FiUser />
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h4>{connection.sender.name}</h4>
                    <p>Connected since {new Date(connection.accepted_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="connection-actions">
                  <button 
                    className="message-btn"
                    onClick={() => navigate(`/messages/${connection.sender.id}`)}
                  >
                    <FiMessageSquare /> Message
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="pending-requests">
          {pendingRequests.length === 0 ? (
            <div className="empty-state">
              <FiClock className="empty-icon" />
              <h3>No pending requests</h3>
              <p>Your sent connection requests will appear here</p>
            </div>
          ) : (
            pendingRequests.map(request => (
              <div key={request.id} className="request-item">
                <div className="request-user">
                  <div className="avatar">
                    {request.receiver.avatar ? (
                      <img src={request.receiver.avatar} alt={request.receiver.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        <FiUser />
                      </div>
                    )}
                  </div>
                  <div className="user-details">
                    <h4>{request.receiver.name}</h4>
                    <p>Request sent on {new Date(request.created_at).toLocaleDateString()}</p>
                    <p className="request-message">{request.initial_message}</p>
                  </div>
                </div>
                <div className="request-status">
                  <span className="status-badge pending">Pending</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Connection Request Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="connection-modal">
            <h3>Connect with {selectedUser.name}</h3>
            <p>Add a personal message (optional):</p>
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Hi, I'd like to connect because..."
              rows={4}
            />
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </button>
              <button 
                className="send-btn"
                onClick={() => sendConnectionRequest(selectedUser.id)}
              >
                <FiSend /> Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;