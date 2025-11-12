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
    <header
      style={{
        background: '#1a1a1a',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Link 
        to="/" 
        style={{ 
          color: 'white', 
          textDecoration: 'none',
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.opacity = '0.8'}
        onMouseLeave={(e) => e.target.style.opacity = '1'}
      >
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          fontWeight: '600',
          letterSpacing: '-0.5px'
        }}>
          Career Guidance Platform
        </h1>
      </Link>

      <nav>
        {user ? (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <span style={{ 
              color: '#e0e0e0',
              fontWeight: '500'
            }}>
              Welcome, {user.name || user.institutionName || user.companyName}!
            </span>
            <Link
              to={
                user.role === 'admin'
                  ? `/admin/home/${user.uid}`
                  : `/${user.role}/${user.uid}/home`
              }
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333';
                e.target.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Home
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'transparent',
                border: '1px solid #666',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333';
                e.target.style.borderColor = '#888';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#666';
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            alignItems: 'center'
          }}>
            <Link 
              to="/login" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: '1px solid #666',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#333';
                e.target.style.borderColor = '#888';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = '#666';
              }}
            >
              Login
            </Link>
            <Link 
              to="/register/student" 
              style={{ 
                color: 'white', 
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                background: '#fff',
                color: '#1a1a1a',
                border: '1px solid #fff',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e0e0e0';
                e.target.style.borderColor = '#e0e0e0';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fff';
                e.target.style.borderColor = '#fff';
              }}
            >
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
