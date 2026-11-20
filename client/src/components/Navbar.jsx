import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/menu" className="brand">Restaurant</Link>

      <div className="nav-links">
        <Link to="/menu">Menu</Link>

        {user?.role === 'customer' && (
          <Link to="/orders">My Orders ({totalCount} in cart)</Link>
        )}

        {(user?.role === 'staff' || user?.role === 'admin') && (
          <Link to="/kitchen">Kitchen Orders</Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin">Admin Dashboard</Link>
        )}

        {user ? (
          <>
            <span className="user-badge">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}