import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { signOutUser } from '../utils/firebase';
import Button from './design-system/Button';
import { colors, typography, spacing, shadows } from '../styles/tokens';

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

  const headerStyles = {
    padding: `${spacing[4]} ${spacing[6]}`,
    backgroundColor: colors.background.paper,
    borderBottom: `1px solid ${colors.divider}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: shadows.sm,
  };

  const logoContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  };

  const logoStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1],
  };

  const logoImageStyles = {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
  };

  const appNameStyles = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary.base,
    margin: 0,
    lineHeight: typography.lineHeight.tight,
  };

  const welcomeStyles = {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.regular,
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
  };

  return (
    <header style={headerStyles}>
      <div style={logoContainerStyles}>
        <img 
          src="/math-mentor-logo-svg.svg" 
          alt="MathMentor AI Logo" 
          style={logoImageStyles}
        />
        <div style={logoStyles}>
          <h1 style={appNameStyles}>MathMentor AI</h1>
          <span style={welcomeStyles}>
            Welcome, {currentUser.displayName || currentUser.email}
          </span>
        </div>
      </div>
      <div style={rightSectionStyles}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}

export default Header;

