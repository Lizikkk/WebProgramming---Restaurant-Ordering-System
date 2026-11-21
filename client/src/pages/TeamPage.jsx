import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import teamTable from '../assets/georgian-food-editorial.png';

export default function TeamPage() {
  const { t } = useLanguage();
  return (
    <section className="editorial-page team-page">
      <div className="editorial-copy">
        <p className="eyebrow">{t('Team')}</p>
        <h1>{t('A table full of stories')}</h1>
        <p>{t('We bring Georgian hospitality to every guest, with recipes, traditions and the joy of sharing food.')}</p>
        <h2>{t('Our philosophy')}</h2>
        <p className="handwritten-line">{t('Food tastes better when shared.')}</p>
        <Link className="text-link" to="/menu">{t('Explore the menu')} ↗</Link>
      </div>
      <img src={teamTable} alt={t('Georgian Restaurant')} />
    </section>
  );
}
