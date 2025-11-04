import { createContext, useState, useEffect } from 'react';
import { onAuthStateChange } from '../utils/firebase';

// Create the auth context
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
});

// AuthProvider component wraps the app and provides auth state
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

