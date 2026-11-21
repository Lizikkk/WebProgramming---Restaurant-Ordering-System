import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <nav className="navbar site-navbar" aria-label="Main navigation">
      <Link to="/" className="brand" aria-label={t('Georgian Restaurant')}><span>Georgian</span><span>Restaurant</span></Link>
      <div className="nav-links">
        <Link to="/">{t('Home')}</Link>
        <Link to="/menu">{t('Menu')}</Link>
        <Link to="/team">{t('Team')}</Link>
        <Link to="/contact">{t('Contact')}</Link>
        <Link to="/menu#cart">{t('MyBasket')}{totalCount > 0 ? ` (${totalCount})` : ''}</Link>
        {user?.role === 'customer' && <Link to="/orders">{t('My Orders')}</Link>}
        {(user?.role === 'staff' || user?.role === 'admin') && <Link to="/kitchen">{t('Kitchen Orders Board')}</Link>}
        {user?.role === 'admin' && <Link to="/admin">{t('Admin Dashboard')}</Link>}
        <Link to="/login">{user ? user.name : t('MyAccount')}</Link>
        {user && <button className="nav-action" onClick={handleLogout}>{t('Logout')}</button>}
        <button className="language-toggle nav-language" type="button" onClick={toggleLanguage} aria-label={language === 'en' ? 'Switch to Georgian' : 'Switch to English'}>{language === 'en' ? 'EN' : 'KA'}</button>
      </div>
    </nav>
  );
}
