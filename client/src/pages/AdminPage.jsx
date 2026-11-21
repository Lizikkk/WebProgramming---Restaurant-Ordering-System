
import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { useLanguage } from '../context/LanguageContext';

const ORDER_STATUSES = ['New', 'Preparing', 'Ready', 'Delivered'];
const USER_ROLES = ['customer', 'staff', 'admin'];

const GEORGIAN_MENU = [
  { category: 'Appetizers', name: 'Badrijani Nigvzit', description: 'Eggplant rolls filled with seasoned walnut paste and pomegranate.', price: 12, image_url: '' },
  { category: 'Appetizers', name: 'Pkhali Selection', description: 'Traditional spinach, beet and vegetable pâtés with walnuts.', price: 14, image_url: '' },
  { category: 'Appetizers', name: 'Georgian Salad with Walnuts', description: 'Fresh tomatoes, cucumber, herbs and crushed walnuts.', price: 13, image_url: '' },
  { category: 'Appetizers', name: 'Jonjoli', description: 'Traditional Georgian pickled jonjoli with herbs and oil.', price: 9, image_url: '' },
  { category: 'Appetizers', name: 'Satsivi', description: 'Tender chicken served in a rich, aromatic walnut sauce.', price: 18, image_url: '' },
  { category: 'Appetizers', name: 'Gebzhalia', description: 'Minty cheese rolls served with a delicate dairy sauce.', price: 16, image_url: '' },
  { category: 'Appetizers', name: 'Mchadi', description: 'Traditional Georgian cornbread, baked until golden.', price: 5, image_url: '' },
  { category: 'Appetizers', name: 'Sulguni Cheese', description: 'Slices of traditional Georgian brined cheese.', price: 10, image_url: '' },
  { category: 'Main Dishes', name: 'Adjarian Khachapuri', description: 'Boat-shaped bread filled with cheese, topped with egg and butter.', price: 19, image_url: '' },
  { category: 'Main Dishes', name: 'Imeretian Khachapuri', description: 'Soft golden bread filled with Imeretian cheese.', price: 17, image_url: '' },
  { category: 'Main Dishes', name: 'Megruli Khachapuri', description: 'Cheese-filled bread with an extra layer of cheese on top.', price: 20, image_url: '' },
  { category: 'Main Dishes', name: 'Khinkali', description: 'Juicy Georgian dumplings with seasoned meat and broth.', price: 2.50, image_url: '' },
  { category: 'Main Dishes', name: 'Cheese Khinkali', description: 'Georgian dumplings filled with melted cheese.', price: 2.50, image_url: '' },
  { category: 'Main Dishes', name: 'Lobiani', description: 'Traditional baked bread filled with seasoned beans.', price: 12, image_url: '' },
  { category: 'Main Dishes', name: 'Mtsvadi', description: 'Charcoal-grilled meat skewers with onion and fresh herbs.', price: 24, image_url: '' },
  { category: 'Main Dishes', name: 'Ojakhuri', description: 'Pan-fried meat and potatoes with Georgian spices.', price: 22, image_url: '' },
  { category: 'Main Dishes', name: 'Chakapuli', description: 'Aromatic seasonal stew with tarragon, herbs and sour plum.', price: 26, image_url: '' },
  { category: 'Main Dishes', name: 'Chashushuli', description: 'Slow-cooked beef stew with tomatoes and Georgian spices.', price: 23, image_url: '' },
  { category: 'Main Dishes', name: 'Shkmeruli', description: 'Chicken in a rich garlic and milk sauce.', price: 25, image_url: '' },
  { category: 'Main Dishes', name: 'Kharcho', description: 'Traditional Georgian beef soup with rice, herbs and spices.', price: 17, image_url: '' },
  { category: 'Desserts', name: 'Churchkhela', description: 'Walnuts threaded on a string and coated in thickened grape juice.', price: 8, image_url: '' },
  { category: 'Desserts', name: 'Pelamushi', description: 'Traditional Georgian grape pudding.', price: 9, image_url: '' },
  { category: 'Desserts', name: 'Gozinaki', description: 'Crunchy walnuts bound with golden honey.', price: 10, image_url: '' },
  { category: 'Desserts', name: 'Kada', description: 'Traditional Georgian pastry with a sweet, buttery filling.', price: 8, image_url: '' },
  { category: 'Desserts', name: 'Nazuki', description: 'Sweet Georgian bread scented with warm spices.', price: 7, image_url: '' },
  { category: 'Drinks', name: 'Tarkhuna Lemonade', description: 'Classic Georgian tarragon lemonade.', price: 4.5, image_url: '' },
  { category: 'Drinks', name: 'Pear Lemonade', description: 'Refreshing Georgian-style pear lemonade.', price: 4.5, image_url: '' },
  { category: 'Drinks', name: 'Lemon Lemonade', description: 'Fresh and sparkling lemon lemonade.', price: 4, image_url: '' },
  { category: 'Drinks', name: 'Natakhtari Lemonade', description: 'Popular Georgian bottled lemonade.', price: 4, image_url: '' },
  { category: 'Drinks', name: 'Borjomi', description: 'Naturally carbonated Georgian mineral water.', price: 3.5, image_url: '' },
  { category: 'Drinks', name: 'Nabeghlavi', description: 'Georgian sparkling mineral water.', price: 3, image_url: '' },
  { category: 'Drinks', name: 'Homemade Fruit Compote', description: 'Traditional chilled fruit compote, made in-house.', price: 5, image_url: '' },
];

const normalizeName = (value) => String(value || '').trim().toLowerCase();
const CATEGORY_ALIASES = { Appetizers: ['appetizers', 'starters'], 'Main Dishes': ['main dishes', 'main dish', 'main courses'], Desserts: ['desserts'], Drinks: ['drinks'] };

const EMPTY_ITEM_FORM = {
  category_id: '',
  name: '',
  description: '',
  price: '',
  image_url: '',
  is_available: true,
};

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('menu');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isImportingMenu, setIsImportingMenu] = useState(false);

  // Category form state
  const [catName, setCatName] = useState('');
  const [catOrder, setCatOrder] = useState(0);
  const [editingCatId, setEditingCatId] = useState(null);

  // Menu item form state
  const [itemForm, setItemForm] = useState(EMPTY_ITEM_FORM);
  const [editingItemId, setEditingItemId] = useState(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load all admin data
  const loadData = async () => {
    setError('');

    try {
      const [cats, items, allOrders, allUsers] = await Promise.all([
        apiFetch('/categories'),
        apiFetch('/menu'),
        apiFetch('/orders'),
        apiFetch('/auth/users'),
      ]);

      setCategories(cats);
      setMenuItems(items);
      setOrders(allOrders);
      setUsers(allUsers);

      setItemForm((prev) => ({
        ...prev,
        category_id:
          prev.category_id || (cats.length > 0 ? cats[0].id : ''),
      }));
    } catch (err) {
      setError(err.message || 'Failed to load admin data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Clear error and success messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Reset category form
  const resetCategoryForm = () => {
    setCatName('');
    setCatOrder(0);
    setEditingCatId(null);
  };

  // Reset menu item form
  const resetItemForm = () => {
    setItemForm({
      ...EMPTY_ITEM_FORM,
      category_id: categories[0]?.id || '',
    });
    setEditingItemId(null);
  };

  // ---------------- CATEGORY HANDLERS ----------------

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    const name = catName.trim();

    if (!name) {
      setError('Category name is required.');
      return;
    }

    try {
      const payload = {
        name,
        display_order: Number(catOrder) || 0,
      };

      if (editingCatId !== null) {
        await apiFetch(`/categories/${editingCatId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        setSuccess('Category updated.');
      } else {
        await apiFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setSuccess('Category created.');
      }

      resetCategoryForm();
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    }
  };

  const startEditCategory = (cat) => {
    clearMessages();
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatOrder(cat.display_order);
  };

  // ---------------- MENU ITEM HANDLERS ----------------

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    const name = itemForm.name.trim();
    const price = Number(itemForm.price);
    const categoryId = Number(itemForm.category_id);

    if (!name) {
      setError('Dish name is required.');
      return;
    }

    if (!itemForm.category_id || !Number.isFinite(categoryId)) {
      setError('Please select a category.');
      return;
    }

    if (itemForm.price === '' || !Number.isFinite(price) || price < 0) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      const payload = {
        ...itemForm,
        name,
        category_id: categoryId,
        price,
      };

      if (editingItemId !== null) {
        await apiFetch(`/menu/${editingItemId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        setSuccess('Menu item updated.');
      } else {
        await apiFetch('/menu', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setSuccess('Menu item added.');
      }

      resetItemForm();
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to save menu item.');
    }
  };

  const startEditMenuItem = (item) => {
    clearMessages();
    setEditingItemId(item.id);

    setItemForm({
      category_id: item.category_id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      image_url: item.image_url || '',
      is_available: Boolean(item.is_available),
    });
  };

  const toggleAvailability = async (item) => {
    clearMessages();

    try {
      await apiFetch(`/menu/${item.id}/availability`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_available: !item.is_available,
        }),
      });

      setSuccess(
        `"${item.name}" is now ${!item.is_available ? 'visible' : 'hidden'}.`
      );

      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to change item availability.');
    }
  };

  // Populate the database through the existing admin API (no server files or schema changes).
  const importGeorgianMenu = async () => {
    clearMessages();
    setIsImportingMenu(true);
    try {
      let currentCategories = await apiFetch('/categories');
      const categoryIds = {};
      const categoryPlan = [
        { name: 'Appetizers', display_order: 1 },
        { name: 'Main Dishes', display_order: 2 },
        { name: 'Desserts', display_order: 3 },
        { name: 'Drinks', display_order: 4 },
      ];

      for (const wanted of categoryPlan) {
        const aliases = CATEGORY_ALIASES[wanted.name];
        let category = currentCategories.find((cat) => aliases.includes(normalizeName(cat.name)));
        if (category) {
          if (category.name !== wanted.name || category.display_order !== wanted.display_order) {
            category = await apiFetch(`/categories/${category.id}`, {
              method: 'PUT',
              body: JSON.stringify(wanted),
            });
          }
        } else {
          category = await apiFetch('/categories', {
            method: 'POST',
            body: JSON.stringify(wanted),
          });
          currentCategories = [...currentCategories, category];
        }
        categoryIds[wanted.name] = category.id;
      }

      const existingItems = await apiFetch('/menu?all=true');
      const desiredNames = new Set(GEORGIAN_MENU.map((item) => normalizeName(item.name)));
      for (const oldItem of existingItems) {
        if (!desiredNames.has(normalizeName(oldItem.name)) && oldItem.is_available) {
          await apiFetch(`/menu/${oldItem.id}/availability`, {
            method: 'PATCH',
            body: JSON.stringify({ is_available: false }),
          });
        }
      }

      let added = 0;
      let updated = 0;
      for (const dish of GEORGIAN_MENU) {
        const existing = existingItems.find((item) => normalizeName(item.name) === normalizeName(dish.name));
        const payload = {
          category_id: categoryIds[dish.category],
          name: dish.name,
          description: dish.description,
          price: dish.price,
          image_url: dish.image_url,
          is_available: true,
        };
        if (existing) {
          await apiFetch(`/menu/${existing.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          updated += 1;
        } else {
          await apiFetch('/menu', { method: 'POST', body: JSON.stringify(payload) });
          added += 1;
        }
      }

      setSuccess(`Georgian menu ready: ${added} dishes added, ${updated} updated, and old sample items hidden.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Could not populate the Georgian menu. Please check your admin login and try again.');
    } finally {
      setIsImportingMenu(false);
    }
  };

  // ---------------- ORDER HANDLERS ----------------

  const handleOrderStatusChange = async (orderId, newStatus) => {
    clearMessages();

    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setSuccess(`Order #${orderId} updated to ${newStatus}.`);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update order status.');
    }
  };

  // ---------------- USER ROLE HANDLER ----------------

  const handleRoleChange = async (userId, newRole) => {
    clearMessages();

    try {
      await apiFetch(`/auth/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });

      setSuccess('User role updated.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  // ---------------- DELETE HANDLER ----------------

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    clearMessages();

    try {
      let endpoint = '';

      if (deleteTarget.type === 'category') {
        endpoint = `/categories/${deleteTarget.id}`;
      } else if (deleteTarget.type === 'menu') {
        endpoint = `/menu/${deleteTarget.id}`;
      } else if (deleteTarget.type === 'order') {
        endpoint = `/orders/${deleteTarget.id}`;
      }

      if (!endpoint) {
        throw new Error('Invalid delete target.');
      }

      await apiFetch(endpoint, { method: 'DELETE' });

      setSuccess(`${deleteTarget.label} deleted.`);
      setDeleteTarget(null);

      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
      setDeleteTarget(null);
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (availabilityFilter === 'available') {
      return Boolean(item.is_available);
    }

    if (availabilityFilter === 'hidden') {
      return !item.is_available;
    }

    return true;
  });

  // ---------------- RENDER ----------------

  return (
    <div className="container">
      <p className="eyebrow">Georgian Restaurant</p><h2>{t('Admin Dashboard')}</h2>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Admin Tabs */}
      <div className="category-tabs">
        <button
          className={activeTab === 'menu' ? 'active' : ''}
          onClick={() => {
            clearMessages();
            setActiveTab('menu');
          }}
        >
          {t('Menu Items')} ({menuItems.length})
        </button>

        <button
          className={activeTab === 'categories' ? 'active' : ''}
          onClick={() => {
            clearMessages();
            setActiveTab('categories');
          }}
        >
          {t('Categories')} ({categories.length})
        </button>

        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => {
            clearMessages();
            setActiveTab('orders');
          }}
        >
          {t('Orders')} ({orders.length})
        </button>

        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => {
            clearMessages();
            setActiveTab('users');
          }}
        >
          {t('Users & Roles')} ({users.length})
        </button>
      </div>

      {/* TAB 1: MENU ITEMS */}
      {activeTab === 'menu' && (
        <section className="admin-section">
          <h3>{editingItemId !== null ? t('Edit Menu Item') : t('Add Menu Item')}</h3>
          <div className="menu-import-panel">
            <div>
              <strong>{t('Georgian menu setup')}</strong>
              <p>{t('Add the agreed Georgian dishes and drinks using the existing API. Existing sample dishes will be hidden, not deleted.')}</p>
            </div>
            <button type="button" className="btn-primary" onClick={importGeorgianMenu} disabled={isImportingMenu}>
              {isImportingMenu ? t('Adding menu...') : t('Populate Georgian Menu')}
            </button>
          </div>

          <form onSubmit={handleMenuSubmit} className="stack-form">
            <select
              value={itemForm.category_id}
              onChange={(e) =>
                setItemForm({
                  ...itemForm,
                  category_id: e.target.value,
                })
              }
              required
            >
              <option value="">{t('Select Category')}</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder={t('Dish Name')}
              value={itemForm.name}
              onChange={(e) =>
                setItemForm({ ...itemForm, name: e.target.value })
              }
              required
            />

            <input
              type="text"
              placeholder={t('Description')}
              value={itemForm.description}
              onChange={(e) =>
                setItemForm({ ...itemForm, description: e.target.value })
              }
            />

            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={t('Price (₾)')}
              value={itemForm.price}
              onChange={(e) =>
                setItemForm({ ...itemForm, price: e.target.value })
              }
              required
            />

            <input
              type="url"
              placeholder="Image URL (optional)"
              value={itemForm.image_url}
              onChange={(e) =>
                setItemForm({ ...itemForm, image_url: e.target.value })
              }
            />

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={itemForm.is_available}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    is_available: e.target.checked,
                  })
                }
              />
              Available on customer menu
            </label>

            <div className="action-buttons">
              <button type="submit" className="btn-primary">
                {editingItemId !== null ? 'Update Item' : 'Add Menu Item'}
              </button>

              {editingItemId !== null && (
                <button type="button" onClick={resetItemForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Availability Filters */}
          <div className="category-tabs">
            <button
              className={availabilityFilter === 'all' ? 'active' : ''}
              onClick={() => setAvailabilityFilter('all')}
            >
              All ({menuItems.length})
            </button>

            <button
              className={availabilityFilter === 'available' ? 'active' : ''}
              onClick={() => setAvailabilityFilter('available')}
            >
              Available ({menuItems.filter((i) => i.is_available).length})
            </button>

            <button
              className={availabilityFilter === 'hidden' ? 'active' : ''}
              onClick={() => setAvailabilityFilter('hidden')}
            >
              Hidden ({menuItems.filter((i) => !i.is_available).length})
            </button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Category</th>
                <th>Price</th>
                <th>Visibility</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {filteredMenuItems.map((item) => (
                <tr
                  key={item.id}
                  className={!item.is_available ? 'row-hidden' : ''}
                >
                  <td>
                    <strong>{item.name}</strong>
                    <div className="subtext">{item.description}</div>
                  </td>

                  <td>{item.category_name}</td>

                  <td>{Number(item.price).toFixed(2)} ₾</td>

                  <td>
                    <button onClick={() => toggleAvailability(item)}>
                      {item.is_available ? 'Visible (Hide)' : 'Hidden (Show)'}
                    </button>
                  </td>

                  <td className="action-buttons">
                    <button onClick={() => startEditMenuItem(item)}>
                      Edit
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'menu',
                          id: item.id,
                          label: item.name,
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <section className="admin-section">
          <h3>{editingCatId !== null ? t('Edit Category') : t('Add Category')}</h3>

          <form onSubmit={handleCategorySubmit} className="inline-form">
            <input
              type="text"
              placeholder={t('Category Name')}
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder={t('Display Order')}
              value={catOrder}
              onChange={(e) => setCatOrder(e.target.value)}
            />

            <button type="submit" className="btn-primary">
              {editingCatId !== null ? 'Update Category' : 'Add Category'}
            </button>

            {editingCatId !== null && (
              <button type="button" onClick={resetCategoryForm}>
                Cancel
              </button>
            )}
          </form>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>{t('Name')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.display_order}</td>
                  <td>{cat.name}</td>

                  <td className="action-buttons">
                    <button onClick={() => startEditCategory(cat)}>
                      Edit
                    </button>

                    <button
                      className="btn-danger"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'category',
                          id: cat.id,
                          label: cat.name,
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <section className="admin-section">
          <h3>{t('Manage All Orders')}</h3>

          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('Order #')}</th>
                <th>{t('Customer')}</th>
                <th>{t('Items')}</th>
                <th>{t('Total')}</th>
                <th>{t('Status')}</th>
                <th>{t('Actions')}</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    <strong>{order.customer_name}</strong>
                    <div className="subtext">{order.customer_email}</div>
                  </td>

                  <td>
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.name}
                      </div>
                    ))}
                  </td>

                  <td>{Number(order.total_price).toFixed(2)} ₾</td>

                  <td>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusChange(order.id, e.target.value)
                      }
                    >
                      {ORDER_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <button
                      className="btn-danger"
                      onClick={() =>
                        setDeleteTarget({
                          type: 'order',
                          id: order.id,
                          label: `Order #${order.id}`,
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === 'users' && (
        <section className="admin-section">
          <h3>{t('Manage User Roles')}</h3>

          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('ID')}</th>
                <th>{t('Name')}</th>
                <th>{t('Email')}</th>
                <th>{t('Role')}</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>

                  <td>
                    {String(u.id) === String(currentUser?.id) ? (
                      <strong>{u.role} (You)</strong>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        {USER_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${deleteTarget?.label}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
