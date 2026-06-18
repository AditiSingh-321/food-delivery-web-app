import { useState, useEffect } from 'react';
import { getMyOrdersAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { assets } from '../../assets/assets';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import EditOrderModal from '../../components/EditOrderModal/EditOrderModal';
import './MyOrders.css';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const { user } = useAuth();

    const fetchOrders = async () => {
        try {
            const response = await getMyOrdersAPI();
            setOrders(response.data.orders);
        } catch (error) {
            console.error("Failed to fetch orders");
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();

            const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
            const baseUrl = apiUrl.replace(/\/api\/v1\/?$/, '');
            const socket = io(baseUrl, {
                withCredentials: true
            });

            socket.on('order_update', (data) => {
                toast.info(`Order #${data.orderId.substring(0, 6)} is now ${data.status}`);
                fetchOrders();
            });

            return () => {
                socket.disconnect();
            };
        }
    }, [user]);

    if (!user) {
        return <div style={{textAlign: 'center', marginTop: '100px'}}><h2>Please login to view orders.</h2></div>
    }

    const isEditable = (order) => {
        if (order.orderStatus !== 'PLACED' && order.orderStatus !== 'CONFIRMED') return false;
        const fiveMins = 5 * 60 * 1000;
        return (Date.now() - new Date(order.createdAt).getTime()) <= fiveMins;
    };

    return (
        <div className='my-orders' style={{margin: '50px 0'}}>
            <h2>My Orders</h2>
            <div className="container" style={{display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px'}}>
                {orders.length === 0 ? <p>No orders found.</p> : null}
                {orders.map((order, index) => {
                    return (
                        <div key={index} className="my-orders-order" style={{display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr', alignItems: 'center', gap: '20px', fontSize: '14px', padding: '10px 20px', border: '1px solid tomato', color: '#454545'}}>
                            <img src={assets.parcel_icon} alt="" style={{width: '50px'}}/>
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " x " + item.quantity
                                } else {
                                    return item.name + " x " + item.quantity + ", "
                                }
                            })}</p>
                            <p>${order.totalAmount.toFixed(2)}</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b style={{fontWeight: 600, color: 'tomato'}}>{order.orderStatus}</b></p>
                            <div>
                                {isEditable(order) && (
                                    <button onClick={() => setEditingOrder(order)} style={{padding: '6px 12px', background: 'white', border: '1px solid tomato', color: 'tomato', borderRadius: '4px', cursor: 'pointer', fontWeight: 600}}>Edit</button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
            {editingOrder && (
                <EditOrderModal 
                    order={editingOrder} 
                    onClose={() => setEditingOrder(null)} 
                    onSuccess={() => { setEditingOrder(null); fetchOrders(); }} 
                />
            )}
        </div>
    )
}

export default MyOrders;
