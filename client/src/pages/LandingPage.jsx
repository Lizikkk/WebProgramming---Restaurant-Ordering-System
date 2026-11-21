import { useState } from 'react';
import { Link } from 'react-router-dom';
import foodHero from '../assets/georgian-food-editorial.png';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-header-left">
          <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" aria-label={t(menuOpen ? 'Close navigation menu' : 'Open navigation menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span/><span/><span/></button>
          <Link className="landing-nav-link" to="/menu">{t('Menu')}</Link>
          <Link className="landing-nav-link" to="/team">{t('Team')}</Link>
        </div>
        <Link to="/" className="landing-logo" aria-label={t('Georgian Restaurant')}><span>{language === 'ka' ? 'ქართული' : 'Georgian'}</span><span>{language === 'ka' ? 'რესტორანი' : 'Restaurant'}</span></Link>
        <div className="landing-header-right">
          <Link className="landing-nav-link" to="/login">{t('MyAccount')}</Link>
          <Link className="landing-nav-link" to="/contact">{t('Contact')}</Link>
          <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label="Switch language">{language === 'en' ? 'EN' : 'KA'}</button>
        </div>
        {menuOpen && <nav className="landing-dropdown" aria-label="Main navigation"><Link to="/menu" onClick={() => setMenuOpen(false)}>{t('Explore the menu')}</Link><Link to="/login" onClick={() => setMenuOpen(false)}>{t('My account')}</Link><Link to="/team" onClick={() => setMenuOpen(false)}>{t('Our team')}</Link><a href="#contact" onClick={() => setMenuOpen(false)}>{t('Contact')}</a></nav>}
      </header>
      <main className="landing-hero">
        <section className="landing-copy" aria-label="Welcome"><h1><span>{t('Made by Georgians.')}</span><span>{t('Enjoyed by Everyone.')}</span></h1><p>{t('Ketili Ikos Tqveni Mobrdzaneba')}</p></section>
        <div className="landing-food-wrap"><img className="landing-food-image" src={foodHero} alt="Traditional Georgian Adjarian khachapuri and khinkali with herbs and Georgian table textiles" /></div>
      </main>
      <footer className="landing-footer"><span>{t('Made with Georgian hospitality.')}</span><span id="contact">{t('Welcome to our table.')}</span></footer>
    </div>
  );
}
