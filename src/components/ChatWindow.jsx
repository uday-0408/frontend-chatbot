import { useEffect, useState, useRef } from "react";
import socket from "../sockets/socket";

export default function ChatWindow({ onClose }) {
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId"));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  // Auto scroll
  const scrollToBottom = () => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(scrollToBottom, [messages]);

  // Socket connection and session initialization
  useEffect(() => {
    console.log("ChatWindow mounted, socket connected:", socket.connected);
    
    const handleConnect = () => {
      console.log("Socket connected!");
      
      if (sessionId) {
        // Join existing session
        socket.emit("init_session", { sessionId }, (response) => {
          console.log("Session initialized:", response.sessionId);
          if (response.sessionId !== sessionId) {
            localStorage.setItem("sessionId", response.sessionId);
            setSessionId(response.sessionId);
          }
        });
      } else {
        // Create new session
        socket.emit("init_session", {}, (response) => {
          console.log("New session created:", response.sessionId);
          localStorage.setItem("sessionId", response.sessionId);
          setSessionId(response.sessionId);
        });
      }
    };

    const handleMessage = (msg) => {
      console.log('\n📨 USER CHAT - MESSAGE RECEIVED');
      console.log('👤 Message sender:', msg.sender);
      console.log('💬 Message content:', msg.content);
      console.log('⏰ Message timestamp:', msg.createdAt);
      console.log('🎯 Current session ID:', sessionId);
      
      // Only add admin/bot messages, never user messages (user messages are added locally)
      if (msg.sender === 'admin' || msg.sender === 'bot') {
        console.log('✅ Adding admin/bot message to chat');
        const formattedMessage = {
          id: `${msg.sender}-${Date.now()}-${Math.random()}`,
          sender: msg.sender,
          content: msg.content,
          createdAt: msg.createdAt,
          isAI: msg.isAI || false
        };
        console.log('📝 Formatted message:', formattedMessage);
        
        setMessages((prev) => {
          console.log('📊 Previous messages count:', prev.length);
          const updated = [...prev, formattedMessage];
          console.log('📊 Updated messages count:', updated.length);
          return updated;
        });
        console.log('✅ Message added to user chat');
      } else {
        console.log('ℹ️ Ignoring user message (handled locally)');
      }
      console.log('✅ Message handling completed\n');
    };
    
    // Remove any existing listeners first
    socket.off("connect", handleConnect);
    socket.off("message", handleMessage);
    
    // Add new listeners
    socket.on("connect", handleConnect);
    socket.on("message", handleMessage);

    // If already connected, initialize session
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("message", handleMessage);
    };
  }, [sessionId]);

  // Add initial greeting when chat opens
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = {
        id: 'greeting-bot',
        content: 'Hello! How can I assist you?',
        sender: 'bot',
        createdAt: new Date().toISOString()
      };
      setMessages([greeting]);
    }
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !sessionId) {
      console.warn('⚠️ Cannot send message: Empty input or no session');
      console.log('📝 Input:', input);
      console.log('🎯 Session ID:', sessionId);
      return;
    }
    
    console.log('\n📤 USER SENDING MESSAGE');
    console.log('💬 Message content:', input.trim());
    console.log('🎯 Session ID:', sessionId);
    
    // Add message immediately to user's UI
    const userMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: 'user',
      content: input.trim(),
      createdAt: new Date().toISOString()
    };
    
    console.log('📝 Formatted user message:', userMessage);
    
    setMessages(prev => {
      console.log('📊 Previous messages count:', prev.length);
      const updated = [...prev, userMessage];
      console.log('📊 Updated messages count:', updated.length);
      return updated;
    });
    
    // Send message via socket
    const socketData = { sessionId, content: input.trim() };
    console.log('📡 Emitting user_message event:', socketData);
    socket.emit("user_message", socketData);
    
    setInput("");
    console.log('✅ Message sent and input cleared\n');
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="bg-white w-80 h-96 rounded-lg shadow-2xl overflow-hidden flex flex-col relative">
      
      {/* Header */}
      <div className="bg-blue-500 text-white px-4 py-3 flex justify-between items-center">
        <span className="font-medium">Chatbot</span>
        <button 
          onClick={onClose}
          className="text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={chatRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3"
      >
        {messages.map((m, index) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
              m.sender === "user" 
                ? "bg-blue-500 text-white rounded-br-none" 
                : m.isAI 
                  ? "bg-purple-100 border border-purple-200 text-purple-900 rounded-bl-none shadow-sm"
                  : "bg-white border text-gray-800 rounded-bl-none shadow-sm"
            }`}>
              {m.content}
              {m.isAI && (
                <div className="flex items-center mt-1 space-x-1">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <span className="text-xs text-purple-600 font-medium">AI Generated</span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {formatTime(m.createdAt)}
            </span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
