import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const AgentDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const { logout } = useAuth();
  const { activeChats, notifications } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    setRecentActivity([
      {
        id: 1,
        icon: '✅',
        text: 'Admin assigned Agent',
        agent: '@Nate',
        user: '@Fin',
        timestamp: '11:20 AM'
      },
      {
        id: 2,
        icon: '➕',
        text: 'Admin added new Agent',
        agent: '@Boots',
        timestamp: '10:45 AM'
      },
      {
        id: 3,
        icon: '✏️',
        text: 'Admin edited login details - Agent',
        agent: '@Storm',
        timestamp: '10:30 AM'
      },
      {
        id: 4,
        icon: '❌',
        text: 'Admin closed the chat - User',
        user: '@Chef',
        timestamp: '10:15 AM'
      }
    ]);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/agent-login');
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="dashboard-container">
      <motion.header 
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-left">
          <motion.h1 
            className="app-logo"
            whileHover={{ scale: 1.05 }}
          >
            💬 Chat App
          </motion.h1>
        </div>
        
        <nav className="header-navigation">
          <motion.button 
            className="nav-button active"
            whileHover={{ scale: 1.05, backgroundColor: '#4a90e2' }}
            whileTap={{ scale: 0.95 }}
          >
            Agents
          </motion.button>
          <motion.button 
            className="nav-button"
            whileHover={{ scale: 1.05, backgroundColor: '#4a90e2' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/agent/notifications')}
          >
            Notifications
          </motion.button>
          <motion.button 
            className="nav-button"
            whileHover={{ scale: 1.05, backgroundColor: '#4a90e2' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/agent/chat')}
          >
            Chat
          </motion.button>
          <motion.button 
            className="nav-button"
            whileHover={{ scale: 1.05, backgroundColor: '#4a90e2' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/agent/profile')}
          >
            Profile
          </motion.button>
          <motion.button 
            className="nav-button logout-button"
            whileHover={{ scale: 1.05, backgroundColor: '#dc3545' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
          >
            Logout
          </motion.button>
        </nav>
      </motion.header>

      <div className="dashboard-layout">
        <motion.aside 
          className="chats-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="panel-header">
            <h2>Chats</h2>
            <div className="chat-filters">
              <motion.button 
                className="filter-button active"
                whileHover={{ backgroundColor: '#4a90e2' }}
              >
                All
              </motion.button>
              <motion.button 
                className="filter-button"
                whileHover={{ backgroundColor: '#4a90e2' }}
              >
                Closed
              </motion.button>
              <motion.button 
                className="filter-button"
                whileHover={{ backgroundColor: '#4a90e2' }}
              >
                Assigned
              </motion.button>
              <motion.button 
                className="filter-button"
                whileHover={{ backgroundColor: '#4a90e2' }}
              >
                Unassigned
              </motion.button>
            </div>
          </div>

          <div className="chats-list">
            {['@hari_911', '@nura_123', '@ramya_dev', '@bala_dev', '@sivani_dev', '@arun_dev', '@yams_dev'].map((chat, index) => (
              <motion.div
                key={chat}
                className={`chat-item ${index === 0 ? 'selected' : ''}`}
                whileHover={{ backgroundColor: '#f8f9fa', x: 5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="chat-details">
                  <span className="chat-name">{chat}</span>
                  <span className="chat-preview">
                    {index === 0 ? '"I need help"' : '"Thank you"'} - {index === 0 ? '11:20 AM' : '10:45 AM'}
                  </span>
                </div>
                {index === 0 && (
                  <motion.div 
                    className="unread-badge"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.aside>

        <motion.main 
          className="activity-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="panel-header">
            <h2>📋 Recent Activity</h2>
          </div>

          <div className="activity-feed">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="activity-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ 
                  scale: 1.02, 
                  backgroundColor: '#f8f9fa',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <motion.span 
                  className="activity-icon"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {activity.icon}
                </motion.span>
                <div className="activity-content">
                  <p className="activity-text">{activity.text}</p>
                  <div className="activity-meta">
                    {activity.agent && (
                      <span className="activity-agent">{activity.agent}</span>
                    )}
                    {activity.user && activity.agent && (
                      <span className="activity-separator"> - User </span>
                    )}
                    {activity.user && (
                      <span className="activity-user">{activity.user}</span>
                    )}
                  </div>
                  <div className="activity-timestamp">{activity.timestamp}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.main>

        <motion.aside 
          className="calendar-panel"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="panel-header">
            <h2>📅 Calendar</h2>
            <p className="calendar-month">{currentMonth.toUpperCase()}</p>
          </div>

          <div className="calendar-widget">
            <div className="calendar-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday-header">{day}</div>
              ))}
            </div>
            
            <div className="calendar-dates">
              {Array.from({length: 30}, (_, i) => i + 1).map(date => (
                <motion.button
                  key={date}
                  className={`calendar-date ${date === 6 ? 'today' : ''} ${date === 12 || date === 25 ? 'selected' : ''}`}
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: '#4a90e2',
                    color: 'white'
                  }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedDate(new Date(2025, 5, date))}
                >
                  {date}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div 
            className="calendar-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p>Select a date</p>
          </motion.div>
        </motion.aside>
      </div>
    </div>
  );
};

export default AgentDashboard;
