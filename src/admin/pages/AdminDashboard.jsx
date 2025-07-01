import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalChats: 0,
    activeAgents: 0,
    unreadMessages: 0,
    resolvedToday: 0
  });
  const [systemActivity, setSystemActivity] = useState([]);
  const { logout } = useAuth();
  const { activeChats, notifications } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    setStats({
      totalChats: 42,
      activeAgents: 8,
      unreadMessages: 15,
      resolvedToday: 23
    });

    setSystemActivity([
      {
        id: 1,
        icon: '👑',
        text: 'System Performance Report Generated',
        detail: 'Daily analytics ready for review',
        timestamp: '2 minutes ago',
        type: 'system'
      },
      {
        id: 2,
        icon: '👨‍💼',
        text: 'New Agent Registration',
        detail: 'Agent @Storm added to support team',
        timestamp: '15 minutes ago',
        type: 'agent'
      },
      {
        id: 3,
        icon: '⚠️',
        text: 'High Volume Alert',
        detail: '12 unassigned chats require attention',
        timestamp: '30 minutes ago',
        type: 'alert'
      },
      {
        id: 4,
        icon: '📊',
        text: 'Customer Satisfaction Score Updated',
        detail: 'Current rating: 4.7/5 stars (↑0.2)',
        timestamp: '1 hour ago',
        type: 'metric'
      }
    ]);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard-container">
      <motion.header 
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="admin-header-left">
          <motion.h1 
            className="admin-logo"
            whileHover={{ scale: 1.05 }}
          >
            👑 Admin Dashboard
          </motion.h1>
        </div>
        
        <nav className="admin-navigation">
          <motion.button 
            className="admin-nav-btn active"
            whileHover={{ scale: 1.05, backgroundColor: '#dc143c' }}
          >
            Dashboard
          </motion.button>
          <motion.button 
            className="admin-nav-btn"
            whileHover={{ scale: 1.05, backgroundColor: '#dc143c' }}
            onClick={() => navigate('/admin/profile')}
          >
            Profile
          </motion.button>
          <motion.button 
            className="admin-nav-btn"
            whileHover={{ scale: 1.05, backgroundColor: '#dc143c' }}
            onClick={() => navigate('/admin/agents')}
          >
            Profile Dashboard
          </motion.button>
          <motion.button 
            className="admin-nav-btn"
            whileHover={{ scale: 1.05, backgroundColor: '#dc143c' }}
            onClick={() => navigate('/admin/notifications')}
          >
            Notifications
          </motion.button>
          <motion.button 
            className="admin-nav-btn"
            whileHover={{ scale: 1.05, backgroundColor: '#dc143c' }}
            onClick={() => navigate('/admin/chat')}
          >
            Chat
          </motion.button>
          <motion.button 
            className="admin-nav-btn admin-logout"
            whileHover={{ scale: 1.05, backgroundColor: '#dc3545' }}
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        </nav>
      </motion.header>

      <motion.section 
        className="admin-stats-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="stats-grid">
          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="stat-icon"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              💬
            </motion.div>
            <div className="stat-info">
              <motion.h3
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stats.totalChats}
              </motion.h3>
              <p>Total Chats</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div 
              className="stat-icon"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              👥
            </motion.div>
            <div className="stat-info">
              <h3>{stats.activeAgents}</h3>
              <p>Active Agents</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="stat-icon"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              📨
            </motion.div>
            <div className="stat-info">
              <h3>{stats.unreadMessages}</h3>
              <p>Unread Messages</p>
            </div>
          </motion.div>

          <motion.div 
            className="stat-card"
            whileHover={{ scale: 1.05, y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="stat-icon"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              ✅
            </motion.div>
            <div className="stat-info">
              <h3>{stats.resolvedToday}</h3>
              <p>Resolved Today</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="admin-content-layout">
        <motion.section 
          className="quick-actions-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <h2>🚀 Quick Actions</h2>
          <div className="actions-grid">
            <motion.button 
              className="action-button"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: '#4a90e2',
                boxShadow: '0 8px 20px rgba(74, 144, 226, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/agents')}
            >
              <span className="action-icon">👥</span>
              <span className="action-text">Manage Agents</span>
            </motion.button>
            
            <motion.button 
              className="action-button"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: '#28a745',
                boxShadow: '0 8px 20px rgba(40, 167, 69, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/chat')}
            >
              <span className="action-icon">💬</span>
              <span className="action-text">Monitor Chats</span>
            </motion.button>
            
            <motion.button 
              className="action-button"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: '#ffc107',
                boxShadow: '0 8px 20px rgba(255, 193, 7, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/analytics')}
            >
              <span className="action-icon">📊</span>
              <span className="action-text">View Analytics</span>
            </motion.button>
            
            <motion.button 
              className="action-button"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: '#17a2b8',
                boxShadow: '0 8px 20px rgba(23, 162, 184, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/settings')}
            >
              <span className="action-icon">⚙️</span>
              <span className="action-text">System Settings</span>
            </motion.button>
          </div>
        </motion.section>

        <motion.section 
          className="system-activity-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2>📋 System Activity</h2>
          <div className="activity-feed">
            {systemActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                className={`system-activity-item ${activity.type}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: '#f8f9fa',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.1)'
                }}
              >
                <motion.span 
                  className="system-activity-icon"
                  whileHover={{ scale: 1.3, rotate: 15 }}
                >
                  {activity.icon}
                </motion.span>
                <div className="system-activity-content">
                  <p className="system-activity-text">{activity.text}</p>
                  <p className="system-activity-detail">{activity.detail}</p>
                  <div className="system-activity-timestamp">{activity.timestamp}</div>
                </div>
                <motion.div 
                  className={`activity-type-indicator ${activity.type}`}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default AdminDashboard;
