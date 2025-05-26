import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../assets/styles/auth.css';
import { FiUser, FiCamera } from 'react-icons/fi'; 

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        avatar: null, // Changed to handle file object
        bio: '',
        linkedin_url: '',
        phone: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                avatar: file
            }));
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('password_confirmation', formData.password_confirmation);
            formDataToSend.append('bio', formData.bio);
            formDataToSend.append('linkedin_url', formData.linkedin_url);
            formDataToSend.append('phone', formData.phone);
            if (formData.avatar) {
                formDataToSend.append('avatar', formData.avatar);
            }

            const response = await api.post('/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/login');
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrors({ general: err.response?.data?.message || 'Registration failed. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="signup-container">
        <div className="signup-form-container">
            <div className="signup-form-card">
              <h2>Create Your Account</h2>
                  
              {errors.general && <div className="auth-error">{errors.general}</div>}
                  
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                {/* Avatar Upload */}
                <div className="form-group">
                  <label htmlFor="avatar-upload" className="avatar-upload-label">
                      {preview ? (
                          <div className="avatar-preview-container">
                              <img 
                                  src={preview} 
                                  alt="Preview" 
                                  className="avatar-preview"
                              />
                              <div className="avatar-edit-icon">
                                  <FiCamera />
                              </div>
                          </div>
                      ) : (
                          <div className="avatar-placeholder">
                              <FiUser className="avatar-icon" />
                              <FiCamera className="avatar-add-icon" />
                          </div>
                      )}
                  </label>
                  <input
                      type="file"
                      id="avatar-upload"
                      name="avatar"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                  />
                  {errors.avatar && <span className="field-error">{errors.avatar[0]}</span>}
              </div>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <span className="field-error">{errors.name[0]}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <span className="field-error">{errors.email[0]}</span>}
                </div>
              {/* Password and Confirm Password in one row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    {errors.password && <span className="field-error">{errors.password[0]}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password_confirmation">Confirm Password</label>
                    <input
                      type="password"
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="bio">Bio (optional)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength="500"
                    rows="3"
                  />
                </div>
                {/* LinkedIn and Phone in one row */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="linkedin_url">LinkedIn URL (optional)</label>
                    <input
                      type="url"
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone (optional)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="auth-actions">
                  <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </div>
              </form>
              <div className="auth-footer">
                Already have an account? <a href="/">Login</a>
              </div>
          </div>
        </div>
    </div>
  );
};

export default Signup;