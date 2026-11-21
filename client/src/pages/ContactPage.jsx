
import { useLanguage } from '../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <section className="contact-page">
      <div className="contact-heading">
        <p className="eyebrow">{t('Get in touch')}</p>
        <h1>{t('Contact Us')}</h1>
        <p>
          {t('We would love to welcome you to our table.')}
        </p>
      </div>

      <div className="contact-grid">
        <article className="contact-card">
          <span className="contact-icon">◷</span>
          <h2>{t('Working Hours')}</h2>
          <p>{t('Monday – Sunday')}</p>
          <strong>{t('Hours to be confirmed')}</strong>
        </article>

        <article className="contact-card">
          <span className="contact-icon">☎</span>
          <h2>{t('Phone')}</h2>
          <p>{t('Call us for reservations and questions.')}</p>
          <strong>{t('Phone number to be added')}</strong>
        </article>

        <article className="contact-card">
          <span className="contact-icon">⌖</span>
          <h2>{t('Location')}</h2>
          <p>{t('Come and visit us.')}</p>
          <strong>{t('Address to be added')}</strong>
        </article>

        <article className="contact-card">
          <span className="contact-icon">✉</span>
          <h2>{t('Email')}</h2>
          <p>{t('Send us your questions.')}</p>
          <strong>{t('Email address to be added')}</strong>
        </article>
      </div>
    </section>
  );
}
