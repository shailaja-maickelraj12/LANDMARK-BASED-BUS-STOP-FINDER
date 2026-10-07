import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Bus, ArrowLeft, ArrowDown, MapPin, Navigation, Compass, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export default function RouteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoute();
  }, [id]);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getRouteById(id);
      setRoute(data);
    } catch (err) {
      console.error('Failed to load route:', err);
      setError('Route details could not be found.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOsmSearch = (stopName) => {
    const url = `https://www.openstreetmap.org/search?query=${encodeURIComponent(stopName + ' Chennai')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="page-loading-state">
        <div className="spinner"></div>
        <p>Loading bus route information...</p>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="page-error-state card">
        <AlertCircle size={40} className="text-danger" />
        <h2>Route Not Found</h2>
        <p>{error || 'The requested bus route does not exist.'}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const stopsList = route.route_stops && route.route_stops.length > 0
    ? route.route_stops
    : [route.source || 'Origin', 'Key Intermediates', route.destination || 'Destination'];

  return (
    <div className="route-details-page">
      <div className="page-nav-bar">
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back to Landmark
        </button>
      </div>

      <div className="route-card-full card">
        <div className="route-header-banner">
          <div className="bus-hero-pill">
            <Bus size={28} />
            <span className="bus-hero-num">{route.bus_number}</span>
          </div>

          <div className="route-title-meta">
            <h1 className="route-main-heading">
              Bus {route.bus_number}: {route.source} ➔ {route.destination}
            </h1>
            <p className="route-sub-meta">
              Boarding Stop: <strong>{route.bus_stop_name || 'Designated Bus Stop'}</strong>
            </p>
          </div>
        </div>

        <div className="route-endpoints-overview">
          <div className="endpoint-box">
            <span className="ep-label">Source</span>
            <span className="ep-name">🏁 {route.source}</span>
          </div>
          <div className="endpoint-arrow-large">➔</div>
          <div className="endpoint-box">
            <span className="ep-label">Destination</span>
            <span className="ep-name">🎯 {route.destination}</span>
          </div>
        </div>

        {/* Vertical Route Sequence Display (Section 23) */}
        <div className="route-timeline-section">
          <h2 className="section-title text-center mb-4">Route Stop Sequence</h2>

          <div className="timeline-container">
            {stopsList.map((stop, index) => {
              const isFirst = index === 0;
              const isLast = index === stopsList.length - 1;

              return (
                <div key={`${stop}-${index}`} className="timeline-step">
                  <div className="timeline-node-wrapper">
                    <div className={`timeline-node ${isFirst ? 'first-node' : isLast ? 'last-node' : 'mid-node'}`}>
                      {isFirst ? 'A' : isLast ? 'B' : index + 1}
                    </div>
                    {!isLast && <div className="timeline-stem"></div>}
                  </div>

                  <div className="timeline-content card">
                    <div className="timeline-stop-info">
                      <span className="stop-title">📍 {stop}</span>
                      <span className="stop-type">
                        {isFirst ? 'Starting Terminal' : isLast ? 'Final Destination' : `Stop #${index + 1}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm view-map-btn"
                      onClick={() => handleOpenOsmSearch(stop)}
                      title="View stop on OpenStreetMap"
                    >
                      <MapPin size={14} />
                      View on Map
                    </button>
                  </div>

                  {!isLast && (
                    <div className="step-connector-arrow">
                      <ArrowDown size={18} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo Disclaimer */}
        <div className="disclaimer-banner mt-4">
          <ShieldCheck size={18} />
          <span>{route.disclaimer || 'Notice: Route data is demonstration data for academic evaluation.'}</span>
        </div>
      </div>
    </div>
  );
}
