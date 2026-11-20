import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const STATUSES = ['New', 'Preparing', 'Ready', 'Delivered'];

export default function StaffBoardPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [deleteOrderId, setDeleteOrderId] = useState(null);

  const { user } = useAuth();

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

  const updateStatus = async (orderId, nextStatus) => {
    setError('');
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteOrderId) return;
    setError('');
    try {
      await apiFetch(`/orders/${deleteOrderId}`, { method: 'DELETE' });
      setDeleteOrderId(null);
      loadOrders();
    } catch (err) {
      setError(err.message);
      setDeleteOrderId(null);
    }
  };

  return (
    <div className="container">
      <div className="board-header">
        <h2>Kitchen Orders Board</h2>
        <button onClick={loadOrders}>Refresh Orders</button>
      </div>
      {error && <p className="error">{error}</p>}

      <div className="kanban-board">
        {STATUSES.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          const nextStatus = STATUSES[STATUSES.indexOf(status) + 1];

          return (
            <div key={status} className="kanban-column">
              <h3>
                {status} ({columnOrders.length})
              </h3>

              {columnOrders.map((order) => (
                <div key={order.id} className="kitchen-card">
                  <div className="kitchen-card-header">
                    <strong>Order #{order.id}</strong>
                    <span>{order.customer_name}</span>
                  </div>

                  <ul className="order-items-list">
                    {order.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.name}
                      </li>
                    ))}
                  </ul>

                  <p className="total">
                    <strong>Total: ${Number(order.total_price).toFixed(2)}</strong>
                  </p>

                  <div className="kitchen-card-actions">
                    {nextStatus && (
                      <button
                        className="btn-primary"
                        onClick={() => updateStatus(order.id, nextStatus)}
                      >
                        Move to {nextStatus} →
                      </button>
                    )}

                    {user?.role === 'admin' && (
                      <button
                        className="btn-danger"
                        onClick={() => setDeleteOrderId(order.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteOrderId)}
        title="Delete Order"
        message={`Are you sure you want to permanently delete Order #${deleteOrderId}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOrderId(null)}
      />
    </div>
  );
}