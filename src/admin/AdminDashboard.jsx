import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Sidebar from './components/Sidebar';
import ChatView from './ChatView';
import AdminLogin from './components/AdminLogin';

const socket = io('https://backend-chatbot-vwcl.onrender.com');

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState('all'); // 'all', 'active', 'past'
  const [aiModeEnabled, setAiModeEnabled] = useState(false);

  // Simple admin authentication check
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username, password) => {
    // Simple hardcoded credentials
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminAuth', 'authenticated');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  // Initialize socket connection and load sessions
  useEffect(() => {
    if (!isAuthenticated) return;

    socket.emit('admin-connect');

    // Load all sessions (including past ones)
    socket.emit('get-all-sessions');

    // Listen for all sessions updates
    socket.on('all-sessions-list', (sessionsList) => {
      setSessions(sessionsList);
      setIsLoading(false);
    });

    // Also listen for active session updates to refresh the list
    socket.on('sessions-list', () => {
      // Refresh all sessions when active sessions change
      socket.emit('get-all-sessions');
    });

    return () => {
      socket.off('all-sessions-list');
      socket.off('sessions-list');
    };
  }, [isAuthenticated, selectedSession]);

  // Load messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    console.log('Loading messages for session:', selectedSession.sessionId);
    
    // Join the session room first
    socket.emit('admin-join-session', { sessionId: selectedSession.sessionId });
    
    // Then load the messages
    socket.emit('get-messages', { sessionId: selectedSession.sessionId });
    
    socket.on('messages-history', (messageHistory) => {
      console.log('Received messages history:', messageHistory);
      const formattedMessages = messageHistory.map(msg => ({
        id: msg.id || Date.now() + Math.random(),
        text: msg.message || msg.content,
        isAdmin: msg.isAdmin || msg.sender === 'admin',
        isAI: msg.isAI || false,
        timestamp: msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setMessages(formattedMessages);
    });

    // Listen for incoming messages for this specific session
    socket.on('message', (msg) => {
      console.log('\n📨 REAL-TIME MESSAGE RECEIVED');
      console.log('👤 Message sender:', msg.sender);
      console.log('💬 Message content:', msg.content);
      console.log('⏰ Message timestamp:', msg.createdAt);
      console.log('🎯 Current session:', selectedSession?.sessionId || 'None');
      
      const newMessage = {
        id: Date.now() + Math.random(),
        text: msg.content,
        isAdmin: msg.sender === 'admin',
        isAI: msg.isAI || false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      console.log('📝 Formatted message:', newMessage);
      console.log('🤖 Is admin message:', newMessage.isAdmin);
      
      setMessages(prev => {
        console.log('📊 Previous messages count:', prev.length);
        const updated = [...prev, newMessage];
        console.log('📊 Updated messages count:', updated.length);
        return updated;
      });
      
      console.log('✅ Message added to chat\n');
    });

    // Listen for AI mode changes
    socket.on('ai-mode-changed', (data) => {
      console.log('\n📡 AI MODE CHANGED EVENT RECEIVED');
      console.log('📊 Event data:', data);
      console.log('🎯 Event session ID:', data.sessionId);
      console.log('🤖 AI mode enabled:', data.enabled);
      console.log('🔍 Current selected session:', selectedSession?.sessionId || 'None');
      
      if (selectedSession && data.sessionId === selectedSession.sessionId) {
        console.log('✅ Event matches current session - updating AI mode');
        setAiModeEnabled(data.enabled);
        console.log('🔄 AI mode updated to:', data.enabled);
      } else {
        console.log('ℹ️ Event for different session - ignoring');
      }
      console.log('✅ AI mode change event processed\n');
    });

    return () => {
      socket.off('messages-history');
      socket.off('message');
      socket.off('ai-mode-changed');
      // Leave the session room when switching sessions or unmounting
      if (selectedSession && selectedSession.sessionId) {
        socket.emit('admin-leave-session', { sessionId: selectedSession.sessionId });
      }
    };
  }, [selectedSession]);

  const handleSessionSelect = (session) => {
    console.log('\n🎯 SESSION SELECTION EVENT');
    console.log('📋 Previous session:', selectedSession?.sessionId || 'None');
    console.log('📋 New session:', session.sessionId);
    console.log('👤 Session user:', session.user);
    console.log('🟢 Session active:', session.isActive);
    
    setSelectedSession(session);
    setMessages([]); // Clear previous messages while loading
    setAiModeEnabled(false); // Reset AI mode when switching sessions
    
    console.log('✅ Session selection completed');
    console.log('🤖 AI mode reset to: false\n');
  };

  const toggleAiMode = () => {
    if (!selectedSession) {
      console.warn('⚠️ Cannot toggle AI mode: No session selected');
      return;
    }
    
    const newAiMode = !aiModeEnabled;
    console.log('\n🔄 AI MODE TOGGLE');
    console.log('🎯 Session ID:', selectedSession.sessionId);
    console.log('🔄 Previous AI mode:', aiModeEnabled);
    console.log('🔄 New AI mode:', newAiMode);
    
    setAiModeEnabled(newAiMode);
    
    // Emit AI mode toggle to backend
    const toggleData = { 
      sessionId: selectedSession.sessionId, 
      enabled: newAiMode 
    };
    
    console.log('📤 Emitting toggle-ai-mode event:', toggleData);
    socket.emit('toggle-ai-mode', toggleData);
    console.log('✅ AI mode toggle completed\n');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedSession) return;

    socket.emit('admin_message', { 
      sessionId: selectedSession.sessionId, 
      content: newMessage.trim()
    });

    // Update session's last message in the sidebar
    setSessions(prev => prev.map(session => 
      session.sessionId === selectedSession.sessionId 
        ? { ...session, lastMessage: `Admin: ${newMessage.trim()}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : session
    ));

    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        sessions={sessions} 
        selectedSession={selectedSession} 
        onSessionSelect={handleSessionSelect}
        isLoading={isLoading}
        onLogout={logout}
      />

      {/* Main Chat Area */}
      <ChatView 
        selectedSession={selectedSession}
        messages={messages}
        newMessage={newMessage}
        onMessageChange={setNewMessage}
        onSendMessage={sendMessage}
        onKeyPress={handleKeyPress}
        aiModeEnabled={aiModeEnabled}
        onToggleAiMode={toggleAiMode}
      />
    </div>
  );
}
