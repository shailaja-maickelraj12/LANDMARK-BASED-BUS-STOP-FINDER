# Landmark-Based Bus Stop Finder - Frontend

React.js single-page application built with Vite, React Router, Axios, and Leaflet + OpenStreetMap.

---

## 1. Features

- **Home Page**: Hero banner, live landmark search bar, quick popular landmark chips, and workflow diagram.
- **Search Page**: Search input with autocomplete suggestions and empty-state recommendations.
- **Landmark Details Page**:
  - Exact coordinates display
  - Dynamically calculated Nearest Bus Stop card with Haversine distance in meters
  - Multi-criteria Filter Panel (Maximum distance: 500m, 1km, 2km, 5km; Destination dropdown; Bus number filter)
  - Recommended Suitable Bus matching algorithm
  - Vertical list of nearby bus stops sorted ascending by Haversine distance
  - Available bus route cards
  - Interactive Leaflet + OpenStreetMap view with custom landmark/stop markers and direct distance line
  - "Get Directions" integration using OpenStreetMap routing without paid APIs.
- **Route Details Page**: Sequential timeline visualization of route stops from origin to destination.
- **System Dashboard**: Asset metric counters and detailed mathematical formulation.
- **Admin Management Page**: Full CRUD operations for Landmarks, Bus Stops, and Routes.

---

## 2. Component Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Top navigation header
│   │   ├── SearchBar.jsx       # Autocomplete search with debounce
│   │   ├── LandmarkCard.jsx    # Landmark display card
│   │   ├── BusStopCard.jsx     # Bus stop card with distance badge & directions
│   │   ├── BusRouteCard.jsx    # Route cards with destination matching highlight
│   │   ├── FilterPanel.jsx     # Distance, destination, and bus number filters
│   │   └── MapView.jsx         # Leaflet + OpenStreetMap distance visualizer
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with popular landmarks
│   │   ├── Search.jsx          # Dedicated search interface
│   │   ├── LandmarkDetails.jsx # Core transit exploration page
│   │   ├── RouteDetails.jsx    # Step-by-step route timeline
│   │   ├── Dashboard.jsx       # Analytics and mathematical model
│   │   └── Admin.jsx           # Data management CRUD interface
│   ├── services/
│   │   └── api.js              # Axios HTTP client
│   ├── App.jsx                 # Routing configuration
│   ├── main.jsx                # React root
│   └── index.css               # Modern responsive styling
├── package.json
└── vite.config.js
```

---

## 3. Running the Frontend

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open: `http://localhost:5173`

### Production Build
```bash
npm run build
```
