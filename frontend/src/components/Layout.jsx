import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  FileBarChart,
  LogOut,
  Wallet,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import AppLogo from './AppLogo';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'PW';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="app-shell">
      {/* Mobile Top App Bar */}
      <header className="mobile-header">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="mobile-header-brand" style={{ cursor: 'pointer' }}>
          <AppLogo size="sm" onClick={() => navigate('/dashboard')} />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ThemeSelector compact={true} placement="bottom" showLabel={false} />
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileMenu} />
      )}

      {/* Sidebar (Desktop static left panel / Mobile sliding drawer) */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo" style={{ cursor: 'pointer' }}>
          <AppLogo size="md" showSub={true} onClick={() => navigate('/dashboard')} />
          {/* Mobile close button inside drawer */}
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close Navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sys-status-badge">
          <span className="pulse-dot"></span>
          <span>SYS.ACTIVE · INR (₹)</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Command Modules</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard className="nav-icon" size={16} /> Dashboard
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <ArrowLeftRight className="nav-icon" size={16} /> Transactions
          </NavLink>
          <NavLink
            to="/budgets"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <PiggyBank className="nav-icon" size={16} /> Budgets
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <FileBarChart className="nav-icon" size={16} /> Monthly Report
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          {/* Multi-Theme Atmosphere Selector */}
          <div style={{ marginBottom: 10 }}>
            <ThemeSelector placement="top" />
          </div>

          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user.name || 'Terminal Operator'}</div>
              <div className="user-email">{user.email || 'operator@pennywise.app'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>

      {/* Native Mobile Bottom Navigation Dock */}
      <nav className="mobile-bottom-dock">
        <NavLink to="/dashboard" className={({ isActive }) => `mobile-dock-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `mobile-dock-item ${isActive ? 'active' : ''}`}>
          <ArrowLeftRight size={18} />
          <span>Ledger</span>
        </NavLink>
        <NavLink to="/budgets" className={({ isActive }) => `mobile-dock-item ${isActive ? 'active' : ''}`}>
          <PiggyBank size={18} />
          <span>Budgets</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `mobile-dock-item ${isActive ? 'active' : ''}`}>
          <FileBarChart size={18} />
          <span>Reports</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;