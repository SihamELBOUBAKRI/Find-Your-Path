import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiBell, FiSearch, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import eventsIcon from '../../assets/images/event.png';
import homeIcon from '../../assets/images/institution.png';
import messagesIcon from '../../assets/images/chat.png';
import brainIcon from '../../assets/images/brain.png';
import userIcon from '../../assets/images/user.png';
import '../../assets/styles/dashboard.css';
import logoGif from '../../assets/images/logo.gif';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const [expanded, setExpanded] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navbarRef = useRef(null);
  const profileRef = useRef(null);

  const navItems = [
    { icon: <img src={userIcon} alt="profile" className="nav-icon-img" />, title: 'Profile', path: 'users' },
    { icon: <img src={homeIcon} alt="Institutions" className="nav-icon-img" />, title: 'Institutions', path: 'institutions' },
    { icon: <img src={eventsIcon} alt="events" className="nav-icon-img" />, title: 'Events', path: 'events' },
    { icon: <img src={messagesIcon} alt="messages" className="nav-icon-img" />, title: 'Messages', path: 'messages' },
    { icon: <img src={brainIcon} alt="core_type" className="nav-icon-img" />, title: 'Core Type', path: 'core-type' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expanded && navbarRef.current && !navbarRef.current.contains(event.target)) {
        setExpanded(false);
      }
      if (showProfileDropdown && profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded, showProfileDropdown]);

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

  return (
    <div className={`dashboard-container ${darkMode ? 'dark' : ''}`}>
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="top-nav-left">
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
          
          <div className="notifications-wrapper">
            <button className="notifications">
              <FiBell />
              <span className="notification-badge">2</span>
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

      {/* Side Navigation Bar */}
      <div 
        ref={navbarRef}
        className={`navbar ${expanded ? 'expanded' : ''}`}
      >
        <button 
          className="navbar-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          <FiMenu />
        </button>
        
        <div className="nav-items">
          {navItems.map((item, index) => (
            <div 
              key={index} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
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

export default AdminDashboard;