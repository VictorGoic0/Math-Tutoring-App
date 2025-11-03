import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Custom hook to use the auth context
// Returns: { currentUser, authToken, loading }
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

