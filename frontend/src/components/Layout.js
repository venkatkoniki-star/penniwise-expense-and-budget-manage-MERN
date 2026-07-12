import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, PiggyBank, FileBarChart, LogOut, Wallet } from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Wallet size={15} color="#fff" />
          </div>
          <div>
            <div className="logo-text">Pennywise</div>
            <div className="logo-sub">Budget Manager</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Navigation</div>
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard className="nav-icon" size={16} /> Dashboard
          </NavLink>
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ArrowLeftRight className="nav-icon" size={16} /> Transactions
          </NavLink>
          <NavLink to="/budgets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <PiggyBank className="nav-icon" size={16} /> Budgets
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileBarChart className="nav-icon" size={16} /> Monthly Report
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;