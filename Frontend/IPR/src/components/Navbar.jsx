import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, PlusCircle, Sun, Moon, BarChart3, LogOut, Menu, X, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isDark, toggleTheme, onLogout, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/auth');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar clean-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <ShieldCheck className="logo-icon" size={28} />
          <span>IPR Portal</span>
        </Link>
        
        <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            to="/analysis"
            className={`nav-link ${location.pathname === '/analysis' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <BarChart3 size={18} />
            Analysis
          </Link>
          <Link 
            to="/add-patent" 
            className={`nav-link ${location.pathname === '/add-patent' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <PlusCircle size={18} />
            Add Patent
          </Link>

          {role === 'ADMIN' && (
            <Link 
              to="/admin" 
              className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <Shield size={18} />
              Admin
            </Link>
          )}
          
          <div className="nav-actions">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => { toggleTheme(); closeMenu(); }} 
              className="theme-toggle-btn"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Logout Button */}
            <button
              id="navbar-logout-btn"
              onClick={handleLogout}
              className="theme-toggle-btn logout-btn"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
