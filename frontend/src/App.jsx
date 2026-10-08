import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import LandmarkDetails from './pages/LandmarkDetails';
import RouteDetails from './pages/RouteDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/landmark/:id" element={<LandmarkDetails />} />
            <Route path="/route/:id" element={<RouteDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-title">Landmark-Based Bus Stop Finder</span>
            <p className="footer-subtitle">
              Smart Tourist Transit Guide • Dynamic Geodesic Distance Engine • OpenStreetMap & Leaflet
            </p>
          </div>
          <div className="footer-links">
            <span>Chennai Tourist Transit Guide</span>
            <span>•</span>
            <span>Leaflet + OpenStreetMap</span>
            <span>•</span>
            <span>Demonstration transit schedules</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
