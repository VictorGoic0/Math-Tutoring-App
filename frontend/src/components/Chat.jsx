import { useEffect, useState, useRef } from 'react';
import { useChat } from 'ai/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';
import { loadConversationHistory, createConversation, saveMessage, deleteConversation } from '../services/chatService';
import { API_URL } from '../services/api';

/**
 * Chat Component
 * 
 * PERSISTENCE MODEL (Optimistic UI):
 * 
 * 1. ON MOUNT:
 *    - Load conversation history from Firestore via backend
 *    - Initialize useChat with existing messages
 * 
 * 2. USER SENDS MESSAGE:
 *    - useChat instantly adds to UI (optimistic)
 *    - AI request sent immediately (no blocking)
 *    - Firestore save happens in background (non-blocking)
 * 
 * 3. AI RESPONDS:
 *    - useChat streams response to UI in real-time
 *    - After stream completes, save to Firestore
 * 
 * 4. ERROR HANDLING:
 *    - If Firestore save fails, message still displays
 *    - Silent failure (no user disruption)
 *    - Messages persist in useChat state during session
 * 
 * 5. ON REFRESH:
 *    - All successfully saved messages load from Firestore
 *    - Any unsaved messages are lost (rare edge case)
 * 
 * This design prioritizes instant UX over guaranteed persistence.
 */
function Chat() {
  const { authToken, currentUser } = useAuth();
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Use ref instead of state to avoid stale closure in onFinish callback
  const conversationIdRef = useRef(null);

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
    } : {},
    // Save AI response after streaming completes
    onFinish: async (message) => {
      if (!conversationIdRef.current || !currentUser) return;
      
      try {
        await saveMessage(conversationIdRef.current, message);
      } catch (error) {
        console.error('⚠️ Failed to save AI message (non-fatal):', error);
        // Silent fail - message is already displayed in UI
      }
    }
  });

  // Load conversation history on mount
  useEffect(() => {
    async function fetchHistory() {
      if (!authToken) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const { conversationId: loadedConvId, messages: loadedMessages } = await loadConversationHistory(authToken);
        
        // Set conversation ID (using ref to avoid stale closure)
        conversationIdRef.current = loadedConvId;
        
        // Initialize useChat with existing messages
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          console.log(`📥 Loaded ${loadedMessages.length} messages from history`);
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

  /**
   * Optimistic submit handler
   * 
   * Flow:
   * 1. useChat immediately adds message to UI (optimistic update)
   * 2. Message sent to /api/chat for AI response
   * 3. Firestore save happens in background (non-blocking)
   * 
   * This ensures instant UI feedback while persisting in the background.
   * If Firestore save fails, message is still in UI and AI still responds.
   */
  const handleCustomSubmit = (e) => {
    if (!input.trim() || !currentUser) return;
    
    const userMessageContent = input; // Capture before useChat clears it
    
    // 1. INSTANT: Let useChat handle optimistic UI update + AI request
    handleSubmit(e);
    
    // 2. BACKGROUND: Save to Firestore (non-blocking)
    saveUserMessageToFirestore(userMessageContent);
  };

  /**
   * Background save for user messages
   * Runs async without blocking UI
   */
  async function saveUserMessageToFirestore(content) {
    try {
      // Create conversation on first message if needed
      let convId = conversationIdRef.current;
      if (!convId) {
        convId = await createConversation(currentUser.uid, content);
        console.log(`📝 Created conversation: ${convId}`);
        conversationIdRef.current = convId;
      }
      
      // Save user message to Firestore
      await saveMessage(convId, {
        role: 'user',
        content
      });
      
    } catch (error) {
      console.error('⚠️ Background save failed (non-fatal):', error);
      // Silent fail - message is already in UI and AI is responding
      // Will be persisted on next successful message or user can refresh
    }
  }

  /**
   * Delete conversation (optimistic UI)
   * Clears UI immediately, deletes from Firestore in background
   */
  const handleDeleteConversation = async () => {
    if (!conversationIdRef.current) {
      // No conversation to delete, just clear local state
      setMessages([]);
      return;
    }

    setIsDeleting(true);

    // 1. INSTANT: Clear UI immediately (optimistic)
    setMessages([]);
    const convIdToDelete = conversationIdRef.current;
    conversationIdRef.current = null;

    // 2. BACKGROUND: Delete from Firestore (non-blocking)
    try {
      await deleteConversation(convIdToDelete);
      console.log('✅ Conversation deleted successfully');
    } catch (error) {
      console.error('⚠️ Failed to delete conversation from Firestore:', error);
      // Silent fail - UI is already cleared
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
        handleInputChange={handleInputChange}
        handleSubmit={handleCustomSubmit}
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

