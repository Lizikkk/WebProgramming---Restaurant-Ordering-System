import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register, user } = useAuth();
  const { mergeGuestCartForUser } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loggedUser = isRegister
        ? await register(name, email, password)
        : await login(email, password);

      const requestedPath = location.state?.from;
      if (requestedPath === '/cart') mergeGuestCartForUser(loggedUser.id);
      if (requestedPath) navigate(requestedPath, { replace: true });
      else if (loggedUser.role === 'admin') navigate('/admin', { replace: true });
      else if (loggedUser.role === 'staff') navigate('/kitchen', { replace: true });
      else navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div className="auth-container editorial-card">
        <p className="eyebrow">Georgian Restaurant</p>
        <h2>{t('You are already signed in.')}</h2>
        <p>{t('Signed in as')} {user.name}</p>
        <Link className="btn-primary account-login-link" to="/account">{t('Go to My Account')}</Link>
      </div>
    );
  }

  return (
    <div className="auth-container editorial-card">
      <p className="eyebrow">Georgian Restaurant</p>
      <h2>{isRegister ? t('Create Account') : t('Login')}</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            type="text"
            placeholder={t('Full Name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder={t('Email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('Password (min 6 chars)')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-primary" type="submit">{isRegister ? t('Register') : t('Login')}</button>
      </form>

      <button
        type="button"
        className="link-btn"
        onClick={() => {
          setIsRegister(!isRegister);
          setError('');
        }}
      >
        {isRegister ? t('Already have an account? Login') : t('Need an account? Register')}
      </button>
    </div>
  );
}