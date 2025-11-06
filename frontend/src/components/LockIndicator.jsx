import { colors, spacing } from '../styles/tokens';

/**
 * LockIndicator Component
 * 
 * Displays a low-profile lock/unlock icon based on canvas state
 * Positioned below the eye icon toggle button
 */
function LockIndicator({ isLocked }) {
  const buttonStyles = {
    position: 'fixed',
    top: '168px', // Below eye icon (120px + 36px height + 12px gap)
    left: spacing[3],
    zIndex: 10,
    padding: '6.5px', // 20px icon + 13px padding + 3px border = 36px total
    backgroundColor: 'transparent',
    border: `1.5px solid ${colors.divider}`,
    borderRadius: '6px',
    cursor: 'default',
    color: colors.text.secondary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px', // Icon size
    height: '20px', // Icon size
  };

  return (
    <div 
      style={buttonStyles} 
      title={isLocked ? "Canvas locked — waiting for visualization" : "Canvas unlocked — ready to draw"}
    >
      {isLocked ? (
        /* Lock icon (locked state) */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ) : (
        /* Unlock icon (unlocked state) */
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
        </svg>
      )}
    </div>
  );
}

export default LockIndicator;

