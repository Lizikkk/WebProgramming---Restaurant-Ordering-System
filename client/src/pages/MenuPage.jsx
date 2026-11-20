import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');

  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([apiFetch('/categories'), apiFetch('/menu')])
      .then(([cats, items]) => {
        setCategories(cats);
        setMenuItems(items);
      })
      .catch((err) => setError(err.message));
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category_id === Number(selectedCategory);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setOrderMessage('');

    try {
      const payload = {
        items: cart.map((c) => ({
          menu_item_id: c.menu_item_id,
          quantity: c.quantity,
        })),
      };
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      clearCart();
      setOrderMessage('Order placed successfully! View it in My Orders.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-layout">
      <div className="menu-section">
        <h2>Menu</h2>
        {error && <p className="error">{error}</p>}
        {orderMessage && <p className="success">{orderMessage}</p>}

        {/* Search Input */}
        <input
          type="text"
          className="search-input"
          placeholder="Search dishes by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Category Filter Tabs */}
        <div className="category-tabs">
          <button
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={selectedCategory === String(cat.id) ? 'active' : ''}
              onClick={() => setSelectedCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <p>No dishes match your filter.</p>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="menu-card-img"
                  />
                )}
                <div className="menu-card-header">
                  <h3>{item.name}</h3>
                  <span className="price">${Number(item.price).toFixed(2)}</span>
                </div>
                <p className="category-tag">{item.category_name}</p>
                <p className="description">{item.description}</p>

                {(!user || user.role === 'customer') && (
                  <button className="btn-primary" onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Sidebar for Customers / Guests */}
      {(!user || user.role === 'customer') && (
        <aside className="cart-sidebar">
          <h3>Your Cart</h3>
          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((item) => (
                  <li key={item.menu_item_id} className="cart-item">
                    <div>
                      <strong>{item.name}</strong>
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="qty-controls">
                      <button
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.menu_item_id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="cart-footer">
                <p>
                  <strong>Total: ${totalPrice.toFixed(2)}</strong>
                </p>
                <button className="btn-primary" onClick={handleCheckout}>
                  {user ? 'Place Order' : 'Login to Order'}
                </button>
              </div>
            </>
          )}
        </aside>
      )}
    </div>
  );
}