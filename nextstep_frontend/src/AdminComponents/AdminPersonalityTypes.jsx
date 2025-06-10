import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiUsers, FiList, FiCheck, FiX } from 'react-icons/fi';
import api from '../api';
import SuccessAlert from '../pages/alerts/SuccessAlert';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import ConfirmForm from '../pages/alerts/ConfirmForm';
import PageLoading from '../pages/loading/loading';
import Modal from 'react-modal';
import '../assets/styles/AdminPersonalityTypes.css';

Modal.setAppElement('#root');

const AdminPersonalityTypes = () => {
  const [personalityTypes, setPersonalityTypes] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAssociations, setUserAssociations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    traits: [],
    strengths: [],
    weaknesses: [],
    anime_character_image: '',
    cartoon_character_image: '',
    famous_star_image: '',
    animal_image: ''
  });
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    category: 'personality',
    weight: 1
  });
  const [showAlert, setShowAlert] = useState({ show: false, type: '', message: '' });
  const [showConfirm, setShowConfirm] = useState({ show: false, message: '', onConfirm: null });
  const [newTrait, setNewTrait] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'types') {
        const response = await api.get('/personality-types');
        setPersonalityTypes(response.data.data || []);
      } else if (activeTab === 'questions') {
        const response = await api.get('/questions');
        setQuizQuestions(response.data.data || []);
      } else if (activeTab === 'users') {
        const response = await api.get('/users?role=student&limit=50&include=personalityType');
        setUserAssociations(response.data.data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      showAlertMessage('error', 'Failed to load data');
      setLoading(false);
      if (activeTab === 'types') setPersonalityTypes([]);
      else if (activeTab === 'questions') setQuizQuestions([]);
      else if (activeTab === 'users') setUserAssociations([]);
    }
  };

  const openModal = (item = null, type = 'type') => {
    if (item) {
      setCurrentItem(item);
      if (type === 'type') {
        setFormData({
          name: item.name || '',
          slug: item.slug || '',
          description: item.description || '',
          traits: item.traits || [],
          strengths: item.strengths || [],
          weaknesses: item.weaknesses || [],
          anime_character_image: item.anime_character_image || '',
          cartoon_character_image: item.cartoon_character_image || '',
          famous_star_image: item.famous_star_image || '',
          animal_image: item.animal_image || ''
        });
      } else if (type === 'question') {
        setQuestionFormData({
          question: item.question || '',
          category: item.category || 'personality',
          weight: item.weight || 1
        });
      }
    } else {
      setCurrentItem(null);
      if (type === 'type') {
        setFormData({
          name: '',
          slug: '',
          description: '',
          traits: [],
          strengths: [],
          weaknesses: [],
          anime_character_image: '',
          cartoon_character_image: '',
          famous_star_image: '',
          animal_image: ''
        });
      } else if (type === 'question') {
        setQuestionFormData({
          question: '',
          category: 'personality',
          weight: 1
        });
      }
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (activeTab === 'types') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setQuestionFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'types') {
        if (currentItem) {
          await api.put(`/personality-types/${currentItem.id}`, formData);
          showAlertMessage('success', 'Personality type updated successfully');
        } else {
          await api.post('/personality-types', formData);
          showAlertMessage('success', 'Personality type created successfully');
        }
      } else if (activeTab === 'questions') {
        if (currentItem) {
          await api.put(`/quiz-questions/${currentItem.id}`, questionFormData);
          showAlertMessage('success', 'Question updated successfully');
        } else {
          await api.post('/quiz-questions', questionFormData);
          showAlertMessage('success', 'Question created successfully');
        }
      }
      fetchData();
      closeModal();
    } catch (error) {
      console.error('Error saving data:', error);
      showAlertMessage('error', error.response?.data?.message || 'Failed to save data');
    }
  };

  const confirmDelete = (id, type = 'type') => {
    setShowConfirm({
      show: true,
      message: `Are you sure you want to delete this ${type}?`,
      onConfirm: async () => {
        try {
          if (type === 'type') {
            await api.delete(`/personality-types/${id}`);
            showAlertMessage('success', 'Personality type deleted successfully');
          } else if (type === 'question') {
            await api.delete(`/quiz-questions/${id}`);
            showAlertMessage('success', 'Question deleted successfully');
          }
          fetchData();
        } catch (error) {
          console.error('Error deleting:', error);
          showAlertMessage('error', 'Failed to delete');
        }
        setShowConfirm({ show: false, message: '', onConfirm: null });
      }
    });
  };

  const addTrait = () => {
    if (newTrait.trim() && !formData.traits.includes(newTrait.trim())) {
      setFormData(prev => ({
        ...prev,
        traits: [...prev.traits, newTrait.trim()]
      }));
      setNewTrait('');
    }
  };

  const removeTrait = (trait) => {
    setFormData(prev => ({
      ...prev,
      traits: prev.traits.filter(t => t !== trait)
    }));
  };

  const addStrength = () => {
    if (newStrength.trim() && !formData.strengths.includes(newStrength.trim())) {
      setFormData(prev => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()]
      }));
      setNewStrength('');
    }
  };

  const removeStrength = (strength) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter(s => s !== strength)
    }));
  };

  const addWeakness = () => {
    if (newWeakness.trim() && !formData.weaknesses.includes(newWeakness.trim())) {
      setFormData(prev => ({
        ...prev,
        weaknesses: [...prev.weaknesses, newWeakness.trim()]
      }));
      setNewWeakness('');
    }
  };

  const removeWeakness = (weakness) => {
    setFormData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.filter(w => w !== weakness)
    }));
  };

  const updateUserPersonality = async (userId, personalityTypeId) => {
    try {
      await api.patch(`/users/${userId}/update-personality`, { 
        personality_type_id: personalityTypeId || null
      });
      showAlertMessage('success', 'User personality updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating user personality:', error);
      showAlertMessage('error', 'Failed to update user personality');
    }
  };

  const showAlertMessage = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: '', message: '' });
    }, 5000);
  };

  // Filter questions by category
  const filteredQuestions = categoryFilter === 'all' 
    ? quizQuestions 
    : quizQuestions.filter(question => question.category === categoryFilter);

  return (
    <div className="admin-personality-container">
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

      <div className="admin-header">
        <h2>Core Personality Type Management</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'types' ? 'active' : ''}`}
            onClick={() => setActiveTab('types')}
          >
            Personality Types
          </button>
          <button 
            className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Quiz Questions
          </button>
          <button 
            className={`tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Associations
          </button>
        </div>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {activeTab === 'questions' && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-filter"
          >
            <option value="all">All Categories</option>
            <option value="personality">Personality</option>
            <option value="interests">Interests</option>
            <option value="skills">Skills</option>
          </select>
        )}
        {activeTab !== 'users' && (
          <button 
            className="btn btn-primary"
            onClick={() => openModal(null, activeTab === 'types' ? 'type' : 'question')}
          >
            <FiPlus /> Add {activeTab === 'types' ? 'Type' : 'Question'}
          </button>
        )}
      </div>

      {loading ? (
        <PageLoading text={`Loading ${activeTab}...`} />
      ) : (
        <div className="content-area">
          {activeTab === 'types' && (
            <div className="types-grid">
              {personalityTypes.filter(type => 
                type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                type.slug?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(type => (
                <div key={type.id} className="type-card">
                  <div className="type-header">
                    <h3>{type.name || 'Unnamed Type'}</h3>
                    <div className="type-actions">
                      <button 
                        className="btn btn-sm btn-edit"
                        onClick={() => openModal(type, 'type')}
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => confirmDelete(type.id, 'type')}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  <p className="type-description">{type.description || 'No description available'}</p>
                  <div className="type-traits">
                    <h4>Traits:</h4>
                    <ul>
                      {type.traits?.map((trait, index) => (
                        <li key={index}>{trait}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="type-meta">
                    <span className="slug">Slug: {type.slug || 'none'}</span>
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => {
                        setActiveTab('users');
                        setSearchTerm(type.name || '');
                      }}
                    >
                      <FiUsers /> View Users
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="questions-container">
              <table className="questions-table">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Weight</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.filter(question => 
                    question.question?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(question => (
                    <tr key={question.id}>
                      <td>{question.question || 'No question text'}</td>
                      <td>
                        <span className={`category-badge ${question.category}`}>
                          {question.category || 'personality'}
                        </span>
                      </td>
                      <td>{question.weight || 1}</td>
                      <td className="actions">
                        <button 
                          className="btn btn-sm btn-edit"
                          onClick={() => openModal(question, 'question')}
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => confirmDelete(question.id, 'question')}
                        >
                          <FiTrash2 />
                        </button>
                        <button 
                          className="btn btn-sm btn-info"
                          onClick={() => navigate(`/admin-dashboard/question-mappings/${question.id}`)}
                        >
                          <FiList /> Mappings
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Current Personality</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userAssociations.filter(user => 
                    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (user.personalityType && user.personalityType.name && 
                     user.personalityType.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          {user.avatar && (
                            <img src={user.avatar} alt={user.name} className="user-avatar" />
                          )}
                          <span>{user.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td>{user.email || 'N/A'}</td>
                      <td>
                        {user.personalityType ? (
                          <span className="personality-badge">
                            {user.personalityType.name}
                          </span>
                        ) : (
                          <span className="no-personality">Not set</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={user.personality_type_id || ''}
                          onChange={(e) => updateUserPersonality(user.id, e.target.value)}
                          className="personality-select"
                        >
                          <option value="">Select Personality</option>
                          {personalityTypes.map(type => (
                            <option 
                              key={type.id} 
                              value={type.id}
                              selected={user.personality_type_id === type.id}
                            >
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h3>
          {currentItem ? 
            `Edit ${activeTab === 'types' ? 'Personality Type' : 'Question'}` : 
            `Create New ${activeTab === 'types' ? 'Personality Type' : 'Question'}`}
        </h3>
        <form onSubmit={handleSubmit}>
          {activeTab === 'types' ? (
            <>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
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

              <div className="form-group">
                <label>Traits</label>
                <div className="array-input">
                  <input
                    type="text"
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    placeholder="Add new trait"
                  />
                  <button type="button" className="btn btn-sm" onClick={addTrait}>
                    <FiPlus />
                  </button>
                </div>
                <div className="array-items">
                  {formData.traits.map((trait, index) => (
                    <div key={index} className="array-item">
                      {trait}
                      <button 
                        type="button" 
                        className="btn btn-sm btn-remove"
                        onClick={() => removeTrait(trait)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Strengths</label>
                <div className="array-input">
                  <input
                    type="text"
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    placeholder="Add new strength"
                  />
                  <button type="button" className="btn btn-sm" onClick={addStrength}>
                    <FiPlus />
                  </button>
                </div>
                <div className="array-items">
                  {formData.strengths.map((strength, index) => (
                    <div key={index} className="array-item">
                      {strength}
                      <button 
                        type="button" 
                        className="btn btn-sm btn-remove"
                        onClick={() => removeStrength(strength)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Weaknesses</label>
                <div className="array-input">
                  <input
                    type="text"
                    value={newWeakness}
                    onChange={(e) => setNewWeakness(e.target.value)}
                    placeholder="Add new weakness"
                  />
                  <button type="button" className="btn btn-sm" onClick={addWeakness}>
                    <FiPlus />
                  </button>
                </div>
                <div className="array-items">
                  {formData.weaknesses.map((weakness, index) => (
                    <div key={index} className="array-item">
                      {weakness}
                      <button 
                        type="button" 
                        className="btn btn-sm btn-remove"
                        onClick={() => removeWeakness(weakness)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Anime Character Image URL</label>
                <input
                  type="url"
                  name="anime_character_image"
                  value={formData.anime_character_image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Cartoon Character Image URL</label>
                <input
                  type="url"
                  name="cartoon_character_image"
                  value={formData.cartoon_character_image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Famous Star Image URL</label>
                <input
                  type="url"
                  name="famous_star_image"
                  value={formData.famous_star_image}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Animal Image URL</label>
                <input
                  type="url"
                  name="animal_image"
                  value={formData.animal_image}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Question</label>
                <textarea
                  name="question"
                  value={questionFormData.question}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={questionFormData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="personality">Personality</option>
                  <option value="interests">Interests</option>
                  <option value="skills">Skills</option>
                </select>
              </div>

              <div className="form-group">
                <label>Weight (1-5)</label>
                <input
                  type="number"
                  name="weight"
                  value={questionFormData.weight}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  required
                />
              </div>
            </>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentItem ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPersonalityTypes;