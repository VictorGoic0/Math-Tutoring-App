import { Routes, Route, Navigate } from 'react-router-dom';
import Chat from './components/Chat';
import Whiteboard from './components/Whiteboard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import { useAuth } from './hooks/useAuth';
import { colors, typography, spacing } from './styles/tokens';

/**
 * Chat and Whiteboard Split Layout
 * 
 * Displays Chat and Whiteboard side by side in a split view.
 */
function ChatWhiteboardLayout() {
  const layoutStyles = {
    flex: 1,
    display: 'flex',
    height: 'calc(100vh - 80px)',
    overflow: 'hidden',
    gap: 0,
  };

  const whiteboardContainerStyles = {
    flex: '1 1 50%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRight: `1px solid ${colors.divider}`,
  };

  const chatContainerStyles = {
    flex: '1 1 50%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return (
    <div style={layoutStyles}>
      <div style={whiteboardContainerStyles}>
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

