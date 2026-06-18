import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import MyOrders from './pages/MyOrders/MyOrders'
import Profile from './pages/Profile/Profile'
import Admin from './pages/Admin/Admin'
import AdminLogin from './pages/Admin/AdminLogin'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Customer Routes wrapped in CustomerLayout */}
        <Route element={<CustomerLayout showLogin={showLogin} setShowLogin={setShowLogin} />}>
          <Route path='/' element={<Home/>}/>
          <Route path='/cart' element={<Cart/>}/>
          <Route path='/place-order' element={<PlaceOrder/>}/>
          <Route path='/myorders' element={<MyOrders/>}/>
          <Route path='/profile' element={<Profile/>}/>
        </Route>

        {/* Dedicated Admin Login */}
        <Route path='/admin/login' element={<AdminLogin />} />

        {/* Admin Routes wrapped in AdminLayout */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path='dashboard' element={<Admin />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
