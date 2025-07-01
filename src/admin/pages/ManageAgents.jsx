import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ManageAgents = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    email: '',
    username: '',
    password: ''
  });

  const { registerAgent, user } = useAuth();

  useEffect(() => {
    const mockAgents = [
      {
        id: 1,
        name: 'John Doe',
        age: '25',
        dob: '01/15/1999',
        email: 'john@email.com',
        username: 'john_agent',
        status: 'Active'
      },
      {
        id: 2,
        name: 'Jane Smith',
        age: '28',
        dob: '03/22/1996',
        email: 'jane@email.com',
        username: 'jane_agent',
        status: 'Active'
      }
    ];
    setAgents(mockAgents);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      age: agent.age,
      dob: agent.dob,
      email: agent.email,
      username: agent.username,
      password: ''
    });
    setIsEditing(false);
    setIsAdding(false);
  };

  const handleEdit = () => {
    if (selectedAgent) {
      setIsEditing(true);
    }
  };

  const handleRemove = () => {
    if (selectedAgent && window.confirm('Are you sure you want to remove this agent?')) {
      setAgents(agents.filter(agent => agent.id !== selectedAgent.id));
      setSelectedAgent(null);
      setFormData({
        name: '',
        age: '',
        dob: '',
        email: '',
        username: '',
        password: ''
      });
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setIsEditing(false);
    setSelectedAgent(null);
    setFormData({
      name: '',
      age: '',
      dob: '',
      email: '',
      username: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAdding) {
      const result = await registerAgent({
        firstName: formData.name.split(' ')[0],
        lastName: formData.name.split(' ')[1] || '',
        email: formData.email,
        password: formData.password,
        phoneNumber: '',
        department: 'Support'
      }, user);

      if (result.success) {
        const newAgent = {
          id: Date.now(),
          name: formData.name,
          age: formData.age,
          dob: formData.dob,
          email: formData.email,
          username: formData.username,
          status: 'Active'
        };
        setAgents([...agents, newAgent]);
        setIsAdding(false);
        setFormData({
          name: '',
          age: '',
          dob: '',
          email: '',
          username: '',
          password: ''
        });
      }
    } else if (isEditing && selectedAgent) {
      const updatedAgents = agents.map(agent =>
        agent.id === selectedAgent.id
          ? { ...agent, ...formData }
          : agent
      );
      setAgents(updatedAgents);
      setSelectedAgent({ ...selectedAgent, ...formData });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    if (selectedAgent) {
      setFormData({
        name: selectedAgent.name,
        age: selectedAgent.age,
        dob: selectedAgent.dob,
        email: selectedAgent.email,
        username: selectedAgent.username,
        password: ''
      });
    } else {
      setFormData({
        name: '',
        age: '',
        dob: '',
        email: '',
        username: '',
        password: ''
      });
    }
  };

  return (
    <section className="manage-agents-wrapper">
      <header className="manage-agents-header">
        <h1>👥 Agents</h1>
        <Link to="/admin/dashboard" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="manage-agents-content">
        <div className="agents-sidebar">
          <div className="agents-list">
            {agents.map(agent => (
              <div
                key={agent.id}
                className={`agent-list-item ${selectedAgent?.id === agent.id ? 'selected' : ''}`}
                onClick={() => handleAgentSelect(agent)}
              >
                <span className="agent-name">{agent.name}</span>
                <span className="agent-status">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="agent-details-panel">
          <h2>Agent Details</h2>
          
          <form className="agent-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdding}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdding}
              />
            </div>

            <div className="form-group">
              <label htmlFor="dob">DOB:</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdding}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdding}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdding}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={!isEditing && !isAdding}
                placeholder={isEditing ? "Leave blank to keep current password" : ""}
                required={isAdding}
              />
            </div>

            <div className="form-actions">
              {!isEditing && !isAdding && selectedAgent && (
                <>
                  <button type="button" className="btn btn-danger" onClick={handleRemove}>
                    Remove
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleEdit}>
                    Edit
                  </button>
                </>
              )}

              {(isEditing || isAdding) && (
                <>
                  <button type="button" className="btn btn-outline" onClick={handleCancel}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isAdding ? 'ADD' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </form>

          {!isEditing && !isAdding && (
            <div className="add-agent-section">
              <button className="btn btn-primary" onClick={handleAddNew}>
                Add New Agent
              </button>
            </div>
          )}
        </div>
      </main>
    </section>
  );
};

export default ManageAgents;
