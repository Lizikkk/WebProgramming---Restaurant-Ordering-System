import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import { useLanguage } from '../context/LanguageContext';
import orderFallback from '../assets/georgian-food-editorial.png';

function formatOrderDate(value, language) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === 'ka' ? 'ka-GE' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const { t, language } = useLanguage();

  const loadOrders = () => {
    apiFetch('/orders')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return;
    try {
      await apiFetch(`/orders/${cancelOrderId}`, { method: 'DELETE' });
      setCancelOrderId(null);
      loadOrders();
    } catch (err) {
      setError(err.message);
      setCancelOrderId(null);
    }
  };

  return (
    <section className="orders-page">
      <div className="page-heading">
        <p className="eyebrow">{t('Georgian Restaurant')}</p>
        <h1>{t('My Orders')}</h1>
        <span className="heading-rule" />
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <p>{t('You have not placed any orders yet.')}</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            const itemSummary = (order.items || []).map((item) => `${item.name} ×${item.quantity}`).join(', ');
            const orderDate = order.created_at || order.createdAt || order.order_date || order.date;
            const image = firstItem?.image_url || firstItem?.image || orderFallback;

            return (
              <article key={order.id} className="order-row">
                <div className="order-photo-wrap">
                  <img className="order-photo" src={image} alt={firstItem?.name || t('Georgian Restaurant')} onError={(event) => { event.currentTarget.src = orderFallback; }} />
                </div>
                <div className="order-details">
                  <div className="order-title-line">
                    <h2>{t('Order')} #{order.id}</h2>
                    <span className={`status-badge status-${String(order.status).toLowerCase()}`}>{t(order.status)}</span>
                  </div>
                  <p><strong>{t('Date')}:</strong> {formatOrderDate(orderDate, language)}</p>
                  <p><strong>{t('Status')}:</strong> {t(order.status)}</p>
                  <p className="ordered-items"><strong>{t('Ordered Items')}:</strong> {itemSummary || '—'}</p>
                  <div className="order-bottom-line">
                    <strong className="order-total">{t('Total')}: {Number(order.total_price).toFixed(2)} ₾</strong>
                    {order.status === 'New' && (
                      <button className="btn-danger" onClick={() => setCancelOrderId(order.id)}>{t('Cancel Order')}</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(cancelOrderId)}
        title={t('Cancel Order')}
        message={`${t('Are you sure you want to cancel Order')} #${cancelOrderId}?`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelOrderId(null)}
      />
    </section>
  );
}
