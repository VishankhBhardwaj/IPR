import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, PlusCircle, Sun, Moon, BarChart3 } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ isDark, toggleTheme }) => {
  const location = useLocation();

  return (
    <nav className="navbar clean-panel">
      <div className="navbar-container container">
        <Link to="/" className="navbar-logo">
          <ShieldCheck className="logo-icon" size={28} />
          <span>IPR Portal</span>
        </Link>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            to="/analysis"
            className={`nav-link ${location.pathname === '/analysis' ? 'active' : ''}`}
          >
            <BarChart3 size={18} />
            Analysis
          </Link>
          <Link 
            to="/add-patent" 
            className={`nav-link ${location.pathname === '/add-patent' ? 'active' : ''}`}
          >
            <PlusCircle size={18} />
            Add Patent
          </Link>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
