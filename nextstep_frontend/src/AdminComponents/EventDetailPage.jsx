import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiClock, FiDollarSign, FiArrowLeft, FiUsers } from 'react-icons/fi';
import api from '../api';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import PageLoading from '../pages/loading/loading';
import '../assets/styles/InstitutionDetail.css';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventRes = await api.get(`/events/${id}`);
        setEvent(eventRes.data.data);
        
        // Check if user is registered
        if (api.defaults.auth?.userId) {
          const registrationRes = await api.get(`/events/${id}/register/${api.defaults.auth.userId}`);
          setIsRegistered(registrationRes.data.data.is_registered);
        }
        
        // Fetch user role
        const userRes = await api.get('/me');
        setUserRole(userRes.data.role);
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load event data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const getMapUrl = () => {
    if (!event) return '';
    if (event.latitude && event.longitude) {
      return `https://maps.google.com/maps?q=${event.latitude},${event.longitude}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(event.address)}&output=embed`;
  };

  const handleRegister = async () => {
    try {
      await api.post(`/events/${id}/register`, {
        user_id: api.defaults.auth?.userId
      });
      setIsRegistered(true);
      setEvent(prev => ({
        ...prev,
        registered_users_count: prev.registered_users_count + 1
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering for event');
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await api.delete(`/events/${id}/register`, {
        data: { user_id: api.defaults.auth?.userId }
      });
      setIsRegistered(false);
      setEvent(prev => ({
        ...prev,
        registered_users_count: prev.registered_users_count - 1
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Error canceling registration');
    }
  };

  if (loading) return <PageLoading />;
  if (error) return <ErrorAlert message={error} onClose={() => navigate('/events')} />;

  return (
    <div className="event-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back to Events
      </button>

      {event && (
        <>
          <div className="detail-header">
            <h1 className="detail-title">{event.title}</h1>
            <div className="detail-subtitle">
              {event.institution && (
                <span className="institution-name">
                  Hosted by {event.institution.name}
                </span>
              )}
            </div>
          </div>

          <div className="detail-media">
            <div className="detail-image">
              <img 
                src={event.image_url || `https://source.unsplash.com/random/800x400/?event,${event.id}`} 
                alt={event.title} 
              />
            </div>
            <div className="detail-map">
              <iframe
                title="Event Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={getMapUrl()}
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="detail-description">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <h3><FiCalendar /> Date & Time</h3>
              <p>
                {new Date(event.start_date).toLocaleString()} - <br />
                {new Date(event.end_date).toLocaleString()}
              </p>
            </div>
            
            <div className="detail-card">
              <h3><FiMapPin /> Location</h3>
              <p>{event.address || 'Not specified'}</p>
            </div>
            
            <div className="detail-card">
              <h3><FiUsers /> Attendance</h3>
              <p>{event.registered_users_count} registered</p>
            </div>
            
            <div className="detail-card">
              <h3><FiDollarSign /> Cost</h3>
              <p>{event.is_free ? 'Free' : 'Paid event'}</p>
            </div>
            
            {event.website && (
              <div className="detail-card">
                <h3>Website</h3>
                <p>
                  <a href={event.website} target="_blank" rel="noopener noreferrer">
                    {event.website}
                  </a>
                </p>
              </div>
            )}
          </div>

          <div className="event-actions">
            {isRegistered ? (
              <button 
                className="cancel-btn"
                onClick={handleCancelRegistration}
              >
                Cancel Registration
              </button>
            ) : (
              <button 
                className="register-btn"
                onClick={handleRegister}
              >
                Register for Event
              </button>
            )}

            {userRole === 'mentor' && (
              <button 
                className="edit-btn"
                onClick={() => navigate(`/events/${event.id}/edit`)}
              >
                Edit Event
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EventDetailPage;