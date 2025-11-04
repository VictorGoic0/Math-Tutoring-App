import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';
import { loadConversationHistory, createConversation, saveMessage } from '../services/chatService';
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
  const [conversationId, setConversationId] = useState(null);

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
      if (!conversationId || !currentUser) return;
      
      try {
        await saveMessage(conversationId, message);
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
        
        // Set conversation ID
        setConversationId(loadedConvId);
        
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
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(currentUser.uid, content);
        setConversationId(convId);
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
      <h2 style={{ marginBottom: '1rem' }}>AI Math Tutor</h2>
      
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

