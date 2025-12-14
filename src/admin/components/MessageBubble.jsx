export default function MessageBubble({ message, isAdmin, isAI = false }) {
  return (
    <div className={`flex mb-4 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isAdmin ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
          isAdmin 
            ? (isAI ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
            : 'bg-gray-600 text-gray-200'
        }`}>
          {isAdmin ? (isAI ? 'AI' : 'A') : 'U'}
        </div>

        {/* Message Bubble */}
        <div className={`px-4 py-2 rounded-lg shadow-sm ${
          isAdmin 
            ? (isAI ? 'bg-purple-600 text-white rounded-br-none' : 'bg-blue-600 text-white rounded-br-none')
            : 'bg-gray-700 text-gray-100 rounded-bl-none'
        }`}>
          <p className="text-sm leading-relaxed break-words">{message.text}</p>
          <div className="flex items-center justify-between mt-1">
            <p className={`text-xs ${
              isAdmin 
                ? (isAI ? 'text-purple-100' : 'text-blue-100')
                : 'text-gray-400'
            }`}>
              {message.timestamp}
            </p>
            {isAI && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="w-1.5 h-1.5 bg-purple-300 rounded-full"></div>
                <span className="text-xs text-purple-200">AI</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}