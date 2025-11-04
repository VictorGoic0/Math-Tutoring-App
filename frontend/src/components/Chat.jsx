import { useChat } from 'ai/react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { useAuth } from '../hooks/useAuth';

function Chat() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { authToken } = useAuth();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: `${apiUrl}/api/chat`,
    headers: authToken ? {
      'Authorization': `Bearer ${authToken}`
    } : {}
  });

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

