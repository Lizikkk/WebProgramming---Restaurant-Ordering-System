import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const loggedUser = isRegister
        ? await register(name, email, password)
        : await login(email, password);

      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'staff') navigate('/kitchen');
      else navigate('/menu');
    } catch (err) {
      setError(err.message);
    }
  };

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