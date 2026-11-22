import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setMenuOpen(false);
  const handleLogout = async () => {
    await logout();
    closeMenu();
    navigate('/');
  };
  const linkClass = ({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar site-navbar" aria-label="Main navigation">
      <Link to="/" className="brand" aria-label={t('Georgian Restaurant')} onClick={closeMenu}>
        <span>Georgian</span><span>Restaurant</span>
      </Link>

      <button
        className="site-nav-toggle"
        type="button"
        aria-label={menuOpen ? t('Close navigation menu') : t('Open navigation menu')}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-links${menuOpen ? ' is-open' : ''}`}>
        <NavLink to="/" end className={linkClass} onClick={closeMenu}>{t('Home')}</NavLink>
        <NavLink to="/menu" className={linkClass} onClick={closeMenu}>{t('Menu')}</NavLink>
        {(!user || user.role === 'customer') && (
          <NavLink to="/cart" className={linkClass} onClick={closeMenu}>
            {t('MyBasket')}{totalCount > 0 ? ` (${totalCount})` : ''}
          </NavLink>
        )}
        <NavLink to="/team" className={linkClass} onClick={closeMenu}>{t('Team')}</NavLink>
        <NavLink to="/contact" className={linkClass} onClick={closeMenu}>{t('Contact')}</NavLink>
        {user?.role === 'customer' && <NavLink to="/orders" className={linkClass} onClick={closeMenu}>{t('My Orders')}</NavLink>}
        {(user?.role === 'staff' || user?.role === 'admin') && <NavLink to="/kitchen" className={linkClass} onClick={closeMenu}>{t('Kitchen Orders Board')}</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className={linkClass} onClick={closeMenu}>{t('Admin Dashboard')}</NavLink>}
        <NavLink to={user ? '/account' : '/login'} className={linkClass} onClick={closeMenu}>
          {user ? user.name : t('MyAccount')}
        </NavLink>
        {user && <button className="nav-action" type="button" onClick={handleLogout}>{t('Logout')}</button>}
        <button className="language-toggle nav-language" type="button" onClick={toggleLanguage} aria-label={language === 'en' ? 'Switch to Georgian' : 'Switch to English'}>
          {language === 'en' ? 'EN' : 'KA'}
        </button>
      </div>
    </nav>
  );
}
