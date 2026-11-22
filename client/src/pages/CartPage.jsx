import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const formatPrice = (price) => `${Number(price).toFixed(2)} ₾`;

export default function CartPage() {
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    if (user.role !== 'customer') {
      setError(t('Only customer accounts can place orders.'));
      return;
    }
    if (!cart.length) return;

    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const payload = {
        items: cart.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      };
      await apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
      clearCart();
      setSuccess(t('Order placed successfully!'));
    } catch (err) {
      setError(err.message || t('Could not place your order.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="cart-page">
      <div className="cart-page-heading">
        <p className="eyebrow">{t('Georgian Restaurant')}</p>
        <h1>{t('Your Cart')}</h1>
        <p>{t('Review your selected dishes before placing your order.')}</p>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {success && <p className="success" role="status">{success}</p>}

      {!cart.length ? (
        <div className="cart-empty-state">
          <p>{t('Your cart is empty.')}</p>
          <Link className="btn-primary" to="/menu">{t('Explore the menu')}</Link>
          {success && user?.role === 'customer' && <Link to="/orders">{t('View My Orders')}</Link>}
        </div>
      ) : (
        <>
          <div className="cart-page-list">
            {cart.map((item) => (
              <article className="cart-page-item" key={item.menu_item_id}>
                <div className="cart-page-item-info">
                  <h2>{t(item.name)}</h2>
                  <p>{formatPrice(item.price)} {t('each')}</p>
                </div>
                <div className="cart-page-item-controls">
                  <div className="qty-controls">
                    <button type="button" aria-label={t('Decrease quantity')} onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={t('Increase quantity')} onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}>+</button>
                  </div>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                  <button className="cart-remove" type="button" onClick={() => removeFromCart(item.menu_item_id)}>{t('Remove')}</button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart-page-summary">
            <p><span>{t('Total')}</span><strong>{formatPrice(totalPrice)}</strong></p>
            <button className="btn-primary" type="button" onClick={handleCheckout} disabled={submitting}>
              {submitting ? t('Placing order...') : user ? t('Place Order') : t('Login to Order')}
            </button>
            <Link to="/menu">{t('Continue shopping')}</Link>
          </div>
        </>
      )}
    </section>
  );
}
