import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpUser } from '../utils/firebase';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authErrors';
import Input from './design-system/Input';
import Card from './design-system/Card';
import Button from './design-system/Button';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  if (currentUser) {
    navigate('/');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);

    const { user, error: signUpError } = await signUpUser(email, password, displayName);

    if (signUpError) {
      const friendlyMessage = getAuthErrorMessage(signUpError);
      
      // Set form-level error or field-specific error based on error code
      const errorCode = signUpError?.code || '';
      if (errorCode === 'auth/email-already-in-use' || errorCode === 'EMAIL_EXISTS') {
        setEmailError(friendlyMessage);
      } else if (errorCode === 'auth/weak-password' || errorCode === 'WEAK_PASSWORD') {
        setPasswordError(friendlyMessage);
      } else {
        setError(friendlyMessage);
      }
      setLoading(false);
    } else {
      // Successfully signed up, navigate to home
      navigate('/');
    }
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: colors.background.default,
    padding: spacing[4],
  };

  const titleStyles = {
    marginBottom: spacing[6],
    textAlign: 'center',
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  };

  const errorStyles = {
    padding: spacing[3],
    marginBottom: spacing[4],
    backgroundColor: colors.error.light + '20',
    color: colors.error.dark,
    borderRadius: borderRadius.base,
    fontSize: typography.fontSize.sm,
    border: `1px solid ${colors.error.light}`,
  };

  const linkStyles = {
    marginTop: spacing[4],
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  };

  const linkAnchorStyles = {
    color: colors.primary.base,
    textDecoration: 'none',
    fontWeight: typography.fontWeight.medium,
  };

  return (
    <div style={containerStyles}>
      <Card
        variant="elevated"
        padding="lg"
        style={{
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <h2 style={titleStyles}>Sign Up</h2>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Display Name (Optional)"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(''); // Clear error on change
            }}
            error={emailError}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(''); // Clear error on change
              // Clear confirm password error if passwords now match
              if (confirmPassword && e.target.value === confirmPassword) {
                setConfirmPasswordError('');
              }
            }}
            error={passwordError}
            required
            helperText="Must be at least 6 characters"
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError(''); // Clear error on change
            }}
            error={confirmPasswordError}
            required
            autoComplete="new-password"
          />

          {error && (
            <div style={errorStyles}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p style={linkStyles}>
          Already have an account?{' '}
          <a
            href="/login"
            style={linkAnchorStyles}
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Login
          </a>
        </p>
      </Card>
    </div>
  );
}

export default SignUp;

