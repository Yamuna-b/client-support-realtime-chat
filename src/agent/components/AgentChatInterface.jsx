import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const AgentChatInterface = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [chatFilter, setChatFilter] = useState('All');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const { chatId } = useParams();
  const { userProfile } = useAuth();
  const { sendMessage, joinChat, assignChat, transferChat } = useSocket();
  const navigate = useNavigate();

  const [agents] = useState([
    { id: 'red', name: '@Red', status: 'Offline' },
    { id: 'blue', name: '@Blue', status: 'Online' },
    { id: 'green', name: '@Green', status: 'Assigned' }
  ]);

  const [users] = useState([
    { id: 1, name: 'User 1', hasNewMessage: true },
    { id: 2, name: 'User 2', hasNewMessage: false },
    { id: 3, name: 'User 3', hasNewMessage: false }
  ]);

  useEffect(() => {
    if (chatId) {
      joinChat(chatId);
    }
  }, [chatId, joinChat]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUser) return;
    
    sendMessage({
      chatId: selectedUser.id,
      message: messageInput,
      type: 'text'
    });
    
    setMessageInput('');
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleAssignAgent = () => {
    if (selectedAgent && selectedUser) {
      assignChat(selectedUser.id, selectedAgent);
    }
  };

  const handleUnassign = () => {
    if (selectedUser) {
      assignChat(selectedUser.id, null);
    }
  };

  const handleTransfer = () => {
    if (selectedAgent && selectedUser) {
      transferChat(selectedUser.id, userProfile.uid, selectedAgent, 'Manual transfer');
    }
  };

  const handleMarkReviewed = () => {
    if (selectedUser) {
      console.log('Marking chat as reviewed for user:', selectedUser.name);
    }
  };

  return (
    <section className="chat-interface-wrapper">
      <aside className="chat-sidebar">
        <div className="chat-filters">
          <h3>Chats</h3>
          <div className="filter-tabs">
            {['All', 'Assigned', 'Closed', 'Unassigned'].map(filter => (
              <button
                key={filter}
                className={`filter-tab ${chatFilter === filter ? 'active' : ''}`}
                onClick={() => setChatFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="user-list">
          {users.map(user => (
            <div
              key={user.id}
              className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
              onClick={() => handleUserSelect(user)}
            >
              <span className="user-name">@{user.name}</span>
              {user.hasNewMessage && <span className="new-message-indicator">●</span>}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-main">
        <div className="chat-header">
          <span className="selected-user">
            {selectedUser ? `@${selectedUser.name}` : '@Select a user'}
          </span>
          <button 
            className="mark-reviewed-btn"
            onClick={handleMarkReviewed}
            disabled={!selectedUser}
          >
            Mark as Reviewed
          </button>
          <button className="close-chat-btn">✖</button>
        </div>

        <div className="chat-messages">
          {isTyping && (
            <div className="typing-indicator">
              <span>Typing...</span>
            </div>
          )}
          
          {!selectedUser && (
            <div className="no-chat-selected">
              <p>No messages yet...</p>
            </div>
          )}

          {selectedUser && messages.length === 0 && (
            <div className="no-messages">
              <p>No messages yet...</p>
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="message-input"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type your message..."
            disabled={!selectedUser}
          />
          <button type="button" className="emoji-btn">😊</button>
          <button type="submit" className="send-btn" disabled={!selectedUser}>
            ▶
          </button>
        </form>
      </main>

      <aside className="agent-panel">
        <div className="agent-controls">
          <h3>Agent Panel</h3>
          
          <div className="agent-selector">
            <label htmlFor="agent-select">Select Agent</label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
            >
              <option value="">Choose agent...</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="agent-actions">
            <button 
              className="assign-btn"
              onClick={handleAssignAgent}
              disabled={!selectedAgent || !selectedUser}
            >
              Assign
            </button>
            <button 
              className="unassign-btn"
              onClick={handleUnassign}
              disabled={!selectedUser}
            >
              Unassign
            </button>
            <button 
              className="transfer-btn"
              onClick={handleTransfer}
              disabled={!selectedAgent || !selectedUser}
            >
              Transfer
            </button>
          </div>
        </div>

        <div className="agents-list">
          <h4>Agents</h4>
          {agents.map(agent => (
            <div key={agent.id} className="agent-item">
              <span className="agent-name">{agent.name}</span>
              <span className={`agent-status status-${agent.status.toLowerCase()}`}>
                ● {agent.status}
              </span>
            </div>
          ))}
        </div>

        <div className="manage-agents-link">
          <button 
            className="manage-agents-btn"
            onClick={() => navigate('/admin/agents')}
          >
            Manage Agents
          </button>
        </div>
      </aside>
    </section>
  );
};

export default AgentChatInterface;
