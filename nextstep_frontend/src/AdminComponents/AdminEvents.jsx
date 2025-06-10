import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiCalendar, FiUsers, FiClock, FiMapPin, FiDollarSign } from 'react-icons/fi';
import api from '../api';
import SuccessAlert from '../pages/alerts/SuccessAlert';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import ConfirmForm from '../pages/alerts/ConfirmForm';
import PageLoading from '../pages/loading/loading';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/styles/AdminEvents.css';

Modal.setAppElement('#root');

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    upcoming: false,
    free: false,
    institution_id: ''
  });
  const [sort, setSort] = useState({ by: 'start_date', dir: 'asc' });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    institution_id: '',
    latitude: '',
    longitude: '',
    address: '',
    start_date: new Date(),
    end_date: new Date(Date.now() + 3600 * 1000 * 24), // Tomorrow
    website: '',
    is_free: false,
    image_url: ''
  });
  const [institutions, setInstitutions] = useState([]);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showConfirm, setShowConfirm] = useState({ show: false, message: '', onConfirm: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchInstitutions();
  }, [searchTerm, filter, sort]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filter.upcoming) params.append('upcoming', 'true');
      if (filter.free) params.append('free', 'true');
      if (filter.institution_id) params.append('institution_id', filter.institution_id);
      params.append('sort_by', sort.by);
      params.append('sort_dir', sort.dir);

      const response = await api.get(`/events?${params.toString()}`);
      setEvents(response.data.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      showAlertMessage('error', 'Failed to load events');
      setLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions');
      setInstitutions(response.data.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
      showAlertMessage('error', 'Failed to load institutions');
    }
  };

  const fetchEventRegistrations = async (eventId) => {
    try {
      const response = await api.get(`/events/${eventId}/registrations`);
      setRegistrations(response.data.data);
      setSelectedEventId(eventId);
      setShowRegistrations(true);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      showAlertMessage('error', 'Failed to load registrations');
    }
  };

  const openModal = (event = null) => {
    if (event) {
      setCurrentEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        institution_id: event.institution_id || '',
        latitude: event.latitude || '',
        longitude: event.longitude || '',
        address: event.address,
        start_date: new Date(event.start_date),
        end_date: new Date(event.end_date),
        website: event.website || '',
        is_free: event.is_free,
        image_url: event.image_url || ''
      });
    } else {
      setCurrentEvent(null);
      setFormData({
        title: '',
        description: '',
        institution_id: '',
        latitude: '',
        longitude: '',
        address: '',
        start_date: new Date(),
        end_date: new Date(Date.now() + 3600 * 1000 * 24),
        website: '',
        is_free: false,
        image_url: ''
      });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        start_date: formData.start_date.toISOString(),
        end_date: formData.end_date.toISOString()
      };

      if (currentEvent) {
        await api.put(`/events/${currentEvent.id}`, data);
        showAlertMessage('success', 'Event updated successfully');
      } else {
        await api.post('/events', data);
        showAlertMessage('success', 'Event created successfully');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      showAlertMessage('error', error.response?.data?.message || 'Failed to save event');
    }
  };

  const confirmDelete = (eventId) => {
    setShowConfirm({
      show: true,
      message: 'Are you sure you want to delete this event?',
      onConfirm: async () => {
        try {
          await api.delete(`/events/${eventId}`);
          showAlertMessage('success', 'Event deleted successfully');
          fetchEvents();
        } catch (error) {
          console.error('Error deleting event:', error);
          showAlertMessage('error', 'Failed to delete event');
        }
        setShowConfirm({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const updateRegistrationStatus = async (eventId, userId, status) => {
    try {
      await api.patch(`/events/${eventId}/users/${userId}/status`, { status });
      showAlertMessage('success', 'Registration status updated');
      fetchEventRegistrations(eventId);
    } catch (error) {
      console.error('Error updating registration:', error);
      showAlertMessage('error', 'Failed to update registration status');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const showAlertMessage = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  return (
    <div className="admin-events-container">
      {showAlert.show && (
        showAlert.type === 'success' ? (
          <SuccessAlert 
            message={showAlert.message} 
            onClose={() => setShowAlert({ show: false, type: '', message: '' })} 
          />
        ) : (
          <ErrorAlert 
            message={showAlert.message} 
            onClose={() => setShowAlert({ show: false, type: '', message: '' })} 
          />
        )
      )}

      {showConfirm.show && (
        <ConfirmForm
          message={showConfirm.message}
          onConfirm={showConfirm.onConfirm}
          onCancel={() => setShowConfirm({ show: false, message: '', onConfirm: null })}
        />
      )}

      <div className="events-header">
        <h2>Manage Events</h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <FiPlus /> Create Event
        </button>
      </div>

      <div className="events-filters">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <label>
            <input
              type="checkbox"
              checked={filter.upcoming}
              onChange={() => setFilter({...filter, upcoming: !filter.upcoming})}
            />
            Upcoming Only
          </label>

          <label>
            <input
              type="checkbox"
              checked={filter.free}
              onChange={() => setFilter({...filter, free: !filter.free})}
            />
            Free Only
          </label>

          <select
            value={filter.institution_id}
            onChange={(e) => setFilter({...filter, institution_id: e.target.value})}
          >
            <option value="">All Institutions</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>

          <select
            value={sort.by}
            onChange={(e) => setSort({...sort, by: e.target.value})}
          >
            <option value="start_date">Sort by Date</option>
            <option value="title">Sort by Title</option>
          </select>

          <select
            value={sort.dir}
            onChange={(e) => setSort({...sort, dir: e.target.value})}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoading text="Loading events..." />
      ) : (
        <div className="events-list">
          {events.length === 0 ? (
            <div className="no-events">No events found</div>
          ) : (
            <table className="events-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Institution</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>
                      <div className="event-title">
                        {event.image_url && (
                          <img src={event.image_url} alt={event.title} className="event-image" />
                        )}
                        <span>{event.title}</span>
                      </div>
                    </td>
                    <td>{event.institution?.name || 'N/A'}</td>
                    <td>
                      <div className="date-info">
                        <FiCalendar /> {formatDate(event.start_date)}
                      </div>
                      {new Date(event.start_date) > new Date() && (
                        <div className="time-remaining">
                          <FiClock /> {Math.ceil((new Date(event.start_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="location-info">
                        <FiMapPin /> {event.address}
                      </div>
                    </td>
                    <td>
                      <div className={`price-tag ${event.is_free ? 'free' : 'paid'}`}>
                        <FiDollarSign /> {event.is_free ? 'Free' : 'Paid'}
                      </div>
                    </td>
                    <td className="actions">
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => fetchEventRegistrations(event.id)}
                      >
                        <FiUsers /> Registrations
                      </button>
                      <button 
                        className="btn btn-sm btn-edit"
                        onClick={() => openModal(event)}
                      >
                        <FiEdit /> Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => confirmDelete(event.id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Event Form Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h3>{currentEvent ? 'Edit Event' : 'Create New Event'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <DatePicker
                selected={formData.start_date}
                onChange={(date) => handleDateChange(date, 'start_date')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <DatePicker
                selected={formData.end_date}
                onChange={(date) => handleDateChange(date, 'end_date')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={formData.start_date}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Institution</label>
            <select
              name="institution_id"
              value={formData.institution_id}
              onChange={handleInputChange}
            >
              <option value="">Select Institution</option>
              {institutions.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                step="any"
                min="-90"
                max="90"
              />
            </div>

            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                step="any"
                min="-180"
                max="180"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="is_free"
                checked={formData.is_free}
                onChange={handleInputChange}
              />
              Is this a free event?
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentEvent ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Registrations Modal */}
      <Modal
        isOpen={showRegistrations}
        onRequestClose={() => setShowRegistrations(false)}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h3>Event Registrations</h3>
        {registrations.length === 0 ? (
          <div className="no-registrations">No registrations found for this event</div>
        ) : (
          <table className="registrations-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id}>
                  <td>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td>{formatDate(reg.pivot.created_at)}</td>
                  <td>
                    <span className={`status-badge ${reg.pivot.status}`}>
                      {reg.pivot.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={reg.pivot.status}
                      onChange={(e) => updateRegistrationStatus(selectedEventId, reg.id, e.target.value)}
                    >
                      <option value="registered">Registered</option>
                      <option value="attended">Attended</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowRegistrations(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminEvents;