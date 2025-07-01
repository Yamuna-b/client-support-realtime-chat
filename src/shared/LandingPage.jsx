import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './LandingPage.css';

export function LandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to our support chat. How can I help you today?",
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString(),
      avatar: '👨‍💼'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileDemo, setShowMobileDemo] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(247);
  const [floatingMessages, setFloatingMessages] = useState([]);
  const navigate = useNavigate();
  const mobileRef = useRef(null);

  const demoMessages = [
    "Need help with login? 💬",
    "Customer support is online! ✅",
    "Response time: < 30 seconds ⚡",
    "24/7 Live Support 🌟",
    "How can we assist you? 🤝"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (floatingMessages.length < 3) {
        const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
        const newFloatingMessage = {
          id: Date.now(),
          text: randomMessage,
          x: Math.random() * 300,
          y: Math.random() * 200
        };
        setFloatingMessages(prev => [...prev, newFloatingMessage]);
        setTimeout(() => {
          setFloatingMessages(prev => prev.filter(msg => msg.id !== newFloatingMessage.id));
        }, 4000);
      }
    }, 2000);

    const userInterval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(userInterval);
    };
  }, [floatingMessages.length]);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        text: newMessage.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
        avatar: '👤'
      };
      setMessages([...messages, message]);
      setNewMessage('');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const agentReplies = [
          "Thank you for your message! An agent will assist you shortly.",
          "I understand your concern. Let me help you with that.",
          "Great question! Here's what I can help you with...",
          "I'm here to help! What specific assistance do you need?"
        ];
        const agentReply = {
          id: Date.now() + 1,
          text: agentReplies[Math.floor(Math.random() * agentReplies.length)],
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString(),
          avatar: '👨‍💼'
        };
        setMessages(prev => [...prev, agentReply]);
      }, 1500);
    }
  };

  const handleAgentLogin = () => {
    navigate('/agent-login');
  };

  const handleAdminAccess = () => {
    navigate('/admin-login');
  };

  return (
    <div className="landing-page">
      <div className="background-animation">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-circle"
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 4 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.3
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.header 
        className="landing-header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <div className="header-content">
            <motion.h1 
              className="logo"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="logo-icon">💬</span>
              ChatSupport Pro
            </motion.h1>
            <nav className="nav-menu">
              <motion.a href="#features" whileHover={{ scale: 1.1 }}>Features</motion.a>
              <motion.a href="#about" whileHover={{ scale: 1.1 }}>About</motion.a>
              <motion.a href="#contact" whileHover={{ scale: 1.1 }}>Contact</motion.a>
            </nav>
          </div>
        </div>
      </motion.header>

      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <motion.div 
              className="hero-text"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="hero-title">
                Real-Time Customer Support
                <motion.span 
                  className="highlight"
                  animate={{ color: ['#007bff', '#28a745', '#ffc107', '#007bff'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                > Made Simple</motion.span>
              </h2>
              <p className="hero-description">
                Connect with your customers instantly through our advanced chat support system. 
                Provide exceptional service with real-time messaging, agent management, and seamless transfers.
              </p>
              <div className="hero-stats">
                <motion.div 
                  className="stat"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="stat-number">{onlineUsers}</span>
                  <span className="stat-label">Users Online</span>
                </motion.div>
                <div className="stat">
                  <span className="stat-number">&lt;30s</span>
                  <span className="stat-label">Response Time</span>
                </div>
                <div className="stat">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
              <div className="hero-buttons">
                <motion.button 
                  className="btn btn-primary"
                  onClick={handleChatToggle}
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,123,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Chat Now
                </motion.button>
                <motion.button 
                  className="btn btn-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Watch Demo
                </motion.button>
              </div>
            </motion.div>

            <motion.div 
              className="hero-mobile"
              ref={mobileRef}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <motion.div 
                className="mobile-device"
                animate={{ 
                  rotateY: [-5, 5, -5],
                  rotateX: [2, -2, 2]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="mobile-screen">
                  <div className="mobile-header">
                    <div className="mobile-status">
                      <motion.div 
                        className="status-dot online"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      Live Support
                    </div>
                  </div>
                  
                  <div className="mobile-messages">
                    <AnimatePresence>
                      {messages.slice(-3).map((message, index) => (
                        <motion.div
                          key={message.id}
                          className={`mobile-message ${message.sender}`}
                          initial={{ y: 20, opacity: 0, scale: 0.8 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          exit={{ y: -20, opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="message-avatar">{message.avatar}</div>
                          <div className="message-bubble">
                            <div className="message-text">{message.text}</div>
                            <div className="message-time">{message.timestamp}</div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {isTyping && (
                      <motion.div
                        className="mobile-message agent typing"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <div className="message-avatar">👨‍💼</div>
                        <div className="message-bubble">
                          <div className="typing-indicator">
                            <motion.span
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            >●</motion.span>
                            <motion.span
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            >●</motion.span>
                            <motion.span
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            >●</motion.span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
                
                <div className="mobile-input">
                  <motion.div 
                    className="input-field"
                    animate={{ width: ["70%", "75%", "70%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    Type your message...
                  </motion.div>
                  <motion.button 
                    className="send-btn"
                    animate={{ backgroundColor: ['#007bff', '#28a745', '#007bff'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ➤
                  </motion.button>
                </div>
              </motion.div>

              <AnimatePresence>
                {floatingMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    className="floating-message"
                    initial={{ 
                      opacity: 0, 
                      y: 0,
                      x: msg.x,
                      scale: 0.8
                    }}
                    animate={{ 
                      opacity: [0, 1, 1, 0],
                      y: [-50, -100, -150, -200],
                      scale: [0.8, 1, 1, 0.6]
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 4, ease: "easeOut" }}
                    style={{ left: msg.x, top: msg.y }}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.section 
        id="features" 
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <motion.h3 
            className="section-title"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Why Choose ChatSupport Pro?
          </motion.h3>
          <div className="features-grid">
            {[
              { icon: '⚡', title: 'Real-Time Messaging', desc: 'Instant communication with customers through our advanced WebSocket technology.' },
              { icon: '👥', title: 'Agent Management', desc: 'Efficiently manage your support team with role-based access and chat assignments.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Track performance metrics and customer satisfaction with detailed reporting.' },
              { icon: '🔄', title: 'Chat Transfer', desc: 'Seamlessly transfer conversations between agents without losing context.' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)" 
                }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300
                }}
                viewport={{ once: true }}
              >
                <motion.div 
                  className="feature-icon"
                  animate={{ rotateY: 360 }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>ChatSupport Pro</h4>
              <p>Professional customer support solutions for modern businesses.</p>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#contact">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Access Portal</h4>
              <ul>
                <li>
                  <motion.button 
                    className="agent-login-link"
                    onClick={handleAgentLogin}
                    whileHover={{ scale: 1.05, color: '#007bff' }}
                  >
                    Agent Login
                  </motion.button>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ChatSupport Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <motion.div 
        className={`chat-float-button ${isChatOpen ? 'active' : ''}`}
        animate={{ 
          scale: isChatOpen ? 1 : [1, 1.1, 1],
          rotate: isChatOpen ? 180 : 0
        }}
        transition={{ 
          scale: { duration: 2, repeat: isChatOpen ? 0 : Infinity },
          rotate: { duration: 0.3 }
        }}
      >
        <motion.button 
          className="chat-toggle-btn"
          onClick={handleChatToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle chat"
        >
          {isChatOpen ? '✕' : '💬'}
        </motion.button>
        <motion.div 
          className="notification-dot"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity 
          }}
        />
      </motion.div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            className="chat-widget"
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 20 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 20 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            <div className="chat-widget-header">
              <div className="chat-widget-title">
                <motion.span 
                  className="status-dot online"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                Live Support
                <span className="agent-count">({Math.floor(onlineUsers/50)} agents online)</span>
              </div>
              <motion.button 
                className="chat-minimize-btn"
                onClick={handleChatToggle}
                whileHover={{ rotate: 90 }}
              >
                ✕
              </motion.button>
            </div>
            
            <div className="chat-widget-messages">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div 
                    key={message.id} 
                    className={`chat-message ${message.sender}`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="message-avatar">{message.avatar}</div>
                    <div className="message-bubble">
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">{message.timestamp}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  className="chat-message agent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="message-avatar">👨‍💼</div>
                  <div className="message-bubble typing-indicator">
                    <div className="typing-dots">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <form className="chat-widget-input" onSubmit={handleSendMessage}>
              <motion.input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
                whileFocus={{ scale: 1.02 }}
              />
              <motion.button 
                type="submit" 
                className="send-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                📤
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
