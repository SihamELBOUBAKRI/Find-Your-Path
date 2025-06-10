import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import '../../assets/styles/PersonalityDetail.css';

const PersonalityDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [personality, setPersonality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/personality-types/${slug}`);
        setPersonality(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading personality type');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonality();
  }, [slug]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) return <div className="loading">Loading personality details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!personality) return <div>Personality type not found</div>;

  return (
    <div className="personality-detail-container">
      <button className="back-button" onClick={handleBackClick}>
        ← Back to Personalities
      </button>

      <div className="personality-header">
        <h1>{personality.name}</h1>
        <p className="type-description">{personality.description}</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'images' ? 'active' : ''}`}
          onClick={() => setActiveTab('images')}
        >
          Character Examples
        </button>
        <button
          className={`tab-button ${activeTab === 'traits' ? 'active' : ''}`}
          onClick={() => setActiveTab('traits')}
        >
          Traits & Characteristics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-content">
              <h2>About {personality.name}</h2>
              <p>{personality.description}</p>
              
              <div className="quick-facts">
                <h3>Quick Facts</h3>
                <ul>
                  <li>
                    <strong>Nickname:</strong> {personality.name}
                  </li>
                  <li>
                    <strong>Core Motivation:</strong> {personality.core_motivation || 'Not specified'}
                  </li>
                  <li>
                    <strong>Rarity:</strong> {personality.rarity || 'Not specified'}
                  </li>
                </ul>
              </div>
            </div>

            <div className="type-image">
              {personality.anime_character_image && (
                <img 
                  src={personality.anime_character_image} 
                  alt={`${personality.name} representation`}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'images' && (
          <div className="images-tab">
            <div className="character-grid">
              <div className="character-card">
                <h3>Anime Character</h3>
                {personality.anime_character_image ? (
                  <img 
                    src={personality.anime_character_image} 
                    alt="Anime representation"
                  />
                ) : (
                  <div className="image-placeholder">No image available</div>
                )}
                <p className="character-description">
                  This anime character exemplifies the {personality.name} personality through their behavior and traits.
                </p>
              </div>

              <div className="character-card">
                <h3>Cartoon Character</h3>
                {personality.cartoon_character_image ? (
                  <img 
                    src={personality.cartoon_character_image} 
                    alt="Cartoon representation"
                  />
                ) : (
                  <div className="image-placeholder">No image available</div>
                )}
                <p className="character-description">
                  A well-known cartoon character that shares the {personality.name} traits.
                </p>
              </div>

              <div className="character-card">
                <h3>Famous Person</h3>
                {personality.famous_star_image ? (
                  <img 
                    src={personality.famous_star_image} 
                    alt="Famous person representation"
                  />
                ) : (
                  <div className="image-placeholder">No image available</div>
                )}
                <p className="character-description">
                  A celebrity or historical figure with this personality type.
                </p>
              </div>

              <div className="character-card">
                <h3>Animal Representation</h3>
                {personality.animal_image ? (
                  <img 
                    src={personality.animal_image} 
                    alt="Animal representation"
                  />
                ) : (
                  <div className="image-placeholder">No image available</div>
                )}
                <p className="character-description">
                  An animal that symbolizes the {personality.name} personality.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traits' && (
          <div className="traits-tab">
            <div className="traits-section">
              <h2>Key Traits</h2>
              <div className="traits-list">
                {personality.traits.map((trait, index) => (
                  <span key={index} className="trait-badge">
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="strengths-weaknesses">
              <div className="strengths-section">
                <h2>Strengths</h2>
                <ul>
                  {personality.strengths.map((strength, index) => (
                    <li key={index}>
                      <span className="strength-icon">✓</span> {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="weaknesses-section">
                <h2>Weaknesses</h2>
                <ul>
                  {personality.weaknesses.map((weakness, index) => (
                    <li key={index}>
                      <span className="weakness-icon">✗</span> {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relationships-section">
              <h2>Relationships</h2>
              <div className="compatibility-cards">
                <div className="compatibility-card good">
                  <h3>Most Compatible With</h3>
                  <ul>
                    <li>Type A</li>
                    <li>Type B</li>
                    <li>Type C</li>
                  </ul>
                </div>
                <div className="compatibility-card neutral">
                  <h3>Neutral With</h3>
                  <ul>
                    <li>Type D</li>
                    <li>Type E</li>
                  </ul>
                </div>
                <div className="compatibility-card bad">
                  <h3>Least Compatible With</h3>
                  <ul>
                    <li>Type F</li>
                    <li>Type G</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityDetail;