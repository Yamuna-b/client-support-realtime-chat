import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiLock, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../config/firebase';
import './AgentLogin.css';

const AgentLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { success, error: err } = await login(
      formData.username.trim(),
      formData.password.trim(),
      'agent',
    );
    setIsLoading(false);
    if (!success) return setError(err || 'Invalid credentials');
    navigate('/agent/dashboard');
  };

  return (
    <div className="agent-login-bg">
      <div className="agent-login-topbar">
        <Link to="/" className="agent-back-btn">
          <FiArrowLeft /> Back
        </Link>
        <Link to="/admin-login" className="agent-admin-link">
          Admin Login
        </Link>
      </div>
      <div className="agent-login-card">
        <header className="login-header">
          <h1 className="login-title agent-title gradient-text">AGENT</h1>
          <p className="login-subtitle">Chat App – Agent Login</p>
        </header>
        <form
          className="agent-login-form"
          onSubmit={handleSubmit}
        >
          <div className="agent-form-group">
            <label htmlFor="username"><FiUser /> Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Enter agent username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="agent-form-group">
            <label htmlFor="password"><FiLock /> Password</label>
            <div className="agent-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter agent password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="agent-pass-toggle"
                onClick={() => setShowPass((s) => !s)}
                tabIndex={-1}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          {error && <div className="agent-login-error">{error}</div>}
          <button
            className="agent-login-btn"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Agent Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentLogin;
