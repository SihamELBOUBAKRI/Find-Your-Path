import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../assets/styles/MessagesPage.css';
import api from '../api';
import PageLoading from '../pages/loading/loading';
import { FiSettings, FiUser, FiUserX, FiMail } from 'react-icons/fi';
import ConfirmForm from '../pages/alerts/ConfirmForm';

const MessagesPage = () => {
  const { userId, contactRequestId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState({
    conversations: true,
    messages: true
  });
  const [error, setError] = useState(null);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const messagesEndRef = useRef(null);
  const settingsRef = useRef(null);
  const headerSettingsRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    try {
      setLoading(prev => ({ ...prev, conversations: true }));
      const response = await api.get('/messages/conversations');
      setConversations(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching conversations');
      setConversations([]);
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }));
    }
  };

  // Fetch messages for a specific conversation
  const fetchMessages = async (targetUserId) => {
    if (!targetUserId) return;
    
    try {
      setLoading(prev => ({ ...prev, messages: true }));
      setError(null);
      
      const params = {};
      if (contactRequestId) params.contact_request_id = contactRequestId;
      
      const response = await api.get(`/messages/${targetUserId}`, { params });
      setMessages(response.data.data.data || []);
      setOtherUser({
        id: response.data.meta.other_user_id,
        name: response.data.meta.other_user_name
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching messages');
    } finally {
      setLoading(prev => ({ ...prev, messages: false }));
    }
  };

  // Fetch blocked users
  const fetchBlockedUsers = async () => {
    try {
      const response = await api.get('/blocked-users');
      setBlockedUsers(response.data.data.data || []);
    } catch (err) {
      console.error('Error fetching blocked users:', err);
    }
  };

  // Block a user
  const blockUser = async (userId) => {
    try {
      await api.post('/blocked-users', { user_id: userId });
      fetchBlockedUsers();
      setShowSettingsDropdown(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error blocking user');
    }
  };

  // Unblock a user
  const unblockUser = async (userId) => {
    try {
      await api.delete(`/blocked-users/${userId}`);
      fetchBlockedUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error unblocking user');
    }
  };

  // Check if current conversation user is blocked
  const isUserBlocked = () => {
    return blockedUsers.some(user => user.id === parseInt(userId));
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId) => {
    navigate(`/student-dashboard/messages/${conversationId}`, {
      state: { contactRequestId }
    });
  };

  const resendMessage = async (messageId) => {
    try {
      const response = await api.post(`/messages/${messageId}/resend`);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? response.data.data : msg
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Error resending message');
    }
  };

  // Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;
    
    try {
      const payload = {
        receiver_id: userId,
        content: newMessage,
        contact_request_id: contactRequestId || null
      };
      
      const response = await api.post('/messages', payload);
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      scrollToBottom();
      fetchConversations();
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending message');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
      if (headerSettingsRef.current && !headerSettingsRef.current.contains(event.target)) {
        setShowHeaderSettings(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load initial data
  useEffect(() => {
    fetchConversations();
    fetchBlockedUsers();
  }, []);

  // Fetch messages when userId changes
  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    } else {
      setMessages([]);
      setOtherUser(null);
    }
  }, [userId, contactRequestId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-container">
      {/* Conversation List Sidebar */}
      <div className="conversation-sidebar">
        <div className="conversation-header">
          <h3>Messages</h3>
          <div className="header-settings-container" ref={headerSettingsRef}>
            <button 
              className="header-settings-button"
              onClick={() => setShowHeaderSettings(!showHeaderSettings)}
            >
              <FiSettings />
            </button>
            
            {showHeaderSettings && (
              <div className="header-settings-dropdown">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/student-dashboard/blocked-users');
                    setShowHeaderSettings(false);
                  }}
                >
                  <FiUserX /> Blocked Users
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    navigate('/student-dashboard/contact-requests');
                    setShowHeaderSettings(false);
                  }}
                >
                  <FiMail /> Contact Requests
                </button>
              </div>
            )}
          </div>
        </div>
        
        {loading.conversations ? (
          <div className="loading-conversations">
            <PageLoading text="Loading conversations..." />
          </div>
        ) : (
          <div className="conversation-list">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`conversation-item ${userId == conversation.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="conversation-avatar">
                  {conversation.avatar ? (
                    <img src={conversation.avatar} alt={conversation.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {conversation.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">{conversation.name}</div>
                  <div className="conversation-preview">
                    {conversation.last_message?.content || 'No messages yet'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message View Area */}
      <div className="message-view">
        {!userId ? (
          <div className="select-conversation">
            <div className="select-message">
              <h3>Select a conversation</h3>
              <p>Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        ) : loading.messages ? (
          <PageLoading text="Loading messages..." />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="messages-header">
              <h2>Conversation with {otherUser?.name}</h2>
              
              <div className="message-header-actions">
                {contactRequestId && (
                  <div className="contact-request-badge">Contact Request</div>
                )}
                
                <div className="message-settings" ref={settingsRef}>
                  <button 
                    className="settings-button"
                    onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                  >
                    <FiSettings />
                  </button>
                  
                  {showSettingsDropdown && (
                    <div className="settings-dropdown">
                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          navigate(`/student-dashboard/profile/${userId}`);
                          setShowSettingsDropdown(false);
                        }}
                      >
                        <FiUser /> View Profile
                      </button>
                      
                      {isUserBlocked() ? (
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            unblockUser(userId);
                            setShowSettingsDropdown(false);
                          }}
                        >
                          <FiUserX /> Unblock User
                        </button>
                      ) : (
                        <button 
                          className="dropdown-item"
                          onClick={() => setShowBlockConfirm(true)}
                        >
                          <FiUserX /> Block User
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showBlockConfirm && (
              <ConfirmForm
                title="Block User"
                message={`Are you sure you want to block ${otherUser?.name}? You won't be able to message them.`}
                onConfirm={() => {
                  blockUser(userId);
                  setShowBlockConfirm(false);
                }}
                onCancel={() => setShowBlockConfirm(false)}
                confirmText="Block"
                cancelText="Cancel"
              />
            )}

            <div className="messages-list-container">
              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.sender_id === otherUser?.id ? 'received' : 'sent'}`}
                    >
                      {message.is_resend ? (
                        <div className="resend-notice">
                          {message.content}
                          <span className="resend-time">
                            (Resent at {new Date(message.updated_at).toLocaleTimeString()})
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="message-content">{message.content}</div>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                            {message.sender_id !== otherUser?.id && !message.is_read && (
                              <span className="unread-indicator">Unread</span>
                            )}
                            {message.sender_id !== otherUser?.id && !message.is_read && (
                              <button
                                className="resend-button"
                                onClick={() => resendMessage(message.id)}
                              >
                                Resend
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
                {isUserBlocked() && (
                  <div className="blocked-notice">
                    <FiUserX /> You have blocked this user. You can't send messages to them.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {!isUserBlocked() && (
              <div className="message-input-area">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()}>
                  Send
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;