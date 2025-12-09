import React, { useState, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/parent/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/parent/dashboard', label: 'Dashboard', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { path: '/parent/transactions', label: 'Transactions', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )},
    { path: '/parent/manage-family', label: 'Manage Family', icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    )},
  ];

  return (
    <div className="parent-theme layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <div className="sidebar__logo">
              <span className="sidebar__logo-icon">💵</span>
            </div>
            <span className="sidebar__brand-name">Kash</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
                closeSidebar();
              }}
              className={`sidebar__nav-item ${isActive(item.path) ? 'sidebar__nav-item--active' : ''}`}
            >
              <span className="sidebar__nav-icon">{item.icon}</span>
              <span className="sidebar__nav-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{user?.name || 'User'}</span>
              <span className="sidebar__user-role">Parent</span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      <div
        className={`layout__overlay ${sidebarOpen ? 'layout__overlay--visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* Main content */}
      <div className="layout__main">
        {/* Header */}
        <header className="header">
          <div className="header__left">
            {showBack ? (
              <button className="header__back" onClick={() => navigate(-1)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12 19 5 12 12 5"/>
                </svg>
              </button>
            ) : (
              <button className="header__menu" onClick={toggleSidebar}>
                <span className="header__menu-bar" />
                <span className="header__menu-bar" />
                <span className="header__menu-bar" />
              </button>
            )}
          </div>

          {title && <h1 className="header__title">{title}</h1>}

          <div className="header__right">
            {/* Placeholder for future actions like notifications */}
          </div>
        </header>

        {/* Page content */}
        <main className="layout__content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
