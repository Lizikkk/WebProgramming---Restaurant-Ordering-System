import foodHero from '../assets/georgian-food-editorial.png';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { t } = useLanguage();
  return (
    <div className="landing-page">
      <main className="landing-hero">
        <section className="landing-copy" aria-label="Welcome"><h1><span>{t('Made by Georgians.')}</span><span>{t('Enjoyed by Everyone.')}</span></h1><p>{t('Ketili Ikos Tqveni Mobrdzaneba')}</p></section>
        <div className="landing-food-wrap"><img className="landing-food-image" src={foodHero} alt="Traditional Georgian Adjarian khachapuri and khinkali with herbs and Georgian table textiles" /></div>
      </main>
      <footer className="landing-footer"><span>{t('Made with Georgian hospitality.')}</span><span id="contact">{t('Welcome to our table.')}</span></footer>
    </div>
  );
}
