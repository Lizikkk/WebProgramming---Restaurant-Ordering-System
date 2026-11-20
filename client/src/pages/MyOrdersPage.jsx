import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const STATUS_STEPS = ['New', 'Preparing', 'Ready', 'Delivered'];

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [cancelOrderId, setCancelOrderId] = useState(null);

  const loadOrders = () => {
    apiFetch('/orders')
      .then(setOrders)
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
    <div className="container">
      <h2>My Orders</h2>
      {error && <p className="error">{error}</p>}

      {orders.length === 0 ? (
        <p>You have not placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const currentStepIndex = STATUS_STEPS.indexOf(order.status);

            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.id}</h3>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="status-stepper">
                  {STATUS_STEPS.map((step, idx) => (
                    <span
                      key={step}
                      className={`step ${idx <= currentStepIndex ? 'completed' : ''}`}
                    >
                      {step}
                    </span>
                  ))}
                </div>

                <ul className="order-items-list">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity}x {item.name} — ${(item.unit_price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="order-footer">
                  <strong>Total: ${Number(order.total_price).toFixed(2)}</strong>
                  {order.status === 'New' && (
                    <button
                      className="btn-danger"
                      onClick={() => setCancelOrderId(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(cancelOrderId)}
        title="Cancel Order"
        message={`Are you sure you want to cancel Order #${cancelOrderId}?`}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelOrderId(null)}
      />
    </div>
  );
}