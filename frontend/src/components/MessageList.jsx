import { useEffect, useRef } from 'react';
import MathDisplay from './MathDisplay';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/tokens';

function MessageList({ messages }) {
  const containerRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const emptyStateStyles = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[8],
    overflowY: 'auto',
    border: `1px solid ${colors.divider}`,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.default,
    boxShadow: shadows.sm,
  };

  const emptyStateContentStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '500px',
    textAlign: 'center',
  };

  const emptyStateIconStyles = {
    width: '80px',
    height: '80px',
    marginBottom: spacing[6],
    opacity: 0.6,
  };

  const emptyStateTitleStyles = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    lineHeight: typography.lineHeight.tight,
  };

  const emptyStateTextStyles = {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed,
    marginBottom: spacing[4],
  };

  const emptyStateExamplesStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    width: '100%',
    marginTop: spacing[4],
  };

  const exampleItemStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: colors.background.paper,
    border: `1px solid ${colors.divider}`,
    borderRadius: borderRadius.base,
    fontStyle: 'italic',
  };

  const containerStyles = {
    height: '100%',
    overflowY: 'auto',
    padding: `${spacing[4]} 0`,
    border: `1px solid ${colors.divider}`,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.default,
    boxShadow: shadows.sm,
  };

  if (messages.length === 0) {
    return (
      <div ref={containerRef} style={emptyStateStyles}>
        <div style={emptyStateContentStyles}>
          <img 
            src="/math-mentor-logo-svg.svg" 
            alt="MathMentor AI" 
            style={emptyStateIconStyles}
          />
          <h3 style={emptyStateTitleStyles}>
            Welcome to MathMentor AI
          </h3>
          <p style={emptyStateTextStyles}>
            I'm here to help you understand math concepts step by step. 
            Ask me any question or upload a problem image!
          </p>
          <div style={emptyStateExamplesStyles}>
            <div style={exampleItemStyles}>
              "How do I solve 2x + 5 = 13?"
            </div>
            <div style={exampleItemStyles}>
              "Explain the quadratic formula"
            </div>
            <div style={exampleItemStyles}>
              Upload an image of your math problem
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyles}>
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const messageStyles = {
          padding: `${spacing[4]} ${spacing[5]}`,
          margin: `0 ${spacing[4]} ${spacing[3]}`,
          backgroundColor: isUser ? colors.primary.lightest : colors.background.paper,
          borderLeft: `4px solid ${isUser ? colors.primary.base : colors.success.main}`,
          borderRadius: borderRadius.base,
          boxShadow: shadows.sm,
        };

        const labelStyles = {
          fontWeight: typography.fontWeight.semibold,
          marginBottom: spacing[2],
          fontSize: typography.fontSize.sm,
          color: isUser ? colors.primary.dark : colors.success.dark,
          textTransform: 'uppercase',
          letterSpacing: typography.letterSpacing.wide,
        };

        return (
          <div key={message.id} style={messageStyles}>
            <div style={labelStyles}>
              {isUser ? 'You' : 'Tutor'}
            </div>
            
            {/* Display image if present */}
            {message.imageUrl && (
              <div style={{ marginBottom: spacing[3] }}>
                <img 
                  src={message.imageUrl} 
                  alt="Uploaded" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: borderRadius.base,
                    cursor: 'pointer',
                    border: `1px solid ${colors.divider}`,
                    boxShadow: shadows.sm,
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
        );
      })}
    </div>
  );
}

export default MessageList;

