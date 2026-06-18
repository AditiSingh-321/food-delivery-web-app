import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './placeOrder.css'
import { StoreContext } from '../../context/storeContextObject'
import { placeOrderAPI } from '../../utils/api'
import { toast } from 'react-toastify'

const PlaceOrder = () => {
  const navigate = useNavigate()
  const { cartItems, food_list, getTotalCartAmount, clearCart } = useContext(StoreContext)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
    paymentMethod: "COD"
  })

  const subtotal = getTotalCartAmount()
  const deliveryFee = subtotal === 0 ? 0 : 2
  const total = subtotal + deliveryFee

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (subtotal === 0) {
      toast.error("Add items to your cart before placing an order.")
      return
    }

    try {
      const payload = {
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        paymentMethod: formData.paymentMethod
      }
      await placeOrderAPI(payload)
      clearCart()
      toast.success("Order placed successfully. Your food is being prepared.")
      setTimeout(() => navigate("/myorders"), 1200)
    } catch (error) {
      toast.error(error.message || "Unable to place order.")
    }
  }

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input name="firstName" onChange={handleChange} placeholder="First name" required value={formData.firstName} />
          <input name="lastName" onChange={handleChange} placeholder="Last name" required value={formData.lastName} />
        </div>
        <input name="email" onChange={handleChange} placeholder="Email address" required type="email" value={formData.email} />
        <input name="street" onChange={handleChange} placeholder="Street" required value={formData.street} />
        <div className="multi-fields">
          <input name="city" onChange={handleChange} placeholder="City" required value={formData.city} />
          <input name="state" onChange={handleChange} placeholder="State" required value={formData.state} />
        </div>
        <div className="multi-fields">
          <input name="zipCode" onChange={handleChange} placeholder="Zip code" required value={formData.zipCode} />
          <input name="country" onChange={handleChange} placeholder="Country" required value={formData.country} />
        </div>
        <input name="phone" onChange={handleChange} placeholder="Phone" required value={formData.phone} />
        <select name="paymentMethod" onChange={handleChange} value={formData.paymentMethod} style={{padding: '10px', marginTop: '10px', width: '100%', border: '1px solid #ccc', borderRadius: '4px'}}>
          <option value="COD">Cash on delivery</option>
          <option value="CARD">Card on delivery</option>
          <option value="UPI">UPI on delivery</option>
        </select>
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Order Summary</h2>
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
              <b>Total</b>
              <b>${total.toFixed(2)}</b>
            </div>
          </div>
          <button type="submit">Place order</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
