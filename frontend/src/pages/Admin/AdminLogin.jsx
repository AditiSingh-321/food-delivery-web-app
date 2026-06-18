import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import './Admin.css';

const AdminLogin = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [loginForm, setLoginForm] = useState({ email: 'restaurant@tomato.app', password: 'password123' });
  const [message, setMessage] = useState('');

  // If already logged in as restaurant, go to admin dashboard
  if (user && (user.role === 'RESTAURANT_OWNER' || user.role === 'ADMIN')) {
      return <Navigate to="/admin" replace />;
  }

  // If logged in as customer, tell them to logout
  if (user && user.role === 'CUSTOMER') {
      return (
          <div className="admin-login">
              <div style={{textAlign: 'center'}}>
                  <h2>You are logged in as a Customer.</h2>
                  <p>Please logout from the main site to access the Restaurant Admin Panel.</p>
                  <button onClick={() => navigate('/')} style={{padding: '10px 20px', cursor: 'pointer'}}>Back to Home</button>
              </div>
          </div>
      );
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');

    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
        navigate('/admin');
    } else {
        setMessage(result.message || 'Invalid restaurant login.');
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleLogin}>
        <p className="admin-eyebrow">Restaurant access</p>
        <h1>Admin Panel</h1>
        <input
          name="email"
          onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="Restaurant email"
          type="email"
          value={loginForm.email}
          required
        />
        <input
          name="password"
          onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="Password"
          type="password"
          value={loginForm.password}
          required
        />
        {message && <p className="admin-message" style={{color: 'red'}}>{message}</p>}
        <button type="submit">Login as restaurant</button>
        <span style={{marginTop: '10px', display: 'block', fontSize: '12px'}}>Demo: restaurant@tomato.app / password123</span>
      </form>
    </div>
  );
};

export default AdminLogin;
