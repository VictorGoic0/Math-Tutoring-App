import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOutUser } from '../utils/firebase';

function Header() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };

  if (!currentUser) {
    return null;
  }

  return (
    <header style={{
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <span style={{ fontWeight: '500' }}>
          Welcome, {currentUser.displayName || currentUser.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </header>
  );
}

export default Header;

