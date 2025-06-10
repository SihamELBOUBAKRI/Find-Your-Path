import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiMapPin, FiGlobe, FiPhone, FiCalendar, FiBook, FiDollarSign, FiArrowLeft } from 'react-icons/fi';
import api from '../api';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import PageLoading from '../pages/loading/loading';
import '../assets/styles/InstitutionDetail.css';

const InstitutionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [institution, setInstitution] = useState(null);
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch institution details
        const institutionRes = await api.get(`/institutions/${id}`);
        setInstitution(institutionRes.data.data);
        
        // Fetch institution's majors
        const majorsRes = await api.get(`/institutions/${id}/majors`);
        setMajors(majorsRes.data.data);
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load institution data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const getMapUrl = () => {
    if (!institution) return '';
    if (institution.latitude && institution.longitude) {
      return `https://maps.google.com/maps?q=${institution.latitude},${institution.longitude}&z=15&output=embed`;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(institution.address)}&output=embed`;
  };

  if (loading) return <PageLoading />;
  if (error) return <ErrorAlert message={error} onClose={() => navigate('/institutions')} />;

  return (
    <div className="institution-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Back to Institutions
      </button>

      {institution && (
        <>
          <div className="detail-header">
            <h1 className="detail-title">{institution.name}</h1>
            <div className="detail-subtitle">
              <span className="institution-type">
                {institution.type.replace('_', ' ')}
              </span>
              <span>
                <FiMapPin /> {institution.city}, {institution.country}
              </span>
            </div>
          </div>

          <div className="detail-media">
            <div className="detail-image">
              <img 
                src={institution.image_url || `https://source.unsplash.com/random/800x400/?university,${institution.id}`} 
                alt={institution.name} 
              />
            </div>
            <div className="detail-map">
              <iframe
                title="Institution Location"
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
            <h2>About</h2>
            <p>{institution.description}</p>
          </div>

          <div className="details-grid">
            <div className="detail-card">
              <h3><FiMapPin /> Address</h3>
              <p>{institution.address || 'Not specified'}</p>
            </div>
            
            <div className="detail-card">
              <h3><FiPhone /> Contact</h3>
              <p>{institution.phone || 'Not specified'}</p>
            </div>
            
            <div className="detail-card">
              <h3><FiCalendar /> Founded</h3>
              <p>{institution.founded_year || 'Not specified'}</p>
            </div>
            
            <div className="detail-card">
              <h3><FiGlobe /> Website</h3>
              <p>
                {institution.website ? (
                  <a href={institution.website} target="_blank" rel="noopener noreferrer">
                    {institution.website}
                  </a>
                ) : 'Not specified'}
              </p>
            </div>
            
            <div className="detail-card">
              <h3><FiDollarSign /> Average Tuition</h3>
              <p>{institution.avg_tuition ? `$${institution.avg_tuition}` : 'Not specified'}</p>
            </div>
            
            <div className="detail-card">
              <h3>Scholarships</h3>
              <p>{institution.scholarships ? 'Available' : 'Not available'}</p>
            </div>
          </div>

          <div className="majors-section">
            <h2>Offered Majors ({majors.length})</h2>
            
            {majors.length > 0 ? (
              <div className="majors-grid">
                {majors.map(major => (
                  <div key={major.id} className="major-card">
                    <h3>{major.name}</h3>
                    {major.pivot?.duration && (
                      <p><strong>Duration:</strong> {major.pivot.duration}</p>
                    )}
                    {major.pivot?.requirements && (
                      <p><strong>Requirements:</strong> {major.pivot.requirements}</p>
                    )}
                    {major.avg_salary && (
                      <p><strong>Avg Salary:</strong> ${major.avg_salary}</p>
                    )}
                    {major.career_prospects && (
                      <p><strong>Career Prospects:</strong> {major.career_prospects}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-majors">This institution currently has no listed majors.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InstitutionDetailPage;