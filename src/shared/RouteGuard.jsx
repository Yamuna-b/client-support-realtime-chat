import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

const RouteGuard = ({ 
  children, 
  requireAuth = true,
  requireSocket = false,
  requiredRole = null,
  requiredPermissions = [],
  maintenanceMode = false 
}) => {
  const { 
    user, 
    userProfile, 
    isAuthenticated, 
    isLoading, 
    hasPermission,
    getUserPermissions 
  } = useAuth();
  
  const { isConnected, connectionError } = useSocket();

  if (maintenanceMode) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          background: 'linear-gradient(135deg, #FFF5F5, #FFEBCD)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}
      >
        <motion.div 
          className="error-icon"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ fontSize: '4rem', color: '#FFD700' }}
        >
          🔧
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <div className="error-title" style={{ color: '#DC143C', fontSize: '2rem', marginBottom: '1rem' }}>
            System Maintenance
          </div>
          <div className="error-message" style={{ color: '#666', fontSize: '1.1rem' }}>
            Our chat support system is currently undergoing maintenance. 
            Please check back in a few minutes.
          </div>
          <motion.div 
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ 
              marginTop: '20px', 
              color: '#FF6347',
              fontWeight: '600'
            }}
          >
            Expected completion: 15 minutes
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div 
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <motion.div 
          className="loading-spinner"
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(220, 20, 60, 0.1)',
            borderTop: '4px solid #DC143C',
            borderRadius: '50%'
          }}
          animate={{ 
            rotate: 360,
            borderColor: ['#DC143C', '#FFD700', '#FF6347', '#DC143C']
          }}
          transition={{ 
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            borderColor: { duration: 2, repeat: Infinity }
          }}
        />
        <div style={{ marginTop: '1rem', color: '#DC143C', fontWeight: '600' }}>
          Loading secure area...
        </div>
      </motion.div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #FFF5F5, #FFFACD)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div 
            className="error-icon"
            animate={{ 
              y: [0, -10, 0],
              color: ['#DC143C', '#FFD700', '#DC143C']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            🔐
          </motion.div>
          <div style={{ fontSize: '2rem', color: '#DC143C', marginBottom: '1rem', fontWeight: '700' }}>
            Authentication Required
          </div>
          <div style={{ color: '#666', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Please log in to access this area of the chat support system.
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/agent-login'}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #DC143C, #FFD700)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Agent Login
            </motion.button>
            <motion.button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/admin-login'}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#DC143C',
                border: '2px solid #DC143C',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Admin Login
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, rotateY: -90 }}
        animate={{ opacity: 1, rotateY: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #FFF5F5, #FFFACD)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div 
            className="error-icon"
            animate={{ 
              rotateZ: [0, 15, -15, 0],
              color: ['#FF6347', '#FFD700', '#DC143C', '#FF6347']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            ⚡
          </motion.div>
          <div style={{ fontSize: '2rem', color: '#DC143C', marginBottom: '1rem', fontWeight: '700' }}>
            Insufficient Role
          </div>
          <div style={{ color: '#666', fontSize: '1.1rem' }}>
            Your current role ({userProfile?.role || 'none'}) doesn't have access to this area. 
            Required role: {requiredRole}
          </div>
        </div>
      </motion.div>
    );
  }

  if (requiredPermissions.length > 0) {
    const missingPermissions = requiredPermissions.filter(permission => 
      !hasPermission(permission)
    );
    
    if (missingPermissions.length > 0) {
      return (
        <motion.div 
          className="error-boundary"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, #FFF5F5, #FFFACD)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <motion.div 
              className="error-icon"
              animate={{ 
                scale: [1, 1.1, 1],
                color: ['#DC143C', '#FF6347', '#FFD700', '#DC143C']
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ fontSize: '4rem', marginBottom: '1rem' }}
            >
              🚫
            </motion.div>
            <div style={{ fontSize: '2rem', color: '#DC143C', marginBottom: '1rem', fontWeight: '700' }}>
              Insufficient Permissions
            </div>
            <div style={{ color: '#666', marginBottom: '1rem', fontSize: '1.1rem' }}>
              You don't have the required permissions to access this feature.
            </div>
            <div style={{ textAlign: 'left', display: 'inline-block' }}>
              <strong>Missing permissions:</strong>
              <ul style={{ textAlign: 'left', marginTop: '10px', paddingLeft: '20px' }}>
                {missingPermissions.map(permission => (
                  <li key={permission} style={{ color: '#FF6347', marginBottom: '5px' }}>
                    {permission.replace(/_/g, ' ').toUpperCase()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      );
    }
  }

  if (requireSocket && !isConnected) {
    return (
      <motion.div 
        className="error-boundary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'linear-gradient(135deg, #FFF5F5, #FFFACD)'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <motion.div 
            className="error-icon"
            animate={{ 
              rotate: [0, 360],
              color: ['#FFD700', '#FF6347', '#DC143C', '#FFD700']
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity },
              color: { duration: 3, repeat: Infinity }
            }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            📡
          </motion.div>
          <div style={{ fontSize: '2rem', color: '#DC143C', marginBottom: '1rem', fontWeight: '700' }}>
            Connection Required
          </div>
          <div style={{ color: '#666', marginBottom: '1rem', fontSize: '1.1rem' }}>
            This feature requires a real-time connection to the chat server.
            {connectionError && (
              <div style={{ marginTop: '10px', color: '#FF6347', fontSize: '14px' }}>
                Error: {connectionError}
              </div>
            )}
          </div>
          <motion.button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.05 }}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #DC143C, #FFD700)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default RouteGuard;
