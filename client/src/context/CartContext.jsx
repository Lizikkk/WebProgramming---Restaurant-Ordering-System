import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Use a fresh guest-cart key so old test items from previous versions are ignored.
const GUEST_CART_KEY = 'restaurant_cart_guest_v2';

function readCart(storageKey) {
  try {
    const saved = localStorage.getItem(storageKey);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const ownerKey = user ? `restaurant_cart_user_${user.id}` : GUEST_CART_KEY;
  const [cart, setCart] = useState([]);
  const [loadedKey, setLoadedKey] = useState(null);

  // Load a separate cart whenever the signed-in account changes.
  useEffect(() => {
    if (authLoading) return;
    setCart(readCart(ownerKey));
    setLoadedKey(ownerKey);
  }, [ownerKey, authLoading]);

  // Do not save the previous account's cart under the next account's key.
  useEffect(() => {
    if (authLoading || loadedKey !== ownerKey) return;
    localStorage.setItem(ownerKey, JSON.stringify(cart));
  }, [cart, ownerKey, loadedKey, authLoading]);

  const addToCart = (item) => {
    setCart((previous) => {
      const existing = previous.find((cartItem) => cartItem.menu_item_id === item.id);
      if (existing) {
        return previous.map((cartItem) =>
          cartItem.menu_item_id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...previous,
        {
          menu_item_id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      setCart((previous) => previous.filter((item) => item.menu_item_id !== menuItemId));
      return;
    }
    setCart((previous) => previous.map((item) =>
      item.menu_item_id === menuItemId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (menuItemId) => {
    setCart((previous) => previous.filter((item) => item.menu_item_id !== menuItemId));
  };

  const clearCart = () => setCart([]);

  const mergeGuestCartForUser = (userId) => {
    const guestCart = readCart(GUEST_CART_KEY);
    const accountKey = `restaurant_cart_user_${userId}`;
    const accountCart = readCart(accountKey);
    const merged = [...accountCart];

    guestCart.forEach((guestItem) => {
      const existing = merged.find((item) => item.menu_item_id === guestItem.menu_item_id);
      if (existing) existing.quantity += guestItem.quantity;
      else merged.push(guestItem);
    });

    localStorage.setItem(accountKey, JSON.stringify(merged));
    localStorage.removeItem(GUEST_CART_KEY);
    setCart(merged);
    setLoadedKey(accountKey);
  };

  const totalPrice = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      mergeGuestCartForUser,
      totalPrice,
      totalCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
