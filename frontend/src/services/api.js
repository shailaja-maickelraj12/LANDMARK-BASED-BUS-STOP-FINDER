import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const api = {
  // Landmarks
  getLandmarks: () => apiClient.get('/landmarks').then(res => res.data),
  searchLandmarks: (q) => apiClient.get('/landmarks/search', { params: { q } }).then(res => res.data),
  getLandmarkById: (id) => apiClient.get(`/landmarks/${id}`).then(res => res.data),
  createLandmark: (data) => apiClient.post('/landmarks', data).then(res => res.data),
  updateLandmark: (id, data) => apiClient.put(`/landmarks/${id}`, data).then(res => res.data),
  deleteLandmark: (id) => apiClient.delete(`/landmarks/${id}`).then(res => res.data),

  // Bus Stops & Nearest / Nearby Calculation
  getNearbyBusStops: (landmarkId, maxDistance = null) => {
    const params = {};
    if (maxDistance) params.max_distance = maxDistance;
    return apiClient.get(`/nearby-bus-stops/${landmarkId}`, { params }).then(res => res.data);
  },
  getNearestBusStop: (landmarkId) => apiClient.get(`/nearest-bus-stop/${landmarkId}`).then(res => res.data),
  getAllBusStops: () => apiClient.get('/bus-stops').then(res => res.data),
  getBusStopById: (id) => apiClient.get(`/bus-stops/${id}`).then(res => res.data),
  createBusStop: (data) => apiClient.post('/bus-stops', data).then(res => res.data),
  updateBusStop: (id, data) => apiClient.put(`/bus-stops/${id}`, data).then(res => res.data),
  deleteBusStop: (id) => apiClient.delete(`/bus-stops/${id}`).then(res => res.data),

  // Routes
  getRoutesForBusStop: (busStopId, destination = null, busNumber = null) => {
    const params = {};
    if (destination) params.destination = destination;
    if (busNumber) params.bus_number = busNumber;
    return apiClient.get(`/routes/bus-stop/${busStopId}`, { params }).then(res => res.data);
  },
  searchRoutes: (destination = null, busNumber = null) => {
    const params = {};
    if (destination) params.destination = destination;
    if (busNumber) params.bus_number = busNumber;
    return apiClient.get('/routes/search', { params }).then(res => res.data);
  },
  getAllRoutes: () => apiClient.get('/routes').then(res => res.data),
  getRouteById: (id) => apiClient.get(`/routes/${id}`).then(res => res.data),
  createRoute: (data) => apiClient.post('/routes', data).then(res => res.data),
  updateRoute: (id, data) => apiClient.put(`/routes/${id}`, data).then(res => res.data),
  deleteRoute: (id) => apiClient.delete(`/routes/${id}`).then(res => res.data),

  // Destinations & Stats
  getDestinations: () => apiClient.get('/destinations').then(res => res.data),
  getDashboardStats: () => apiClient.get('/dashboard/stats').then(res => res.data),
};

export default api;
