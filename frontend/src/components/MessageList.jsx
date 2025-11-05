import { useEffect, useRef } from 'react';
import MathDisplay from './MathDisplay';
import { colors, typography, spacing, borderRadius, shadows, transitions } from '../styles/tokens';

function TypingIndicator() {
  const typingIndicatorStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: `${spacing[2]} 0`,
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
    fontStyle: 'italic',
  };

  const dotStyles = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: colors.primary.base,
    animation: 'typingDot 1.4s infinite ease-in-out',
  };

  return (
    <>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
        .typing-dot-1 {
          animation-delay: 0s;
        }
        .typing-dot-2 {
          animation-delay: 0.2s;
        }
        .typing-dot-3 {
          animation-delay: 0.4s;
        }
      `}</style>
      <div style={typingIndicatorStyles}>
        <span>Tutor is thinking</span>
        <span style={{ ...dotStyles }} className="typing-dot-1"></span>
        <span style={{ ...dotStyles }} className="typing-dot-2"></span>
        <span style={{ ...dotStyles }} className="typing-dot-3"></span>
      </div>
    </>
  );
}

function MessageList({ messages, isLoading = false }) {
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
    cursor: 'pointer',
    transition: `all ${transitions.duration.short} ${transitions.easing.easeInOut}`,
  };

  const containerStyles = {
    height: '100%',
    overflowY: 'auto',
    padding: `${spacing[4]} 0`,
    border: `1px solid ${colors.divider}`,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.default,
    boxShadow: shadows.sm,
    scrollBehavior: 'smooth',
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
            <div 
              style={exampleItemStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary.lightest;
                e.currentTarget.style.borderColor = colors.primary.light;
                e.currentTarget.style.color = colors.primary.dark;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.paper;
                e.currentTarget.style.borderColor = colors.divider;
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              "How do I solve 2x + 5 = 13?"
            </div>
            <div 
              style={exampleItemStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary.lightest;
                e.currentTarget.style.borderColor = colors.primary.light;
                e.currentTarget.style.color = colors.primary.dark;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.paper;
                e.currentTarget.style.borderColor = colors.divider;
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              "Explain the quadratic formula"
            </div>
            <div 
              style={exampleItemStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary.lightest;
                e.currentTarget.style.borderColor = colors.primary.light;
                e.currentTarget.style.color = colors.primary.dark;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.background.paper;
                e.currentTarget.style.borderColor = colors.divider;
                e.currentTarget.style.color = colors.text.secondary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Upload an image of your math problem
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Custom scrollbar styling */
        div::-webkit-scrollbar {
          width: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: ${colors.background.default};
          border-radius: ${borderRadius.base};
        }
        
        div::-webkit-scrollbar-thumb {
          background: ${colors.neutral.mediumLight};
          border-radius: ${borderRadius.base};
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: ${colors.neutral.mediumDark};
        }
      `}</style>
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
          transition: `transform ${transitions.duration.short} ${transitions.easing.easeOut}, box-shadow ${transitions.duration.short} ${transitions.easing.easeOut}`,
          animation: `fadeIn ${transitions.duration.medium} ${transitions.easing.easeOut}`,
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
                    transition: `transform ${transitions.duration.short} ${transitions.easing.easeInOut}, box-shadow ${transitions.duration.short} ${transitions.easing.easeInOut}`,
                  }}
                  onClick={() => window.open(message.imageUrl, '_blank')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = shadows.md;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = shadows.sm;
                  }}
                />
              </div>
            )}
            
            {/* Display text content with math rendering */}
            {message.content ? (
              <MathDisplay content={message.content} />
            ) : isLoading && message.role === 'assistant' && messages[messages.length - 1]?.id === message.id ? (
              <TypingIndicator />
            ) : null}
          </div>
        );
      })}
      </div>
    </>
  );
}

export default MessageList;

