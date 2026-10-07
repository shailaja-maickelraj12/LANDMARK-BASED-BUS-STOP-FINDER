import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, Compass, Navigation, ArrowRight, ShieldCheck } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import LandmarkCard from '../components/LandmarkCard';
import api from '../services/api';

export default function Home() {
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLandmarks();
  }, []);

  const fetchLandmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getLandmarks();
      setLandmarks(data);
    } catch (err) {
      console.error('Failed to load landmarks:', err);
      setError('Unable to connect to the server. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (landmarkName) => {
    const found = landmarks.find((lm) => lm.name.toLowerCase() === landmarkName.toLowerCase());
    if (found) {
      navigate(`/landmark/${found.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(landmarkName)}`);
    }
  };

  const popularNames = [
    'Marina Beach',
    'Kapaleeshwarar Temple',
    'Fort St. George',
    'Government Museum',
    'Valluvar Kottam',
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Compass size={16} />
            <span>Smart Tourist Transit Companion</span>
          </div>

          <h1 className="hero-title">
            LANDMARK-BASED BUS STOP FINDER
          </h1>

          <p className="hero-subtitle">
            Find the nearest bus stop and suitable bus from popular landmarks.
          </p>

          <div className="hero-search-wrapper">
            <SearchBar placeholder="Search Landmark (e.g. Marina Beach, Valluvar Kottam)..." />
          </div>

          {/* Quick Popular Landmark Chips */}
          <div className="popular-landmarks-section">
            <span className="popular-label">Popular Landmarks:</span>
            <div className="popular-chips">
              {popularNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleQuickSelect(name)}
                  className="popular-chip"
                >
                  <MapPin size={14} className="chip-icon" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Step Diagram / Highlights */}
      <section className="workflow-section">
        <div className="section-header text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Dynamic Haversine Distance & Route Destination Matching</p>
        </div>

        <div className="workflow-steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon"><MapPin size={22} /></div>
            <h4 className="step-title">Select Landmark</h4>
            <p className="step-desc">Pick an iconic tourist site or search by name</p>
          </div>

          <div className="workflow-arrow"><ArrowRight size={20} /></div>

          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-icon"><Compass size={22} /></div>
            <h4 className="step-title">Calculate Distance</h4>
            <p className="step-desc">Haversine formula computes exact distance to stops</p>
          </div>

          <div className="workflow-arrow"><ArrowRight size={20} /></div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon"><Bus size={22} /></div>
            <h4 className="step-title">Find Nearest Bus Stop</h4>
            <p className="step-desc">Identifies B* = argmin d_i dynamically in meters</p>
          </div>

          <div className="workflow-arrow"><ArrowRight size={20} /></div>

          <div className="step-card">
            <div className="step-number">4</div>
            <div className="step-icon"><Navigation size={22} /></div>
            <h4 className="step-title">Match Suitable Bus</h4>
            <p className="step-desc">Filter by destination and get direct route stops & map</p>
          </div>
        </div>
      </section>

      {/* Landmarks Grid */}
      <section className="featured-landmarks-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Explore Landmarks</h2>
            <p className="section-subtitle">Select a landmark to view its nearest bus stop and transit routes</p>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading landmarks from database...</p>
          </div>
        )}

        {error && (
          <div className="error-alert">
            <p>{error}</p>
            <button onClick={fetchLandmarks} className="btn btn-secondary btn-sm mt-2">
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && landmarks.length > 0 && (
          <div className="landmarks-grid">
            {landmarks.map((lm) => (
              <LandmarkCard key={lm.id} landmark={lm} />
            ))}
          </div>
        )}
      </section>

      {/* Project Disclaimer Banner */}
      <div className="disclaimer-banner">
        <ShieldCheck size={18} className="disclaimer-icon" />
        <span>
          <strong>Academic Mini-Project:</strong> Bus route schedules are demonstration data for full-stack college project evaluation.
        </span>
      </div>
    </div>
  );
}
