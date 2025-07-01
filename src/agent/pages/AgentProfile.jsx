import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AgentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Online');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    email: '',
    phone: ''
  });

  const { userProfile, updateProfile, updateStatus, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'BS',
        age: userProfile.age || '19 years old',
        dob: userProfile.dateOfBirth || '01/01/2002',
        email: userProfile.email || 'chatapp@email.com',
        phone: userProfile.phoneNumber || '+91 7919101234'
      });
      setSelectedStatus(userProfile.status || 'Online');
    }
  }, [userProfile]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userProfile) {
      setFormData({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'BS',
        age: userProfile.age || '19 years old',
        dob: userProfile.dateOfBirth || '01/01/2002',
        email: userProfile.email || 'chatapp@email.com',
        phone: userProfile.phoneNumber || '+91 7919101234'
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const nameParts = formData.name.split(' ');
    const updateData = {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      age: formData.age,
      dateOfBirth: formData.dob,
      email: formData.email,
      phoneNumber: formData.phone
    };
    const result = await updateProfile(updateData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleStatusChange = async (status) => {
    setSelectedStatus(status);
    await updateStatus(status.toLowerCase());
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/agent-login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <section className="profile-wrapper">
      <header className="profile-header">
        <Link to="/agent/dashboard" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar">
            <span className="avatar-text">{formData.name}</span>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Age:</label>
              <input
                type="text"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>DOB:</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            {!isEditing && (
              <button type="button" className="btn btn-primary" onClick={handleEdit}>
                Edit
              </button>
            )}
          </form>
        </div>

        <div className="status-section">
          <h3>Status</h3>
          <div className="status-options">
            {['Online', 'Idle', 'Offline'].map(status => (
              <button
                key={status}
                className={`status-btn ${selectedStatus === status ? 'active' : ''}`}
                onClick={() => handleStatusChange(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="auth-section">
          <button className="btn btn-primary">Login</button>
          <button className="btn btn-danger" onClick={handleLogoutClick}>
            Log Out
          </button>
        </div>

        {isEditing && (
          <div className="edit-profile-section">
            <h3>Edit Profile Details</h3>
            <div className="edit-actions">
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        )}
      </main>

      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={handleLogoutCancel}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLogoutConfirm}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AgentProfile;
