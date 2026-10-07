import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, MapPin, BarChart3, Settings, Search } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">
            <Bus size={22} className="text-white" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Landmark-Based Bus Stop Finder</span>
            <span className="brand-subtitle">Smart Tourist Transit System</span>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
            <Search size={16} />
            Search
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
            <BarChart3 size={16} />
            Dashboard
          </Link>
          <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
            <Settings size={16} />
            Manage
          </Link>
        </nav>
      </div>
    </header>
  );
}
