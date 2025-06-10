import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiHeart } from 'react-icons/fi';
import api from '../api';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import PageLoading from '../pages/loading/loading';
import '../assets/styles/InstitutionsPage.css';

const InstitutionsPage = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    country: '',
    sort_by: 'name',
    sort_dir: 'asc'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/institutions', { 
          params: filters 
        });
        
        setInstitutions(response.data.data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || 'Error fetching institutions');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getInstitutionImage = (institution) => {
    return institution.image_url || `https://source.unsplash.com/random/300x200/?university,${institution.id}`;
  };

  if (loading && institutions.length === 0) return <PageLoading text="Loading institutions..." />;
  if (error) return <ErrorAlert message={error} onClose={() => setError(null)} />;

  return (
    <div className="institutions-page">
      <div className="filters-container">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            name="search"
            placeholder="Search institutions..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="filter-group">
          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="university">University</option>
            <option value="academy">Academy</option>
            <option value="ecole_superieure">École Supérieure</option>
            <option value="ofppt">OFPPT</option>
            <option value="cmc">CMC</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="filter-group">
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={filters.country}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="filter-group">
          <select name="sort_by" value={filters.sort_by} onChange={handleFilterChange}>
            <option value="name">Name</option>
            <option value="founded_year">Founded Year</option>
            <option value="majors_count">Majors Count</option>
          </select>
        </div>
        
        <div className="filter-group">
          <select name="sort_dir" value={filters.sort_dir} onChange={handleFilterChange}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="institutions-grid">
        {institutions.map(institution => (
          <div 
            key={institution.id}
            className="institution-card"
            onClick={() => navigate(`${institution.id}`)}
          >
            <div className="card-image">
              <img 
                src={getInstitutionImage(institution)} 
                alt={institution.name} 
              />
              <button 
                className="save-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle save logic here
                }}
              >
                <FiHeart />
              </button>
            </div>
            <div className="card-body">
              <h3>{institution.name}</h3>
              <span className="institution-type">
                {institution.type.replace('_', ' ')}
              </span>
              <p className="location">
                <FiMapPin /> {institution.city}, {institution.country}
              </p>
              <p className="description">
                {institution.description.length > 100 
                  ? `${institution.description.substring(0, 100)}...` 
                  : institution.description}
              </p>
              <button 
                className="view-btn"
                onClick={() => navigate(`${institution.id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionsPage;