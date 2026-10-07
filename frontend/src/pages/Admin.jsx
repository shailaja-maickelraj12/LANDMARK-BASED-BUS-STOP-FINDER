import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Bus,
  Route,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../services/api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('landmarks'); // 'landmarks' | 'bus_stops' | 'routes'
  const [landmarks, setLandmarks] = useState([]);
  const [busStops, setBusStops] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Form states
  const [landmarkForm, setLandmarkForm] = useState({
    id: null,
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    category: 'Tourist Attraction',
  });

  const [busStopForm, setBusStopForm] = useState({
    id: null,
    name: '',
    latitude: '',
    longitude: '',
    landmark_id: '',
  });

  const [routeForm, setRouteForm] = useState({
    id: null,
    bus_number: '',
    bus_stop_id: '',
    source: '',
    destination: '',
    route_stops: '',
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [lms, stops, rts] = await Promise.all([
        api.getLandmarks(),
        api.getAllBusStops(),
        api.getAllRoutes(),
      ]);
      setLandmarks(lms || []);
      setBusStops(stops || []);
      setRoutes(rts.routes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showMessage('Failed to load data from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  // Landmark CRUD
  const handleSaveLandmark = async (e) => {
    e.preventDefault();
    try {
      if (landmarkForm.id) {
        await api.updateLandmark(landmarkForm.id, landmarkForm);
        showMessage('Landmark updated successfully!');
      } else {
        await api.createLandmark(landmarkForm);
        showMessage('Landmark added successfully!');
      }
      setLandmarkForm({
        id: null,
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        category: 'Tourist Attraction',
      });
      loadAllData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to save landmark', 'error');
    }
  };

  const handleDeleteLandmark = async (id) => {
    if (!window.confirm('Are you sure you want to delete this landmark?')) return;
    try {
      await api.deleteLandmark(id);
      showMessage('Landmark deleted successfully!');
      loadAllData();
    } catch (err) {
      showMessage('Failed to delete landmark', 'error');
    }
  };

  // Bus Stop CRUD
  const handleSaveBusStop = async (e) => {
    e.preventDefault();
    try {
      if (busStopForm.id) {
        await api.updateBusStop(busStopForm.id, busStopForm);
        showMessage('Bus stop updated successfully!');
      } else {
        await api.createBusStop(busStopForm);
        showMessage('Bus stop added successfully!');
      }
      setBusStopForm({ id: null, name: '', latitude: '', longitude: '', landmark_id: '' });
      loadAllData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to save bus stop', 'error');
    }
  };

  const handleDeleteBusStop = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus stop?')) return;
    try {
      await api.deleteBusStop(id);
      showMessage('Bus stop deleted successfully!');
      loadAllData();
    } catch (err) {
      showMessage('Failed to delete bus stop', 'error');
    }
  };

  // Route CRUD
  const handleSaveRoute = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...routeForm,
        route_stops: typeof routeForm.route_stops === 'string'
          ? routeForm.route_stops.split(',').map((s) => s.trim()).filter(Boolean)
          : routeForm.route_stops,
      };

      if (routeForm.id) {
        await api.updateRoute(routeForm.id, payload);
        showMessage('Bus route updated successfully!');
      } else {
        await api.createRoute(payload);
        showMessage('Bus route added successfully!');
      }
      setRouteForm({
        id: null,
        bus_number: '',
        bus_stop_id: '',
        source: '',
        destination: '',
        route_stops: '',
      });
      loadAllData();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Failed to save route', 'error');
    }
  };

  const handleDeleteRoute = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;
    try {
      await api.deleteRoute(id);
      showMessage('Bus route deleted successfully!');
      loadAllData();
    } catch (err) {
      showMessage('Failed to delete route', 'error');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Manage Transit Data</h1>
          <p className="page-subtitle">Add, edit, and delete landmarks, bus stops, and routes (CRUD operations)</p>
        </div>
        <button onClick={loadAllData} className="btn btn-outline btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {msg.text && (
        <div className={`alert-banner ${msg.type === 'error' ? 'alert-danger' : 'alert-success'}`}>
          {msg.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'landmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('landmarks')}
        >
          <MapPin size={16} />
          Landmarks ({landmarks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'bus_stops' ? 'active' : ''}`}
          onClick={() => setActiveTab('bus_stops')}
        >
          <Bus size={16} />
          Bus Stops ({busStops.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'routes' ? 'active' : ''}`}
          onClick={() => setActiveTab('routes')}
        >
          <Route size={16} />
          Bus Routes ({routes.length})
        </button>
      </div>

      {/* 1. Landmarks Tab */}
      {activeTab === 'landmarks' && (
        <div className="admin-tab-content">
          <div className="admin-form-card card">
            <h3 className="form-title">
              {landmarkForm.id ? 'Edit Landmark' : 'Add New Landmark'}
            </h3>
            <form onSubmit={handleSaveLandmark} className="crud-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Landmark Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marina Beach"
                    value={landmarkForm.name}
                    onChange={(e) => setLandmarkForm({ ...landmarkForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Tourist Attraction"
                    value={landmarkForm.category}
                    onChange={(e) => setLandmarkForm({ ...landmarkForm, category: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="13.0500"
                    value={landmarkForm.latitude}
                    onChange={(e) => setLandmarkForm({ ...landmarkForm, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="80.2824"
                    value={landmarkForm.longitude}
                    onChange={(e) => setLandmarkForm({ ...landmarkForm, longitude: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="2"
                  placeholder="Short description of the landmark..."
                  value={landmarkForm.description}
                  onChange={(e) => setLandmarkForm({ ...landmarkForm, description: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {landmarkForm.id ? <Check size={16} /> : <Plus size={16} />}
                  {landmarkForm.id ? 'Update Landmark' : 'Save Landmark'}
                </button>
                {landmarkForm.id && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setLandmarkForm({
                        id: null,
                        name: '',
                        description: '',
                        latitude: '',
                        longitude: '',
                        category: 'Tourist Attraction',
                      })
                    }
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-table-card card mt-4">
            <h3 className="table-title">Existing Landmarks</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {landmarks.map((lm) => (
                    <tr key={lm.id}>
                      <td><strong>{lm.name}</strong></td>
                      <td>{lm.category}</td>
                      <td>{Number(lm.latitude).toFixed(4)}</td>
                      <td>{Number(lm.longitude).toFixed(4)}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon text-primary"
                          onClick={() => setLandmarkForm(lm)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon text-danger"
                          onClick={() => handleDeleteLandmark(lm.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bus Stops Tab */}
      {activeTab === 'bus_stops' && (
        <div className="admin-tab-content">
          <div className="admin-form-card card">
            <h3 className="form-title">
              {busStopForm.id ? 'Edit Bus Stop' : 'Add New Bus Stop'}
            </h3>
            <form onSubmit={handleSaveBusStop} className="crud-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Bus Stop Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marina Beach Bus Stop"
                    value={busStopForm.name}
                    onChange={(e) => setBusStopForm({ ...busStopForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Associated Landmark</label>
                  <select
                    value={busStopForm.landmark_id}
                    onChange={(e) => setBusStopForm({ ...busStopForm, landmark_id: e.target.value })}
                  >
                    <option value="">-- Optional Associated Landmark --</option>
                    {landmarks.map((lm) => (
                      <option key={lm.id} value={lm.id}>
                        {lm.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="13.0515"
                    value={busStopForm.latitude}
                    onChange={(e) => setBusStopForm({ ...busStopForm, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="80.2840"
                    value={busStopForm.longitude}
                    onChange={(e) => setBusStopForm({ ...busStopForm, longitude: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {busStopForm.id ? <Check size={16} /> : <Plus size={16} />}
                  {busStopForm.id ? 'Update Bus Stop' : 'Save Bus Stop'}
                </button>
                {busStopForm.id && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setBusStopForm({ id: null, name: '', latitude: '', longitude: '', landmark_id: '' })
                    }
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-table-card card mt-4">
            <h3 className="table-title">Existing Bus Stops</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {busStops.map((stop) => (
                    <tr key={stop.id}>
                      <td><strong>{stop.name}</strong></td>
                      <td>{Number(stop.latitude).toFixed(4)}</td>
                      <td>{Number(stop.longitude).toFixed(4)}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon text-primary"
                          onClick={() => setBusStopForm(stop)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon text-danger"
                          onClick={() => handleDeleteBusStop(stop.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bus Routes Tab */}
      {activeTab === 'routes' && (
        <div className="admin-tab-content">
          <div className="admin-form-card card">
            <h3 className="form-title">
              {routeForm.id ? 'Edit Bus Route' : 'Add New Bus Route'}
            </h3>
            <form onSubmit={handleSaveRoute} className="crud-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Bus Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 27B"
                    value={routeForm.bus_number}
                    onChange={(e) => setRouteForm({ ...routeForm, bus_number: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Operating Bus Stop *</label>
                  <select
                    required
                    value={routeForm.bus_stop_id}
                    onChange={(e) => {
                      const selected = busStops.find((s) => s.id === e.target.value);
                      setRouteForm({
                        ...routeForm,
                        bus_stop_id: e.target.value,
                        bus_stop_name: selected?.name || '',
                      });
                    }}
                  >
                    <option value="">-- Select Bus Stop --</option>
                    {busStops.map((bs) => (
                      <option key={bs.id} value={bs.id}>
                        {bs.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Source / Origin *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marina Beach"
                    value={routeForm.source}
                    onChange={(e) => setRouteForm({ ...routeForm, source: e.target.value })}
                  />
                </div>
                <div className="form-group flex-1">
                  <label>Destination *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central"
                    value={routeForm.destination}
                    onChange={(e) => setRouteForm({ ...routeForm, destination: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Route Stops (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Marina Beach, Triplicane, Central"
                  value={
                    Array.isArray(routeForm.route_stops)
                      ? routeForm.route_stops.join(', ')
                      : routeForm.route_stops
                  }
                  onChange={(e) => setRouteForm({ ...routeForm, route_stops: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {routeForm.id ? <Check size={16} /> : <Plus size={16} />}
                  {routeForm.id ? 'Update Route' : 'Save Route'}
                </button>
                {routeForm.id && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() =>
                      setRouteForm({
                        id: null,
                        bus_number: '',
                        bus_stop_id: '',
                        source: '',
                        destination: '',
                        route_stops: '',
                      })
                    }
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-table-card card mt-4">
            <h3 className="table-title">Existing Routes</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Bus No</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Stops Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((rt) => (
                    <tr key={rt.id}>
                      <td><span className="badge bus-number-badge">{rt.bus_number}</span></td>
                      <td>{rt.source}</td>
                      <td><strong>{rt.destination}</strong></td>
                      <td>{(rt.route_stops || []).length} stops</td>
                      <td className="actions-cell">
                        <button
                          className="btn-icon text-primary"
                          onClick={() =>
                            setRouteForm({
                              ...rt,
                              route_stops: (rt.route_stops || []).join(', '),
                            })
                          }
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon text-danger"
                          onClick={() => handleDeleteRoute(rt.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
