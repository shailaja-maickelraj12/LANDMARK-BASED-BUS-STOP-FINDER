import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Compass } from 'lucide-react';

export default function LandmarkCard({ landmark, onSelect }) {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onSelect) {
      onSelect(landmark);
    } else {
      navigate(`/landmark/${landmark.id}`);
    }
  };

  return (
    <div className="card landmark-card">
      <div className="card-header">
        <div className="badge landmark-badge">
          <Compass size={14} className="badge-icon" />
          {landmark.category || 'Landmark'}
        </div>
        <span className="location-tag">{landmark.city || 'Chennai'}</span>
      </div>

      <h3 className="card-title">{landmark.name}</h3>
      <p className="card-description">{landmark.description}</p>

      <div className="coordinates-row">
        <span className="coord-item">
          <strong>Lat:</strong> {Number(landmark.latitude).toFixed(4)}
        </span>
        <span className="coord-item">
          <strong>Long:</strong> {Number(landmark.longitude).toFixed(4)}
        </span>
      </div>

      <div className="card-actions">
        <button onClick={handleAction} className="btn btn-primary w-full">
          <MapPin size={16} />
          Find Nearby Bus Stops
        </button>
      </div>
    </div>
  );
}
