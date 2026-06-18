import { Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingCart from '../components/FloatingCart/FloatingCart';
import LoginPopup from '../components/LoginPopup/LoginPopup';
import { useAuth } from '../context/AuthContext';

const CustomerLayout = ({ showLogin, setShowLogin }) => {
  const { user } = useAuth();

  if (user && (user.role === 'RESTAURANT_OWNER' || user.role === 'ADMIN')) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <>
      {showLogin && <LoginPopup onClose={() => setShowLogin(false)} />}
      <div className='app'>
        <Navbar onSignIn={() => setShowLogin(true)} />
        <FloatingCart />
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default CustomerLayout;
