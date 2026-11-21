import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import badrijaniImage from '../assets/menu/badrijani.jpg';
import pkhaliImage from '../assets/menu/pkhali.jpg';
import saladImage from '../assets/menu/georgian-salad.jpg';
import jonjoliImage from '../assets/menu/jonjoli.jpg';
import satsiviImage from '../assets/menu/satsivi.jpg';
import gebzhaliaImage from '../assets/menu/gebzhalia.jpg';
import mchadiImage from '../assets/menu/mchadi.jpg';
import sulguniImage from '../assets/menu/sulguni.jpg';
import adjarianImage from '../assets/menu/adjarian-khachapuri.jpg';
import khinkaliImage from '../assets/menu/khinkali-meat.jpg';
import lobianiImage from '../assets/menu/lobiani.jpg';
import mtsvadiImage from '../assets/menu/mtsvadi.jpg';
import churchkhelaImage from '../assets/menu/churchkhela.jpg';
import pelamushiImage from '../assets/menu/pelamushi.jpg';
import gozinakiImage from '../assets/menu/gozinaki.jpg';
import drinksImage from '../assets/menu/georgian-drinks.jpg';

const dishImages = [
  { terms: ['badrijani', 'ბადრიჯანი'], image: badrijaniImage },
  { terms: ['pkhali', 'ფხალი'], image: pkhaliImage },
  { terms: ['salad', 'სალათი'], image: saladImage },
  { terms: ['jonjoli', 'ჯონჯოლი'], image: jonjoliImage },
  { terms: ['satsivi', 'საცივი'], image: satsiviImage },
  { terms: ['gebzhalia', 'გებჟალია'], image: gebzhaliaImage },
  { terms: ['mchadi', 'მჭადი'], image: mchadiImage },
  { terms: ['sulguni', 'სულგუნი'], image: sulguniImage },
  { terms: ['adjarian', 'imeretian', 'megruli', 'khachapuri', 'აჭარული', 'იმერული', 'მეგრული', 'ხაჭაპური'], image: adjarianImage },
  { terms: ['khinkali', 'ხინკალი'], image: khinkaliImage },
  { terms: ['lobiani', 'ლობიანი'], image: lobianiImage },
  { terms: ['mtsvadi', 'მწვადი'], image: mtsvadiImage },
  { terms: ['ojakhuri', 'ოჯახური'], image: mtsvadiImage },
  { terms: ['chakapuli', 'ჩაქაფული', 'chashushuli', 'ჩაშუშული', 'shkmeruli', 'შქმერული', 'kharcho', 'ხარჩო'], image: satsiviImage },
  { terms: ['churchkhela', 'ჩურჩხელა'], image: churchkhelaImage },
  { terms: ['pelamushi', 'ფელამუში'], image: pelamushiImage },
  { terms: ['gozinaki', 'გოზინაყი', 'kada', 'ქადა', 'nazuki', 'ნაზუქი'], image: gozinakiImage },
  { terms: ['lemonade', 'lemonade', 'borjomi', 'nabeghlavi', 'compote', 'წყალი', 'ლიმონათი', 'ტარხუნა', 'pear', 'მსხალი'], image: drinksImage },
];

function getDishImage(item) {
  if (item.image_url) return item.image_url;
  const name = `${item.name || ''} ${item.description || ''}`.toLowerCase();
  return dishImages.find(({ terms }) => terms.some((term) => name.includes(term)))?.image || '';
}

const formatPrice = (price) => `${Number(price).toFixed(2)} ₾`;

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    let active = true;
    Promise.all([apiFetch('/categories'), apiFetch('/menu')])
      .then(([cats, items]) => {
        if (!active) return;
        setCategories(cats);
        setMenuItems(items);
      })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === Number(selectedCategory);
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || item.name.toLowerCase().includes(query) || (item.description && item.description.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    setError('');
    setOrderMessage('');
    try {
      const payload = { items: cart.map((c) => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })) };
      await apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
      clearCart();
      setOrderMessage(t('Order placed successfully! View it in My Orders.'));
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="georgian-menu-page">
      <section className="menu-section">
        <p className="eyebrow menu-eyebrow">{t('Georgian Restaurant')}</p>
        <h1 className="menu-page-title">{t('Menu')}</h1>
        <p className="menu-intro">{t('A taste of Georgia, made to be shared.')}</p>
        {error && <p className="error" role="alert">{error}</p>}
        {orderMessage && <p className="success" role="status">{orderMessage}</p>}

        <input type="search" className="search-input" placeholder={t('Search dishes by name or description...')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

        <div className="category-tabs menu-category-tabs" aria-label={t('Menu categories')}>
          <button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => setSelectedCategory('all')}>{t('All')}</button>
          {categories.map((cat) => (
            <button key={cat.id} className={selectedCategory === String(cat.id) ? 'active' : ''} onClick={() => setSelectedCategory(String(cat.id))}>{t(cat.name)}</button>
          ))}
        </div>

        {loading ? <p className="menu-loading">{t('Loading menu...')}</p> : filteredItems.length === 0 ? (
          <p className="menu-empty">{t('No dishes match your filter.')}</p>
        ) : (
          <div className="menu-grid georgian-menu-grid">
            {filteredItems.map((item) => (
              <article key={item.id} className="menu-card">
                {getDishImage(item) ? <img src={getDishImage(item)} alt={t(item.name)} className="menu-card-img" loading="lazy" /> : <div className="menu-card-image-placeholder"><span>{t('Georgian cuisine')}</span></div>}
                <div className="menu-card-copy">
                  <div className="menu-card-header"><h3>{t(item.name)}</h3><span className="price">{formatPrice(item.price)}</span></div>
                  <p className="category-tag">{t(item.category_name || '')}</p>
                  {item.description && <p className="description">{t(item.description)}</p>}
                </div>
                {(!user || user.role === 'customer') && <button className="btn-primary" onClick={() => addToCart(item)}>{t('Add to Cart')}</button>}
              </article>
            ))}
          </div>
        )}
      </section>

      {(!user || user.role === 'customer') && (
        <aside className="cart-sidebar menu-cart-section" id="cart">
          <h3>{t('Your Cart')}</h3>
          {cart.length === 0 ? <p>{t('Your cart is empty.')}</p> : (
            <>
              <ul className="cart-list">
                {cart.map((item) => (
                  <li key={item.menu_item_id} className="cart-item">
                    <div><strong>{t(item.name)}</strong><p>{formatPrice(item.price * item.quantity)}</p></div>
                    <div className="qty-controls">
                      <button aria-label={t('Decrease quantity')} onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button aria-label={t('Increase quantity')} onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="cart-footer"><p><strong>{t('Total')}: {formatPrice(totalPrice)}</strong></p><button className="btn-primary" onClick={handleCheckout}>{user ? t('Place Order') : t('Login to Order')}</button></div>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
