import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import './AdminLogin.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    let timeout = setTimeout(() => {
      setIsLoading(false);
      setError('Request timed out. Please try again.');
    }, 10000);

    try {
      await signInWithEmailAndPassword(auth, formData.username, formData.password);
      clearTimeout(timeout);
      navigate('/admin/dashboard');
    } catch (err) {
      clearTimeout(timeout);
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-bg">
      <div className="admin-login-topbar">
        <div></div>
        <Link to="/agent-login" className="admin-login-link">Agent Login?</Link>
      </div>
      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Login</h2>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="username"><FiUser /> Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Enter admin username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password"><FiLock /> Password</label>
            <div className="admin-password-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="admin-pass-toggle"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          {error && <div className="admin-login-error">{error}</div>}
          <button className="admin-login-btn" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Admin Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
