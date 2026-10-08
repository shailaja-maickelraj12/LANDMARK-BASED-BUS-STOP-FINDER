import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bus,
  Compass,
  Navigation,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Route,
  Loader2,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import BusStopCard from '../components/BusStopCard';
import BusRouteCard from '../components/BusRouteCard';
import FilterPanel from '../components/FilterPanel';
import MapView from '../components/MapView';

export default function LandmarkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core Data
  const [landmark, setLandmark] = useState(null);
  const [nearbyStops, setNearbyStops] = useState([]);
  const [nearestStop, setNearestStop] = useState(null);
  const [selectedBusStop, setSelectedBusStop] = useState(null);
  const [routesForSelectedStop, setRoutesForSelectedStop] = useState([]);
  const [allAvailableRoutes, setAllAvailableRoutes] = useState([]);
  const [destinations, setDestinations] = useState([]);

  // Filters
  const searchParams = new URLSearchParams(window.location.search);
  const [selectedDistance, setSelectedDistance] = useState(
    searchParams.get('max_distance') || ''
  );
  const [selectedDestination, setSelectedDestination] = useState(
    searchParams.get('destination') || ''
  );
  const [busNumberQuery, setBusNumberQuery] = useState(
    searchParams.get('bus') || ''
  );

  // UI States
  const [loadingLandmark, setLoadingLandmark] = useState(true);
  const [loadingStops, setLoadingStops] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [error, setError] = useState(null);

  // 1. Initial Load: Landmark details & destinations list
  useEffect(() => {
    loadLandmarkData();
    loadDestinations();
  }, [id]);

  const loadLandmarkData = async () => {
    try {
      setLoadingLandmark(true);
      setError(null);
      const lmData = await api.getLandmarkById(id);
      setLandmark(lmData);

      // Fetch nearest bus stop for landmark
      try {
        const nearestRes = await api.getNearestBusStop(id);
        setNearestStop(nearestRes);
      } catch (e) {
        console.warn('Could not fetch nearest stop:', e);
      }
    } catch (err) {
      console.error('Failed to load landmark:', err);
      setError('No landmark found. Please try another landmark.');
    } finally {
      setLoadingLandmark(false);
    }
  };

  const loadDestinations = async () => {
    try {
      const dests = await api.getDestinations();
      setDestinations(dests);
    } catch (e) {
      console.warn('Failed to load destinations:', e);
    }
  };

  // 2. Load Nearby Bus Stops (dynamic Haversine calculation)
  useEffect(() => {
    if (landmark) {
      fetchNearbyBusStops();
    }
  }, [landmark, selectedDistance]);

  const fetchNearbyBusStops = async () => {
    try {
      setLoadingStops(true);
      const res = await api.getNearbyBusStops(id, selectedDistance);
      const stops = res.bus_stops || [];
      setNearbyStops(stops);

      // If no bus stop is currently selected, default to the nearest stop
      if (!selectedBusStop && stops.length > 0) {
        setSelectedBusStop(stops[0]);
      } else if (selectedBusStop) {
        // verify still in filtered list
        const exists = stops.find((s) => s.id === selectedBusStop.id);
        if (!exists && stops.length > 0) {
          setSelectedBusStop(stops[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load nearby bus stops:', err);
    } finally {
      setLoadingStops(false);
    }
  };

  // 3. Load Routes for currently selected bus stop
  useEffect(() => {
    if (selectedBusStop) {
      fetchRoutesForStop(selectedBusStop.id);
    } else {
      setRoutesForSelectedStop([]);
    }
  }, [selectedBusStop]);

  const fetchRoutesForStop = async (stopId) => {
    try {
      setLoadingRoutes(true);
      const res = await api.getRoutesForBusStop(stopId);
      setRoutesForSelectedStop(res.routes || []);
    } catch (err) {
      console.error('Failed to fetch routes for stop:', err);
      setRoutesForSelectedStop([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  // 4. Also fetch all routes across all nearby bus stops for global destination matching
  useEffect(() => {
    if (nearbyStops.length > 0) {
      fetchAllNearbyRoutes();
    }
  }, [nearbyStops]);

  const fetchAllNearbyRoutes = async () => {
    try {
      const promises = nearbyStops.map((stop) => api.getRoutesForBusStop(stop.id));
      const results = await Promise.all(promises);
      const combined = [];
      results.forEach((r, idx) => {
        (r.routes || []).forEach((route) => {
          combined.push({
            ...route,
            bus_stop_id: nearbyStops[idx].id,
            bus_stop_name: nearbyStops[idx].name,
            distance_meters: nearbyStops[idx].distance_meters,
          });
        });
      });
      setAllAvailableRoutes(combined);
    } catch (err) {
      console.warn('Failed to aggregate nearby routes:', err);
    }
  };

  // Destination Matching & Bus Filtering
  // Mathematical model: Match(R_i, D_u) = 1 if destination matches, else 0
  const matchedSuitableBuses = useMemo(() => {
    if (!selectedDestination) return [];
    const targetDest = selectedDestination.trim().toLowerCase();

    // Look through all routes available at nearby stops
    const matched = allAvailableRoutes.filter((r) => {
      const dest = (r.destination || '').trim().toLowerCase();
      const matchDest = dest === targetDest || dest.includes(targetDest);

      if (!matchDest) return false;
      if (busNumberQuery.trim()) {
        const query = busNumberQuery.trim().toLowerCase();
        return (r.bus_number || '').toLowerCase().includes(query);
      }
      return true;
    });

    // Sort matching routes by bus stop distance ascending
    matched.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));
    return matched;
  }, [allAvailableRoutes, selectedDestination, busNumberQuery]);

  // Filtered routes for the active bus stop
  const displayRoutes = useMemo(() => {
    return routesForSelectedStop.filter((r) => {
      if (selectedDestination) {
        const targetDest = selectedDestination.trim().toLowerCase();
        const dest = (r.destination || '').trim().toLowerCase();
        if (dest !== targetDest && !dest.includes(targetDest)) return false;
      }
      if (busNumberQuery.trim()) {
        const query = busNumberQuery.trim().toLowerCase();
        if (!(r.bus_number || '').toLowerCase().includes(query)) return false;
      }
      return true;
    });
  }, [routesForSelectedStop, selectedDestination, busNumberQuery]);

  const handleResetFilters = () => {
    setSelectedDistance('');
    setSelectedDestination('');
    setBusNumberQuery('');
  };

  const openDirections = (busStop) => {
    if (!busStop || !landmark) return;
    const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${landmark.latitude}%2C${landmark.longitude}%3B${busStop.latitude}%2C${busStop.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loadingLandmark) {
    return (
      <div className="page-loading-state">
        <Loader2 className="animate-spin text-primary" size={36} />
        <h2>Searching landmark...</h2>
        <p>Loading landmark coordinates and details</p>
      </div>
    );
  }

  if (error || !landmark) {
    return (
      <div className="page-error-state card">
        <AlertCircle size={40} className="text-danger" />
        <h2>No landmark found.</h2>
        <p>Please try another landmark from our home page or search bar.</p>
        <Link to="/search" className="btn btn-primary mt-3">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="landmark-details-page">
      {/* 1. Landmark Details Header */}
      <section className="landmark-header-card card">
        <div className="landmark-header-top">
          <div className="landmark-title-group">
            <span className="badge category-badge">
              <Compass size={14} />
              {landmark.category}
            </span>
            <span className="city-label">{landmark.city || 'Chennai'}</span>
            <h1 className="landmark-main-title">📍 {landmark.name}</h1>
          </div>
          <div className="coords-box">
            <span className="coords-label">Landmark Coordinates</span>
            <span className="coords-val">
              {Number(landmark.latitude).toFixed(4)}° N, {Number(landmark.longitude).toFixed(4)}° E
            </span>
          </div>
        </div>
        <p className="landmark-full-desc">{landmark.description}</p>
      </section>

      {/* 2. Nearest Bus Stop Highlight Card */}
      {nearestStop && (
        <section className="nearest-bus-stop-banner card">
          <div className="nearest-banner-content">
            <div className="nearest-icon-wrapper">
              <Bus size={32} />
            </div>
            <div className="nearest-info">
              <span className="badge nearest-pill">★ Nearest Bus Stop</span>
              <h2 className="nearest-stop-title">🚌 {nearestStop.nearest_bus_stop}</h2>
              <div className="nearest-distance-tag">
                Walking Distance: <strong>{Math.round(nearestStop.distance_meters)} meters</strong> (~{Math.max(1, Math.round(nearestStop.distance_meters / 80))} min walk)
              </div>
            </div>
            <div className="nearest-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const match = nearbyStops.find((s) => s.id === nearestStop.bus_stop_id);
                  if (match) setSelectedBusStop(match);
                }}
              >
                <Bus size={16} />
                View Bus Routes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => openDirections(nearestStop)}
              >
                <Navigation size={16} />
                Get Directions
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Filter Panel */}
      <section className="filter-section">
        <FilterPanel
          selectedDistance={selectedDistance}
          onDistanceChange={setSelectedDistance}
          selectedDestination={selectedDestination}
          onDestinationChange={setSelectedDestination}
          destinations={destinations}
          busNumberQuery={busNumberQuery}
          onBusNumberChange={setBusNumberQuery}
          onResetFilters={handleResetFilters}
        />
      </section>

      {/* 4. Destination Matching / Recommended Bus (Section 11 & 28) */}
      {selectedDestination && (
        <section className="matched-destination-section card">
          <div className="matched-header">
            <div className="matched-header-title">
              <Sparkles size={20} className="text-amber" />
              <h3>
                Recommended Bus for: <span className="dest-term">"{selectedDestination}"</span>
              </h3>
            </div>
            <span className="badge dest-count-badge">
              {matchedSuitableBuses.length} Match{matchedSuitableBuses.length === 1 ? '' : 'es'}
            </span>
          </div>

          {matchedSuitableBuses.length > 0 ? (
            <div className="recommended-buses-grid">
              {matchedSuitableBuses.map((bus) => (
                <div key={bus.id || `${bus.bus_number}-${bus.bus_stop_id}`} className="recommended-bus-card">
                  <div className="rec-top">
                    <span className="rec-bus-pill">🚌 {bus.bus_number}</span>
                    <span className="rec-distance-pill">
                      {Math.round(bus.distance_meters || 0)} m to stop
                    </span>
                  </div>
                  <div className="rec-route-info">
                    <p className="rec-dest">
                      <strong>Destination:</strong> {bus.destination}
                    </p>
                    <p className="rec-stop-name">
                      <strong>Boarding Stop:</strong> {bus.bus_stop_name}
                    </p>
                  </div>
                  <div className="rec-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/route/${bus.id}`)}
                    >
                      <Route size={14} />
                      View Route
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        const targetStop = nearbyStops.find((s) => s.id === bus.bus_stop_id);
                        if (targetStop) setSelectedBusStop(targetStop);
                      }}
                    >
                      <MapPin size={14} />
                      View on Map
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        const targetStop = nearbyStops.find((s) => s.id === bus.bus_stop_id);
                        if (targetStop) openDirections(targetStop);
                      }}
                    >
                      <Navigation size={14} />
                      Get Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-direct-bus-box">
              <AlertCircle size={22} className="text-amber" />
              <div>
                <strong>No direct bus found for this destination.</strong>
                <p>Please try selecting another destination from the dropdown or clear the filter.</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 5. Main Grid: Nearby Bus Stops, Routes, and Interactive Map */}
      <div className="details-main-layout">
        {/* Left Column: Nearby Bus Stops List */}
        <div className="stops-and-routes-column">
          <div className="column-card card">
            <div className="column-header">
              <div className="col-header-left">
                <Bus size={18} className="text-primary" />
                <h3>Nearby Bus Stops</h3>
              </div>
              <span className="badge count-badge">{nearbyStops.length} stops</span>
            </div>

            {loadingStops && (
              <div className="loading-state-inline">
                <Loader2 className="animate-spin" size={20} />
                <span>Finding nearby bus stops...</span>
              </div>
            )}

            {!loadingStops && nearbyStops.length === 0 && (
              <div className="empty-stops-alert">
                <AlertCircle size={20} />
                <p>
                  No bus stops found within the selected distance.
                  <br />
                  Try increasing the distance filter (e.g. 2 km or 5 km).
                </p>
              </div>
            )}

            {!loadingStops && nearbyStops.length > 0 && (
              <div className="stops-list-vertical">
                {nearbyStops.map((stop) => {
                  const isNearest = nearestStop && (stop.id === nearestStop.bus_stop_id || stop.name === nearestStop.nearest_bus_stop);
                  const isSelected = selectedBusStop && selectedBusStop.id === stop.id;

                  return (
                    <BusStopCard
                      key={stop.id}
                      busStop={stop}
                      landmark={landmark}
                      isNearest={isNearest}
                      isSelected={isSelected}
                      onSelect={(st) => setSelectedBusStop(st)}
                      onShowRoutes={(st) => setSelectedBusStop(st)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Buses at Selected Stop */}
          {selectedBusStop && (
            <div className="column-card card mt-4">
              <div className="column-header">
                <div className="col-header-left">
                  <Route size={18} className="text-primary" />
                  <div>
                    <h3>Available Buses</h3>
                    <p className="subtext">
                      Operating at: <strong>{selectedBusStop.name}</strong>
                    </p>
                  </div>
                </div>
                <span className="badge count-badge">{displayRoutes.length} buses</span>
              </div>

              {loadingRoutes && (
                <div className="loading-state-inline">
                  <Loader2 className="animate-spin" size={20} />
                  <span>Finding suitable buses...</span>
                </div>
              )}

              {!loadingRoutes && displayRoutes.length === 0 && (
                <div className="empty-routes-alert">
                  <AlertCircle size={20} />
                  <p>No bus routes match your current filter at this stop.</p>
                </div>
              )}

              {!loadingRoutes && displayRoutes.length > 0 && (
                <div className="routes-cards-grid">
                  {displayRoutes.map((route) => {
                    const isMatch =
                      selectedDestination &&
                      (route.destination || '').toLowerCase().includes(selectedDestination.toLowerCase());
                    return (
                      <BusRouteCard
                        key={route.id || route._id}
                        route={route}
                        isMatch={isMatch}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Leaflet Map & Directions Panel */}
        <div className="map-column">
          <div className="sticky-map-container card">
            <MapView
              landmark={landmark}
              busStops={nearbyStops}
              selectedBusStop={selectedBusStop}
              nearestBusStop={nearestStop ? { ...nearestStop, id: nearestStop.bus_stop_id, name: nearestStop.nearest_bus_stop } : null}
              onSelectBusStop={(stop) => setSelectedBusStop(stop)}
            />

            {selectedBusStop && (
              <div className="map-bottom-controls">
                <div className="direction-info-box">
                  <div className="dir-points">
                    <span>📍 {landmark.name}</span>
                    <ArrowRight size={14} className="mx-1" />
                    <span>🚌 {selectedBusStop.name}</span>
                  </div>
                  <div className="dir-distance">
                    Direct Distance: <strong>{Math.round(selectedBusStop.distance_meters || 0)} meters</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => openDirections(selectedBusStop)}
                >
                  <Navigation size={16} />
                  Get Directions (Walk / Transit)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
