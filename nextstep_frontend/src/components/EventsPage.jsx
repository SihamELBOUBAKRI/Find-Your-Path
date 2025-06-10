import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiDollarSign, FiSearch, FiPlus, FiHeart } from 'react-icons/fi';
import api from '../api';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import SuccessAlert from '../pages/alerts/SuccessAlert';
import ConfirmForm from '../pages/alerts/ConfirmForm';
import PageLoading from '../pages/loading/loading';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    institution_id: '',
    upcoming: false,
    free: false,
    sort_by: 'start_date',
    sort_dir: 'asc'
  });
  const [institutions, setInstitutions] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [savedEvents, setSavedEvents] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [currentEventId, setCurrentEventId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [userResponse, eventsResponse, institutionsResponse, savedResponse] = await Promise.all([
          api.get('/me').catch(() => ({ data: {} })),
          api.get('/events', { params: { ...filters, per_page: 12, page: 1 } }),
          api.get('/institutions'),
          api.get('/saved-items/events').catch(() => ({ data: [] }))
        ]);

        setUserRole(userResponse.data.user.role);
        setCurrentUserId(userResponse.data.user.id);
        
        const eventsData = eventsResponse.data.data?.data || eventsResponse.data.data || [];
        setEvents(eventsData);
        
        setInstitutions(institutionsResponse.data.data || []);
        setSavedEvents(savedResponse.data.data?.map(item => item.id) || []);
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleSavedEvent = async (eventId, e) => {
    e.stopPropagation();
    try {
      if (savedEvents.includes(eventId)) {
        await api.delete(`/saved-items/events/${eventId}`);
        setSavedEvents(prev => prev.filter(id => id !== eventId));
        setSuccess('Event removed from saved items');
      } else {
        // Updated to match your API requirements
        await api.post('/saved-items', { 
          type: 'event',
          event_id: eventId 
        });
        setSavedEvents(prev => [...prev, eventId]);
        setSuccess('Event added to saved items');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Error updating saved events');
    }
  };

  const handleRegisterClick = (eventId, e) => {
    e.stopPropagation();
    setCurrentEventId(eventId);
    setCurrentAction('register');
    setShowConfirm(true);
  };

  const handleCancelClick = (eventId, e) => {
    e.stopPropagation();
    setCurrentEventId(eventId);
    setCurrentAction('cancel');
    setShowConfirm(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (currentAction === 'register') {
        await handleRegister(currentEventId);
      } else {
        await handleCancelRegistration(currentEventId);
      }
      setSuccess(`Successfully ${currentAction === 'register' ? 'registered for' : 'canceled registration for'} the event!`);
    } catch (err) {
      setError(err.response?.data?.message || `Error ${currentAction === 'register' ? 'registering for' : 'canceling registration for'} event`);
    } finally {
      setShowConfirm(false);
    }
  };

  const handleRegister = async (eventId) => {
    const response = await api.post(`/events/${eventId}/register`, {
      user_id: currentUserId,
      status: 'registered'
    });

    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            is_registered: true,
            registered_users_count: (event.registered_users_count || 0) + 1,
            registered_users: response.data.data?.registered_users || []
          }
        : event
    ));
  };

  const handleCancelRegistration = async (eventId) => {
    // Updated to match your new route structure
    const response = await api.delete(`/events/${eventId}/users/${currentUserId}`);
    
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            is_registered: false,
            registered_users_count: Math.max(0, (event.registered_users_count || 1) - 1),
            registered_users: event.registered_users?.filter(user => user.id !== currentUserId) || []
          }
        : event
    ));
  };

  const getEventImage = (event) => {
    return event.image_url || `https://source.unsplash.com/random/300x200/?event,${event.id}`;
  };

  if (loading && events.length === 0) return <PageLoading text="Loading events..." />;

  return (
     <div className="events-page">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {showConfirm && (
        <ConfirmForm
          title={`Confirm ${currentAction === 'register' ? 'Registration' : 'Cancellation'}`}
          message={`Are you sure you want to ${currentAction === 'register' ? 'register for' : 'cancel your registration for'} this event?`}
          onConfirm={handleConfirmAction}
          onCancel={() => setShowConfirm(false)}
          confirmText={currentAction === 'register' ? 'Register' : 'Cancel Registration'}
        />
      )}

     <div className="filters-container">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            name="search"
            placeholder="Search events..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="filter-group">
          <select 
            name="institution_id" 
            value={filters.institution_id} 
            onChange={handleFilterChange}
          >
            <option value="">All Institutions</option>
            {institutions.map(institution => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              name="upcoming"
              checked={filters.upcoming}
              onChange={handleFilterChange}
            />
            Upcoming Only
          </label>
        </div>
        
        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              name="free"
              checked={filters.free}
              onChange={handleFilterChange}
            />
            Free Events
          </label>
        </div>
        
        <div className="filter-group">
          <select 
            name="sort_by" 
            value={filters.sort_by} 
            onChange={handleFilterChange}
          >
            <option value="start_date">Date</option>
            <option value="title">Title</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select 
            name="sort_dir" 
            value={filters.sort_dir} 
            onChange={handleFilterChange}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        {userRole === 'mentor' && (
          <button 
            className="create-event-btn"
            onClick={() => navigate('/events/create')}
          >
            <FiPlus /> Create Event
          </button>
        )}
      </div>


      <div className="institutions-grid">
        {events.length === 0 ? (
          <div className="no-events">
            No events found matching your criteria
          </div>
        ) : (
          events.map(event => (
            <div 
              key={event.id}
              className="event-card"
              onClick={() => navigate(`${event.id}`)}
            >
              <div className="card-image">
                <img 
                  src={getEventImage(event)} 
                  alt={event.title} 
                />
                <button 
                  className={`save-btn ${savedEvents.includes(event.id) ? 'active' : ''}`}
                  onClick={(e) => toggleSavedEvent(event.id, e)}
                >
                  <FiHeart className={savedEvents.includes(event.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                </button>
              </div>
              <div className="card-body">
                <h3>{event.title}</h3>
                <div className="event-meta">
                  <div className="meta-item">
                    <FiCalendar className="meta-icon" />
                    <span>
                      {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <FiMapPin className="meta-icon" />
                    <span>{event.address}</span>
                  </div>
                  
                  {event.institution && (
                    <div className="meta-item">
                      <span className="institution-badge">
                        {event.institution.name}
                      </span>
                    </div>
                  )}
                  
                  <div className="meta-item">
                    <FiDollarSign className="meta-icon" />
                    <span>{event.is_free ? 'Free' : 'Paid'}</span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="attendees">
                      {event.registered_users_count} attending
                    </span>
                  </div>
                </div>
                
                <p className="description">
                  {event.description.length > 100 
                    ? `${event.description.substring(0, 100)}...` 
                    : event.description}
                </p>
                
                <div className="event-actions">
                  {event.is_registered ? (
                    <button 
                      className="cancel-btn"
                      onClick={(e) => handleCancelClick(event.id, e)}
                    >
                      Cancel Registration
                    </button>
                  ) : (
                    <button 
                      className="view-btn"
                      onClick={(e) => handleRegisterClick(event.id, e)}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsPage;









