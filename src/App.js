import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import ErrorBoundary from './shared/ErrorBoundary';
import LoadingSpinner from './shared/LoadingSpinner';
import { LandingPage } from './shared/LandingPage';

import AgentLogin from './agent/pages/AgentLogin';
import AgentDashboard from './agent/pages/AgentDashboard';
import AgentChatInterface from './agent/components/AgentChatInterface';
import AgentProfile from './agent/pages/AgentProfileDashboard';
import AgentNotifications from './agent/pages/AgentNotifications';

import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminChatPanel from './admin/components/AdminChatPanel';
import AdminProfile from './admin/pages/AdminProfile';
import AdminNotifications from './admin/pages/AdminNotifications';
import ManageAgents from './admin/pages/ManageAgents';

import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';

import ProtectedRoute from './shared/ProtectedRoute';
import AdminRoute from './shared/AdminRoute';
import AgentRoute from './shared/AgentRoute';

import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <Router>
              <div className="app">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route 
                      path="/" 
                      element={<LandingPage />} 
                    />
                    
                    <Route 
                      path="/agent-login" 
                      element={<AgentLogin />} 
                    />
                    <Route 
                      path="/admin-login" 
                      element={<AdminLogin />} 
                    />
                    
                    <Route 
                      path="/agent/*" 
                      element={
                        <ProtectedRoute>
                          <AgentRoute>
                            <AgentRoutes />
                          </AgentRoute>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute>
                          <AdminRoute>
                            <AdminRoutes />
                          </AdminRoute>
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/loading" 
                      element={<LoadingSpinner />} 
                    />
                    <Route 
                      path="*" 
                      element={<Navigate to="/" replace />} 
                    />
                  </Routes>
                </AnimatePresence>
              </div>
            </Router>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const AgentRoutes = () => {
  return (
    <Routes>
      <Route 
        index 
        element={<AgentDashboard />} 
      />
      <Route 
        path="dashboard" 
        element={<AgentDashboard />} 
      />
      
      <Route 
        path="chat" 
        element={<AgentChatInterface />} 
      />
      <Route 
        path="chat/:chatId" 
        element={<AgentChatInterface />} 
      />
      
      <Route 
        path="profile" 
        element={<AgentProfile />} 
      />
      
      <Route 
        path="notifications" 
        element={<AgentNotifications />} 
      />
      
      <Route 
        path="*" 
        element={<Navigate to="/agent/dashboard" replace />} 
      />
    </Routes>
  );
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        index 
        element={<AdminDashboard />} 
      />
      <Route 
        path="dashboard" 
        element={<AdminDashboard />} 
      />
      
      <Route 
        path="chat" 
        element={<AdminChatPanel />} 
      />
      <Route 
        path="chat/:chatId" 
        element={<AdminChatPanel />} 
      />
      
      <Route 
        path="agents" 
        element={<ManageAgents />} 
      />
      <Route 
        path="agents/manage" 
        element={<ManageAgents />} 
      />
      
      <Route 
        path="profile" 
        element={<AdminProfile />} 
      />
      
      <Route 
        path="notifications" 
        element={<AdminNotifications />} 
      />
      
      <Route 
        path="*" 
        element={<Navigate to="/admin/dashboard" replace />} 
      />
    </Routes>
  );
};

export default App;
