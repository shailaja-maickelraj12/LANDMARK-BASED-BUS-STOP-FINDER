import React from 'react';
import { Bus, MapPin, Navigation, ExternalLink } from 'lucide-react';

export default function BusStopCard({
  busStop,
  landmark,
  isNearest = false,
  isSelected = false,
  onSelect,
  onShowRoutes
}) {
  const formatDistance = (meters) => {
    if (meters === undefined || meters === null) return 'N/A';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km (${Math.round(meters)} m)`;
    }
    return `${Math.round(meters)} m`;
  };

  const openDirections = (e) => {
    e.stopPropagation();
    if (!busStop || !landmark) return;
    // Free web directions link using OpenStreetMap routing or standard geo link (no paid API key required)
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${landmark.latitude}%2C${landmark.longitude}%3B${busStop.latitude}%2C${busStop.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`card bus-stop-card ${isNearest ? 'nearest-card' : ''} ${isSelected ? 'selected-card' : ''}`}
      onClick={() => onSelect && onSelect(busStop)}
    >
      <div className="card-top-bar">
        <div className="bus-icon-badge">
          <Bus size={18} />
        </div>
        {isNearest && (
          <span className="badge nearest-badge">
            ★ Nearest Bus Stop
          </span>
        )}
        <div className="distance-badge">
          {formatDistance(busStop.distance_meters)}
        </div>
      </div>

      <h3 className="bus-stop-title">{busStop.name}</h3>

      <div className="coordinates-row">
        <span>Lat: {Number(busStop.latitude).toFixed(4)}</span>
        <span>Lon: {Number(busStop.longitude).toFixed(4)}</span>
      </div>

      <div className="bus-stop-footer">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={openDirections}
          title="Get Directions on Map"
        >
          <Navigation size={14} />
          Directions
        </button>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onShowRoutes) onShowRoutes(busStop);
            else if (onSelect) onSelect(busStop);
          }}
        >
          <Bus size={14} />
          View Buses
        </button>
      </div>
    </div>
  );
}
