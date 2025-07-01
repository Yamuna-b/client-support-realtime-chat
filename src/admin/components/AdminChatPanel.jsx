import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useChat } from '../../contexts/ChatContext';

const AdminChatPanel = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [chatFilter, setChatFilter] = useState('All');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { chatId } = useParams();
  const { userProfile } = useAuth();
  const { sendMessage, joinChat, assignChat, transferChat } = useSocket();
  const { chats, currentChat, setCurrentChat, getChatMessages, markChatAsRead } = useChat();
  const navigate = useNavigate();

  const [agents] = useState([
    { id: 'agent1', name: '@Red', status: 'Offline', email: 'red@agent.com' },
    { id: 'agent2', name: '@Blue', status: 'Online', email: 'blue@agent.com' },
    { id: 'agent3', name: '@Green', status: 'Assigned', email: 'green@agent.com' },
    { id: 'agent4', name: '@Yellow', status: 'Online', email: 'yellow@agent.com' },
    { id: 'agent5', name: '@Purple', status: 'Busy', email: 'purple@agent.com' }
  ]);

  const filteredChats = chats.filter(chat => {
    switch (chatFilter) {
      case 'Assigned':
        return chat.status === 'assigned';
      case 'Closed':
        return chat.status === 'closed';
      case 'Unassigned':
        return chat.status === 'unassigned';
      default:
        return true;
    }
  });

  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
      const chat = chats.find(c => c.id === chatId);
      if (chat) {
        setCurrentChat(chat);
        setSelectedUser(chat);
        loadChatMessages(chatId);
      }
    }
  }, [chatId, chats, joinChat, setCurrentChat]);

  const loadChatMessages = async (chatId) => {
    try {
      const chatMessages = await getChatMessages(chatId);
      setMessages(chatMessages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;
    
    const result = sendMessage({
      chatId: selectedUser.id,
      message: messageInput,
      type: 'text'
    });
    
    if (result.success) {
      setMessageInput('');
    }
  };

  const handleUserSelect = async (chat) => {
    setSelectedUser(chat);
    setCurrentChat(chat);
    markChatAsRead(chat.id);
    await loadChatMessages(chat.id);
    navigate(`/admin/chat/${chat.id}`);
  };

  const handleAssignAgent = async () => {
    if (selectedAgent && selectedUser) {
      const result = await assignChat(selectedUser.id, selectedAgent);
      if (result.success) {
        setSelectedUser({
          ...selectedUser,
          assignedAgent: selectedAgent,
          status: 'assigned'
        });
      }
    }
  };

  const handleUnassign = async () => {
    if (selectedUser) {
      const result = await assignChat(selectedUser.id, null);
      if (result.success) {
        setSelectedUser({
          ...selectedUser,
          assignedAgent: null,
          status: 'unassigned'
        });
      }
    }
  };

  const handleTransfer = async () => {
    if (selectedAgent && selectedUser && selectedUser.assignedAgent) {
      const result = await transferChat(
        selectedUser.id, 
        selectedUser.assignedAgent, 
        selectedAgent, 
        'Admin transfer'
      );
      if (result.success) {
        setSelectedUser({
          ...selectedUser,
          assignedAgent: selectedAgent
        });
      }
    }
  };

  const handleMarkReviewed = async () => {
    if (selectedUser) {
      console.log('Marking chat as reviewed for user:', selectedUser.customerName);
    }
  };

  const handleCloseChat = async () => {
    if (selectedUser && window.confirm('Are you sure you want to close this chat?')) {
      console.log('Closing chat:', selectedUser.id);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const getAgentName = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    return agent ? agent.name : 'Unassigned';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online': return '#28a745';
      case 'offline': return '#6c757d';
      case 'assigned': return '#ffc107';
      case 'busy': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <section className={`chat-interface-wrapper admin-chat-panel ${isFullScreen ? 'fullscreen' : ''}`}>
      <aside className="chat-sidebar">
        <div className="chat-filters">
          <h3>All Chats (Admin View)</h3>
          <div className="filter-tabs">
            {['All', 'Assigned', 'Closed', 'Unassigned'].map(filter => (
              <button
                key={filter}
                className={`filter-tab ${chatFilter === filter ? 'active' : ''}`}
                onClick={() => setChatFilter(filter)}
              >
                {filter}
                <span className="chat-count">
                  ({filter === 'All' ? chats.length : 
                    chats.filter(chat => {
                      switch (filter) {
                        case 'Assigned': return chat.status === 'assigned';
                        case 'Closed': return chat.status === 'closed';
                        case 'Unassigned': return chat.status === 'unassigned';
                        default: return true;
                      }
                    }).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="user-list">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`user-item ${selectedUser?.id === chat.id ? 'selected' : ''}`}
              onClick={() => handleUserSelect(chat)}
            >
              <div className="user-info">
                <span className="user-name">@{chat.customerName || `User ${chat.id.slice(-4)}`}</span>
                <span className="chat-status">{chat.status}</span>
              </div>
              <div className="chat-meta">
                <span className="assigned-agent">
                  {chat.assignedAgent ? getAgentName(chat.assignedAgent) : 'Unassigned'}
                </span>
                {chat.unreadCount > 0 && (
                  <span className="unread-count">{chat.unreadCount}</span>
                )}
              </div>
            </div>
          ))}
          
          {filteredChats.length === 0 && (
            <div className="no-chats">
              <p>No {chatFilter.toLowerCase()} chats found.</p>
            </div>
          )}
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-header">
          <div className="chat-info">
            <span className="selected-user">
              {selectedUser ? `@${selectedUser.customerName || 'Customer'}` : '@Select a chat'}
            </span>
            {selectedUser && (
              <span className="chat-id">ID: {selectedUser.id.slice(-8)}</span>
            )}
          </div>
          
          <div className="chat-actions">
            <button 
              className="mark-reviewed-btn"
              onClick={handleMarkReviewed}
              disabled={!selectedUser}
              title="Mark as Reviewed"
            >
              ✓ Mark as Reviewed
            </button>
            
            <button 
              className="fullscreen-btn"
              onClick={toggleFullScreen}
              title="Toggle Fullscreen"
            >
              {isFullScreen ? '⊡' : '⊞'}
            </button>
            
            <button 
              className="close-chat-btn"
              onClick={handleCloseChat}
              disabled={!selectedUser}
              title="Close Chat"
            >
              ✖
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {isTyping && (
            <div className="typing-indicator">
              <span>Customer is typing...</span>
            </div>
          )}
          
          {!selectedUser && (
            <div className="no-chat-selected">
              <h3>💬 Admin Chat Management</h3>
              <p>Select a chat from the sidebar to begin managing customer conversations.</p>
              <div className="admin-stats">
                <div className="stat">
                  <span className="stat-label">Total Chats:</span>
                  <span className="stat-value">{chats.length}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Unassigned:</span>
                  <span className="stat-value">
                    {chats.filter(c => c.status === 'unassigned').length}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Active:</span>
                  <span className="stat-value">
                    {chats.filter(c => c.status === 'assigned').length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedUser && messages.length === 0 && (
            <div className="no-messages">
              <p>No messages in this conversation yet...</p>
              <small>Chat created: {selectedUser.createdAt?.toLocaleString()}</small>
            </div>
          )}

          {selectedUser && messages.length > 0 && (
            <div className="message-history">
              {messages.map((message, index) => (
                <div 
                  key={message.id || index} 
                  className={`message ${message.senderRole === 'customer' ? 'customer' : 'agent'}`}
                >
                  <div className="message-avatar">
                    {message.senderRole === 'customer' ? '👤' : '👨‍💼'}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {message.senderName || (message.senderRole === 'customer' ? 'Customer' : 'Agent')}
                      </span>
                      <span className="message-time">
                        {message.timestamp?.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="message-text">{message.content || message.text}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={selectedUser ? "Type your admin message..." : "Select a chat to send messages"}
            disabled={!selectedUser}
          />
          <button type="button" className="emoji-btn" disabled={!selectedUser}>😊</button>
          <button type="submit" className="send-btn" disabled={!selectedUser || !messageInput.trim()}>
            ▶
          </button>
        </form>
      </main>

      <aside className="agent-panel admin-panel">
        <div className="agent-controls">
          <h3>👑 Admin Controls</h3>
          
          {selectedUser && (
            <div className="chat-details">
              <div className="detail-item">
                <label>Customer:</label>
                <span>{selectedUser.customerName || 'Anonymous'}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge ${selectedUser.status}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div className="detail-item">
                <label>Current Agent:</label>
                <span>{selectedUser.assignedAgent ? getAgentName(selectedUser.assignedAgent) : 'Unassigned'}</span>
              </div>
              <div className="detail-item">
                <label>Created:</label>
                <span>{selectedUser.createdAt?.toLocaleDateString()}</span>
              </div>
            </div>
          )}
          
          <div className="agent-selector">
            <label htmlFor="agent-select">Assign to Agent:</label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Choose agent...</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id} disabled={agent.status === 'Offline'}>
                  {agent.name} ({agent.status})
                </option>
              ))}
            </select>
          </div>

          <div className="agent-actions">
            <button 
              className="assign-btn"
              onClick={handleAssignAgent}
              disabled={!selectedAgent || !selectedUser}
              title="Assign chat to selected agent"
            >
              📋 Assign
            </button>
            <button 
              className="unassign-btn"
              onClick={handleUnassign}
              disabled={!selectedUser || !selectedUser.assignedAgent}
              title="Remove agent assignment"
            >
              ❌ Unassign
            </button>
            <button 
              className="transfer-btn"
              onClick={handleTransfer}
              disabled={!selectedAgent || !selectedUser || !selectedUser.assignedAgent}
              title="Transfer to selected agent"
            >
              🔄 Transfer
            </button>
          </div>
        </div>

        <div className="agents-list">
          <h4>🎧 All Agents</h4>
          <div className="agents-grid">
            {agents.map(agent => (
              <div key={agent.id} className="agent-item">
                <div className="agent-info">
                  <span className="agent-name">{agent.name}</span>
                  <span className="agent-email">{agent.email}</span>
                </div>
                <span 
                  className="agent-status" 
                  style={{ color: getStatusColor(agent.status) }}
                >
                  ● {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-tools">
          <h4>🛠 Admin Tools</h4>
          <div className="tool-buttons">
            <button 
              className="manage-agents-btn"
              onClick={() => navigate('/admin/agents')}
            >
              👥 Manage Agents
            </button>
            <button 
              className="analytics-btn"
              onClick={() => navigate('/admin/analytics')}
            >
              📊 View Analytics
            </button>
            <button 
              className="export-btn"
              disabled={!selectedUser}
              onClick={() => console.log('Export chat:', selectedUser?.id)}
            >
              💾 Export Chat
            </button>
          </div>
        </div>
      </aside>
    </section>
  );
};

export default AdminChatPanel;
