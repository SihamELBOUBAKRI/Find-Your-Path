import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiBell, FiSearch, FiLogOut, FiUser, FiMenu, FiX } from 'react-icons/fi';
import eventsIcon from '../../assets/images/event.png';
import homeIcon from '../../assets/images/institution.png';
import messagesIcon from '../../assets/images/chat.png';
import brainIcon from '../../assets/images/brain.png';
import userIcon from '../../assets/images/user.png';
import wishlistIcon from '../../assets/images/wishlist.png';
import connectionIcom from '../../assets/images/connection.png';
import postIcom from '../../assets/images/post.png';
import '../../assets/styles/dashboard.css';
import logoGif from '../../assets/images/logo.gif';
import { Outlet } from 'react-router-dom';
import api from '../../api';

const StudentDashboard = () => {
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  const navItems = [
    { icon: <img src={userIcon} alt="profile" className="nav-icon-img" />, title: 'Profile', path: 'profile' },
    { icon: <img src={homeIcon} alt="Institutions" className="nav-icon-img" />, title: 'Institutions', path: 'institutions' },
    { icon: <img src={eventsIcon} alt="events" className="nav-icon-img" />, title: 'Events', path: 'events' },
    { icon: <img src={messagesIcon} alt="messages" className="nav-icon-img" />, title: 'Messages', path: 'messages' },
    { icon: <img src={brainIcon} alt="core_type" className="nav-icon-img" />, title: 'Core Type', path: 'core-type' },
    { icon: <img src={wishlistIcon} alt="saved_items" className="nav-icon-img" />, title: 'Saved Items', path: 'saved-items' },
    { icon: <img src={connectionIcom} alt="connection" className="nav-icon-img" />, title: 'connections', path: 'connections' },
    { icon: <img src={postIcom} alt="posts" className="nav-icon-img" />, title: 'posts', path: 'posts' }
  ];

  // Fetch notifications
  useEffect(() => {
   const fetchNotifications = async () => {
  try {
    setLoadingNotifications(true);
    const response = await api.get('/notifications', {
      params: { unread: true }
    });
    
    // Extract the notifications array from the paginated response
    const notificationsData = response.data.data?.data || [];
    
    setNotifications(notificationsData);
    setUnreadCount(notificationsData.filter(n => !n.is_read).length);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    setNotifications([]); // Fallback to empty array
    setUnreadCount(0);
  } finally {
    setLoadingNotifications(false);
  }
};

    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expanded && navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
      if (showProfileDropdown && profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, showProfileDropdown, showNotifications]);

  const handleNavItemClick = (path) => {
    navigate(path);
    setExpanded(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode', !darkMode);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      markNotificationsAsRead();
    }
  };

  const markNotificationsAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      await api.post('/notifications/mark-as-read', {
        notification_ids: unreadIds
      });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete('/notifications', {
        data: { notification_ids: [id] }
      });
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="top-nav-left" onClick={() => navigate("")}>
          <div className="platform-logo-container">
            <img src={logoGif} alt="Next Sep Logo" className="logo" />
            <div className="platform-title-cont">
              <h1 className="platform-name">Next Sep</h1>
              <span className="platform-tagline">Student Guidance Platform</span>
            </div>
          </div>
        </div>
        
        <div className="top-nav-center">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search courses, resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FiSearch />
            </button>
          </form>
        </div>
        
        <div className="top-nav-right">
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          
          <div className="notifications-wrapper" ref={notificationsRef}>
            <button className="notifications" onClick={toggleNotifications}>
              <FiBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
          </div>
          
          <div className="profile-dropdown" ref={profileRef}>
            <button 
              className="profile-btn"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <FiUser />
            </button>
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('profile')}>
                  My Profile
                </button>
                <button className="dropdown-item" onClick={() => navigate('settings')}>
                  Settings
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Notifications Offcanvas */}
      <div className={`notifications-offcanvas ${showNotifications ? 'show' : ''}`}>
        <div className="offcanvas-header">
          <h3>Notifications</h3>
          <button className="close-btn" onClick={() => setShowNotifications(false)}>
            <FiX />
          </button>
        </div>
        
        <div className="notifications-list">
          {loadingNotifications ? (
            <div className="loading-notifications">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">No notifications yet</div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <small className="notification-time">
                    {new Date(notification.created_at).toLocaleString()}
                  </small>
                </div>
                <button 
                  className="delete-notification"
                  onClick={() => deleteNotification(notification.id)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Side Navigation Bar */}
      <div 
        ref={navbarRef}
        className={`navbar ${expanded ? 'expanded' : ''}`}
      >
       <div className="navbar-toggle-container">
        <button className="navbar-toggle" onClick={() => setExpanded(!expanded)}>
          <span className="menu-icon"><FiMenu /></span>
          <span className="close-icon"><FiX /></span>
        </button>
      </div>
        
        <div className="nav-items">
          {navItems.map((item, index) => (
            <div 
              key={index} 
              className={`nav-item ${location.pathname.includes(item.path) ? 'active' : ''}`}
              onClick={() => handleNavItemClick(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-title">{item.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main 
        className="dashboard-content"
        onClick={() => expanded && setExpanded(false)}
      >
        <section className="dashboard-main-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;