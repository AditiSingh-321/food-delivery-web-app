import {useContext} from 'react'
import './FoodItem.css'
import {assets} from '../../assets/assets'
import { StoreContext } from '../../context/storeContextObject'

const FoodItem = ({id,name,price,description,image}) => {
   
    const{cartItems,addToCart,removeFromCart} = useContext(StoreContext)
    const animateToCart = (event) => {
      const cardImage = event.currentTarget.closest('.food-item')?.querySelector('.food-item-image')
      const cartTarget = document.getElementById('floating-cart-target') || document.getElementById('cart-target')
      if (!cardImage || !cartTarget) return

      const imageRect = cardImage.getBoundingClientRect()
      const cartRect = cartTarget.getBoundingClientRect()
      const flyingImage = cardImage.cloneNode(true)
      flyingImage.className = 'flying-food'
      flyingImage.style.left = `${imageRect.left}px`
      flyingImage.style.top = `${imageRect.top}px`
      flyingImage.style.width = `${imageRect.width}px`
      flyingImage.style.height = `${imageRect.height}px`
      document.body.appendChild(flyingImage)

      requestAnimationFrame(() => {
        flyingImage.style.transform = `translate(${cartRect.left - imageRect.left}px, ${cartRect.top - imageRect.top}px) scale(0.12) rotate(18deg)`
        flyingImage.style.opacity = '0.35'
      })

      setTimeout(() => flyingImage.remove(), 1200)
    }

    const handleAdd = (event) => {
      animateToCart(event)
      addToCart(id)
    }

  return (
    <div className='food-item'>
        <div className="food-item-img-container">
            <img className='food-item-image' src={image} alt=""/>
            {!cartItems[id]
            ?<img className='add' onClick={handleAdd} src={assets.add_icon_white} alt="" />
            :<div className='food-item-counter'>
          
        <img onClick={()=> removeFromCart(id)} src={assets.remove_icon_red} alt="" />
        <p>{cartItems[id]}</p>
        <img onClick={handleAdd} src={assets.add_icon_green} alt="" />
                </div>
            } 
        </div>

      <div className ='food-item-info'>
        <div className="food-item-name-rating">
            <p>{name}</p>
            <img src={assets.rating_starts} alt="" />
            </div>
            <p className="food-item-description">{description}</p>
            <div className="food-item-tags">
              <span>{price <= 15 ? 'Budget bite' : 'Chef pick'}</span>
              <span>{name.toLowerCase().includes('chicken') ? 'Protein rich' : 'Fresh'}</span>
            </div>
            <p className="food-item-price">${price}</p>
        </div>
    </div>
  )
}

export default FoodItem
