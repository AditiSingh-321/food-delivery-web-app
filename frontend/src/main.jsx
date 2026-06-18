import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import StoreContextProvider from './context/StoreContext'
import { AuthProvider } from './context/AuthContext'
import { StrictMode } from 'react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
