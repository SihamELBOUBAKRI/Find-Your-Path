import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import ConfirmForm from '../pages/alerts/ConfirmForm';
import SuccessAlert from '../pages/alerts/SuccessAlert';
import ErrorAlert from '../pages/alerts/ErrorAlert';
import PageLoading from '../pages/loading/loading';
import '../assets/styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch users on component mount and when filters change
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = {};
        if (roleFilter !== 'all') params.role = roleFilter;
        if (searchTerm) params.search = searchTerm;
        
        const response = await api.get('/users', { params });
        setUsers(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [roleFilter, searchTerm]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setSuccess(`User ${userToDelete.name} deleted successfully`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user');
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSuccess('User role updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/users/${userId}`, { status: newStatus });
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setSuccess('User status updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading && users.length === 0) return <PageLoading text="Loading users..." />;

  return (
    <div className="admin-users-container">
      <div className="admin-users-header">
        <h1>User Management</h1>
        <button 
          className="add-user-btn"
          onClick={() => navigate('/admin/users/create')}
        >
          Add New User
        </button>
      </div>

      <div className="users-filters">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="role-filter">
          <label>Filter by Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="mentor">Mentors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {success && <SuccessAlert message={success} onClose={() => setSuccess(null)} />}

      {filteredUsers.length === 0 ? (
        <div className="no-users">
          No users found matching your criteria
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Personality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-info">
                      {user.avatar && (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="user-avatar"
                        />
                      )}
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.status || 'active'}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td>
                    {user.personality_type_id ? (
                      <span className="personality-badge">
                        {user.personalityType?.name || 'Unknown'}
                      </span>
                    ) : (
                      <span className="no-personality">Not set</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        View
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteClick(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteConfirm && (
        <ConfirmForm
          title="Confirm Deletion"
          message={`Are you sure you want to delete user ${userToDelete?.name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Delete User"
          cancelText="Cancel"
        />
      )}
    </div>
  );
};

export default AdminUsers;