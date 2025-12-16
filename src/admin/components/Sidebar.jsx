import { useState } from 'react';

export default function Sidebar({ sessions, selectedSession, onSessionSelect, isLoading, onLogout, isMobile }) {
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'past'
  
  const filteredSessions = sessions.filter(session => {
    if (filter === 'active') return session.isActive;
    if (filter === 'past') return !session.isActive;
    return true; // 'all'
  });
  
  const activeCount = sessions.filter(s => s.isActive).length;
  const totalCount = sessions.length;
  return (
    <div className="w-full h-full bg-gray-800 border-r border-gray-700 flex flex-col shadow-lg lg:shadow-none">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs sm:text-sm text-gray-400">Chat Management</p>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Session List Header */}
      <div className="p-3 sm:p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Chat Sessions
          </h2>
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {activeCount}/{totalCount}
          </span>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-1 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filter === 'active' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap ${
              filter === 'past' 
                ? 'bg-gray-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Past ({totalCount - activeCount})
          </button>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-700 h-16 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-4 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">
              {filter === 'active' ? 'No active sessions' : 
               filter === 'past' ? 'No past sessions' : 'No sessions found'}
            </p>
          </div>
        ) : (
          <div className="p-1 sm:p-2 space-y-1">
            {filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                onClick={() => onSessionSelect(session)}
                className={`p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700 ${
                  selectedSession?.sessionId === session.sessionId
                    ? 'bg-blue-600 shadow-lg'
                    : 'bg-gray-750'
                }`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  {/* Avatar */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                    session.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {session.user.charAt(0).toUpperCase()}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium text-xs sm:text-sm truncate ${
                        selectedSession?.sessionId === session.sessionId
                          ? 'text-white'
                          : 'text-gray-200'
                      }`}>
                        {session.user}
                      </h3>
                      {session.isActive && (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <p className={`text-xs truncate mt-1 ${
                      selectedSession?.sessionId === session.sessionId
                        ? 'text-blue-100'
                        : 'text-gray-400'
                    }`}>
                      {session.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1 sm:mt-2">
                      <span className={`text-xs ${
                        selectedSession?.sessionId === session.sessionId
                          ? 'text-blue-200'
                          : 'text-gray-500'
                      }`}>
                        {session.timestamp}
                      </span>
                      <span className={`text-xs ${
                        selectedSession?.sessionId === session.sessionId
                          ? 'text-blue-200'
                          : 'text-gray-500'
                      }`}>
                        {session.sessionId.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-850">
        <div className="text-center">
          <p className="text-xs text-gray-500">Admin Chat Panel v1.0</p>
        </div>
      </div>
    </div>
  );
}