import { createContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../utils/firebase';

// Create the auth context
export const AuthContext = createContext({
  currentUser: null,
  authToken: null,
  loading: true,
});

// AuthProvider component wraps the app and provides auth state
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);
      
      // Get auth token if user is logged in
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
        } catch (error) {
          console.error('Error getting auth token:', error);
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    authToken,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

