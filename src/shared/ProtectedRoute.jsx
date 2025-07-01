import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null, fallbackPath = '/agent-login' }) => {
  const { user, userProfile, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="loading-spinner"></div>
        <motion.div 
          className="loading-text"
          animate={{ 
            color: ['#DC143C', '#FFD700', '#FF6347', '#DC143C']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Verifying authentication...
        </motion.div>
      </motion.div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="error-icon"
          animate={{ 
            scale: [1, 1.1, 1],
            color: ['#DC143C', '#FFD700', '#DC143C']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🔐
        </motion.div>
        <div className="error-title">Access Denied</div>
        <div className="error-message">
          You don't have permission to access this area. Required role: {requiredRole}
        </div>
        <div className="error-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Back
          </motion.button>
        </div>
      </motion.div>
    );
  }

  if (userProfile && !userProfile.isActive) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="error-icon"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ⚠️
        </motion.div>
        <div className="error-title">Account Deactivated</div>
        <div className="error-message">
          Your account has been deactivated. Please contact your administrator for assistance.
        </div>
        <div className="error-actions">
          <motion.button 
            className="btn btn-secondary"
            onClick={() => window.location.href = 'mailto:admin@yourdomain.com'}
            whileHover={{ scale: 1.05 }}
          >
            Contact Admin
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default ProtectedRoute;
