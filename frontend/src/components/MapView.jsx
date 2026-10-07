import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Bounds Updater
function MapBoundsUpdater({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (bounds && bounds.length === 1) {
      map.setView(bounds[0], 15);
    }
  }, [bounds, map]);
  return null;
}

// Custom DivIcons for crisp SVG rendering without asset path issues
const createLandmarkIcon = () =>
  L.divIcon({
    className: 'custom-leaflet-icon landmark-icon',
    html: `
      <div style="
        background: #ef4444;
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5);
        border: 2px solid #ffffff;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-size: 15px;
          line-height: 1;
        ">📍</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });

const createBusStopIcon = (isNearest = false, isSelected = false) =>
  L.divIcon({
    className: 'custom-leaflet-icon bus-stop-icon',
    html: `
      <div style="
        background: ${isSelected ? '#2563eb' : isNearest ? '#059669' : '#0284c7'};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        border: 2px solid #ffffff;
        font-size: 15px;
      ">
        🚌
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });

export default function MapView({
  landmark,
  busStops = [],
  selectedBusStop = null,
  nearestBusStop = null,
  onSelectBusStop
}) {
  const defaultCenter = [13.0500, 80.2824]; // Chennai default

  const activeBusStop = selectedBusStop || nearestBusStop || (busStops.length > 0 ? busStops[0] : null);

  // Compute map bounds to fit both landmark and stops
  const bounds = useMemo(() => {
    const points = [];
    if (landmark && landmark.latitude && landmark.longitude) {
      points.push([Number(landmark.latitude), Number(landmark.longitude)]);
    }
    if (activeBusStop && activeBusStop.latitude && activeBusStop.longitude) {
      points.push([Number(activeBusStop.latitude), Number(activeBusStop.longitude)]);
    }
    return points.length > 0 ? points : [defaultCenter];
  }, [landmark, activeBusStop]);

  const polylineCoordinates = useMemo(() => {
    if (
      landmark &&
      landmark.latitude &&
      landmark.longitude &&
      activeBusStop &&
      activeBusStop.latitude &&
      activeBusStop.longitude
    ) {
      return [
        [Number(landmark.latitude), Number(landmark.longitude)],
        [Number(activeBusStop.latitude), Number(activeBusStop.longitude)],
      ];
    }
    return null;
  }, [landmark, activeBusStop]);

  // Center point on the polyline for distance label
  const midpoint = useMemo(() => {
    if (polylineCoordinates && polylineCoordinates.length === 2) {
      const latMid = (polylineCoordinates[0][0] + polylineCoordinates[1][0]) / 2;
      const lonMid = (polylineCoordinates[0][1] + polylineCoordinates[1][1]) / 2;
      return [latMid, lonMid];
    }
    return null;
  }, [polylineCoordinates]);

  const landmarkIcon = useMemo(() => createLandmarkIcon(), []);

  return (
    <div className="map-view-wrapper">
      <div className="map-view-header">
        <div className="map-header-left">
          <span className="map-title">Interactive Map View</span>
          <span className="map-subtitle">OpenStreetMap + Leaflet Distance Visualizer</span>
        </div>
        {activeBusStop && (
          <div className="map-active-info">
            <span className="active-stop-name">{activeBusStop.name}</span>
            <span className="active-stop-dist">
              {Math.round(activeBusStop.distance_meters || 0)} m away
            </span>
          </div>
        )}
      </div>

      <div className="leaflet-container-wrapper">
        <MapContainer
          center={bounds[0] || defaultCenter}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapBoundsUpdater bounds={bounds} />

          {/* Landmark Marker */}
          {landmark && landmark.latitude && landmark.longitude && (
            <Marker
              position={[Number(landmark.latitude), Number(landmark.longitude)]}
              icon={landmarkIcon}
            >
              <Popup>
                <div className="map-popup">
                  <h4 className="popup-title">📍 {landmark.name}</h4>
                  <p className="popup-subtitle">{landmark.category || 'Tourist Landmark'}</p>
                  <p className="popup-coords">
                    {Number(landmark.latitude).toFixed(4)}, {Number(landmark.longitude).toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Bus Stops Markers */}
          {busStops.map((stop) => {
            const isNearest = nearestBusStop && (stop.id === nearestBusStop.id || stop.name === nearestBusStop.name);
            const isSelected = activeBusStop && (stop.id === activeBusStop.id || stop.name === activeBusStop.name);
            const stopIcon = createBusStopIcon(isNearest, isSelected);

            return (
              <Marker
                key={stop.id || stop.name}
                position={[Number(stop.latitude), Number(stop.longitude)]}
                icon={stopIcon}
                eventHandlers={{
                  click: () => onSelectBusStop && onSelectBusStop(stop),
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <h4 className="popup-title">🚌 {stop.name}</h4>
                    {isNearest && <div className="popup-badge">★ Nearest Bus Stop</div>}
                    <p className="popup-distance">
                      <strong>Distance:</strong> {Math.round(stop.distance_meters || 0)} m
                    </p>
                    <p className="popup-coords">
                      {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Polyline connecting Landmark and Active Bus Stop */}
          {polylineCoordinates && (
            <Polyline
              positions={polylineCoordinates}
              color="#2563eb"
              weight={4}
              opacity={0.85}
              dashArray="6, 8"
            />
          )}

          {/* Popup at midpoint showing distance */}
          {midpoint && activeBusStop && activeBusStop.distance_meters && (
            <Popup position={midpoint} closeButton={false} autoClose={false} closeOnClick={false}>
              <div className="midpoint-label">
                📏 {Math.round(activeBusStop.distance_meters)} m
              </div>
            </Popup>
          )}
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot landmark-dot"></span>
          <span>Landmark ({landmark?.name || 'Selected'})</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot nearest-dot"></span>
          <span>Nearest Bus Stop</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot other-dot"></span>
          <span>Other Bus Stops</span>
        </div>
        <div className="legend-item">
          <span className="legend-line"></span>
          <span>Haversine Direct Distance</span>
        </div>
      </div>
    </div>
  );
}
