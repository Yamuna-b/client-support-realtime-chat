import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';

const AgentNotifications = () => {
  const { notifications, markNotificationAsRead } = useSocket();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (notifications.length) {
      setItems(notifications);
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
        },
      ]);
    }
  }, [notifications]);

  return (
    <section className="notifications-wrapper agent-notifications">
      <header className="notifications-header">
        <h2>🔔 Notifications</h2>
        <Link to="/agent/dashboard" className="btn btn-outline">
          ← Back to Dashboard
        </Link>
      </header>

      <main className="notifications-content">
        {items.map((n) => (
          <div
            key={n.id}
            className={`notification-item ${n.read ? 'read' : 'unread'}`}
            onClick={() => markNotificationAsRead(n.id)}
          >
            <span className="notif-icon">{n.icon}</span>
            <div className="notif-body">
              <strong>{n.label}</strong> – {n.tag}
              <div className="notif-meta">{n.meta1}</div>
              <div className="notif-meta">{n.meta2}</div>
              {n.meta3 && <div className="notif-meta">{n.meta3}</div>}
              {n.meta4 && <div className="notif-meta">{n.meta4}</div>}
            </div>
          </div>
        ))}

        {!items.length && (
          <div className="no-notifications">No notifications right now.</div>
        )}
      </main>
    </section>
  );
};

export default AgentNotifications;
