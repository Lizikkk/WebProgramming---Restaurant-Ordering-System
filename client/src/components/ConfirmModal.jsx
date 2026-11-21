import { useLanguage } from '../context/LanguageContext';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title || t('Confirm Delete')}</h3>
        <p>{message || t('Are you sure you want to delete this item?')}</p>
        <div className="modal-actions">
          <button type="button" onClick={onCancel}>{t('Cancel')}</button>
          <button type="button" className="btn-danger" onClick={onConfirm}>{t('Delete')}</button>
        </div>
      </div>
    </div>
  );
}
