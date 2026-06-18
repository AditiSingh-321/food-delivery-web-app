import { createContext, useState, useEffect, useContext } from 'react';
import { getMe, loginUser, registerUser, logoutUser } from '../utils/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await getMe();
                setUser(response.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await loginUser({ email, password });
            setUser(response.data.user);
            toast.success("Logged in successfully");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await registerUser({ name, email, password });
            setUser(response.data.user);
            toast.success("Registered successfully");
            return { success: true };
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await logoutUser();
            setUser(null);
            toast.info("Logged out");
        } catch (error) {
            toast.error("Failed to logout");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
