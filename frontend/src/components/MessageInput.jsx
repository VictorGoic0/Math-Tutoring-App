import { useRef } from 'react';
import Button from './design-system/Button';
import { colors, typography, spacing, borderRadius, shadows, transitions } from '../styles/tokens';

function MessageInput({ 
  input, 
  onInputChange, 
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

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
  };

  const previewStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.background.default,
    borderRadius: borderRadius.base,
    border: `1px solid ${colors.divider}`,
    boxShadow: shadows.sm,
    animation: `slideIn ${transitions.duration.medium} ${transitions.easing.easeOut}`,
  };

  const previewImageStyles = {
    width: '60px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: borderRadius.base,
    border: `1px solid ${colors.divider}`,
  };

  const previewTextStyles = {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  };

  const formStyles = {
    display: 'flex',
    gap: spacing[2],
  };

  const textInputStyles = {
    flex: 1,
    padding: `${spacing[3]} ${spacing[4]}`,
    border: `1px solid ${colors.divider}`,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.base,
    color: colors.text.primary,
    backgroundColor: colors.background.paper,
    outline: 'none',
    transition: `border-color ${transitions.duration.short} ${transitions.easing.easeInOut}, box-shadow ${transitions.duration.short} ${transitions.easing.easeInOut}`,
  };

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div style={containerStyles}>
      {/* Image Preview */}
      {imagePreviewUrl && (
        <div style={previewStyles}>
          <img 
            src={imagePreviewUrl} 
            alt="Preview" 
            style={previewImageStyles}
          />
          <span style={previewTextStyles}>
            Image ready to send
          </span>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onClearImage}
            style={{
              backgroundColor: colors.error.main,
              borderColor: colors.error.main,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.error.dark;
              e.currentTarget.style.borderColor = colors.error.dark;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.error.main;
              e.currentTarget.style.borderColor = colors.error.main;
            }}
          >
            Remove
          </Button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={formStyles}>
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Image Upload Button */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading || isUploadingImage || imagePreviewUrl}
          title="Upload image"
          style={{
            minWidth: '50px',
            ...(imagePreviewUrl && {
              backgroundColor: colors.action.disabledBackground,
              borderColor: colors.neutral.lightBase,
              color: colors.text.disabled,
            }),
          }}
        >
          Image
        </Button>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={onInputChange}
          placeholder="Ask a math question or upload an image..."
          disabled={isLoading || isUploadingImage}
          style={textInputStyles}
          onFocus={(e) => {
            e.target.style.borderColor = colors.primary.base;
            e.target.style.boxShadow = `0 0 0 3px ${colors.primary.base}1A`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = colors.divider;
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSend}
          loading={isLoading || isUploadingImage}
          style={{
            minWidth: '100px'
          }}
        >
          {isUploadingImage ? 'Uploading...' : isLoading ? 'Sending...' : 'Send'}
        </Button>
      </form>
    </div>
    </>
  );
}

export default MessageInput;

