import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true,
  type = 'spinner',
  color = 'primary' 
}) => {
  
  const sizeConfig = {
    small: { width: '24px', height: '24px', fontSize: '0.875rem' },
    medium: { width: '48px', height: '48px', fontSize: '1rem' },
    large: { width: '72px', height: '72px', fontSize: '1.25rem' },
    xlarge: { width: '96px', height: '96px', fontSize: '1.5rem' }
  };


  const colorConfig = {
    primary: {
      gradient: 'linear-gradient(135deg, #DC143C, #FFD700)',
      color: '#DC143C',
      secondary: '#FFD700'
    },
    secondary: {
      gradient: 'linear-gradient(135deg, #FFD700, #FF6347)',
      color: '#FFD700',
      secondary: '#FF6347'
    },
    accent: {
      gradient: 'linear-gradient(135deg, #FF6347, #DC143C)',
      color: '#FF6347',
      secondary: '#DC143C'
    }
  };

  const currentSize = sizeConfig[size];
  const currentColor = colorConfig[color];

  const SpinnerVariant = () => (
    <motion.div 
      className="loading-spinner-ring"
      style={{
        width: currentSize.width,
        height: currentSize.height,
        border: `4px solid rgba(220, 20, 60, 0.1)`,
        borderTop: `4px solid ${currentColor.color}`,
        borderRadius: '50%'
      }}
      animate={{ rotate: 360 }}
      transition={{ 
        duration: 1, 
        repeat: Infinity, 
        ease: "linear" 
      }}
    />
  );

  const DotsVariant = () => (
    <div 
      className="loading-dots" 
      style={{ 
        display: 'flex', 
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            width: parseInt(currentSize.width) / 4 + 'px',
            height: parseInt(currentSize.width) / 4 + 'px',
            borderRadius: '50%',
            background: currentColor.gradient
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const PulseVariant = () => (
    <motion.div
      className="loading-pulse"
      style={{
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: '50%',
        background: currentColor.gradient
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  const WaveVariant = () => (
    <div 
      className="loading-wave"
      style={{ 
        display: 'flex', 
        gap: '4px',
        alignItems: 'flex-end',
        height: currentSize.height
      }}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          style={{
            width: parseInt(currentSize.width) / 8 + 'px',
            background: index % 2 === 0 ? currentColor.color : currentColor.secondary,
            borderRadius: '2px'
          }}
          animate={{
            height: [
              parseInt(currentSize.height) / 4,
              parseInt(currentSize.height),
              parseInt(currentSize.height) / 4
            ]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const ChatBubbleVariant = () => (
    <div className="loading-chat-bubbles" style={{ display: 'flex', gap: '8px' }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          style={{
            width: parseInt(currentSize.width) / 3 + 'px',
            height: parseInt(currentSize.width) / 4 + 'px',
            background: currentColor.gradient,
            borderRadius: '12px 12px 12px 4px'
          }}
          animate={{
            y: [0, -8, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return <DotsVariant />;
      case 'pulse':
        return <PulseVariant />;
      case 'wave':
        return <WaveVariant />;
      case 'chat':
        return <ChatBubbleVariant />;
      default:
        return <SpinnerVariant />;
    }
  };

  return (
    <motion.div 
      className="loading-spinner-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '20px'
      }}
    >
      <div className="spinner-wrapper">
        {renderSpinner()}
      </div>

      {showText && (
        <motion.div 
          className="loading-text"
          style={{
            fontSize: currentSize.fontSize,
            fontWeight: '600',
            background: currentColor.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textAlign: 'center'
          }}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {text}
        </motion.div>
      )}
    </motion.div>
  );
};

export const AuthLoadingSpinner = () => (
  <LoadingSpinner 
    size="large" 
    text="Authenticating..." 
    type="pulse" 
    color="primary"
  />
);

export const ChatLoadingSpinner = () => (
  <LoadingSpinner 
    size="medium" 
    text="Loading chat..." 
    type="chat" 
    color="secondary"
  />
);

export const DataLoadingSpinner = () => (
  <LoadingSpinner 
    size="medium" 
    text="Loading data..." 
    type="wave" 
    color="accent"
  />
);

export const ConnectionSpinner = () => (
  <LoadingSpinner 
    size="large" 
    text="Connecting to server..." 
    type="dots" 
    color="primary"
  />
);

export const LoadingOverlay = ({ 
  isVisible, 
  text = "Loading...", 
  type = "spinner",
  backdrop = true 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        background: backdrop 
          ? 'rgba(255, 255, 255, 0.9)' 
          : 'transparent',
        backdropFilter: backdrop ? 'blur(4px)' : 'none'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
          border: '2px solid transparent',
          backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #DC143C, #FFD700)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box'
        }}
      >
        <LoadingSpinner 
          size="xlarge" 
          text={text} 
          type={type}
          color="primary"
        />
      </motion.div>
    </motion.div>
  );
};

export default LoadingSpinner;
