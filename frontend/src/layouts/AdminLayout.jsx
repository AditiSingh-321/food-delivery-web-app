import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';
import { assets } from '../assets/assets';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  if (!user || (user.role !== 'RESTAURANT_OWNER' && user.role !== 'ADMIN')) {
      return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className='admin-layout'>
        <div className="admin-sidebar">
            <div className="admin-logo">
                <h2>Tomato Admin</h2>
            </div>
            <ul className="admin-nav-links">
                <li className="active">Dashboard</li>
                {/* Future links: Foods, Settings */}
            </ul>
            <div className="admin-logout">
                <button onClick={logout}>Logout</button>
            </div>
        </div>
        <div className="admin-main-content">
            <Outlet />
        </div>
    </div>
  );
};

export default AdminLayout;
