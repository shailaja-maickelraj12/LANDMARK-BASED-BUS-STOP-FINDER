import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, Bus, Route, Compass, CheckCircle2, Cpu, Calculator } from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_landmarks: 0,
    total_bus_stops: 0,
    total_routes: 0,
    total_destinations: 0,
    mathematical_model: 'M = (L, B, R, D, U, F)',
    distance_formula: 'Haversine formula d = 2R * asin(...)',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setStats(res);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header text-center">
        <h1 className="page-title">System Dashboard</h1>
        <p className="page-subtitle">
          Overview of transit network assets and mathematical model formulation
        </p>
      </div>

      {/* 1. Statistics Cards (Section 33) */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon-wrap stat-landmark">
            <MapPin size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_landmarks}</div>
          <div className="stat-label">Landmarks</div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap stat-bus-stop">
            <Bus size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_bus_stops}</div>
          <div className="stat-label">Bus Stops</div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap stat-routes">
            <Route size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_routes}</div>
          <div className="stat-label">Bus Routes</div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap stat-dest">
            <Compass size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_destinations}</div>
          <div className="stat-label">Destinations</div>
        </div>
      </div>

      {/* 2. Mathematical Model Section (Section 4, 7, 8, 9, 10, 11, 12) */}
      <div className="math-model-section card mt-4">
        <div className="card-header">
          <div className="math-title-group">
            <Calculator size={22} className="text-primary" />
            <h2 className="section-title">Mathematical Model Implementation</h2>
          </div>
          <span className="badge">Backend Service Grounded</span>
        </div>

        <div className="math-box">
          <p className="math-formula">
            <strong>Formal Representation:</strong> M = (L, B, R, D, U, F)
          </p>
          <div className="math-tuples-grid">
            <div className="tuple-item">
              <strong>L</strong>: Set of Landmarks <code>L_i = (Lat_i, Long_i)</code>
            </div>
            <div className="tuple-item">
              <strong>B</strong>: Set of Bus Stops <code>B_j = (Lat_j, Long_j)</code>
            </div>
            <div className="tuple-item">
              <strong>R</strong>: Set of Bus Routes <code>R_i = (N_i, S_i, D_i, P_i)</code>
            </div>
            <div className="tuple-item">
              <strong>D</strong>: Set of Destinations <code>D_u</code>
            </div>
            <div className="tuple-item">
              <strong>U</strong>: User Search Information <code>Input = (L, D_u, D_max, B_n)</code>
            </div>
            <div className="tuple-item">
              <strong>F</strong>: Selection & Matching Functions
            </div>
          </div>
        </div>

        <div className="math-details-grid mt-4">
          <div className="math-card">
            <h3>1. Haversine Distance Formula</h3>
            <div className="code-block">
              d = 2R · sin⁻¹( √( sin²(Δϕ/2) + cos(ϕ₁)cos(ϕ₂)sin²(Δλ/2) ) )
              <br />
              Distance_meters = d × 1000  (R = 6371 km)
            </div>
            <p className="math-explain">
              Implemented in <code>backend/services/distance_service.py</code>. Calculates exact great-circle distance dynamically without hard-coded distances.
            </p>
          </div>

          <div className="math-card">
            <h3>2. Nearest Bus Stop Algorithm</h3>
            <div className="code-block">
              d_i = Distance(L, B_i)
              <br />
              B* = argmin_{'{B_i ∈ B}'} d_i
            </div>
            <p className="math-explain">
              Identifies the minimum distance bus stop dynamically for any given landmark coordinate.
            </p>
          </div>

          <div className="math-card">
            <h3>3. Distance Filtering</h3>
            <div className="code-block">
              B' = {'{ B_i | D(L, B_i) ≤ D_max }'}
              <br />
              Options: 500 m, 1 km, 2 km, 5 km
            </div>
            <p className="math-explain">
              Filters candidate bus stops within the user-specified maximum radius.
            </p>
          </div>

          <div className="math-card">
            <h3>4. Destination Matching</h3>
            <div className="code-block">
              Match(R_i, D_u) = 1 if Destination(R_i) = D_u else 0
              <br />
              R* = {'{ R_i ∈ R\' | Destination(R_i) = D_u }'}
            </div>
            <p className="math-explain">
              Recommends the optimal bus for the tourist's designated destination.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
