import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminProfile = () => {
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
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Admin',
        age: userProfile.age || '35 years old',
        dob: userProfile.dateOfBirth || '01/01/1990',
        email: userProfile.email || 'admin@chatapp.com',
        phone: userProfile.phoneNumber || '+91 9876543210'
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
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'Admin',
        age: userProfile.age || '35 years old',
        dob: userProfile.dateOfBirth || '01/01/1990',
        email: userProfile.email || 'admin@chatapp.com',
        phone: userProfile.phoneNumber || '+91 9876543210'
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
    navigate('/admin-login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <section className="profile-wrapper admin-profile">
      <header className="profile-header">
        <Link to="/admin/dashboard" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="profile-content">
        <div className="profile-info">
          <div className="profile-avatar admin-avatar">
            <span className="avatar-text">{formData.name}</span>
            <div className="admin-badge">👑</div>
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

        <div className="status-section admin-status">
          <h3>👑 Admin Status</h3>
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
          <div className="admin-privileges">
            <p>✓ Full system access</p>
            <p>✓ Agent management</p>
            <p>✓ Analytics & reports</p>
            <p>✓ System configuration</p>
          </div>
        </div>

        <div className="admin-tools-section">
          <h3>🛠 Quick Admin Tools</h3>
          <div className="tool-grid">
            <Link to="/admin/agents" className="tool-card">
              <span className="tool-icon">👥</span>
              <span className="tool-name">Manage Agents</span>
            </Link>
            <Link to="/admin/chat" className="tool-card">
              <span className="tool-icon">💬</span>
              <span className="tool-name">Monitor Chats</span>
            </Link>
            <Link to="/admin/analytics" className="tool-card">
              <span className="tool-icon">📊</span>
              <span className="tool-name">View Analytics</span>
            </Link>
            <Link to="/admin/settings" className="tool-card">
              <span className="tool-icon">⚙️</span>
              <span className="tool-name">System Settings</span>
            </Link>
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
              <h3>Confirm Admin Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to log out of the admin panel?</p>
              <p><small>All active admin sessions will be terminated.</small></p>
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

export default AdminProfile;
