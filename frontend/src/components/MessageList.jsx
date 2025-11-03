function MessageList({ messages }) {
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
          <div style={{ whiteSpace: 'pre-wrap' }}>
            {message.content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MessageList;

