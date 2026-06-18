import { useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { useAuth } from '../../context/AuthContext'

const LoginPopup = ({ onClose }) => {
  const [mode, setMode] = useState('Login')
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const { login, register } = useAuth()

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    let result;
    if (mode === 'Login') {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password);
    }

    if (result.success) {
      onClose();
    } else {
      setMessage(result.message || 'Unable to continue right now.');
    }
  }

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={handleSubmit}>
        <div className="login-popup-title">
          <h2>{mode}</h2>
          <img onClick={onClose} src={assets.cross_icon} alt="Close" />
        </div>
        <div className="login-popup-inputs">
          {mode === 'Sign Up' && (
            <input
              name="name"
              onChange={handleChange}
              placeholder="Your name"
              required
              type="text"
              value={formData.name}
            />
          )}
          <input
            name="email"
            onChange={handleChange}
            placeholder="Your email"
            required
            type="email"
            value={formData.email}
          />
          <input
            name="password"
            onChange={handleChange}
            placeholder="Password"
            required
            type="password"
            value={formData.password}
          />
        </div>
        {message && <p className="login-popup-message" style={{color: 'red'}}>{message}</p>}
        <button type="submit">{mode === 'Sign Up' ? 'Create account' : 'Login'}</button>
        <div className="login-popup-condition">
          <input required type="checkbox" />
          <p>I agree to the terms of use and privacy policy.</p>
        </div>
        {mode === 'Login' ? (
          <p>
            Create a new account? <span onClick={() => setMode('Sign Up')}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account? <span onClick={() => setMode('Login')}>Login here</span>
          </p>
        )}
      </form>
    </div>
  )
}

export default LoginPopup
