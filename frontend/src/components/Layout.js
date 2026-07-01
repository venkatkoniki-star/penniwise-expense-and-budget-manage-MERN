import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, PiggyBank, FileBarChart, LogOut, Wallet,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Wallet size={18} color="#fff" />
          </div>
          <div>
            <div className="logo-text">Pennywise</div>
            <div className="logo-sub">Budget Manager</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Menu</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard className="nav-icon" /> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ArrowLeftRight className="nav-icon" /> Transactions
          </NavLink>
          <NavLink to="/budgets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PiggyBank className="nav-icon" /> Budgets
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileBarChart className="nav-icon" /> Monthly Report
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
