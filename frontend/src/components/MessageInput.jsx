function MessageInput({ input, handleInputChange, handleSubmit, isLoading }) {
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Ask a math question..."
        disabled={isLoading}
        style={{
          flex: 1,
          padding: '0.75rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '1rem',
          outline: 'none'
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: isLoading || !input.trim() ? '#ccc' : '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: 'bold'
        }}
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}

export default MessageInput;

