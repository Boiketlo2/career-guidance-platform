import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      background: '#f8f9fa',
      padding: '2rem',
      textAlign: 'center',
      marginTop: 'auto',
      borderTop: '1px solid #dee2e6'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
           Career Guidance and Employment Integration Platform
        </p>
        <p style={{ margin: '0', color: '#999', fontSize: '0.9rem' }}>
          Connecting students with higher learning institutions and career opportunities in Lesotho
        </p>
        <p style={{ margin: '1rem 0 0 0', color: '#999', fontSize: '0.8rem' }}>
          © 2025 Career Guidance Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
