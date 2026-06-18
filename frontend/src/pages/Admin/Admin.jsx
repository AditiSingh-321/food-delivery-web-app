import { useCallback, useEffect, useMemo, useState } from 'react';
import './Admin.css';
import { getAdminStats, getOrders, updateOrderStatus } from '../../utils/api';
import { toast } from 'react-toastify';

const statusOptions = ['Preparing', 'Ready', 'Out for delivery', 'Delivered', 'Cancelled'];

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
        const [ordersResponse, statsResponse] = await Promise.all([getOrders(), getAdminStats()]);
        setOrders(ordersResponse.data.orders || ordersResponse.data); // depends on backend format
        setStats(statsResponse.data);
    } catch (error) {
        toast.error(error.message || 'Unable to load admin dashboard.');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleStatusChange = async (orderId, status) => {
    try {
        await updateOrderStatus(orderId, status);
        toast.success(`Order ${orderId.substring(0, 6)} updated to ${status}`);
        await loadDashboard();
    } catch (error) {
        toast.error("Failed to update status");
    }
  };

  const topCustomers = useMemo(() => stats?.customerFrequency?.slice(0, 5) || [], [stats]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="admin">
      <div className="admin-header">
        <div>
          <p className="admin-eyebrow">Restaurant dashboard</p>
          <h1>Orders, delivery, billing and customers</h1>
        </div>
        <div className="admin-actions">
          <button onClick={loadDashboard} type="button" style={{padding: '10px 20px', cursor: 'pointer', border: '1px solid tomato', backgroundColor: 'white', color: 'tomato', borderRadius: '5px'}}>Refresh</button>
        </div>
      </div>

      <div className="admin-stats">
        <div>
          <span>Total orders</span>
          <strong>{stats?.totalOrders || 0}</strong>
        </div>
        <div>
          <span>Active orders</span>
          <strong>{stats?.active || 0}</strong>
        </div>
        <div>
          <span>Delivered</span>
          <strong>{stats?.delivered || 0}</strong>
        </div>
        <div>
          <span>Revenue</span>
          <strong>${Number(stats?.revenue || 0).toFixed(2)}</strong>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-orders">
          <div className="admin-section-title">
            <h2>Order tracking</h2>
            <p>{orders.length} order records</p>
          </div>
          {orders.length === 0 ? (
            <div className="admin-empty">No orders yet. Place an order from checkout and it will appear here.</div>
          ) : (
            orders.map((order) => (
              <article className="admin-order-card" key={order._id || order.id}>
                <div className="admin-order-top">
                  <div>
                    <h3>{(order._id || order.id).substring(0, 8)}</h3>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <select onChange={(event) => handleStatusChange(order._id || order.id, event.target.value)} value={order.orderStatus || order.status}>
                    {statusOptions.map((status) => <option key={status} value={status.toUpperCase().replace(/ /g, '_')}>{status}</option>)}
                  </select>
                </div>
                <div className="admin-order-body">
                  <div>
                    <span>Customer</span>
                    <b>{order.deliveryAddress?.name || order.user?.name || "Customer"}</b>
                    <p>{order.deliveryAddress?.phone}</p>
                  </div>
                  <div>
                    <span>Bill</span>
                    <b>${Number(order.totalAmount || 0).toFixed(2)}</b>
                    <p>{order.paymentMethod}</p>
                  </div>
                  <div>
                    <span>Address</span>
                    <p>{order.deliveryAddress?.street}</p>
                    <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                  </div>
                </div>
                <div className="admin-order-items">
                  {(order.items || []).map((item, idx) => (
                    <span key={idx}>{item.name || item.food?.name} x {item.quantity}</span>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="admin-customers">
          <div className="admin-section-title">
            <h2>Customer frequency</h2>
            <p>Most frequent buyers</p>
          </div>
          {topCustomers.length === 0 ? (
            <div className="admin-empty">Customer frequency appears after orders are placed.</div>
          ) : (
            topCustomers.map((customer) => (
              <div className="customer-row" key={customer.email}>
                <div>
                  <b>{customer.name}</b>
                  <p>{customer.email}</p>
                </div>
                <span>{customer.orders} orders</span>
              </div>
            ))
          )}
        </aside>
      </div>
    </div>
  );
};

export default Admin;
