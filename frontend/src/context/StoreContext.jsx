import { useEffect, useState } from 'react'
import { food_list } from '../assets/assets'
import { StoreContext } from './storeContextObject'
import { getFoods, getCart, addToCartAPI, updateCartItemAPI, removeCartItemAPI, clearCartAPI } from '../utils/api'
import { useAuth } from './AuthContext'
import { toast } from 'react-toastify'

const storedCart = () => {
    try {
        return JSON.parse(localStorage.getItem('tomato_cart')) || {}
    } catch {
        return {}
    }
}

const StoreContextProvider = ({ children }) => {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState(storedCart);
    const [foodList, setFoodList] = useState(food_list);
    const [backendCartLoaded, setBackendCartLoaded] = useState(false);

    useEffect(() => {
        const loadFoods = async () => {
            try {
                const response = await getFoods()
                const foodsWithImages = response.data.foods.map((food) => {
                    const localFood = food_list.find((item) => item.name === food.name)
                    const categoryFood = food_list.find((item) => item.category === food.category?.name)
                    return { ...food, image: localFood?.image || categoryFood?.image || food_list[0].image }
                })
                if (foodsWithImages.length > 0) {
                    setFoodList(foodsWithImages)
                }
            } catch (error) {
                console.error("Failed to load backend foods, falling back to local assets", error)
                setFoodList(food_list)
            }
        }

        loadFoods()
    }, [])

    useEffect(() => {
        const fetchBackendCart = async () => {
            if (user) {
                try {
                    const response = await getCart();
                    const bCart = response.data;
                    const newCartItems = {};
                    if (bCart && bCart.items) {
                        bCart.items.forEach(item => {
                            newCartItems[item.food._id || item.food] = item.quantity;
                        });
                    }
                    setCartItems(newCartItems);
                    setBackendCartLoaded(true);
                } catch (error) {
                    console.error("Failed to fetch cart", error);
                }
            } else {
                setCartItems({});
                setBackendCartLoaded(false);
            }
        };

        fetchBackendCart();
    }, [user]);

    useEffect(() => {
        if (!user) {
            localStorage.setItem('tomato_cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = async (ItemId) => {
        if (user) {
            try {
                await addToCartAPI(ItemId, 1);
            } catch (error) {
                toast.error(error.message);
                return; // Revert optimistic update if API fails
            }
        }
        setCartItems(prev => ({ ...prev, [ItemId]: (prev[ItemId] || 0) + 1 }));
    }

    const removeFromCart = async (ItemId) => {
        if (user) {
            try {
                const currentQuantity = cartItems[ItemId];
                if (currentQuantity <= 1) {
                    await removeCartItemAPI(ItemId);
                } else {
                    await updateCartItemAPI(ItemId, currentQuantity - 1);
                }
            } catch (error) {
                toast.error(error.message);
                return;
            }
        }
        
        setCartItems((prev) => {
            const next = { ...prev };
            if (!next[ItemId]) return next;
            next[ItemId] -= 1;
            if (next[ItemId] <= 0) delete next[ItemId];
            return next;
        });
    }

    const setCartItem = async (ItemId, quantity) => {
        if (user) {
            try {
                if (quantity <= 0) {
                    await removeCartItemAPI(ItemId);
                } else {
                    await updateCartItemAPI(ItemId, quantity);
                }
            } catch (error) {
                toast.error(error.message);
                return;
            }
        }

        setCartItems((prev) => {
            const next = { ...prev };
            if (quantity <= 0) {
                delete next[ItemId];
            } else {
                next[ItemId] = quantity;
            }
            return next;
        });
    }

    const clearCart = async () => {
        if (user) {
            try {
                await clearCartAPI();
            } catch (error) {
                toast.error("Failed to clear cart");
                return;
            }
        }
        setCartItems({});
    }

    const getTotalCartAmount = () => {
        return foodList.reduce((total, item) => total + (cartItems[item._id] || 0) * (item.discountPrice || item.price), 0);
    }

    const getCartCount = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    }

    const contextValue = {
        food_list: foodList,
        cartItems,
        addToCart,
        removeFromCart,
        setCartItem,
        clearCart,
        getTotalCartAmount,
        getCartCount
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider
