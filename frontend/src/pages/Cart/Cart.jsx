import { useContext, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './Cart.css'
import { StoreContext } from '../../context/storeContextObject'
const Cart = () => {
  const { cartItems, food_list, removeFromCart, setCartItem, getTotalCartAmount } = useContext(StoreContext)
  const [promoCode, setPromoCode] = useState("")

  const cartFoods = useMemo(
    () => food_list.filter((item) => cartItems[item._id] > 0),
    [cartItems, food_list]
  )
  const subtotal = getTotalCartAmount()
  const discount = promoCode.trim().toUpperCase() === "TOMATO10" ? subtotal * 0.1 : 0
  const deliveryFee = subtotal === 0 ? 0 : 2
  const total = Math.max(subtotal - discount + deliveryFee, 0)

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {cartFoods.length === 0 ? (
          <div className="cart-empty">
            <h2>Your cart is waiting for something delicious.</h2>
            <Link to="/">Explore menu</Link>
          </div>
        ) : (
          cartFoods.map((item) => (
            <div key={item._id}>
              <div className="cart-items-title cart-items-item">
                <img src={item.image} alt={item.name} />
                <p>{item.name}</p>
                <p>${item.price}</p>
                <input
                  min="1"
                  onChange={(event) => setCartItem(item._id, Number(event.target.value))}
                  type="number"
                  value={cartItems[item._id]}
                />
                <p>${item.price * cartItems[item._id]}</p>
                <button onClick={() => removeFromCart(item._id)} type="button">x</button>
              </div>
              <hr />
            </div>
          ))
        )}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>${deliveryFee.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Discount</p>
              <p>-${discount.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>${total.toFixed(2)}</b>
            </div>
          </div>
          <Link className={subtotal === 0 ? "disabled" : ""} to={subtotal === 0 ? "/cart" : "/place-order"}>
            Proceed to checkout
          </Link>
        </div>
        <div className="cart-promocode">
          <div>
            <p>Have a promo code? Try TOMATO10.</p>
            <div className="cart-promocode-input">
              <input
                onChange={(event) => setPromoCode(event.target.value)}
                placeholder="Promo code"
                value={promoCode}
              />
              <button type="button">Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
