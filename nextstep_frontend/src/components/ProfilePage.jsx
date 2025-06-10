import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiLink, FiBook, FiAward, FiChevronRight } from 'react-icons/fi';
import { FaLinkedin, FaGraduationCap, FaBrain } from 'react-icons/fa';
import api from '../api';
import PageLoading from '../pages/loading/loading';
import PostCard from './posts/PostCard';
import '../assets/styles/ProfilePage.css';

const ProfilePage = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState({ profile: true, posts: false });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadedPosts, setLoadedPosts] = useState([]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(prev => ({ ...prev, profile: true }));
        setError(null);
        
        const endpoint = userId ? `/users/${userId}` : '/me';
        const response = await api.get(endpoint);
        
        setProfile(response.data.data || response.data.user);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching profile');
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };

    fetchProfile();
  }, [userId]);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile?.id) return;
      
      try {
        setLoading(prev => ({ ...prev, posts: true }));
        
        const response = await api.get(`/users/${profile.id}/posts`, {
          params: { page, per_page: 5 } // Limit posts per page
        });
        
        const newPosts = response.data.data || [];
        
        // Filter out duplicates
        const uniqueNewPosts = newPosts.filter(
          newPost => !loadedPosts.some(post => post.id === newPost.id)
        );
        
        if (page === 1) {
          setLoadedPosts(uniqueNewPosts);
        } else {
          setLoadedPosts(prev => [...prev, ...uniqueNewPosts]);
        }
        
        setHasMorePosts(newPosts.length > 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching posts');
      } finally {
        setLoading(prev => ({ ...prev, posts: false }));
      }
    };

    fetchPosts();
  }, [profile?.id, page]);

  const loadMorePosts = () => {
    if (hasMorePosts) {
      setPage(prev => prev + 1);
    }
  };

  if (loading.profile) return <PageLoading text="Loading profile..." />;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    
<div className="luxury-profile-container">
  <div className="luxury-profile-header">
    <div className="luxury-avatar-container">
      {profile.avatar ? (
        <img 
          src={profile.avatar} 
          alt={`${profile.name}'s avatar`} 
          className="luxury-profile-avatar"
        />
      ) : (
        <div className="luxury-avatar-placeholder">
          {profile.name.charAt(0).toUpperCase()}
        </div>
      )}
      <h1 className="luxury-profile-name">{profile.name}</h1>
      {profile.title && <p className="luxury-profile-title">{profile.title}</p>}
    </div>
  </div>

      <div className="luxury-profile-layout">
        {/* Left Side - Profile Info */}
        <div className="luxury-profile-info-side">
          <div className="luxury-profile-section">
            <h2 className="luxury-section-title">
              <FiUser className="luxury-section-icon" />
              Personal Information
            </h2>
            
            <div className="luxury-detail-item">
              <FiMail className="luxury-detail-icon" />
              <div>
                <h3>Email</h3>
                <p>{profile.email}</p>
              </div>
            </div>
            
            {profile.phone && (
              <div className="luxury-detail-item">
                <FiPhone className="luxury-detail-icon" />
                <div>
                  <h3>Phone</h3>
                  <p>{profile.phone}</p>
                </div>
              </div>
            )}
            
            {profile.linkedin_url && (
              <div className="luxury-detail-item">
                <FaLinkedin className="luxury-detail-icon" />
                <div>
                  <h3>LinkedIn</h3>
                  <a 
                    href={profile.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="luxury-link"
                  >
                    View Profile <FiChevronRight />
                  </a>
                </div>
              </div>
            )}
          </div>
          
          {profile.bio && (
            <div className="luxury-profile-section">
              <h2 className="luxury-section-title">
                <FiBook className="luxury-section-icon" />
                About Me
              </h2>
              <p className="luxury-bio">{profile.bio}</p>
            </div>
          )}
          
          {profile.recommended_major && (
            <div className="luxury-profile-section">
              <h2 className="luxury-section-title">
                <FaGraduationCap className="luxury-section-icon" />
                Academic Recommendation
              </h2>
              <div className="luxury-recommendation">
                {profile.recommended_major}
              </div>
            </div>
          )}
          
          {profile.personalityType && (
            <div className="luxury-profile-section">
              <h2 className="luxury-section-title">
                <FaBrain className="luxury-section-icon" />
                Personality Type
              </h2>
              <div className="luxury-personality-badge">
                {profile.personalityType.name}
              </div>
              <p className="luxury-personality-description">
                {profile.personalityType.description}
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Posts */}
        <div className="luxury-profile-posts-side">
          <div className="luxury-posts-header">
            <h2>
              <span className="luxury-posts-highlight">{profile.name}'s</span> Activity
            </h2>
          </div>
          
          {loadedPosts.length === 0 && !loading.posts ? (
            <div className="luxury-no-posts">
              <div className="luxury-no-posts-icon">📭</div>
              <h3>No Posts Yet</h3>
              <p>{profile.name} hasn't shared any posts yet.</p>
            </div>
          ) : (
            <>
              <div className="luxury-posts-list">
                {loadedPosts.map(post => (
                  <PostCard 
                    key={post.id} 
                    post={post} 
                    showFullContent={false}
                    className="luxury-post-card"
                  />
                ))}
              </div>
              
              <div className="luxury-load-more-container">
                <button 
                  className={`luxury-load-more-btn ${!hasMorePosts ? 'disabled' : ''}`}
                  onClick={loadMorePosts}
                  disabled={!hasMorePosts || loading.posts}
                >
                  {loading.posts ? (
                    'Loading...'
                  ) : hasMorePosts ? (
                    'Show More Activity'
                  ) : (
                    'No More Posts'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;