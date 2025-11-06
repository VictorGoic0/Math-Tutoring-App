import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Whiteboard from './components/Whiteboard';
import LockIndicator from './components/LockIndicator';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { useAuth } from './hooks/useAuth';
import { useCanvasStore } from './stores/canvasStore';
import { colors, typography, spacing } from './styles/tokens';

/**
 * Chat and Whiteboard Split Layout
 * 
 * Displays Chat and Whiteboard side by side in a split view.
 * Canvas can be hidden/shown with smooth animations.
 */
function ChatWhiteboardLayout() {
  const [isCanvasVisible, setIsCanvasVisible] = useState(false);
  const [hasManuallyHidden, setHasManuallyHidden] = useState(false);
  
  const shouldShowCanvas = useCanvasStore(state => state.shouldShowCanvas);
  const setShouldShowCanvas = useCanvasStore(state => state.setShouldShowCanvas);
  const isLocked = useCanvasStore(state => state.isLocked);

  // Listen to store's shouldShowCanvas event (but respect manual hide)
  useEffect(() => {
    if (shouldShowCanvas && !hasManuallyHidden) {
      setIsCanvasVisible(true);
    }
  }, [shouldShowCanvas, hasManuallyHidden]);
  
  const handleHideCanvas = () => {
    setIsCanvasVisible(false);
    setHasManuallyHidden(true);
    setShouldShowCanvas(false); // Update store
  };
  
  const handleShowCanvas = () => {
    setIsCanvasVisible(true);
    setHasManuallyHidden(false);
    setShouldShowCanvas(true); // Update store
  };

  const layoutStyles = {
    flex: 1,
    display: 'flex',
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    gap: 0,
    position: 'relative',
  };

  const whiteboardContainerStyles = {
    flex: isCanvasVisible ? '1 1 65%' : '0 0 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: isCanvasVisible ? `1px solid ${colors.divider}` : 'none',
    transition: 'flex 0.3s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.3s ease-in-out',
    opacity: isCanvasVisible ? 1 : 0,
    position: 'relative',
    willChange: 'flex, opacity',
    visibility: isCanvasVisible ? 'visible' : 'hidden', // Keep in DOM but hide
  };

  const chatContainerStyles = {
    flex: isCanvasVisible ? '1 1 35%' : '1 1 100%',
    minWidth: 0,
    maxWidth: '50%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'flex 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    margin: isCanvasVisible ? '0' : '0 auto',
    willChange: 'flex',
  };

  const toggleButtonStyles = {
    position: 'fixed',
    top: '120px',
    left: spacing[3],
    zIndex: 10,
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: `1.5px solid ${colors.divider}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    color: colors.text.secondary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  };

  const showButtonStyles = {
    position: 'fixed',
    top: '120px',
    left: spacing[3],
    zIndex: 10,
    padding: spacing[2],
    backgroundColor: 'transparent',
    border: `1.5px solid ${colors.divider}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '18px',
    color: colors.text.secondary,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
  };

  return (
    <div style={layoutStyles}>
      {/* Hide button (shows when canvas is visible) */}
      {isCanvasVisible && (
        <button
          style={toggleButtonStyles}
          onClick={handleHideCanvas}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.neutral.lighter;
            e.currentTarget.style.borderColor = colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = colors.divider;
          }}
          title="Hide Canvas"
        >
          {/* Eye slash icon (hidden) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        </button>
      )}

      {/* Show button (shows when canvas is hidden) */}
      {!isCanvasVisible && (
        <button
          style={showButtonStyles}
          onClick={handleShowCanvas}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.neutral.lighter;
            e.currentTarget.style.borderColor = colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = colors.divider;
          }}
          title="Show Canvas"
        >
          {/* Eye icon (visible) */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
      )}

      <div style={whiteboardContainerStyles}>
        <LockIndicator isLocked={isLocked} />
        <Whiteboard />
      </div>
      <div style={chatContainerStyles}>
        <Chat />
      </div>
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  const loadingStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: colors.background.default,
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
    marginTop: '1rem',
    color: colors.text.secondary,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.base,
  };

  if (loading) {
    return (
      <div style={loadingStyles}>
        <div style={{ textAlign: 'center' }}>
          <div style={spinnerStyles}></div>
          <p style={loadingTextStyles}>Loading...</p>
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

  const appStyles = {
    height: '100vh',
    maxHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: typography.fontFamily.base,
    backgroundColor: colors.background.default,
    overflow: 'hidden',
  };

  return (
    <>
      <style>{`
        html, body {
          height: 100%;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        #root {
          height: 100%;
          overflow: hidden;
        }
      `}</style>
      <div style={appStyles}>
        <Header />

        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatWhiteboardLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </>
  );
}

export default App;

