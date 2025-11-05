import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';
import { loadConversationHistory, createConversation, saveMessage, deleteConversation } from '../services/chatService';
import { uploadImage, validateImageFile } from '../services/storageService';
import { API_URL, parseAIStream } from '../services/api';
import Button from './design-system/Button';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/tokens';

function Chat() {
  const { currentUser } = useAuth();
  
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
      if (!currentUser) {
        setIsLoadingHistory(false);
        return;
      }

      try {
        const { conversationId: loadedConvId, messages: loadedMessages } = await loadConversationHistory(currentUser.uid);
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
  }, [currentUser]);

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
    
    // Await the conversation ID so we can pass it to AI message persistence
    const convId = await persistUserMessage(userMessageContent, imageUrl);
    
    const aiMessageId = `assistant-${Date.now()}`;
    const aiMessage = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      createdAt: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
          persistAIMessage(fullText, convId);
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
      
      // Return the conversationId so AI message can use it
      return convId;
    } catch (error) {
      // console.error('⚠️ Failed to persist user message (non-fatal):', error);
      return conversationId; // Return existing conversationId on error
    }
  }

  async function persistAIMessage(content, convId) {
    if (!convId) return;
    
    try {
      await saveMessage(convId, {
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
  const loadingContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  };

  const spinnerStyles = {
    width: '40px',
    height: '40px',
    border: `4px solid ${colors.neutral.light}`,
    borderTop: `4px solid ${colors.primary.base}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto',
  };

  const loadingTextStyles = {
    marginTop: spacing[4],
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.base,
  };

  if (isLoadingHistory) {
    return (
      <div style={loadingContainerStyles}>
        <div style={{ textAlign: 'center' }}>
          <div style={spinnerStyles}></div>
          <p style={loadingTextStyles}>Loading conversation...</p>
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

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 80px)',
    width: '1200px',
    maxWidth: '100%',
    margin: '0 auto',
    padding: `${spacing[2]} ${spacing[6]}`,
    boxSizing: 'border-box',
    overflow: 'hidden',
    gap: spacing[2],
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: `${spacing[1]} 0`,
    gap: spacing[2],
  };

  return (
    <div style={containerStyles}>
      {/* Delete conversation button (only show if messages exist) */}
      {messages.length > 0 && (
        <div style={{ ...headerStyles, flexShrink: 0 }}>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDeleteConversation}
            disabled={isDeleting}
            loading={isDeleting}
            style={{
              backgroundColor: colors.error.main,
              borderColor: colors.error.main,
              fontSize: typography.fontSize.xs,
              padding: `${spacing[1]} ${spacing[3]}`,
              minHeight: '28px',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = colors.error.dark;
                e.currentTarget.style.borderColor = colors.error.dark;
              }
            }}
            onMouseLeave={(e) => {
              if (!isDeleting) {
                e.currentTarget.style.backgroundColor = colors.error.main;
                e.currentTarget.style.borderColor = colors.error.main;
              }
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      )}
      
      <div style={{ flex: 1, minHeight: 0, maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      
      <div style={{ flexShrink: 0 }}>
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
      </div>
      
      {error && (
        <div style={{
          color: colors.error.dark,
          padding: spacing[3],
          marginTop: spacing[2],
          backgroundColor: colors.error.light + '20',
          borderRadius: borderRadius.base,
          border: `1px solid ${colors.error.light}`,
          fontSize: typography.fontSize.sm,
          boxShadow: shadows.sm,
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default Chat;

