import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/HomePage.css'; // You'll need to create this CSS file
import api from '../api';
import RefreshImg from '../assets/images/refresh.png'
import Quot from '../assets/images/quotation.png'
import filter from '../assets/images/filter.png'

const HomePage = () => {
  const [randomQuote, setRandomQuote] = useState(null);
  const [successStories, setSuccessStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [majors, setMajors] = useState([]);
  const [showMajorFilter, setShowMajorFilter] = useState(false);
  const [filters, setFilters] = useState({
    major: '',
    institution: '',
    search: ''
  });

  // Fetch random quote
  const fetchRandomQuote = async () => {
    try {
      const response = await api.get('/quotes/random');
      setRandomQuote(response.data.data);
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  // Fetch success stories
  const fetchSuccessStories = async () => {
    try {
      const params = {};
      if (filters.major) params.major = filters.major;
      if (filters.search) params.search = filters.search;

      const response = await api.get('/success-stories', { params });
      setSuccessStories(response.data.data);
      setFilteredStories(response.data.data.data);
    } catch (error) {
      console.error('Error fetching success stories:', error);
    }
  };
   const fetchMajors = async () => {
  try {
    const response = await api.get('/majors');
    // Check if response.data.data exists (common Laravel API structure)
    const majorsData = response.data.data || response.data;
    setMajors(Array.isArray(majorsData) ? majorsData : []);
  } catch (error) {
    console.error('Error fetching majors:', error);
    setMajors([]); 
  }
};

  // Fetch institutions
  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions');
      setInstitutions(response.data.data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  useEffect(() => {
    fetchRandomQuote();
    fetchSuccessStories();
    fetchInstitutions();
    fetchMajors();
  }, []);

  useEffect(() => {
    fetchSuccessStories();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="home-container">
      {/* Top Section - 40% height */}
      <div className="top-section">
        {/* Random Quote */}
        <div className="quote-section">
            <div className='icons-quot'>
                <img src={Quot} className='quot-img' onClick={fetchRandomQuote}/>
            </div>
          {randomQuote && (
            <>
              <blockquote className="quote-text">
                "{randomQuote.quote}"
              </blockquote>
              <p className="quote-author">— {randomQuote.author || 'Unknown'}—</p>
              
            </>
          )}
        </div>

        {/* Success Stories */}
        <div className="stories-section">
            <div className="filters">
                <div className="filter-icon-container">
                    <img
                    src={filter} 
                    alt="Filter by Major"
                    className="filter-icon"
                    onClick={() => setShowMajorFilter(!showMajorFilter)}
                    />
                    {showMajorFilter && (
                    <div className="filter-options-dropdown">
                        <div className="filter-options-header">
                        <span>Filter by Major</span>
                        <button onClick={() => setShowMajorFilter(false)}>×</button>
                        </div>
                        <div className="filter-options-list">
                        {majors.map(major => (
                            <div
                            key={major.id}
                            className={`filter-option ${filters.major === major.name ? 'active' : ''}`}
                            onClick={() => {
                                setFilters({ ...filters, major: major.name });
                                setShowMajorFilter(false);
                            }}
                            >
                            {major.name}
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </div>
                <input
                    type="text"
                    name="search"
                    placeholder="Search stories..."
                    value={filters.search}
                    onChange={handleFilterChange}
                />
            </div>
            <div className="stories-grid">
            {filteredStories.slice(0, 8).map((story, index) => {
                const imageUrl = `http://127.0.0.1:8000/storage/success-stories/success-story-${story.id}.png`;
                
                return (
               <div className="story-card">
                <div className="story-header">
                    <div className="story-image">
                    <img 
                        src={imageUrl}
                        alt={story.name}
                        onError={(e) => {
                        const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
                        let currentAttempt = 0;
                        const tryNextExtension = () => {
                            if (currentAttempt < extensions.length) {
                            e.target.src = `http://127.0.0.1:8000/storage/success-story-${story.id}${extensions[currentAttempt]}`;
                            currentAttempt++;
                            } else {
                            e.target.src = 'http://127.0.0.1:8000/storage/success-stories/default.jpg';
                            e.target.onerror = null;
                            }
                        };
                        tryNextExtension();
                        }}
                    />
                    </div>
                    <div className="story-info">
                    <h3 className="story-name">{story.name}</h3>
                    </div>
                </div>

                <div className="story-content">
                    <p className="story-years">{story.birth_year} - {story.death_year}</p>
                    <p className="story-excerpt">
                    {story.story.length > 100 
                        ? `${story.story.substring(0, 100)}...` 
                        : story.story}
                    </p>
                </div>
            </div>

                );
            })}
            </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <h1>Find Your Path</h1>
        <div className="institutions-container">
          {/* Institutions List - 60% width */}
          <div className="institutions-list">
            {institutions.slice(0, 5).map(institution => (
              <div 
                key={institution.id} 
                className="institution-card"
                onClick={() => setSelectedInstitution(institution)}
              >
                <div className="institution-image">
                  {/* Replace with actual image if available */}
                  <div className="image-placeholder">{institution.name.charAt(0)}</div>
                </div>
                <h3>{institution.name}</h3>
                <p className="institution-location">
                  {institution.city}, {institution.country}
                </p>
                <p className="institution-description">
                  {institution.description.length > 100
                    ? `${institution.description.substring(0, 100)}...`
                    : institution.description}
                </p>
              </div>
            ))}
          </div>

          {/* Institution Details - 40% width */}
          <div className="institution-details">
            {selectedInstitution ? (
              <>
                <h2>{selectedInstitution.name}</h2>
                <p><strong>Type:</strong> {selectedInstitution.type}</p>
                <p><strong>Location:</strong> {selectedInstitution.city}, {selectedInstitution.country}</p>
                <p><strong>Address:</strong> {selectedInstitution.address}</p>
                <p><strong>Website:</strong> 
                  <a href={selectedInstitution.website} target="_blank" rel="noopener noreferrer">
                    {selectedInstitution.website}
                  </a>
                </p>
                <p><strong>Average Tuition:</strong> ${selectedInstitution.avg_tuition}</p>
                <p><strong>Scholarships:</strong> {selectedInstitution.scholarships ? 'Yes' : 'No'}</p>
                <div className="full-description">
                  <h3>About</h3>
                  <p>{selectedInstitution.description}</p>
                </div>
              </>
            ) : (
              <div className="no-institution-selected">
                <p>Select an institution to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;