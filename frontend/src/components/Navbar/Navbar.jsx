import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/storeContextObject'
import { useAuth } from '../../context/AuthContext'
import './Navbar-hover.css'

const Navbar = ({ onSignIn }) => {
  const [menu, setMenu] = useState("home");
  const { getCartCount } = useContext(StoreContext)
  const { user, logout } = useAuth()
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    setMenu(id)
    if (window.location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className='navbar'>
     <Link to='/'><img src={assets.logo} alt="Tomato" className="logo"/></Link>
     <ul className="navbar-menu">
      <Link to='/' onClick={()=>setMenu("home")} className={menu==="home"?"active":""}>home</Link>
      <li onClick={()=>scrollToSection("explore-menu")} className={menu==="explore-menu"?"active":""}>menu</li>
      <li onClick={()=>scrollToSection("app-download")} className={menu==="app-download"?"active":""}>mobile-app</li>
      <li onClick={()=>scrollToSection("footer")} className={menu==="footer"?"active":""}>contact us</li>
      {user?.role === 'ADMIN' && (
        <Link to='/admin' onClick={()=>setMenu("admin")} className={menu==="admin"?"active":""}>admin</Link>
      )}
     </ul>

     <div className="navbar-right">
      <button className="navbar-icon-button" onClick={()=>scrollToSection("food-display")} aria-label="Search menu">
        <img src={assets.search_icon} alt=""/>
      </button>
      <Link to='/cart' className="navbar-search-icon" id="cart-target">
        <img src={assets.basket_icon} alt="Cart"/>
        {getCartCount() > 0 && <div className ="dot">{getCartCount()}</div>}
      </Link>
      {!user ? (
        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <Link to='/admin/login' style={{fontSize: '14px', color: '#49557e', textDecoration: 'none', border: '1px solid #ddd', padding: '8px 15px', borderRadius: '50px', whiteSpace: 'nowrap'}}>Restaurant Login</Link>
          <button onClick={onSignIn}>sign in</button>
        </div>
      ) : (
        <div className="navbar-profile" style={{position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <img src={user.profileImage || assets.profile_icon} alt="" style={{width: '30px', borderRadius: '50%'}} />
          <div className="nav-profile-dropdown-wrapper">
             <ul className="nav-profile-dropdown" style={{position: 'absolute', top: '100%', right: '0', backgroundColor: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', flexDirection: 'column', gap: '10px', zIndex: 1}}>
               <li onClick={()=>navigate('/profile')} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}><img src={assets.profile_icon} alt="" style={{width: '20px'}}/> <p style={{margin: 0}}>Profile</p></li>
               <hr style={{margin: '5px 0'}}/>
               <li onClick={()=>navigate('/myorders')} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}><img src={assets.bag_icon} alt="" style={{width: '20px'}}/> <p style={{margin: 0}}>Orders</p></li>
               <hr style={{margin: '5px 0'}}/>
               <li onClick={logout} style={{display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}><img src={assets.logout_icon} alt="" style={{width: '20px'}}/> <p style={{margin: 0}}>Logout</p></li>
             </ul>
          </div>
        </div>
      )}
     </div>
    </div>
  )
}

export default Navbar
