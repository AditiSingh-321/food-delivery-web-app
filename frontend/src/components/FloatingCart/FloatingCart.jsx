import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/storeContextObject';
import { assets } from '../../assets/assets';
import './FloatingCart.css';

const FloatingCart = () => {
    const { getCartCount } = useContext(StoreContext);
    const navigate = useNavigate();
    const cartCount = getCartCount();

    // Floating cart is always visible

    return (
        <div className="floating-cart" id="floating-cart-target" onClick={() => navigate('/cart')}>
            <img src={assets.basket_icon} alt="Cart" />
            {cartCount > 0 && <span className="floating-cart-count">{cartCount}</span>}
        </div>
    );
};

export default FloatingCart;
