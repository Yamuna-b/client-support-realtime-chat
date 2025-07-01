import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children, fallbackPath = '/agent/dashboard' }) => {
  const { user, userProfile, isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner"></div>
        <motion.div 
          className="loading-text"
          animate={{ 
            background: [
              'linear-gradient(45deg, #DC143C, #FFD700)',
              'linear-gradient(45deg, #FFD700, #FF6347)',
              'linear-gradient(45deg, #FF6347, #DC143C)',
              'linear-gradient(45deg, #DC143C, #FFD700)'
            ]
          }}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Checking admin permissions...
        </motion.div>
      </motion.div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin-login" state={{ from: location.pathname }} replace />;
  }

  if (!isAdmin()) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="error-icon"
          animate={{ 
            rotateY: [0, 360],
            color: ['#DC143C', '#FFD700', '#FF6347', '#DC143C']
          }}
          transition={{ 
            rotateY: { duration: 2, repeat: Infinity },
            color: { duration: 3, repeat: Infinity }
          }}
        >
          👑
        </motion.div>
        <div className="error-title">Administrator Access Required</div>
        <div className="error-message">
          This area is restricted to administrators only. You are currently logged in as an agent.
        </div>
        <div className="error-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/agent/dashboard'}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 10px 25px rgba(220, 20, 60, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Agent Dashboard
          </motion.button>
          <motion.button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/admin-login'}
            whileHover={{ scale: 1.05 }}
          >
            Admin Login
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, rotateX: -15 }}
      animate={{ opacity: 1, rotateX: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
    >
      {children}
    </motion.div>
  );
};

export default AdminRoute;
