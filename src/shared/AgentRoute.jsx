import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const AgentRoute = ({ children, allowAdmin = true, fallbackPath = '/agent-login' }) => {
  const { user, userProfile, isAuthenticated, isLoading, isAgent, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="loading-spinner"
          animate={{ 
            borderLeftColor: ['#DC143C', '#FFD700', '#FF6347', '#DC143C']
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="loading-text">
          Verifying agent access...
        </div>
      </motion.div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location.pathname }} replace />;
  }

  const hasAccess = isAgent() || (allowAdmin && isAdmin());
  
  if (!hasAccess) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="error-icon"
          animate={{ 
            scale: [1, 1.2, 1],
            color: ['#FF6347', '#FFD700', '#DC143C', '#FF6347']
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          🎧
        </motion.div>
        <div className="error-title">Agent Access Required</div>
        <div className="error-message">
          This area is restricted to support agents. Please log in with an agent account.
        </div>
        <div className="error-actions">
          <motion.button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/agent-login'}
            whileHover={{ 
              scale: 1.05,
              background: 'linear-gradient(135deg, #DC143C, #FFD700)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Agent Login
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {isAdmin() && allowAdmin && (
        <motion.div 
          className="admin-badge"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #FFD700, #FF6347)',
            color: '#000',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
          }}
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginRight: '4px' }}
          >
            👑
          </motion.span>
          Admin View
        </motion.div>
      )}
      {children}
    </motion.div>
  );
};

export default AgentRoute;
