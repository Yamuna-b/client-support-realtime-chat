import React from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: Date.now()
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.log('Error Report:', errorReport);
    
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => alert('Error report copied to clipboard'))
      .catch(() => alert('Unable to copy error report'));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <motion.div 
            className="error-container"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="error-icon"
              animate={{ 
                rotate: [0, 10, -10, 0],
                color: ['#DC143C', '#FFD700', '#FF6347', '#DC143C']
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity },
                color: { duration: 3, repeat: Infinity }
              }}
            >
              💥
            </motion.div>

            <motion.h1 
              className="error-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Oops! Something went wrong
            </motion.h1>


            <motion.div 
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p>
                We're sorry, but something unexpected happened in the chat support system. 
                Don't worry - your data is safe and the issue has been logged.
              </p>
              
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-technical">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  {this.state.error && (
                    <p><strong>Error:</strong> {this.state.error.toString()}</p>
                  )}
                  <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
                </div>
              </details>
            </motion.div>

            <motion.div 
              className="error-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.button 
                className="btn btn-primary"
                onClick={this.handleReload}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 25px rgba(220, 20, 60, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                🔄 Reload Page
              </motion.button>
              
              <motion.button 
                className="btn btn-secondary"
                onClick={this.handleGoHome}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 10px 25px rgba(255, 215, 0, 0.3)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                🏠 Go Home
              </motion.button>
              
              <motion.button 
                className="btn btn-outline"
                onClick={this.handleReportError}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📋 Report Issue
              </motion.button>
            </motion.div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.div 
                className="error-debug"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <h3>Debug Information</h3>
                <pre className="error-stack">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="error-component-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </motion.div>
            )}


            <motion.div 
              className="error-tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <h3>💡 Quick Fixes</h3>
              <ul>
                <li>Try refreshing the page</li>
                <li>Clear your browser cache and cookies</li>
                <li>Check your internet connection</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
