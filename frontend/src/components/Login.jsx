import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInUser } from '../utils/firebase';
import { useAuth } from '../hooks/useAuth';
import { getAuthErrorMessage } from '../utils/authErrors';
import Input from './design-system/Input';
import Card from './design-system/Card';
import Button from './design-system/Button';
import { colors, typography, spacing, borderRadius } from '../styles/tokens';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already logged in
  if (currentUser) {
    navigate('/');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error: signInError } = await signInUser(email, password);

    if (signInError) {
      setError(getAuthErrorMessage(signInError));
      setLoading(false);
    } else {
      // Successfully logged in, navigate to home
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
        <h2 style={titleStyles}>Login</h2>
        
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p style={linkStyles}>
          Don't have an account?{' '}
          <a
            href="/signup"
            style={linkAnchorStyles}
            onClick={(e) => {
              e.preventDefault();
              navigate('/signup');
            }}
          >
            Sign up
          </a>
        </p>
      </Card>
    </div>
  );
}

export default Login;

