import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <section className="account-page">
      <p className="eyebrow">{t('Georgian Restaurant')}</p>
      <h1>{t('My Account')}</h1>
      <div className="account-details">
        <p><span>{t('Name')}</span><strong>{user.name}</strong></p>
        <p><span>{t('Email')}</span><strong>{user.email}</strong></p>
        <p><span>{t('Role')}</span><strong>{t(user.role)}</strong></p>
      </div>
      <div className="account-actions">
        {user.role === 'customer' && <Link to="/orders">{t('My Orders')}</Link>}
        {user.role === 'customer' && <Link to="/cart">{t('MyBasket')}</Link>}
        {(user.role === 'admin' || user.role === 'staff') && <Link to="/kitchen">{t('Kitchen Orders Board')}</Link>}
        {user.role === 'admin' && <Link to="/admin">{t('Admin Dashboard')}</Link>}
        <Link to="/menu">{t('Explore the menu')}</Link>
        <button className="btn-danger" type="button" onClick={handleLogout}>{t('Logout')}</button>
      </div>
    </section>
  );
}
