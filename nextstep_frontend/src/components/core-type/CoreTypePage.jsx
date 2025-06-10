import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import '../../assets/styles/CoreTypePage.css';

const CoreTypePage = () => {
  const [personalityTypes, setPersonalityTypes] = useState([]);
  const [userPersonality, setUserPersonality] = useState(null);
  const [loading, setLoading] = useState({
    types: true,
    user: true
  });
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('personalities'); // Default to personalities
  const navigate = useNavigate();

  // Fetch personality types and user's personality
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all personality types
        const typesResponse = await api.get('/personality-types');
        setPersonalityTypes(typesResponse.data.data);
        setLoading(prev => ({ ...prev, types: false }));

        // Fetch user's personality if authenticated
        try {
          const userResponse = await api.get('/quiz/personality-analysis');
          console.log(userResponse.data.data);
          setUserPersonality(userResponse.data.data);
        } catch (err) {
          // User hasn't taken the test or not authenticated - this is expected
        }
        setLoading(prev => ({ ...prev, user: false }));
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading data');
        setLoading({ types: false, user: false });
      }
    };

    fetchData();
  }, []);

  const startTest = () => {
    navigate('personality-test');
  };

  const viewPersonalityDetails = (type) => {
    navigate(`personality-types/${type.slug}`);
  };

  if (loading.types) return <div className="loading">Loading personality types...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="personality-dashboard">
      <h1 className="dashboard-title">Personality Assessment</h1>
      
      {/* Navigation Squares */}
      <div className="navigation-squares">
        <div 
          className={`nav-square ${activeSection === 'personalities' ? 'active' : ''}`}
          onClick={() => setActiveSection('personalities')}
        >
          <h2>All Personalities</h2>
        </div>
        
        <div 
          className={`nav-square ${activeSection === 'test' ? 'active' : ''}`}
          onClick={() => setActiveSection('test')}
        >
          <h2>Take Test</h2>
        </div>
        
        <div 
          className={`nav-square ${activeSection === 'your-type' ? 'active' : ''}`}
          onClick={() => setActiveSection('your-type')}
        >
          <h2>Your Personality</h2>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="main-content">
        {activeSection === 'personalities' && (
          <div className="personalities-section">
            <h2>Personality Types</h2>
            <div className="types-grid">
              {personalityTypes.map(type => (
                <div 
                  key={type.id} 
                  className="type-card"
                  onClick={() => viewPersonalityDetails(type)}
                >
                  {type.anime_character_image && (
                    <img 
                      src={type.anime_character_image} 
                      alt={type.name} 
                      className="type-image"
                    />
                  )}
                  <h3 className="type-name">{type.name}</h3>
                  <p className="type-description">{type.description.substring(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeSection === 'test' && (
          <div className="test-section">
            <h2>Personality Test</h2>
            <div className="test-info">
              <p>Discover your personality type by taking our comprehensive assessment.</p>
              <p>The test consists of multiple questions where you'll rate how much each statement applies to you.</p>
              <p>It takes about 10-15 minutes to complete.</p>
              
              <button 
                className="start-test-btn"
                onClick={startTest}
              >
                Start Personality Test
              </button>
            </div>
          </div>
        )}
        
        {activeSection === 'your-type' && (
  <div className="your-type-section">
    <h2>Your Personality</h2>
    {!loading.user && (
      userPersonality ? (
        <div className="user-personality-card">
          <h3 className="user-type">{userPersonality.type.name}</h3>
          
          {userPersonality.type.anime_character_image && (
            <img 
              src={userPersonality.type.anime_character_image} 
              alt={userPersonality.type.name}
              className="user-type-image"
            />
          )}
          
          <p className="user-type-description">
            {userPersonality.type.description.substring(0, 200)}...
          </p>
          
          <button 
            className="view-details-btn"
            onClick={() => viewPersonalityDetails(userPersonality.type)}
          >
            View Full Details
          </button>
          
          <button 
            className="retake-test-btn"
            onClick={startTest}
          >
            Retake Test
          </button>
        </div>
      ) : (
        <div className="no-personality">
          <p>You haven't taken the personality test yet.</p>
          <p>Discover your personality type by taking our assessment.</p>
          <button 
            className="take-test-btn"
            onClick={startTest}
          >
            Take the Test Now
          </button>
        </div>
      )
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default CoreTypePage;