import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Bus,
  Route,
  Compass,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Navigation,
  Activity,
  Layers,
  Database,
  Search,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_landmarks: 0,
    total_bus_stops: 0,
    total_routes: 0,
    total_destinations: 0,
    avg_nearest_distance: 146,
    landmarks_summary: [],
    top_destinations: [],
    mathematical_model: 'M = (L, B, R, D, U, F)',
    distance_formula: 'Haversine d = 2R * asin(...)',
  });
  const [loading, setLoading] = useState(true);
  const [activeMathTab, setActiveMathTab] = useState('model'); // 'model' | 'haversine' | 'matching'

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardStats();
      setStats((prev) => ({ ...prev, ...res }));
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* 1. Dashboard Header */}
      <div className="dashboard-header-card card">
        <div className="dash-header-content">
          <div>
            <div className="system-status-badge">
              <span className="status-dot-pulse"></span>
              <span>System Operational • Chennai Transit Network</span>
            </div>
            <h1 className="dash-title">Transit Network Dashboard</h1>
            <p className="dash-subtitle">
              Overview of tourist landmarks, associated boarding stops, bus line connectivity, and spatial distance metrics.
            </p>
          </div>
          <div className="quick-action-group">
            <Link to="/search" className="btn btn-primary btn-sm">
              <Search size={15} />
              Search Landmark
            </Link>
            <Link to="/admin" className="btn btn-secondary btn-sm">
              <Database size={15} />
              Manage Network
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Core Operational KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon-wrap stat-landmark">
            <MapPin size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_landmarks}</div>
          <div className="stat-label">Landmarks Monitored</div>
          <span className="stat-hint">Iconic Chennai Attractions</span>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap stat-bus-stop">
            <Bus size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_bus_stops}</div>
          <div className="stat-label">Bus Stops Linked</div>
          <span className="stat-hint">Geolocated Boarding Bays</span>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap stat-routes">
            <Route size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_routes}</div>
          <div className="stat-label">Active Bus Routes</div>
          <span className="stat-hint">City Transit Lines</span>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap stat-dest">
            <Compass size={24} />
          </div>
          <div className="stat-value">{loading ? '...' : stats.total_destinations}</div>
          <div className="stat-label">Connected Destinations</div>
          <span className="stat-hint">Major Travel Termini</span>
        </div>
      </div>

      {/* 3. Operational Highlights & Network Strip */}
      <div className="network-strip-grid">
        <div className="metric-strip-card card">
          <div className="strip-icon-box">
            <Navigation size={20} className="text-primary" />
          </div>
          <div className="strip-info">
            <span className="strip-label">Average Walking Distance</span>
            <span className="strip-value">
              {loading ? '...' : `${Math.round(stats.avg_nearest_distance || 146)} meters`}
            </span>
            <span className="strip-desc">From landmarks to nearest bus stop (~2 min walk)</span>
          </div>
        </div>

        <div className="metric-strip-card card">
          <div className="strip-icon-box">
            <Activity size={20} className="text-accent" />
          </div>
          <div className="strip-info">
            <span className="strip-label">Spatial Distance Engine</span>
            <span className="strip-value">Haversine Geodesic (WGS-84)</span>
            <span className="strip-desc">Curvature-corrected great-circle computation (R=6,371 km)</span>
          </div>
        </div>

        <div className="metric-strip-card card">
          <div className="strip-icon-box">
            <Layers size={20} className="text-amber" />
          </div>
          <div className="strip-info">
            <span className="strip-label">Map & Visualization</span>
            <span className="strip-value">Leaflet + OpenStreetMap</span>
            <span className="strip-desc">Interactive open-source geospatial routing</span>
          </div>
        </div>
      </div>

      {/* 4. Network Overview Section (Directly on Topic) */}
      <div className="dashboard-content-split">
        {/* Left: Landmark Transit Accessibility Table */}
        <div className="dash-table-card card">
          <div className="dash-card-header">
            <div>
              <h2 className="dash-section-title">Landmark Transit Accessibility</h2>
              <p className="dash-section-sub">
                Closest bus stop and walking distance calculated dynamically for each landmark
              </p>
            </div>
            <span className="badge">{stats.landmarks_summary?.length || 5} Locations</span>
          </div>

          <div className="table-responsive mt-3">
            <table className="standard-dash-table">
              <thead>
                <tr>
                  <th>Landmark</th>
                  <th>Category</th>
                  <th>Nearest Bus Stop</th>
                  <th>Walking Distance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(stats.landmarks_summary || []).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="td-landmark">
                        <MapPin size={15} className="text-danger" />
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge category-pill">{item.category}</span>
                    </td>
                    <td>
                      <div className="td-stop">
                        <Bus size={15} className="text-primary" />
                        <span>{item.nearest_bus_stop}</span>
                      </div>
                    </td>
                    <td>
                      <span className="dist-chip">
                        {Math.round(item.distance_meters)} m
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/landmark/${item.id}`}
                        className="btn btn-outline btn-xs table-action-btn"
                        title="View nearby stops and map"
                      >
                        Explore <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Popular Destination Connectivity */}
        <div className="dash-destinations-card card">
          <div className="dash-card-header">
            <div>
              <h2 className="dash-section-title">Destination Connectivity</h2>
              <p className="dash-section-sub">
                Top destinations reachable directly from nearby landmark bus stops
              </p>
            </div>
            <Compass size={18} className="text-amber" />
          </div>

          <div className="destinations-list mt-3">
            {(stats.top_destinations || []).map((dest) => (
              <div key={dest.destination} className="dest-row">
                <div className="dest-name-wrap">
                  <span className="dest-dot"></span>
                  <span className="dest-name">{dest.destination}</span>
                </div>
                <div className="dest-metric">
                  <span className="dest-count-tag">{dest.route_count} Direct Buses</span>
                </div>
              </div>
            ))}
          </div>

          <div className="dest-card-footer mt-4">
            <p className="text-muted text-xs">
              Direct bus matching is performed dynamically when a tourist selects a destination on any landmark page.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Standardized Technical Architecture & Mathematical Model */}
      <div className="standard-tech-card card mt-4">
        <div className="dash-card-header">
          <div className="tech-header-left">
            <div className="tech-badge-icon">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="dash-section-title">Transit Model & Algorithmic Engine</h2>
              <p className="dash-section-sub">
                Standard formal specification of the Landmark-Based Bus Stop Finder architecture
              </p>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="tech-tabs">
            <button
              type="button"
              className={`tech-tab-btn ${activeMathTab === 'model' ? 'active' : ''}`}
              onClick={() => setActiveMathTab('model')}
            >
              1. System Model M
            </button>
            <button
              type="button"
              className={`tech-tab-btn ${activeMathTab === 'haversine' ? 'active' : ''}`}
              onClick={() => setActiveMathTab('haversine')}
            >
              2. Haversine Formula
            </button>
            <button
              type="button"
              className={`tech-tab-btn ${activeMathTab === 'matching' ? 'active' : ''}`}
              onClick={() => setActiveMathTab('matching')}
            >
              3. Spatial Optimization
            </button>
          </div>
        </div>

        {/* Tab 1: System Model M */}
        {activeMathTab === 'model' && (
          <div className="tech-tab-content">
            <div className="spec-banner">
              <span className="spec-formula-code">System Tuple: M = (L, B, R, D, U, F)</span>
              <p className="spec-summary">
                The transit finder represents the complete application state as a mathematical 6-tuple combining spatial coordinates, transit networks, and user constraints.
              </p>
            </div>

            <div className="spec-grid mt-3">
              <div className="spec-item-box">
                <div className="spec-item-header">
                  <span className="spec-letter">L</span>
                  <h4>Landmarks Set</h4>
                </div>
                <p>
                  Represented as geographic points <code>L_i = (Lat_i, Long_i)</code> with cultural metadata (e.g. Marina Beach: 13.0500° N, 80.2824° E).
                </p>
              </div>

              <div className="spec-item-box">
                <div className="spec-item-header">
                  <span className="spec-letter">B</span>
                  <h4>Bus Stops Set</h4>
                </div>
                <p>
                  Set of physical boarding points <code>B_j = (Lat_j, Long_j)</code> located throughout the urban transit corridor.
                </p>
              </div>

              <div className="spec-item-box">
                <div className="spec-item-header">
                  <span className="spec-letter">R</span>
                  <h4>Transit Routes</h4>
                </div>
                <p>
                  Route tuple <code>R_i = (N_i, S_i, D_i, P_i)</code> defining bus number, origin, destination, and ordered stop sequence.
                </p>
              </div>

              <div className="spec-item-box">
                <div className="spec-item-header">
                  <span className="spec-letter">D</span>
                  <h4>Destinations Set</h4>
                </div>
                <p>
                  Target termini <code>D_u</code> across Chennai (e.g. Central, Tambaram, Saidapet, Guindy, Broadway).
                </p>
              </div>

              <div className="spec-item-box">
                <div className="spec-item-header">
                  <span className="spec-letter">U</span>
                  <h4>User Inquiry</h4>
                </div>
                <p>
                  Search input parameters <code>Input = (L, D_u, D_max, B_n)</code> capturing the selected landmark and user travel preferences.
                </p>
              </div>

              <div className="spec-item-box">
                <div className="spec-item-header">
                  <span className="spec-letter">F</span>
                  <h4>Filtering Engine</h4>
                </div>
                <p>
                  Selection operators that filter candidates by radius ($D_{max}$) and match direct bus lines heading to $D_u$.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Haversine Formula */}
        {activeMathTab === 'haversine' && (
          <div className="tech-tab-content">
            <div className="spec-banner">
              <span className="spec-formula-code">
                d = 2R · sin⁻¹( √( sin²(Δϕ/2) + cos(ϕ₁)cos(ϕ₂)sin²(Δλ/2) ) )
              </span>
              <p className="spec-summary">
                Calculates spherical great-circle distance between GPS coordinates on Earth without flat-plane distortion.
              </p>
            </div>

            <div className="haversine-breakdown-grid mt-3">
              <div className="h-card">
                <h5>1. Angular Radians Conversion</h5>
                <p>
                  Latitudes $\phi_1, \phi_2$ and longitudes $\lambda_1, \lambda_2$ are converted from decimal degrees to radians:
                  <br />
                  <code>Δϕ = radians(Lat₂ - Lat₁)</code>
                  <br />
                  <code>Δλ = radians(Long₂ - Long₁)</code>
                </p>
              </div>

              <div className="h-card">
                <h5>2. Great-Circle Arc Calculation</h5>
                <p>
                  Computes square of half chord length $a$ between coordinates, accounting for Earth's curvature:
                  <br />
                  <code>a = sin²(Δϕ/2) + cos(ϕ₁)·cos(ϕ₂)·sin²(Δλ/2)</code>
                </p>
              </div>

              <div className="h-card">
                <h5>3. Metric Distance Conversion</h5>
                <p>
                  Using Earth's mean radius $R = 6,371\text{ km}$, the final distance is converted to walking meters:
                  <br />
                  <code>Distance_meters = d × 1,000</code>
                </p>
              </div>
            </div>

            <div className="tech-note mt-3">
              <CheckCircle2 size={16} className="text-accent" />
              <span>
                <strong>Implementation:</strong> Built in <code>backend/services/distance_service.py</code>. Distances are computed on-demand per request with zero hard-coded distance values.
              </span>
            </div>
          </div>
        )}

        {/* Tab 3: Spatial Optimization */}
        {activeMathTab === 'matching' && (
          <div className="tech-tab-content">
            <div className="spec-banner">
              <span className="spec-formula-code">
                B* = argmin_{'{B_i ∈ B\'}'} d_i  &nbsp; &nbsp; | &nbsp; &nbsp;  R* = {'{ R_i ∈ R\' | Destination(R_i) = D_u }'}
              </span>
              <p className="spec-summary">
                Dynamic optimization to identify the absolute closest boarding stop and filter buses by passenger destination.
              </p>
            </div>

            <div className="optimization-flow-grid mt-3">
              <div className="opt-step-card">
                <span className="opt-step-badge">Phase 1</span>
                <h4>Radius Filtering</h4>
                <code>B' = {'{ B_i ∈ B | D(L, B_i) ≤ D_max }'}</code>
                <p>
                  Filters candidate bus stops within tourist-selected walking tolerances (500 m, 1 km, 2 km, 5 km).
                </p>
              </div>

              <div className="opt-step-card">
                <span className="opt-step-badge">Phase 2</span>
                <h4>Nearest Stop Ranking</h4>
                <code>B* = argmin d_i</code>
                <p>
                  Sorts all surrounding stops by Haversine distance ascending, highlighting the closest stop ($B^*$).
                </p>
              </div>

              <div className="opt-step-card">
                <span className="opt-step-badge">Phase 3</span>
                <h4>Destination Matching</h4>
                <code>Match(R_i, D_u) ∈ {'{0, 1}'}</code>
                <p>
                  Matches buses operating at nearby stops whose destination reaches the tourist's onward target ($D_u$).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
