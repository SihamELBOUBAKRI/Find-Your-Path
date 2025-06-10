import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookmark, FiHeart, FiMapPin, FiCalendar, FiTrash2 } from 'react-icons/fi';
import api from '../api';
import '../assets/styles/SavedItemsPage.css';

const SavedItemsPage = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Changed to singular to match your backend data
  const [activeTab, setActiveTab] = useState('institution');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        setLoading(true);
        const response = await api.get('/saved-items');
        
        setSavedItems(response.data.data);
      } catch (err) {
        console.error('Error fetching saved items:', err);
        setError(err.response?.data?.message || 'Error fetching saved items');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  const removeSavedItem = async (itemId) => {
    try {
      await api.delete(`/saved-items/${itemId}`);
      setSavedItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing item');
    }
  };

  // Updated to match singular 'institution' type
  const filteredItems = savedItems.filter(item => item.type === activeTab);

  if (loading) return <div className="loading">Loading your saved items...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="saved-items-container">
      <div className="saved-items-header">
        <h1>Your Saved Items</h1>
        <p>All your bookmarked institutions and events in one place</p>
      </div>

      <div className="saved-items-tabs">
        <button
          className={`tab-btn ${activeTab === 'institution' ? 'active' : ''}`}
          onClick={() => setActiveTab('institution')}
        >
          <FiBookmark className="tab-icon" />
          {/* Updated to singular */}
          Institutions ({savedItems.filter(i => i.type === 'institution').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'event' ? 'active' : ''}`}
          onClick={() => setActiveTab('event')}
        >
          <FiCalendar className="tab-icon" />
          Events ({savedItems.filter(i => i.type === 'event').length})
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="no-items">
          <FiBookmark className="no-items-icon" />
          <h3>No saved {activeTab === 'institution' ? 'institutions' : 'events'} found</h3>
          <p>Start saving items to see them appear here</p>
        </div>
      ) : (
        <div className="saved-items-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="saved-item-card">
              {item.type === 'institution' ? (
                <>
                  <div className="item-header">
                    <h3 onClick={() => navigate(`/institutions/${item.institution.id}`)}>
                      {item.institution.name}
                    </h3>
                    <button 
                      className="remove-btn"
                      onClick={() => removeSavedItem(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  
                  <div className="item-meta">
                    <div className="meta-item">
                      <FiMapPin className="meta-icon" />
                      <span>{item.institution.city}, {item.institution.country}</span>
                    </div>
                    <span className="type-badge">
                      {item.institution.type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="item-description">
                    {item.institution.description.length > 120 
                      ? `${item.institution.description.substring(0, 120)}...` 
                      : item.institution.description}
                  </p>
                </>
              ) : (
                <>
                  <div className="item-header">
                    <h3 onClick={() => navigate(`/events/${item.event.id}`)}>
                      {item.event.title}
                    </h3>
                    <button 
                      className="remove-btn"
                      onClick={() => removeSavedItem(item.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                  
                  <div className="item-meta">
                    <div className="meta-item">
                      <FiCalendar className="meta-icon" />
                      <span>
                        {new Date(item.event.start_date).toLocaleDateString()} - 
                        {new Date(item.event.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="type-badge">
                      {item.event.event_type}
                    </span>
                  </div>
                  
                  <p className="item-description">
                    {item.event.description.length > 120 
                      ? `${item.event.description.substring(0, 120)}...` 
                      : item.event.description}
                  </p>
                </>
              )}
              
              <div className="item-footer">
                <span className="saved-date">
                  Saved on {new Date(item.created_at).toLocaleDateString()}
                </span>
                <button 
                  className="view-btn"
                  onClick={() => navigate(
                    item.type === 'institution' 
                      ? `/institutions/${item.institution.id}`
                      : `/events/${item.event.id}`
                  )}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItemsPage;