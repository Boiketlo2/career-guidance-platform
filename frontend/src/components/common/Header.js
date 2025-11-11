import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{
      background: '#667eea',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
        <h1 style={{ margin: 0 }}>🎓 Career Guidance Platform</h1>
      </Link>
      
      <nav>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user.name || user.institutionName || user.companyName}!</span>
            {/* Link to user's home page */}
            <Link
              to={
                user.role === 'admin'
                  ? `/admin/home/${user.uid}`
                  : `/${user.role}/${user.uid}/home`
              }
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Home
            </Link>
            <button 
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid white',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/register/student" style={{ color: 'white', textDecoration: 'none' }}>
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;