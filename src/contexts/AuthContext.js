import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

const initialState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  loginAttempts: 0,
  lastLoginTime: null,
  sessionTimeout: null
};

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  INCREMENT_LOGIN_ATTEMPTS: 'INCREMENT_LOGIN_ATTEMPTS',
  RESET_LOGIN_ATTEMPTS: 'RESET_LOGIN_ATTEMPTS',
  SET_LAST_LOGIN: 'SET_LAST_LOGIN',
  SET_SESSION_TIMEOUT: 'SET_SESSION_TIMEOUT',
  LOGOUT: 'LOGOUT'
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case AUTH_ACTIONS.INCREMENT_LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: state.loginAttempts + 1
      };
    case AUTH_ACTIONS.RESET_LOGIN_ATTEMPTS:
      return {
        ...state,
        loginAttempts: 0
      };
    case AUTH_ACTIONS.SET_LAST_LOGIN:
      return {
        ...state,
        lastLoginTime: action.payload
      };
    case AUTH_ACTIONS.SET_SESSION_TIMEOUT:
      return {
        ...state,
        sessionTimeout: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [timedOut, setTimedOut] = useState(false);
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
          dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: userProfile });
          dispatch({ type: AUTH_ACTIONS.SET_LAST_LOGIN, payload: new Date() });
          dispatch({ type: AUTH_ACTIONS.RESET_LOGIN_ATTEMPTS });
          const timeoutId = setTimeout(() => {
            handleSessionTimeout();
          }, SESSION_TIMEOUT);
          dispatch({ type: AUTH_ACTIONS.SET_SESSION_TIMEOUT, payload: timeoutId });
          await updateUserLastLogin(user.uid);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Failed to load user profile' });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
        dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: null });
      }
    });
    return unsubscribe;
  }, []);

  const getUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      } else {
        throw new Error('User profile not found');
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  const updateUserLastLogin = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        lastLoginTime: serverTimestamp(),
        isOnline: true
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  const handleSessionTimeout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: 'Session expired. Please login again.' });
    } catch (error) {
      console.error('Error during session timeout:', error);
    }
  };

  const login = async (email, password, userType = 'agent') => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      if (state.loginAttempts >= 5) {
        throw new Error('Too many failed login attempts. Please try again later.');
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userProfile = await getUserProfile(user.uid);
      if (userProfile.role !== userType) {
        await signOut(auth);
        throw new Error(`Invalid credentials for ${userType} login`);
      }
      if (!userProfile.isActive) {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Please contact administrator.');
      }
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: AUTH_ACTIONS.INCREMENT_LOGIN_ATTEMPTS });
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const registerAgent = async (agentData, adminUser) => {
    try {
      if (!adminUser || state.userProfile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        agentData.email, 
        agentData.password
      );
      const userProfile = {
        uid: userCredential.user.uid,
        email: agentData.email,
        role: 'agent',
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        phoneNumber: agentData.phoneNumber || '',
        department: agentData.department || 'Support',
        isActive: true,
        isOnline: false,
        createdAt: serverTimestamp(),
        createdBy: adminUser.uid,
        lastLoginTime: null,
        profilePicture: agentData.profilePicture || '',
        skills: agentData.skills || [],
        status: 'available'
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      return { success: true, userId: userCredential.user.uid };
    } catch (error) {
      console.error('Registration error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      if (state.sessionTimeout) {
        clearTimeout(state.sessionTimeout);
      }
      if (state.user) {
        await updateDoc(doc(db, 'users', state.user.uid), {
          isOnline: false,
          lastLogoutTime: serverTimestamp()
        });
      }
      await signOut(auth);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!state.user) {
        throw new Error('No authenticated user');
      }
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      await updateDoc(doc(db, 'users', state.user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      const updatedProfile = { ...state.userProfile, ...updates };
      dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: updatedProfile });
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const updateStatus = async (status) => {
    try {
      if (!state.user) {
        throw new Error('No authenticated user');
      }
      await updateDoc(doc(db, 'users', state.user.uid), {
        status: status,
        statusUpdatedAt: serverTimestamp()
      });
      const updatedProfile = { ...state.userProfile, status };
      dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: updatedProfile });
      return { success: true };
    } catch (error) {
      console.error('Status update error:', error);
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const extendSession = () => {
    if (state.sessionTimeout) {
      clearTimeout(state.sessionTimeout);
    }
    const timeoutId = setTimeout(() => {
      handleSessionTimeout();
    }, SESSION_TIMEOUT);
    dispatch({ type: AUTH_ACTIONS.SET_SESSION_TIMEOUT, payload: timeoutId });
  };

  const isAdmin = () => {
    return state.userProfile?.role === 'admin';
  };

  const isAgent = () => {
    return state.userProfile?.role === 'agent';
  };

  const getUserPermissions = () => {
    if (!state.userProfile) return [];
    const basePermissions = ['view_chats', 'send_messages'];
    if (isAdmin()) {
      return [
        ...basePermissions,
        'manage_agents',
        'view_all_chats',
        'assign_chats',
        'transfer_chats',
        'view_analytics',
        'manage_settings',
        'delete_messages',
        'export_data'
      ];
    }
    if (isAgent()) {
      return [
        ...basePermissions,
        'accept_chats',
        'transfer_chats',
        'update_profile',
        'view_assigned_chats'
      ];
    }
    return [];
  };

  const hasPermission = (permission) => {
    const permissions = getUserPermissions();
    return permissions.includes(permission);
  };

  const value = {
    ...state,
    login,
    logout,
    registerAgent,
    updateProfile,
    updateStatus,
    clearError,
    extendSession,
    isAdmin,
    isAgent,
    hasPermission,
    getUserPermissions,
    sessionTimeRemaining: state.sessionTimeout ? SESSION_TIMEOUT : 0
  };

  if (state.isLoading) {
    if (timedOut) {
      return <div>Something went wrong. Please refresh or try again.</div>;
    }
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Authenticating...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Authenticating...</div>
        </div>
      );
    }
    if (!isAuthenticated) {
      return (
        <div className="error-boundary">
          <div className="error-icon">🔒</div>
          <div className="error-title">Authentication Required</div>
          <div className="error-message">
            You must be logged in to access this page.
          </div>
        </div>
      );
    }
    return <WrappedComponent {...props} />;
  };
};

export const withAdminAuth = (WrappedComponent) => {
  return function AdminAuthenticatedComponent(props) {
    const { isAuthenticated, isAdmin, isLoading } = useAuth();
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Verifying permissions...</div>
        </div>
      );
    }
    if (!isAuthenticated || !isAdmin()) {
      return (
        <div className="error-boundary">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Admin Access Required</div>
          <div className="error-message">
            You must be an administrator to access this page.
          </div>
        </div>
      );
    }
    return <WrappedComponent {...props} />;
  };
};

export default AuthContext;
