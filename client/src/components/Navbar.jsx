import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const { language, toggleLanguage, t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const closeMenus = () => {
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const handleAccountClick = () => {
    setMenuOpen(false);
    if (!user) {
      setAccountOpen(false);
      navigate('/login');
      return;
    }
    setAccountOpen((open) => !open);
  };

  const handleLogout = async () => {
    await logout();
    closeMenus();
    navigate('/');
  };

  const linkClass = ({ isActive }) => `site-nav-link${isActive ? ' active' : ''}`;

  return (
    <nav className="navbar site-navbar" aria-label="Main navigation">
      <button
        className="site-nav-toggle"
        type="button"
        aria-label={menuOpen ? t('Close navigation menu') : t('Open navigation menu')}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span /><span /><span />
      </button>

      <div className={`nav-left-links${menuOpen ? ' is-open' : ''}`}>
        <NavLink to="/" end className={linkClass} onClick={closeMenus}>{t('Home')}</NavLink>
        <NavLink to="/menu" className={linkClass} onClick={closeMenus}>{t('Menu')}</NavLink>
      </div>

      <Link to="/" className="brand" aria-label={t('Georgian Restaurant')} onClick={closeMenus}>
        <span>Georgian</span><span>Restaurant</span>
      </Link>

      <div className="nav-right-actions">
        {(!user || user.role === 'customer') && (
          <NavLink to="/cart" className={`basket-icon-button${location.pathname === '/cart' ? ' is-active' : ''}`} aria-label={t('MyBasket')} title={t('MyBasket')}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 4h2l2.1 11.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            {totalCount > 0 && <span className="basket-count">{totalCount}</span>}
          </NavLink>
        )}

        {user?.role === 'customer' && <NavLink to="/orders" className={linkClass}>{t('My Orders')}</NavLink>}
        {(user?.role === 'staff' || user?.role === 'admin') && <NavLink to="/kitchen" className={linkClass}>{t('Kitchen Orders Board')}</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin" className={linkClass}>{t('Admin Dashboard')}</NavLink>}

        <div className="account-menu-wrap">
          <button
            type="button"
            className={`account-icon-button${accountOpen ? ' is-open' : ''}`}
            aria-label={user ? t('My Account') : t('Login')}
            aria-expanded={user ? accountOpen : undefined}
            onClick={handleAccountClick}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.5-3.5 3.2-5.5 7-5.5s6.5 2 7 5.5" />
            </svg>
          </button>
          {user && accountOpen && (
            <div className="account-dropdown">
              <div className="account-dropdown-details">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <small>{t(user.role)}</small>
              </div>
              <Link to="/account" onClick={closeMenus}>{t('My Account')}</Link>
              <button type="button" className="nav-action account-logout" onClick={handleLogout}>{t('Logout')}</button>
            </div>
          )}
        </div>

        <button className="language-toggle nav-language" type="button" onClick={toggleLanguage} aria-label={language === 'en' ? 'Switch to Georgian' : 'Switch to English'}>
          {language === 'en' ? 'EN' : 'KA'}
        </button>
      </div>
    </nav>
  );
}
