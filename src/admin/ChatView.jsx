import { useEffect, useRef } from 'react';
import MessageBubble from './components/MessageBubble';

export default function ChatView({ 
  selectedSession, 
  messages, 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  onKeyPress,
  aiModeEnabled,
  onToggleAiMode
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedSession) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No Chat Selected</h3>
          <p className="text-gray-500">Select a session from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full">
      {/* Chat Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
              selectedSession.isActive 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}>
              {selectedSession.user.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold text-white truncate">{selectedSession.user}</h2>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-xs sm:text-sm text-gray-400 truncate">
                  Session: {selectedSession.sessionId.substring(0, 8)}...
                </span>
                {selectedSession.isActive && (
                  <>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 hidden sm:inline">Online</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* AI Toggle Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">AI Mode</span>
            <button
              onClick={onToggleAiMode}
              className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                aiModeEnabled ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  aiModeEnabled ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            {aiModeEnabled && (
              <div className="hidden sm:flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-400">Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-600 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isAdmin={message.isAdmin}
                isAI={message.isAI}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex items-end space-x-2 sm:space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder="Type your message..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm sm:text-base"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
            <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 text-xs text-gray-500 hidden sm:block">
              Press Enter to send
            </div>
          </div>
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-1 sm:space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
