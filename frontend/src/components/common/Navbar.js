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
          { path: '/student/dashboard', label: 'Dashboard' },
          { path: '/student/apply-courses', label: 'Apply for Courses' },
          { path: '/student/jobs', label: 'Job Opportunities' },
          { path: '/student/results', label: 'Admission Results' },
          { path: '/student/upload', label: 'Upload Documents' }
        ];
      case 'company':
        return [
          { path: '/company/dashboard', label: 'Dashboard' },
          { path: '/company/post-jobs', label: 'Post Jobs' },
          { path: '/company/applicants', label: 'View Applicants' },
          { path: '/company/profile', label: 'Company Profile' }
        ];
      case 'institution':
        return [
          { path: `/institute/${user.uid}/dashboard`, label: 'Dashboard' },
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