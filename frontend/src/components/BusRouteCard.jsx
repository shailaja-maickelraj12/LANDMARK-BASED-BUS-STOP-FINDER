import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, ArrowRight, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';

export default function BusRouteCard({ route, isMatch = false, onSelectRoute }) {
  const navigate = useNavigate();

  const handleView = () => {
    if (onSelectRoute) {
      onSelectRoute(route);
    } else {
      navigate(`/route/${route.id || route._id}`);
    }
  };

  return (
    <div className={`card bus-route-card ${isMatch ? 'matched-route-card' : ''}`}>
      <div className="route-card-header">
        <div className="bus-number-badge">
          <Bus size={16} />
          <span>{route.bus_number}</span>
        </div>
        {isMatch && (
          <div className="badge match-badge">
            <CheckCircle2 size={13} />
            Suitable Bus
          </div>
        )}
      </div>

      <div className="route-endpoints">
        <div className="endpoint-row">
          <span className="endpoint-label">Origin:</span>
          <span className="endpoint-name">{route.source || 'Current Stop'}</span>
        </div>
        <div className="endpoint-arrow">
          <ArrowRight size={16} />
        </div>
        <div className="endpoint-row destination-row">
          <span className="endpoint-label">Destination:</span>
          <span className="endpoint-name destination-highlight">{route.destination}</span>
        </div>
      </div>

      {route.route_stops && route.route_stops.length > 0 && (
        <div className="route-stops-preview">
          <span className="stops-count">
            {route.route_stops.length} Stops:
          </span>
          <span className="stops-summary">
            {route.route_stops.slice(0, 3).join(' → ')}
            {route.route_stops.length > 3 ? '...' : ''}
          </span>
        </div>
      )}

      {route.bus_stop_name && (
        <div className="operates-at">
          <MapPin size={13} />
          <span>Operates at: {route.bus_stop_name}</span>
        </div>
      )}

      <div className="route-card-actions">
        <button onClick={handleView} className="btn btn-outline btn-sm w-full">
          <span>View Route</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
