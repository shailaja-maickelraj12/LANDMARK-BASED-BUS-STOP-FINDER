# Landmark-Based Bus Stop Finder - Backend

Flask REST API and Mathematical Transit Engine for **Landmark-Based Bus Stop Finder**.

---

## 1. Overview & Architecture

The backend provides RESTful endpoints to query landmarks, calculate real-time great-circle distances using the Haversine formula, identify the nearest bus stops, filter by distance thresholds, and match suitable transit routes for tourist destinations.

```
backend/
├── routes/
│   ├── landmark_routes.py    # Landmark retrieval, search, and CRUD
│   ├── bus_stop_routes.py    # Haversine distance calculation and nearest stop
│   └── route_routes.py       # Route search, destination matching, and stats
├── services/
│   └── distance_service.py   # Pure mathematical model functions
├── database/
│   └── db.py                 # PyMongo connection with resilient fallback
├── app.py                    # Flask application factory and blueprints
├── config.py                 # Environment configurations
├── seed.py                   # Realistic demonstration database seed
├── test_app.py               # Automated unit tests
└── requirements.txt          # Python dependencies
```

---

## 2. Mathematical Model Implementation

The backend implements the formal mathematical model:

$$M = (L, B, R, D, U, F)$$

### Haversine Formula (`services/distance_service.py`)
Computes great-circle distance between coordinates $(Lat_1, Long_1)$ and $(Lat_2, Long_2)$:

$$d = 2R \sin^{-1} \left( \sqrt{ \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right) } \right)$$

where $R = 6371\text{ km}$, and $Distance_{meters} = d \times 1000$.

### Nearest Bus Stop:
$$B^* = \arg\min_{B_i \in B} d_i$$

### Distance Filtering:
$$B' = \{ B_i \mid D(L, B_i) \leq D_{max} \}$$
Supported filters: `500m`, `1000m`, `2000m`, `5000m`.

### Destination Matching:
$$Match(R_i, D_u) = \begin{cases} 1 & \text{if destination matches} \\ 0 & \text{otherwise} \end{cases}$$
$$R^* = \{ R_i \in R' \mid Destination(R_i) = D_u \}$$

---

## 3. Database Collections (MongoDB)

1. **`landmarks`**:
   - `name`: String
   - `description`: String
   - `latitude`: Float
   - `longitude`: Float
   - `category`: String
   - `city`: String
2. **`bus_stops`**:
   - `name`: String
   - `latitude`: Float
   - `longitude`: Float
   - `landmark_id`: ObjectId reference
   - `landmark_name`: String
3. **`routes`**:
   - `bus_number`: String (e.g. `27B`)
   - `bus_stop_id`: ObjectId reference
   - `bus_stop_name`: String
   - `source`: String
   - `destination`: String
   - `route_stops`: Array of stop names
   - `disclaimer`: String
4. **`destinations`**:
   - `name`: String (e.g. `Central`, `Tambaram`, `Guindy`, `Saidapet`)

---

## 4. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/landmarks` | Get all landmarks |
| `GET` | `/api/landmarks/search?q=Marina` | Search landmarks by keyword |
| `GET` | `/api/landmarks/<id>` | Get landmark by ID |
| `POST` | `/api/landmarks` | Create landmark (Admin CRUD) |
| `PUT` | `/api/landmarks/<id>` | Update landmark (Admin CRUD) |
| `DELETE` | `/api/landmarks/<id>` | Delete landmark (Admin CRUD) |
| `GET` | `/api/nearby-bus-stops/<id>?max_distance=1000` | Haversine distance-sorted bus stops |
| `GET` | `/api/nearest-bus-stop/<id>` | Get dynamically calculated nearest bus stop |
| `GET` | `/api/bus-stops` | List all bus stops |
| `POST` | `/api/bus-stops` | Create bus stop |
| `PUT` | `/api/bus-stops/<id>` | Update bus stop |
| `DELETE` | `/api/bus-stops/<id>` | Delete bus stop |
| `GET` | `/api/routes/bus-stop/<bus_stop_id>` | Get routes operating at a bus stop |
| `GET` | `/api/routes/search?destination=Central&bus_number=27B` | Search routes |
| `GET` | `/api/routes/<id>` | Get single route details |
| `POST` | `/api/routes` | Create route |
| `PUT` | `/api/routes/<id>` | Update route |
| `DELETE` | `/api/routes/<id>` | Delete route |
| `GET` | `/api/destinations` | List available transit destinations |
| `GET` | `/api/dashboard/stats` | System counts and model definition |

---

## 5. Running the Backend

### Virtual Environment Setup
```bash
python -m venv venv
```

Windows:
```powershell
.\venv\Scripts\activate
```

Linux/macOS:
```bash
source venv/bin/activate
```

### Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Seed Database
```bash
python backend/seed.py
```

### Run Tests
```bash
python backend/test_app.py
```

### Start Server
```bash
python backend/app.py
```
Default server port: `http://localhost:5000`
