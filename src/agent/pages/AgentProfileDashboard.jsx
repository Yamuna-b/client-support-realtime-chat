import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AgentProfileDashboard = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    email: '',
    username: '',
    password: ''
  });

  const { userProfile, updateProfile } = useAuth();

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'BS',
        age: userProfile.age || '19 years old',
        dob: userProfile.dateOfBirth || '01/01/2006',
        email: userProfile.email || 'bala@email.com',
        username: userProfile.username || '',
        password: ''
      });
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
        dob: userProfile.dateOfBirth || '01/01/2006',
        email: userProfile.email || 'bala@email.com',
        username: userProfile.username || '',
        password: ''
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
      email: formData.email
    };
    const result = await updateProfile(updateData);
    if (result.success) {
      setIsEditing(false);
    }
  };

  return (
    <section className="profile-dashboard-wrapper">
      <header className="profile-dashboard-header">
        <h1>Profile Dashboard</h1>
        <Link to="/agent/dashboard" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="profile-dashboard-content">
        <div className="profile-info-section">
          <div className="profile-avatar">
            <span className="avatar-initials">{formData.name}</span>
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
              <label>Username:</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={true}
                title="Username can only be changed by admin"
              />
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={true}
                placeholder="Password can only be changed by admin"
                title="Password can only be changed by admin"
              />
            </div>

            <div className="form-actions">
              {!isEditing && (
                <button type="button" className="btn btn-primary" onClick={handleEdit}>
                  EDIT
                </button>
              )}

              {isEditing && (
                <>
                  <button type="button" className="btn btn-outline" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        <div className="agent-overview-section">
          <h2>👥 Agent Overview</h2>
          <div className="overview-stats">
            <div className="stat-item">
              <span className="stat-label">Chats Handled:</span>
              <span className="stat-value">24</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Response Time:</span>
              <span className="stat-value">2.3 minutes</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Customer Rating:</span>
              <span className="stat-value">4.8/5</span>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h2>📈 Activity Analytics</h2>
          <div className="analytics-placeholder">
            <p>(Graph Placeholder)</p>
          </div>
          <div className="analytics-summary">
            <div className="summary-item">
              <span className="summary-label">Today's Activity:</span>
              <span className="summary-value">5 chats</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">This Week:</span>
              <span className="summary-value">28 chats</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">This Month:</span>
              <span className="summary-value">112 chats</span>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default AgentProfileDashboard;
