import './Header.css'
const Header = () => {
  return (
    <div className='header'>
      <div className="header-contents">
        <h2>order your favourite food here</h2> 
        <p>Choose from a diverse menu of dishes crafted with quality ingredients and culinary care. Our mission is to satisfy your cravings and make every meal feel easy.</p>
        <div className="header-highlights">
          <span>30 min delivery</span>
          <span>40+ dishes</span>
          <span>Live tracking</span>
        </div>
        <button onClick={() => document.getElementById("explore-menu")?.scrollIntoView({ behavior: "smooth" })}>View Menu</button>
           </div>
    </div>
  )
}

export default Header
