import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';
import { loadConversationHistory, createConversation, saveMessage, deleteConversation } from '../services/chatService';
import { uploadImage, validateImageFile } from '../services/storageService';
import { API_URL, parseAIStream } from '../services/api';

function Chat() {
  const { authToken, currentUser } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!authToken) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const { conversationId: loadedConvId, messages: loadedMessages } = await loadConversationHistory(authToken);
        setConversationId(loadedConvId);
        
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
          // console.log(`📥 Loaded ${loadedMessages.length} messages from history`);
        }
        
        setIsLoadingHistory(false);
      } catch (error) {
        console.error('Error loading history:', error);
        setIsLoadingHistory(false);
      }
    }

    fetchHistory();
  }, [authToken]);

  const handleImageSelect = (file) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setSelectedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
  };

  const handleClearImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setSelectedImage(null);
    setImagePreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!input.trim() && !selectedImage) || !currentUser || isLoading) return;
    
    const userMessageContent = input;
    let imageUrl = null;

    if (selectedImage) {
      setIsUploadingImage(true);
      try {
        imageUrl = await uploadImage(selectedImage, currentUser.uid);
        // console.log(`📷 Image uploaded: ${imageUrl}`);
      } catch (error) {
        console.error('Failed to upload image:', error);
        alert(`Failed to upload image: ${error.message}`);
        setIsUploadingImage(false);
        return;
      } finally {
        setIsUploadingImage(false);
        handleClearImage();
      }
    }
    
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      createdAt: new Date(),
      ...(imageUrl && { imageUrl })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setIsLoading(true);
    
    persistUserMessage(userMessageContent, imageUrl);
    
    const aiMessageId = `assistant-${Date.now()}`;
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            ...(m.imageUrl && { imageUrl: m.imageUrl })
          })),
          ...(imageUrl && { imageUrl })
        })
      });
      
      await parseAIStream(
        response,
        (chunk) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        async (fullText) => {
          setIsLoading(false);
          persistAIMessage(fullText);
        },
        (error) => {
          setIsLoading(false);
          setError(error.message);
          console.error('Stream error:', error);
          setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
        }
      );
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
      console.error('Chat request failed:', error);
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    }
  };

  async function persistUserMessage(content, imageUrl = null) {
    try {
      let convId = conversationId;
      if (!convId) {
        convId = await createConversation(currentUser.uid, content || 'Image message');
        setConversationId(convId);
        // console.log(`📝 Created conversation: ${convId}`);
      }
      
      await saveMessage(convId, {
        role: 'user',
        content,
        ...(imageUrl && { imageUrl })
      });
      
      // console.log('✅ User message persisted');
    } catch (error) {
      // console.error('⚠️ Failed to persist user message (non-fatal):', error);
    }
  }

  async function persistAIMessage(content) {
    if (!conversationId) return;
    
    try {
      await saveMessage(conversationId, {
        role: 'assistant',
        content
      });
      // console.log('✅ AI message persisted');
    } catch (error) {
      // console.error('⚠️ Failed to persist AI message (non-fatal):', error);
    }
  }

  const handleDeleteConversation = async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setIsDeleting(true);

    setMessages([]);
    const convIdToDelete = conversationId;
    setConversationId(null);

    try {
      await deleteConversation(convIdToDelete);
      // console.log('✅ Conversation deleted');
    } catch (error) {
      // console.error('⚠️ Failed to delete conversation:', error);
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
      height: '100vh',
      width: '1200px',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
      boxSizing: 'border-box',
      overflow: 'hidden'
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

