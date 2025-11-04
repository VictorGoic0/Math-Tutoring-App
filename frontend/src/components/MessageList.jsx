import { useEffect, useRef } from 'react';
import MathDisplay from './MathDisplay';

function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        padding: '2rem'
      }}>
        <p>Start a conversation by asking a math question or uploading a problem!</p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '1rem 0',
      marginBottom: '1rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '0.5rem',
            backgroundColor: message.role === 'user' ? '#e3f2fd' : '#fff',
            borderLeft: message.role === 'user' ? '4px solid #2196f3' : '4px solid #4caf50',
            borderRadius: '4px'
          }}
        >
            <div style={{
              fontWeight: 'bold',
              marginBottom: '0.25rem',
              fontSize: '0.875rem',
              color: '#666'
            }}>
              {message.role === 'user' ? 'You' : 'Tutor'}
            </div>
            
            {/* Display image if present */}
            {message.imageUrl && (
            <div style={{ marginBottom: '0.5rem' }}>
              <img 
                src={message.imageUrl} 
                alt="Uploaded" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid #ddd'
                }}
                onClick={() => window.open(message.imageUrl, '_blank')}
              />
            </div>
          )}
          
          {/* Display text content with math rendering */}
          {message.content && (
            <MathDisplay content={message.content} />
          )}
        </div>
      ))}
      {/* Invisible element at the bottom for scroll target */}
      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;

