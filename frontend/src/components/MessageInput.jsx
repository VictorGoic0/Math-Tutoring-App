import { useRef } from 'react';

function MessageInput({ 
  input, 
  handleInputChange, 
  handleSubmit, 
  isLoading,
  onImageSelect,
  imagePreviewUrl,
  onClearImage,
  isUploadingImage
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const canSend = (input.trim() || imagePreviewUrl) && !isLoading && !isUploadingImage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Image Preview */}
      {imagePreviewUrl && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }}>
          <img 
            src={imagePreviewUrl} 
            alt="Preview" 
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
          <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>
            Image ready to send
          </span>
          <button
            type="button"
            onClick={onClearImage}
            style={{
              padding: '0.25rem 0.5rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploadingImage || imagePreviewUrl}
          title="Upload image"
          style={{
            padding: '0.75rem',
            backgroundColor: imagePreviewUrl ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isLoading || isUploadingImage || imagePreviewUrl) ? 'not-allowed' : 'pointer',
            fontSize: '1.2rem',
            minWidth: '50px'
          }}
        >
          📷
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a math question or upload an image..."
          disabled={isLoading || isUploadingImage}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            outline: 'none'
          }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: canSend ? '#2196f3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canSend ? 'pointer' : 'not-allowed',
            fontSize: '1rem',
            fontWeight: 'bold',
            minWidth: '100px'
          }}
        >
          {isUploadingImage ? 'Uploading...' : isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default MessageInput;

