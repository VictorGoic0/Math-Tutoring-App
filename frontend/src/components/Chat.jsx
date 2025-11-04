import { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';

/**
 * Chat Component
 * 
 * BUSINESS LOGIC REMOVED - UI/Styling Only
 * TODO: Implement proper state management for messaging
 */
function Chat() {
  const { authToken, currentUser } = useAuth();
  
  // Minimal state for UI only
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI state
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  /**
   * Handle image selection - UI only
   */
  const handleImageSelect = (file) => {
    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  /**
   * Clear selected image - UI only
   */
  const handleClearImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  /**
   * Handle form submission - PLACEHOLDER
   * TODO: Implement message sending logic
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('TODO: Implement message sending logic');
  };

  /**
   * Delete conversation - PLACEHOLDER
   * TODO: Implement conversation deletion logic
   */
  const handleDeleteConversation = async () => {
    console.log('TODO: Implement conversation deletion logic');
    setMessages([]);
  };

  // Show loading state while fetching history
  if (isLoadingHistory) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading conversation...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem' 
      }}>
        <h2 style={{ margin: 0 }}>AI Math Tutor</h2>
        
        {/* Delete conversation button (only show if messages exist) */}
        {messages.length > 0 && (
          <button
            onClick={handleDeleteConversation}
            disabled={isDeleting}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              opacity: isDeleting ? 0.6 : 1,
              transition: 'opacity 0.2s, background-color 0.2s'
            }}
            onMouseEnter={(e) => !isDeleting && (e.target.style.backgroundColor = '#c82333')}
            onMouseLeave={(e) => !isDeleting && (e.target.style.backgroundColor = '#dc3545')}
          >
            {isDeleting ? '🗑️ Deleting...' : '🗑️ Delete Conversation'}
          </button>
        )}
      </div>
      
      <MessageList messages={messages} />
      
      <MessageInput
        input={input}
        onInputChange={(e) => setInput(e.target.value)}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        onImageSelect={handleImageSelect}
        imagePreviewUrl={imagePreviewUrl}
        onClearImage={handleClearImage}
        isUploadingImage={isUploadingImage}
      />
      
      {error && (
        <div style={{
          color: 'red',
          padding: '0.5rem',
          marginTop: '0.5rem',
          backgroundColor: '#fee',
          borderRadius: '4px'
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default Chat;

