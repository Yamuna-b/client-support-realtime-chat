import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const initialState = {
  socket: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  activeChats: [],
  onlineUsers: {},
  typingUsers: {},
  notifications: [],
  agentStatus: {},
  connectionAttempts: 0,
  lastConnectionTime: null,
  messageQueue: []
};

const SOCKET_ACTIONS = {
  SET_SOCKET: 'SET_SOCKET',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_CONNECTING: 'SET_CONNECTING',
  SET_CONNECTION_ERROR: 'SET_CONNECTION_ERROR',
  UPDATE_ACTIVE_CHATS: 'UPDATE_ACTIVE_CHATS',
  UPDATE_ONLINE_USERS: 'UPDATE_ONLINE_USERS',
  UPDATE_TYPING_USERS: 'UPDATE_TYPING_USERS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  UPDATE_AGENT_STATUS: 'UPDATE_AGENT_STATUS',
  INCREMENT_CONNECTION_ATTEMPTS: 'INCREMENT_CONNECTION_ATTEMPTS',
  RESET_CONNECTION_ATTEMPTS: 'RESET_CONNECTION_ATTEMPTS',
  SET_LAST_CONNECTION_TIME: 'SET_LAST_CONNECTION_TIME',
  ADD_TO_MESSAGE_QUEUE: 'ADD_TO_MESSAGE_QUEUE',
  CLEAR_MESSAGE_QUEUE: 'CLEAR_MESSAGE_QUEUE',
  RESET_SOCKET: 'RESET_SOCKET'
};

const socketReducer = (state, action) => {
  switch (action.type) {
    case SOCKET_ACTIONS.SET_SOCKET:
      return {
        ...state,
        socket: action.payload
      };
    case SOCKET_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload,
        isConnecting: false,
        connectionError: null,
        connectionAttempts: action.payload ? 0 : state.connectionAttempts,
        lastConnectionTime: action.payload ? new Date() : state.lastConnectionTime
      };
    case SOCKET_ACTIONS.SET_CONNECTING:
      return {
        ...state,
        isConnecting: action.payload
      };
    case SOCKET_ACTIONS.SET_CONNECTION_ERROR:
      return {
        ...state,
        connectionError: action.payload,
        isConnected: false,
        isConnecting: false
      };
    case SOCKET_ACTIONS.UPDATE_ACTIVE_CHATS:
      return {
        ...state,
        activeChats: action.payload
      };
    case SOCKET_ACTIONS.UPDATE_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: { ...state.onlineUsers, ...action.payload }
      };
    case SOCKET_ACTIONS.UPDATE_TYPING_USERS:
      return {
        ...state,
        typingUsers: { ...state.typingUsers, ...action.payload }
      };
    case SOCKET_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50)
      };
    case SOCKET_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    case SOCKET_ACTIONS.UPDATE_AGENT_STATUS:
      return {
        ...state,
        agentStatus: { ...state.agentStatus, ...action.payload }
      };
    case SOCKET_ACTIONS.INCREMENT_CONNECTION_ATTEMPTS:
      return {
        ...state,
        connectionAttempts: state.connectionAttempts + 1
      };
    case SOCKET_ACTIONS.RESET_CONNECTION_ATTEMPTS:
      return {
        ...state,
        connectionAttempts: 0
      };
    case SOCKET_ACTIONS.SET_LAST_CONNECTION_TIME:
      return {
        ...state,
        lastConnectionTime: action.payload
      };
    case SOCKET_ACTIONS.ADD_TO_MESSAGE_QUEUE:
      return {
        ...state,
        messageQueue: [...state.messageQueue, action.payload]
      };
    case SOCKET_ACTIONS.CLEAR_MESSAGE_QUEUE:
      return {
        ...state,
        messageQueue: []
      };
    case SOCKET_ACTIONS.RESET_SOCKET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

export const SocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(socketReducer, initialState);
  const { user, userProfile, isAuthenticated } = useAuth();

  const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://localhost:3001';
  const MAX_RECONNECTION_ATTEMPTS = 5;
  const RECONNECTION_DELAY = 2000;

  const initializeSocket = useCallback(() => {
    if (!isAuthenticated || !user || state.socket) {
      return;
    }
    try {
      dispatch({ type: SOCKET_ACTIONS.SET_CONNECTING, payload: true });
      const socketOptions = {
        auth: {
          token: user.accessToken,
          userId: user.uid,
          userRole: userProfile?.role || 'agent',
          userEmail: user.email
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      };
      const newSocket = io(SOCKET_SERVER_URL, socketOptions);
      newSocket.on('connect', () => {
        console.log('🔌 Socket connected successfully');
        dispatch({ type: SOCKET_ACTIONS.SET_SOCKET, payload: newSocket });
        dispatch({ type: SOCKET_ACTIONS.SET_CONNECTED, payload: true });
        dispatch({ type: SOCKET_ACTIONS.RESET_CONNECTION_ATTEMPTS });
        sendQueuedMessages(newSocket);
        joinUserRooms(newSocket);
      });
      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        dispatch({ type: SOCKET_ACTIONS.SET_CONNECTION_ERROR, payload: error.message });
        dispatch({ type: SOCKET_ACTIONS.INCREMENT_CONNECTION_ATTEMPTS });
        if (state.connectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
          setTimeout(() => {
            if (!state.isConnected) {
              initializeSocket();
            }
          }, RECONNECTION_DELAY * (state.connectionAttempts + 1));
        }
      });
      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        dispatch({ type: SOCKET_ACTIONS.SET_CONNECTED, payload: false });
        if (reason === 'io server disconnect') {
          setTimeout(initializeSocket, RECONNECTION_DELAY);
        }
      });
      newSocket.on('message_received', (messageData) => {
        handleMessageReceived(messageData);
      });
      newSocket.on('message_sent', (messageData) => {
        handleMessageSent(messageData);
      });
      newSocket.on('user_typing', (typingData) => {
        handleUserTyping(typingData);
      });
      newSocket.on('user_stopped_typing', (typingData) => {
        handleUserStoppedTyping(typingData);
      });
      newSocket.on('user_online', (userData) => {
        dispatch({
          type: SOCKET_ACTIONS.UPDATE_ONLINE_USERS,
          payload: { [userData.userId]: { ...userData, isOnline: true } }
        });
      });
      newSocket.on('user_offline', (userData) => {
        dispatch({
          type: SOCKET_ACTIONS.UPDATE_ONLINE_USERS,
          payload: { [userData.userId]: { ...userData, isOnline: false } }
        });
      });
      newSocket.on('agent_status_changed', (statusData) => {
        dispatch({
          type: SOCKET_ACTIONS.UPDATE_AGENT_STATUS,
          payload: { [statusData.agentId]: statusData }
        });
      });
      newSocket.on('chat_assigned', (assignmentData) => {
        handleChatAssigned(assignmentData);
      });
      newSocket.on('chat_transferred', (transferData) => {
        handleChatTransferred(transferData);
      });
      newSocket.on('notification', (notificationData) => {
        const notification = {
          id: Date.now(),
          ...notificationData,
          timestamp: new Date(),
          read: false
        };
        dispatch({ type: SOCKET_ACTIONS.ADD_NOTIFICATION, payload: notification });
      });
      newSocket.on('active_chats_updated', (chatsData) => {
        dispatch({ type: SOCKET_ACTIONS.UPDATE_ACTIVE_CHATS, payload: chatsData });
      });
      newSocket.on('error', (errorData) => {
        console.error('Socket error:', errorData);
        handleSocketError(errorData);
      });
    } catch (error) {
      console.error('Failed to initialize socket:', error);
      dispatch({ type: SOCKET_ACTIONS.SET_CONNECTION_ERROR, payload: error.message });
    }
  }, [isAuthenticated, user, userProfile, state.socket, state.connectionAttempts]);

  const joinUserRooms = useCallback((socket) => {
    if (!userProfile) return;
    const rooms = [];
    rooms.push('authenticated_users');
    if (userProfile.role === 'admin') {
      rooms.push('admins', 'all_chats');
    } else if (userProfile.role === 'agent') {
      rooms.push('agents', `agent_${user.uid}`);
    }
    if (userProfile.department) {
      rooms.push(`department_${userProfile.department}`);
    }
    socket.emit('join_rooms', { rooms });
  }, [userProfile, user]);

  const sendQueuedMessages = useCallback((socket) => {
    if (state.messageQueue.length > 0) {
      state.messageQueue.forEach(message => {
        socket.emit('send_message', message);
      });
      dispatch({ type: SOCKET_ACTIONS.CLEAR_MESSAGE_QUEUE });
    }
  }, [state.messageQueue]);

  const handleMessageReceived = useCallback((messageData) => {
    window.dispatchEvent(new CustomEvent('messageReceived', { detail: messageData }));
    if (messageData.chatId !== getCurrentChatId()) {
      const notification = {
        id: `message_${messageData.messageId}`,
        type: 'message',
        title: 'New Message',
        message: `New message from ${messageData.senderName}`,
        chatId: messageData.chatId,
        timestamp: new Date(),
        read: false
      };
      dispatch({ type: SOCKET_ACTIONS.ADD_NOTIFICATION, payload: notification });
    }
  }, []);

  const handleMessageSent = useCallback((messageData) => {
    window.dispatchEvent(new CustomEvent('messageSent', { detail: messageData }));
  }, []);

  const handleUserTyping = useCallback((typingData) => {
    dispatch({
      type: SOCKET_ACTIONS.UPDATE_TYPING_USERS,
      payload: {
        [`${typingData.chatId}_${typingData.userId}`]: {
          ...typingData,
          isTyping: true,
          timestamp: new Date()
        }
      }
    });
    setTimeout(() => {
      dispatch({
        type: SOCKET_ACTIONS.UPDATE_TYPING_USERS,
        payload: { [`${typingData.chatId}_${typingData.userId}`]: null }
      });
    }, 5000);
  }, []);

  const handleUserStoppedTyping = useCallback((typingData) => {
    dispatch({
      type: SOCKET_ACTIONS.UPDATE_TYPING_USERS,
      payload: { [`${typingData.chatId}_${typingData.userId}`]: null }
    });
  }, []);

  const handleChatAssigned = useCallback((assignmentData) => {
    const notification = {
      id: `assignment_${assignmentData.chatId}`,
      type: 'assignment',
      title: 'Chat Assigned',
      message: `You have been assigned to chat #${assignmentData.chatId}`,
      chatId: assignmentData.chatId,
      timestamp: new Date(),
      read: false
    };
    dispatch({ type: SOCKET_ACTIONS.ADD_NOTIFICATION, payload: notification });
    window.dispatchEvent(new CustomEvent('chatAssigned', { detail: assignmentData }));
  }, []);

  const handleChatTransferred = useCallback((transferData) => {
    const notification = {
      id: `transfer_${transferData.chatId}`,
      type: 'transfer',
      title: 'Chat Transferred',
      message: `Chat #${transferData.chatId} has been transferred`,
      chatId: transferData.chatId,
      timestamp: new Date(),
      read: false
    };
    dispatch({ type: SOCKET_ACTIONS.ADD_NOTIFICATION, payload: notification });
    window.dispatchEvent(new CustomEvent('chatTransferred', { detail: transferData }));
  }, []);

  const handleSocketError = useCallback((errorData) => {
    const notification = {
      id: `error_${Date.now()}`,
      type: 'error',
      title: 'Connection Error',
      message: errorData.message || 'Socket connection error occurred',
      timestamp: new Date(),
      read: false
    };
    dispatch({ type: SOCKET_ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  const getCurrentChatId = useCallback(() => {
    const path = window.location.pathname;
    const chatMatch = path.match(/\/chat\/([^\/]+)/);
    return chatMatch ? chatMatch[1] : null;
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && userProfile && !state.socket) {
      initializeSocket();
    }
  }, [isAuthenticated, user, userProfile, initializeSocket]);

  useEffect(() => {
    return () => {
      if (state.socket) {
        state.socket.disconnect();
        dispatch({ type: SOCKET_ACTIONS.RESET_SOCKET });
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated && state.socket) {
      state.socket.disconnect();
      dispatch({ type: SOCKET_ACTIONS.RESET_SOCKET });
    }
  }, [isAuthenticated, state.socket]);

  const sendMessage = useCallback((messageData) => {
    if (!state.socket || !state.isConnected) {
      dispatch({ type: SOCKET_ACTIONS.ADD_TO_MESSAGE_QUEUE, payload: messageData });
      return { success: false, error: 'Not connected' };
    }
    try {
      state.socket.emit('send_message', {
        ...messageData,
        senderId: user.uid,
        senderName: userProfile?.firstName + ' ' + userProfile?.lastName,
        senderRole: userProfile?.role,
        timestamp: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, error: error.message };
    }
  }, [state.socket, state.isConnected, user, userProfile]);

  const startTyping = useCallback((chatId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('start_typing', {
        chatId,
        userId: user.uid,
        userName: userProfile?.firstName + ' ' + userProfile?.lastName
      });
    }
  }, [state.socket, state.isConnected, user, userProfile]);

  const stopTyping = useCallback((chatId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('stop_typing', {
        chatId,
        userId: user.uid
      });
    }
  }, [state.socket, state.isConnected, user]);

  const updateAgentStatus = useCallback((status) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('update_agent_status', {
        agentId: user.uid,
        status,
        timestamp: new Date().toISOString()
      });
    }
  }, [state.socket, state.isConnected, user]);

  const joinChat = useCallback((chatId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('join_chat', {
        chatId,
        userId: user.uid,
        userRole: userProfile?.role
      });
    }
  }, [state.socket, state.isConnected, user, userProfile]);

  const leaveChat = useCallback((chatId) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('leave_chat', {
        chatId,
        userId: user.uid
      });
    }
  }, [state.socket, state.isConnected, user]);

  const assignChat = useCallback((chatId, agentId) => {
    if (state.socket && state.isConnected && userProfile?.role === 'admin') {
      state.socket.emit('assign_chat', {
        chatId,
        agentId,
        assignedBy: user.uid,
        timestamp: new Date().toISOString()
      });
    }
  }, [state.socket, state.isConnected, user, userProfile]);

  const transferChat = useCallback((chatId, fromAgentId, toAgentId, reason) => {
    if (state.socket && state.isConnected) {
      state.socket.emit('transfer_chat', {
        chatId,
        fromAgentId,
        toAgentId,
        transferredBy: user.uid,
        reason,
        timestamp: new Date().toISOString()
      });
    }
  }, [state.socket, state.isConnected, user]);

  const markNotificationAsRead = useCallback((notificationId) => {
    dispatch({ type: SOCKET_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
  }, []);

  const clearAllNotifications = useCallback(() => {
    state.notifications.forEach(notification => {
      dispatch({ type: SOCKET_ACTIONS.REMOVE_NOTIFICATION, payload: notification.id });
    });
  }, [state.notifications]);

  const reconnect = useCallback(() => {
    if (state.socket) {
      state.socket.disconnect();
    }
    dispatch({ type: SOCKET_ACTIONS.RESET_SOCKET });
    setTimeout(initializeSocket, 1000);
  }, [state.socket, initializeSocket]);

  const value = {
    ...state,
    reconnect,
    sendMessage,
    startTyping,
    stopTyping,
    joinChat,
    leaveChat,
    assignChat,
    transferChat,
    updateAgentStatus,
    markNotificationAsRead,
    clearAllNotifications,
    isUserOnline: (userId) => state.onlineUsers[userId]?.isOnline || false,
    isUserTyping: (chatId, userId) => state.typingUsers[`${chatId}_${userId}`]?.isTyping || false,
    getActiveChatsCount: () => state.activeChats.length,
    getUnreadNotificationsCount: () => state.notifications.filter(n => !n.read).length
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const withSocket = (WrappedComponent) => {
  return function SocketConnectedComponent(props) {
    const { isConnected, isConnecting, connectionError } = useSocket();
    if (isConnecting) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Connecting to chat server...</div>
        </div>
      );
    }
    if (connectionError && !isConnected) {
      return (
        <div className="error-boundary">
          <div className="error-icon">📡</div>
          <div className="error-title">Connection Error</div>
          <div className="error-message">
            Unable to connect to chat server. Please check your internet connection and try again.
          </div>
        </div>
      );
    }
    return <WrappedComponent {...props} />;
  };
};

export default SocketContext;
