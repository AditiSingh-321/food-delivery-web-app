import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import './Profile.css'

const Profile = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    if (!user) {
        return <div style={{textAlign: 'center', marginTop: '100px'}}><h2>Please login to view profile.</h2></div>
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>My Profile</h2>
                <div className="profile-info">
                    <img src={user.profileImage || assets.profile_icon} alt="Profile" className="profile-image" />
                    <div className="profile-details">
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                    </div>
                </div>
                
                <div className="profile-actions">
                    <button onClick={() => navigate('/myorders')} className="btn-orders">View Orders</button>
                    <button onClick={handleLogout} className="btn-logout">Sign Out</button>
                </div>
            </div>
        </div>
    )
}

export default Profile
