# Landmark-Based Bus Stop Finder

A full-stack web application designed for tourists and new visitors to identify nearby bus stops associated with popular landmarks, compute dynamic walking/transit distances using the **Haversine formula**, and match direct bus routes to their intended destinations.

---

## 1. Project Description

The **Landmark-Based Bus Stop Finder** bridges the gap between prominent cultural, historic, and recreational landmarks and public urban bus transit networks. 

A tourist visiting Chennai may know iconic landmarks such as:
* Marina Beach
* Kapaleeshwarar Temple
* Fort St. George
* Government Museum
* Valluvar Kottam

However, they often do not know where the closest bus stop is, how far they need to walk, or which bus will take them to their onward destination (e.g., Central, Tambaram, Guindy, Saidapet).

This application solves that exact problem by providing a clean, responsive, and mathematically grounded full-stack system that computes real-time distances in meters, displays bus stops on an interactive Leaflet + OpenStreetMap canvas, and recommends suitable buses dynamically.

---

## 2. Problem Statement

Public bus transit stops are frequently designated with local street names, bus bays, or historical neighborhood monikers that tourists and out-of-town visitors do not recognize. While tourists navigate the city by well-known points of interest (monuments, beaches, temples), bus networks operate on transit route stops. Consequently, visitors struggle to:
1. Identify which boarding stop is closest to their current tourist site.
2. Estimate the exact walking distance to that stop.
3. Determine which bus numbers depart from that stop toward their destination.

---

## 3. Objectives

* **Dynamic Distance Computation:** Calculate precise distances in meters between landmarks and all candidate bus stops using the spherical Haversine formula on the backend.
* **Nearest Stop Identification:** Dynamically determine $B^* = \arg\min_{B_i \in B} d_i$.
* **Interactive Mapping:** Render landmarks, nearby bus stops, and direct distance polyline vectors using OpenStreetMap and Leaflet without paid API keys.
* **Route Matching & Filtering:** Filter bus stops by distance (500m, 1km, 2km, 5km) and match buses whose routes reach the user's selected destination.
* **Full-Stack Data Management:** Support full CRUD operations for landmarks, bus stops, and routes to demonstrate real database management.

---

## 4. Features

* 🔍 **Live Landmark Search with Autocomplete:** Instant suggestions as the user types, with support for keyboard navigation.
* ⭐ **Popular Landmark Quick Filters:** One-click shortcuts for top iconic attractions.
* 📏 **Haversine Formula Distance Engine:** Backend service calculates distances dynamically in meters; no hard-coded values.
* 📍 **Nearest Bus Stop Highlight:** Automatically identifies and elevates the closest boarding point.
* 🎛️ **Multi-Parameter Filter Panel:**
  * Distance Radii: 500 m, 1 km, 2 km, 5 km, or All.
  * Destination Filter: Dropdown populated dynamically from destination records.
  * Bus Number Filter: Search by bus line (e.g., `27B`, `21G`, `29C`).
* ✨ **Smart Destination Bus Matching:** Directly recommends suitable buses that head toward the selected destination from nearby stops.
* 🗺️ **Leaflet + OpenStreetMap Visualizer:** Custom-styled markers for landmarks and bus stops, with connecting distance polylines and interactive popups.
* 🧭 **Free Navigation Directions:** One-click integration with OpenStreetMap routing for walking/driving directions without paid APIs.
* 🚏 **Route Timeline Details:** Sequential visual representation of route stops from origin to destination.
* 📊 **Dashboard:** Real-time counters for landmarks, bus stops, routes, and destinations, along with a full mathematical breakdown.
* ⚙️ **Admin / Data Management Panel:** Simple CRUD interface to add, edit, and delete landmarks, bus stops, and routes.
* 🛡️ **Graceful Resiliency:** Connects directly to local MongoDB or MongoDB Atlas; falls back gracefully to in-memory `mongomock` if the local MongoDB daemon is not running.

---

## 5. Technology Stack

### Frontend
* **React.js** (v18+ with Vite)
* **JavaScript (ES6+)**
* **React Router DOM** (Client-side routing)
* **Axios** (REST API communication)
* **Leaflet** & **React-Leaflet** (Map visualization)
* **OpenStreetMap** (Map tile provider)
* **Lucide React** (Clean icons)
* **Modern CSS** (Responsive grid & flexbox design)

### Backend
* **Python** (3.10+)
* **Flask** (REST API framework)
* **Flask-CORS** (Cross-Origin Resource Sharing)
* **PyMongo** (MongoDB ODM)
* **mongomock** (In-memory fallback for out-of-the-box evaluation)
* **python-dotenv** (Environment variable management)

### Database
* **MongoDB** (NoSQL document store)

### Mapping Provider
* **OpenStreetMap + Leaflet** (100% free, open-source, no paid Google Maps API required)

---

## 6. Mathematical Model

The system is formally modeled as:

$$M = (L, B, R, D, U, F)$$

Where:
* $L = \{L_1, L_2, \dots, L_n\}$: Set of Landmarks, each defined as $L_i = (Lat_i, Long_i)$.
* $B = \{B_1, B_2, \dots, B_m\}$: Set of Bus Stops, each defined as $B_j = (Lat_j, Long_j)$.
* $R = \{R_1, R_2, \dots, R_k\}$: Set of Bus Routes, each defined as $R_i = (N_i, S_i, D_i, P_i)$, where $N_i$ is the bus number, $S_i$ is the origin, $D_i$ is the destination, and $P_i$ is the sequence of route stops.
* $D = \{D_1, D_2, \dots\}$: Set of user destinations.
* $U = (L, D_u, D_{max}, B_n)$: User search query containing landmark $L$, optional destination $D_u$, maximum distance threshold $D_{max}$, and optional bus number $B_n$.
* $F$: Filtering and selection functions.

### Step 1: Haversine Distance Calculation
The great-circle distance between Landmark $L$ and each Bus Stop $B_i$ is computed via:

$$d_i = 2R \sin^{-1} \left( \sqrt{ \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right) } \right)$$

where:
* $R = 6371\text{ km}$ (Earth's mean radius)
* $\phi_1, \phi_2$ = latitudes in radians
* $\Delta\phi = \phi_2 - \phi_1$
* $\Delta\lambda = \lambda_2 - \lambda_1$
* $Distance_{meters} = d_i \times 1000$

### Step 2: Distance Filtering
$$B' = \{ B_i \in B \mid d_i \leq D_{max} \}$$

### Step 3: Nearest Bus Stop Selection
$$B^* = \arg\min_{B_i \in B'} d_i$$

### Step 4: Available Routes Identification
$$R' = \{ R_i \in R \mid R_i \text{ operates at } B^* \text{ or } B_j \in B' \}$$

### Step 5: Destination Matching
$$Match(R_i, D_u) = \begin{cases} 1 & \text{if } Destination(R_i) = D_u \\ 0 & \text{otherwise} \end{cases}$$
$$R^* = \{ R_i \in R' \mid Destination(R_i) = D_u \}$$

### Final System Output:
$$Output = (B^*, d^*, R^*, Map)$$

---

## 7. System Workflow

```text
Tourist
   ↓
Search Landmark
   ↓
Select Landmark
   ↓
Get Landmark Coordinates (Lat, Long)
   ↓
Find Nearby Bus Stops
   ↓
Calculate Distance (Haversine Formula)
   ↓
Find Nearest Bus Stop (B* = argmin d_i)
   ↓
Show Available Buses
   ↓
Select Destination (D_u)
   ↓
Match Suitable Bus (Destination(R_i) == D_u)
   ↓
Show Route Details (Stop sequence)
   ↓
View on Map (Leaflet + OpenStreetMap)
   ↓
Get Directions (OSRM / Free Routing)
```

---

## 8. Database Structure

The database consists of 4 MongoDB collections:

```
bus_stop_finder
├── landmarks
├── bus_stops
├── routes
└── destinations
```

### Sample Document Schemas:

#### `landmarks`
```json
{
  "_id": "6ac67860afb30b998a4addf2",
  "name": "Marina Beach",
  "description": "World's second longest natural urban beach along the Bay of Bengal.",
  "latitude": 13.0500,
  "longitude": 80.2824,
  "category": "Tourist Attraction",
  "city": "Chennai",
  "state": "Tamil Nadu"
}
```

#### `bus_stops`
```json
{
  "_id": "6ac67860afb30b998a4addf7",
  "name": "Marina Beach Bus Stop",
  "latitude": 13.0515,
  "longitude": 80.2840,
  "landmark_id": "6ac67860afb30b998a4addf2",
  "landmark_name": "Marina Beach"
}
```

#### `routes`
```json
{
  "_id": "6ac67860afb30b998a4ade0b",
  "bus_number": "27B",
  "bus_stop_id": "6ac67860afb30b998a4addf7",
  "bus_stop_name": "Marina Beach Bus Stop",
  "source": "Marina Beach",
  "destination": "Central",
  "route_stops": [
    "Marina Beach",
    "Vivekanandar Illam",
    "Triplicane",
    "Simpsons",
    "Central"
  ],
  "disclaimer": "Notice: Route data is demonstration data for academic and project evaluation purposes; not an official transport schedule."
}
```

#### `destinations`
```json
{
  "_id": "6ac67860afb30b998a4addd0",
  "name": "Central"
}
```

---

## 9. API List

| HTTP Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/landmarks` | — | Returns all landmarks |
| `GET` | `/api/landmarks/search` | `?q=Marina` | Autocomplete search for landmarks |
| `GET` | `/api/landmarks/<id>` | — | Returns details for a single landmark |
| `POST` | `/api/landmarks` | Body: `{name, latitude, longitude, ...}` | Add new landmark (Admin CRUD) |
| `PUT` | `/api/landmarks/<id>` | Body: `{...}` | Update landmark (Admin CRUD) |
| `DELETE` | `/api/landmarks/<id>` | — | Delete landmark (Admin CRUD) |
| `GET` | `/api/nearby-bus-stops/<landmark_id>` | `?max_distance=1000` | Calculates Haversine distances to all bus stops, sorts ascending |
| `GET` | `/api/nearest-bus-stop/<landmark_id>` | — | Returns the single nearest bus stop and distance in meters |
| `GET` | `/api/bus-stops` | — | Returns all bus stops in database |
| `POST` | `/api/bus-stops` | Body: `{name, latitude, longitude, ...}` | Add new bus stop |
| `PUT` | `/api/bus-stops/<id>` | Body: `{...}` | Update bus stop |
| `DELETE` | `/api/bus-stops/<id>` | — | Delete bus stop |
| `GET` | `/api/routes/bus-stop/<bus_stop_id>` | `?destination=Central&bus_number=27B` | Returns routes for a bus stop |
| `GET` | `/api/routes/search` | `?destination=Central&bus_number=27B` | Search across all routes |
| `GET` | `/api/routes/<id>` | — | Returns single route details |
| `POST` | `/api/routes` | Body: `{bus_number, source, destination, ...}` | Add new route |
| `PUT` | `/api/routes/<id>` | Body: `{...}` | Update route |
| `DELETE` | `/api/routes/<id>` | — | Delete route |
| `GET` | `/api/destinations` | — | Returns list of distinct destinations |
| `GET` | `/api/dashboard/stats` | — | Returns counts and mathematical model details |

---

## 10. Installation & Run Instructions

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & **npm**
* **MongoDB** (Optional: defaults to local MongoDB; auto-falls back to `mongomock` if local daemon is inactive)

---

### Step 1: Clone or Navigate to Project Directory
```bash
cd e:\SMT_PROJECT
```

---

### Step 2: Backend Setup

1. **Create and Activate Python Virtual Environment:**
   ```bash
   python -m venv venv
   ```
   *Windows:*
   ```powershell
   .\venv\Scripts\activate
   ```
   *macOS/Linux:*
   ```bash
   source venv/bin/activate
   ```

2. **Install Backend Dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **(Optional) Seed Database:**
   ```bash
   python backend/seed.py
   ```
   *(Note: The server also auto-seeds automatically on first launch if the database is empty).*

4. **Run Backend Test Suite:**
   ```bash
   python backend/test_app.py
   ```

5. **Start Flask API Server:**
   ```bash
   python backend/app.py
   ```
   Backend will run on: `http://localhost:5000`

---

### Step 3: Frontend Setup

1. **Navigate to Frontend Directory:**
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Start Vite Development Server:**
   ```bash
   npm run dev
   ```
   Frontend will run on: `http://localhost:5173`

---

## 11. MongoDB Setup & Configuration

The application is pre-configured in `backend/config.py`:
* `MONGO_URI`: `mongodb://localhost:27017/bus_stop_finder`
* `DB_NAME`: `bus_stop_finder`
* `PORT`: `5000`

You can customize this via environment variables or a `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/bus_stop_finder
DB_NAME=bus_stop_finder
PORT=5000
DEBUG=True
```

*Note on Zero-Configuration Evaluation:*
If MongoDB is installed and running on port 27017, the application automatically persists to real MongoDB. If MongoDB is not yet running, the system transparently utilizes an in-memory `mongomock` store, allowing immediate evaluation without setup friction.

---

## 12. Complete User Journey Example

1. **User opens Home Page:**
   * Sees the hero search bar and popular landmarks (Marina Beach, Kapaleeshwarar Temple, Fort St. George, Government Museum, Valluvar Kottam).
2. **User selects "Marina Beach":**
   * Landmark details load: $Lat = 13.0500, Long = 80.2824$.
   * Haversine engine calculates distance to all bus stops in Chennai.
   * Nearest Bus Stop card displays:
     * 🚌 **Marina Beach Bus Stop**
     * Distance: **241 m** (calculated dynamically).
3. **User views the Leaflet Map:**
   * Landmark marker (📍 Red pin) and Bus Stop marker (🚌 Green icon) appear.
   * A dashed polyline connects them with an interactive popup showing `📏 241 m`.
4. **User selects Destination "Central":**
   * The destination matching function $Match(R_i, D_u)$ executes.
   * "Recommended Bus" card appears:
     * 🚌 **27B**
     * Boarding Stop: **Marina Beach Bus Stop**
     * Distance to Bus Stop: **241 m**
5. **User clicks "View Route":**
   * Route details page displays the full stop timeline:
     * Marina Beach $\rightarrow$ Vivekanandar Illam $\rightarrow$ Triplicane $\rightarrow$ Simpsons $\rightarrow$ Central.
6. **User clicks "Get Directions":**
   * Opens OpenStreetMap routing showing turn-by-turn walking directions from Marina Beach to Marina Beach Bus Stop.

---

## 13. Screenshots & Visual Interface

| Interface Section | Description |
|---|---|
| **Home Page** | Modern hero search, quick landmark chips, and 4-step transit workflow guide. |
| **Landmark Details** | Nearest bus stop highlight, dynamic distance in meters, filter panel, and leaflet map. |
| **Recommended Bus** | Elevated card highlighting suitable bus when user filters by destination. |
| **Interactive Map** | OpenStreetMap canvas with landmark marker, bus stop marker, and Haversine distance polyline. |
| **Route Details** | Vertical sequence timeline detailing intermediate stops. |
| **Admin Panel** | CRUD tables and forms for managing landmarks, bus stops, and routes. |
| **Dashboard** | Stat metrics and full formal mathematical model documentation. |

---

## 14. Testing Checklist

The project has been tested and verified across all test criteria:

- [x] React frontend starts on `http://localhost:5173`
- [x] Flask backend starts on `http://localhost:5000`
- [x] MongoDB connection & mongomock fallback work seamlessly
- [x] Landmark search works with live autocomplete
- [x] Landmark data loads from database
- [x] Bus stop data loads from database
- [x] Haversine distance calculation works dynamically
- [x] Distance is displayed in meters
- [x] Nearest bus stop is calculated dynamically
- [x] Distance filter works (500m, 1km, 2km, 5km)
- [x] Destination filter works
- [x] Bus number search works
- [x] Suitable bus is displayed with matching badge
- [x] Route details work with stop sequence
- [x] Map displays landmark marker
- [x] Map displays bus stop marker
- [x] Distance polyline line is displayed on map
- [x] Get Directions opens free map routing
- [x] Error messages work (no landmark found, empty filter results)
- [x] Loading states work with smooth spinners
- [x] CRUD operations work in the Admin management page

---

## 15. Future Enhancements

* Integration with real-time GPS vehicle tracking feeds (GTFS-RT).
* Multi-modal transfers (bus to Chennai Metro / suburban rail interchanges).
* Multilingual support (Tamil, Hindi, English).
* Fare calculator based on stage-wise bus stop increments.
* Offline PWA (Progressive Web App) caching for tourists with limited roaming connectivity.

---

## 16. Academic & Demonstration Notice

*Route schedules, bus numbers, and timing sequences in this repository are demonstration data created for academic and project evaluation purposes, and do not represent real-time official transit schedules.*
