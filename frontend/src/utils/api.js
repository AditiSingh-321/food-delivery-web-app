import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        let message = "Something went wrong";
        if (typeof error.response?.data === 'string') {
            message = error.response.data;
        } else {
            message = error.response?.data?.message || error.message || "Something went wrong";
        }
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            const errorDetails = error.response.data.errors.map(err => Object.values(err)[0]).join(', ');
            if (errorDetails) {
                message = `${message}: ${errorDetails}`;
            }
        }
        return Promise.reject(new Error(message));
    }
);

// Auth APIs
export const registerUser = (data) => apiClient.post('/auth/register', data);
export const loginUser = (data) => apiClient.post('/auth/login', data);
export const logoutUser = () => apiClient.post('/auth/logout');
export const getMe = () => apiClient.get('/users/me');

// Admin Auth Alias
export const adminLogin = (data) => apiClient.post('/auth/login', data);

// Food APIs
export const getFoods = () => apiClient.get('/foods/search?limit=100');

// Cart APIs
export const getCart = () => apiClient.get('/cart');
export const addToCartAPI = (foodId, quantity = 1) => apiClient.post('/cart', { foodId, quantity });
export const updateCartItemAPI = (foodId, quantity) => apiClient.patch('/cart/item', { foodId, quantity });
export const removeCartItemAPI = (foodId) => apiClient.delete(`/cart/item/${foodId}`);
export const clearCartAPI = () => apiClient.delete('/cart');

// Order APIs
export const placeOrderAPI = (data) => apiClient.post('/orders', data);
export const getMyOrdersAPI = () => apiClient.get('/orders');
export const editOrderAPI = (orderId, items) => apiClient.patch(`/orders/${orderId}/edit`, { items });
export const getOrders = () => apiClient.get('/admin/orders'); // Admin route
export const updateOrderStatus = (orderId, status) => apiClient.patch(`/orders/${orderId}/status`, { status });

// Admin APIs
export const getAdminStats = () => apiClient.get('/admin/dashboard');

export default apiClient;
