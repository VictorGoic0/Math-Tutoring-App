import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';
import { loadConversationHistory, deleteCurrentConversation } from '../services/chatService';
import { API_URL } from '../services/api';

function Chat() {
  const { authToken } = useAuth();
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: `${API_URL}/api/chat`,
    headers: authToken ? {
      'Authorization': `Bearer ${authToken}`
    } : {}
  });

  // Load conversation history on mount
  useEffect(() => {
    async function fetchHistory() {
      if (!authToken) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const messages = await loadConversationHistory(authToken);
        
        // Initialize useChat with existing messages
        if (messages.length > 0) {
          setMessages(messages);
          console.log(`📥 Loaded ${messages.length} messages from history`);
        }
        
        setIsLoadingHistory(false);
      } catch (error) {
        console.error('Error loading history:', error);
        setIsLoadingHistory(false);
        // Don't block the chat if history fails to load - just start fresh
      }
    }

    fetchHistory();
  }, [authToken, setMessages]);

  // Handle delete conversation
  const handleDeleteConversation = async () => {
    if (!window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCurrentConversation(authToken);
      // Clear messages in UI
      setMessages([]);
      console.log('🗑️ Conversation deleted');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
        
        {messages.length > 0 && (
          <button
            onClick={handleDeleteConversation}
            disabled={isDeleting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isDeleting ? '#ccc' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {isDeleting ? 'Deleting...' : '🗑️ Delete Conversation'}
          </button>
        )}
      </div>
      
      <MessageList messages={messages} />
      
      <MessageInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
      
      {error && (
        <div style={{
          color: 'red',
          padding: '0.5rem',
          marginTop: '0.5rem',
          backgroundColor: '#fee',
          borderRadius: '4px'
        }}>
          Error: {error.message}
        </div>
      )}
    </div>
  );
}

export default Chat;

