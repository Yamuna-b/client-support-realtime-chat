import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminNotifications = () => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useSocket();
  const { userProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (notifications.length) {
      const adminNotifications = notifications.map(notif => ({
        ...notif,
        isSystemNotification: notif.type === 'system' || notif.type === 'admin'
      }));
      setItems(adminNotifications);
    } else {
      setItems([
        {
          id: 1,
          icon: '🧑💻',
          label: 'Chana',
          tag: 'New User',
          meta1: 'Agent assigned',
          meta2: '@Blue-User ➡ @John',
          meta3: 'Agent transfer',
          meta4: '@Cool to @Blue-User ➡ @John',
          type: 'assignment',
          timestamp: new Date(),
          read: false
        },
        {
          id: 2,
          icon: '⚠️',
          label: 'System',
          tag: 'Alert',
          meta1: 'High chat volume detected',
          meta2: '15 unassigned chats',
          meta3: 'Consider adding more agents',
          meta4: '',
          type: 'system',
          timestamp: new Date(Date.now() - 300000),
          read: false
        },
        {
          id: 3,
          icon: '👨‍💼',
          label: 'Agent Storm',
          tag: 'Status Change',
          meta1: 'Agent went offline',
          meta2: '3 chats transferred to @Blue',
          meta3: 'Automatic reassignment',
          meta4: '',
          type: 'agent',
          timestamp: new Date(Date.now() - 600000),
          read: true
        },
        {
          id: 4,
          icon: '📊',
          label: 'Analytics',
          tag: 'Report Ready',
          meta1: 'Daily performance report generated',
          meta2: 'Response time: 2.1 minutes avg',
          meta3: 'Customer satisfaction: 4.7/5',
          meta4: 'View full report in dashboard',
          type: 'system',
          timestamp: new Date(Date.now() - 900000),
          read: false
        }
      ]);
    }
  }, [notifications]);

  const filteredItems = items.filter(item => {
    switch (filter) {
      case 'unread':
        return !item.read;
      case 'system':
        return item.type === 'system' || item.type === 'admin';
      case 'agent':
        return item.type === 'agent' || item.type === 'assignment';
      case 'chat':
        return item.type === 'message' || item.type === 'transfer';
      default:
        return true;
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
      setItems(items.map(item => 
        item.id === notification.id ? { ...item, read: true } : item
      ));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearAllNotifications();
      setItems([]);
    }
  };

  const unreadCount = filteredItems.filter(item => !item.read).length;

  return (
    <section className="notifications-wrapper admin-notifications">
      <header className="notifications-header">
        <h2>🔔 Admin Notifications</h2>
        
        <div className="notification-controls">
          <div className="notification-stats">
            <span className="total-count">Total: {filteredItems.length}</span>
            <span className="unread-count">Unread: {unreadCount}</span>
          </div>
          
          <div className="notification-filters">
            {['all', 'unread', 'system', 'agent', 'chat'].map(filterType => (
              <button
                key={filterType}
                className={`filter-btn ${filter === filterType ? 'active' : ''}`}
                onClick={() => setFilter(filterType)}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="notification-actions">
            <button 
              className="btn btn-outline clear-all-btn"
              onClick={handleClearAll}
              disabled={items.length === 0}
            >
              Clear All
            </button>
            <Link to="/admin/dashboard" className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="notifications-content">
        {filteredItems.length === 0 && (
          <div className="no-notifications">
            <div className="no-notifications-icon">📭</div>
            <h3>No {filter !== 'all' ? filter : ''} notifications</h3>
            <p>
              {filter === 'all' 
                ? 'All caught up! No notifications right now.' 
                : `No ${filter} notifications at the moment.`}
            </p>
          </div>
        )}

        {filteredItems.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.type || ''}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <span className="notif-icon">{notification.icon}</span>

            <div className="notif-body">
              <div className="notif-header">
                <strong>{notification.label}</strong> – {notification.tag}
                <span className="notif-timestamp">
                  {notification.timestamp ? 
                    new Date(notification.timestamp).toLocaleTimeString() : 
                    'Just now'
                  }
                </span>
              </div>
              
              <div className="notif-content">
                {notification.meta1 && (
                  <div className="notif-meta primary">{notification.meta1}</div>
                )}
                {notification.meta2 && (
                  <div className="notif-meta secondary">{notification.meta2}</div>
                )}
                {notification.meta3 && (
                  <div className="notif-meta tertiary">{notification.meta3}</div>
                )}
                {notification.meta4 && (
                  <div className="notif-meta quaternary">{notification.meta4}</div>
                )}
              </div>

              {notification.type && (
                <div className="notif-type-badge">
                  <span className={`type-badge ${notification.type}`}>
                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {!notification.read && (
              <div className="unread-indicator">●</div>
            )}
          </div>
        ))}
      </main>

      {filteredItems.length > 0 && (
        <footer className="notifications-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">System Alerts:</span>
              <span className="stat-value">
                {items.filter(item => item.type === 'system').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Agent Activities:</span>
              <span className="stat-value">
                {items.filter(item => item.type === 'agent' || item.type === 'assignment').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Chat Events:</span>
              <span className="stat-value">
                {items.filter(item => item.type === 'message' || item.type === 'transfer').length}
              </span>
            </div>
          </div>
        </footer>
      )}
    </section>
  );
};

export default AdminNotifications;
