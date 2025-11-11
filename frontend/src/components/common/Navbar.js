import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'student':
        return [
          { path: `/student/${user.uid}/home`, label: 'Home' },
          { path: `/student/${user.uid}/apply`, label: 'Apply for Courses' },
          { path: `/student/${user.uid}/jobs`, label: 'Job Opportunities' },
          { path: `/student/${user.uid}/results`, label: 'Admission Results' },
          { path: `/student/${user.uid}/upload`, label: 'Upload Documents' }
        ];
      case 'company':
        return [
          { path: `/company/${user.uid}/home`, label: 'Home' },
          { path: `/company/${user.uid}/post-job`, label: 'Post Jobs' },
          { path: `/company/${user.uid}/applicants`, label: 'View Applicants' },
          { path: `/company/${user.uid}/profile`, label: 'Company Profile' }
        ];
      case 'institution':
        return [
          { path: `/institute/${user.uid}/home`, label: 'Home' },
          { path: `/institute/${user.uid}/faculties`, label: 'Faculties' },
          { path: `/institute/${user.uid}/courses`, label: 'Courses' },
          { path: `/institute/${user.uid}/applications`, label: 'Applications' },
          { path: `/institute/${user.uid}/admissions`, label: 'Admissions' },
          { path: `/institute/${user.uid}/profile`, label: 'Profile' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav style={{
      background: '#f8f9fa',
      padding: '1rem 2rem',
      borderBottom: '1px solid #dee2e6'
    }}>
      <div style={{
        display: 'flex',
        gap: '2rem',
        alignItems: 'center'
      }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              color: location.pathname === item.path ? '#667eea' : '#495057',
              textDecoration: 'none',
              fontWeight: location.pathname === item.path ? '600' : '400',
              padding: '0.5rem 0',
              borderBottom: location.pathname === item.path ? '2px solid #667eea' : 'none'
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;