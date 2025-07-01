import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

const initialState = {
  chats: [],
  activeChats: [],
  assignedChats: [],
  unassignedChats: [],
  closedChats: [],
  currentChat: null,
  messages: {},
  unreadCounts: {},
  totalUnreadCount: 0,
  chatFilters: {
    status: 'all',
    agent: 'all',
    priority: 'all'
  },
  isLoading: false,
  error: null,
  lastActivity: {},
  typingUsers: {}
};

const CHAT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CHATS: 'SET_CHATS',
  ADD_CHAT: 'ADD_CHAT',
  UPDATE_CHAT: 'UPDATE_CHAT',
  REMOVE_CHAT: 'REMOVE_CHAT',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  UPDATE_UNREAD_COUNTS: 'UPDATE_UNREAD_COUNTS',
  SET_CHAT_FILTERS: 'SET_CHAT_FILTERS',
  SET_LAST_ACTIVITY: 'SET_LAST_ACTIVITY',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  RESET_CHAT_STATE: 'RESET_CHAT_STATE'
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case CHAT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case CHAT_ACTIONS.SET_CHATS:
      const chats = action.payload;
      return {
        ...state,
        chats,
        activeChats: chats.filter(chat => chat.status === 'active'),
        assignedChats: chats.filter(chat => chat.status === 'assigned'),
        unassignedChats: chats.filter(chat => chat.status === 'unassigned'),
        closedChats: chats.filter(chat => chat.status === 'closed'),
        isLoading: false
      };
    case CHAT_ACTIONS.ADD_CHAT:
      const newChat = action.payload;
      const updatedChats = [...state.chats, newChat];
      return {
        ...state,
        chats: updatedChats,
        activeChats: updatedChats.filter(chat => chat.status === 'active'),
        assignedChats: updatedChats.filter(chat => chat.status === 'assigned'),
        unassignedChats: updatedChats.filter(chat => chat.status === 'unassigned'),
        closedChats: updatedChats.filter(chat => chat.status === 'closed')
      };
    case CHAT_ACTIONS.UPDATE_CHAT:
      const updatedChatList = state.chats.map(chat =>
        chat.id === action.payload.id ? { ...chat, ...action.payload } : chat
      );
      return {
        ...state,
        chats: updatedChatList,
        activeChats: updatedChatList.filter(chat => chat.status === 'active'),
        assignedChats: updatedChatList.filter(chat => chat.status === 'assigned'),
        unassignedChats: updatedChatList.filter(chat => chat.status === 'unassigned'),
        closedChats: updatedChatList.filter(chat => chat.status === 'closed'),
        currentChat: state.currentChat?.id === action.payload.id 
          ? { ...state.currentChat, ...action.payload } 
          : state.currentChat
      };
    case CHAT_ACTIONS.REMOVE_CHAT:
      const filteredChats = state.chats.filter(chat => chat.id !== action.payload);
      return {
        ...state,
        chats: filteredChats,
        activeChats: filteredChats.filter(chat => chat.status === 'active'),
        assignedChats: filteredChats.filter(chat => chat.status === 'assigned'),
        unassignedChats: filteredChats.filter(chat => chat.status === 'unassigned'),
        closedChats: filteredChats.filter(chat => chat.status === 'closed'),
        currentChat: state.currentChat?.id === action.payload ? null : state.currentChat
      };
    case CHAT_ACTIONS.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.payload
      };
    case CHAT_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages
        }
      };
    case CHAT_ACTIONS.ADD_MESSAGE:
      const { chatId, message } = action.payload;
      const existingMessages = state.messages[chatId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, message]
        }
      };
    case CHAT_ACTIONS.UPDATE_MESSAGE:
      const { chatId: msgChatId, messageId, updates } = action.payload;
      const chatMessages = state.messages[msgChatId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [msgChatId]: chatMessages.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }
      };
    case CHAT_ACTIONS.SET_UNREAD_COUNT:
      const { chatId: unreadChatId, count } = action.payload;
      const newUnreadCounts = {
        ...state.unreadCounts,
        [unreadChatId]: count
      };
      return {
        ...state,
        unreadCounts: newUnreadCounts,
        totalUnreadCount: Object.values(newUnreadCounts).reduce((sum, count) => sum + count, 0)
      };
    case CHAT_ACTIONS.UPDATE_UNREAD_COUNTS:
      const totalUnread = Object.values(action.payload).reduce((sum, count) => sum + count, 0);
      return {
        ...state,
        unreadCounts: action.payload,
        totalUnreadCount: totalUnread
      };
    case CHAT_ACTIONS.SET_CHAT_FILTERS:
      return {
        ...state,
        chatFilters: { ...state.chatFilters, ...action.payload }
      };
    case CHAT_ACTIONS.SET_LAST_ACTIVITY:
      return {
        ...state,
        lastActivity: {
          ...state.lastActivity,
          [action.payload.chatId]: action.payload.timestamp
        }
      };
    case CHAT_ACTIONS.SET_TYPING_USERS:
      return {
        ...state,
        typingUsers: {
          ...state.typingUsers,
          [action.payload.chatId]: action.payload.users
        }
      };
    case CHAT_ACTIONS.RESET_CHAT_STATE:
      return initialState;
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user, userProfile, isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

    let unsubscribe;

    try {
      const chatsRef = collection(db, 'chats');
      let chatQuery;

      if (userProfile?.role === 'admin') {
        chatQuery = query(
          chatsRef,
          orderBy('updatedAt', 'desc'),
          limit(100)
        );
      } else if (userProfile?.role === 'agent') {
        chatQuery = query(
          chatsRef,
          where('assignedAgent', 'in', [user.uid, null, '']),
          orderBy('updatedAt', 'desc'),
          limit(50)
        );
      }

      if (chatQuery) {
        unsubscribe = onSnapshot(chatQuery, 
          (snapshot) => {
            const chats = [];
            snapshot.forEach((doc) => {
              chats.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
              });
            });
            dispatch({ type: CHAT_ACTIONS.SET_CHATS, payload: chats });
          },
          (error) => {
            console.error('Error fetching chats:', error);
            dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
          }
        );
      }
    } catch (error) {
      console.error('Error setting up chat subscription:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user, userProfile]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessageReceived = (messageData) => {
      dispatch({
        type: CHAT_ACTIONS.ADD_MESSAGE,
        payload: {
          chatId: messageData.chatId,
          message: messageData
        }
      });

      if (state.currentChat?.id !== messageData.chatId) {
        const currentCount = state.unreadCounts[messageData.chatId] || 0;
        dispatch({
          type: CHAT_ACTIONS.SET_UNREAD_COUNT,
          payload: {
            chatId: messageData.chatId,
            count: currentCount + 1
          }
        });
      }

      dispatch({
        type: CHAT_ACTIONS.SET_LAST_ACTIVITY,
        payload: {
          chatId: messageData.chatId,
          timestamp: new Date()
        }
      });
    };

    const handleChatUpdated = (chatData) => {
      dispatch({
        type: CHAT_ACTIONS.UPDATE_CHAT,
        payload: chatData
      });
    };

    const handleUserTyping = (typingData) => {
      const currentTyping = state.typingUsers[typingData.chatId] || [];
      const updatedTyping = [...currentTyping.filter(u => u.userId !== typingData.userId), typingData];
      
      dispatch({
        type: CHAT_ACTIONS.SET_TYPING_USERS,
        payload: {
          chatId: typingData.chatId,
          users: updatedTyping
        }
      });
    };

    const handleUserStoppedTyping = (typingData) => {
      const currentTyping = state.typingUsers[typingData.chatId] || [];
      const updatedTyping = currentTyping.filter(u => u.userId !== typingData.userId);
      
      dispatch({
        type: CHAT_ACTIONS.SET_TYPING_USERS,
        payload: {
          chatId: typingData.chatId,
          users: updatedTyping
        }
      });
    };

    window.addEventListener('messageReceived', (e) => handleMessageReceived(e.detail));
    socket.on('chat_updated', handleChatUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      window.removeEventListener('messageReceived', handleMessageReceived);
      socket.off('chat_updated', handleChatUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, isConnected, state.currentChat, state.unreadCounts, state.typingUsers]);

  const createChat = useCallback(async (chatData) => {
    try {
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: true });

      const newChat = {
        ...chatData,
        status: 'unassigned',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid
      };

      const docRef = await addDoc(collection(db, 'chats'), newChat);
      
      const createdChat = {
        id: docRef.id,
        ...newChat,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dispatch({ type: CHAT_ACTIONS.ADD_CHAT, payload: createdChat });
      dispatch({ type: CHAT_ACTIONS.SET_LOADING, payload: false });

      return { success: true, chatId: docRef.id };
    } catch (error) {
      console.error('Error creating chat:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, [user]);

  const updateChat = useCallback(async (chatId, updates) => {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      dispatch({
        type: CHAT_ACTIONS.UPDATE_CHAT,
        payload: { id: chatId, ...updates, updatedAt: new Date() }
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating chat:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  }, []);

  const assignChat = useCallback(async (chatId, agentId) => {
    return await updateChat(chatId, {
      assignedAgent: agentId,
      status: 'assigned',
      assignedAt: serverTimestamp(),
      assignedBy: user.uid
    });
  }, [updateChat, user]);

  const closeChat = useCallback(async (chatId, reason = '') => {
    return await updateChat(chatId, {
      status: 'closed',
      closedAt: serverTimestamp(),
      closedBy: user.uid,
      closeReason: reason
    });
  }, [updateChat, user]);

  const markChatAsRead = useCallback((chatId) => {
    dispatch({
      type: CHAT_ACTIONS.SET_UNREAD_COUNT,
      payload: { chatId, count: 0 }
    });
  }, []);

  const setCurrentChat = useCallback((chat) => {
    dispatch({ type: CHAT_ACTIONS.SET_CURRENT_CHAT, payload: chat });
    if (chat) {
      markChatAsRead(chat.id);
    }
  }, [markChatAsRead]);

  const setChatFilters = useCallback((filters) => {
    dispatch({ type: CHAT_ACTIONS.SET_CHAT_FILTERS, payload: filters });
  }, []);

  const getFilteredChats = useCallback(() => {
    let filtered = state.chats;
    if (state.chatFilters.status !== 'all') {
      filtered = filtered.filter(chat => chat.status === state.chatFilters.status);
    }
    if (state.chatFilters.agent !== 'all') {
      filtered = filtered.filter(chat => chat.assignedAgent === state.chatFilters.agent);
    }
    if (state.chatFilters.priority !== 'all') {
      filtered = filtered.filter(chat => chat.priority === state.chatFilters.priority);
    }
    return filtered;
  }, [state.chats, state.chatFilters]);

  const getChatMessages = useCallback(async (chatId) => {
    try {
      const messages = state.messages[chatId];
      if (messages) {
        return messages;
      }
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(messagesQuery);
      
      const fetchedMessages = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });

      dispatch({
        type: CHAT_ACTIONS.SET_MESSAGES,
        payload: { chatId, messages: fetchedMessages }
      });

      return fetchedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      dispatch({ type: CHAT_ACTIONS.SET_ERROR, payload: error.message });
      return [];
    }
  }, [state.messages]);

  const clearError = useCallback(() => {
    dispatch({ type: CHAT_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    createChat,
    updateChat,
    assignChat,
    closeChat,
    setCurrentChat,
    getChatMessages,
    markChatAsRead,
    setChatFilters,
    getFilteredChats,
    clearError,
    hasUnreadChats: state.totalUnreadCount > 0,
    getUnreadCount: (chatId) => state.unreadCounts[chatId] || 0,
    isUserTyping: (chatId, userId) => {
      const typingUsers = state.typingUsers[chatId] || [];
      return typingUsers.some(user => user.userId === userId);
    },
    getChatById: (chatId) => state.chats.find(chat => chat.id === chatId),
    getRecentChats: (limit = 10) => state.chats
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
      .slice(0, limit)
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const withChat = (WrappedComponent) => {
  return function ChatConnectedComponent(props) {
    const { isLoading, error } = useChat();
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading chats...</div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="error-boundary">
          <div className="error-icon">💬</div>
          <div className="error-title">Chat System Error</div>
          <div className="error-message">
            Unable to load chat data. Please try refreshing the page.
          </div>
        </div>
      );
    }
    return <WrappedComponent {...props} />;
  };
};

export default ChatContext;
