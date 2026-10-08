import re
from flask import Blueprint, request, jsonify
from bson import ObjectId
from bson.errors import InvalidId
from database.db import get_db
from services.distance_service import find_routes_by_destination

route_bp = Blueprint("route_bp", __name__)

DEMO_DISCLAIMER = "Notice: Route data is demonstration data for academic and project evaluation purposes; not an official transport schedule."

def serialize_doc(doc):
    if not doc:
        return None
    d = dict(doc)
    d["id"] = str(d["_id"])
    del d["_id"]
    return d

@route_bp.route("/routes/bus-stop/<bus_stop_id>", methods=["GET"])
def get_routes_for_bus_stop(bus_stop_id):
    """
    Get all routes operating at a specific bus stop.
    Allows optional filter by destination or bus_number via query params.
    """
    db = get_db()
    # Find routes matching bus_stop_id
    routes = list(db.routes.find({"bus_stop_id": str(bus_stop_id)}))
    serialized = [serialize_doc(r) for r in routes]

    # Optional destination filtering
    destination = request.args.get("destination")
    if destination:
        serialized = find_routes_by_destination(serialized, destination)

    # Optional bus number filtering
    bus_number = request.args.get("bus_number")
    if bus_number:
        target_num = bus_number.strip().lower()
        serialized = [r for r in serialized if target_num in r.get("bus_number", "").strip().lower()]

    return jsonify({
        "bus_stop_id": bus_stop_id,
        "routes": serialized,
        "count": len(serialized),
        "disclaimer": DEMO_DISCLAIMER
    }), 200

@route_bp.route("/routes/search", methods=["GET"])
def search_routes():
    """
    Search routes across the entire system.
    Supports ?destination=... and ?bus_number=...
    """
    destination = request.args.get("destination", "").strip()
    bus_number = request.args.get("bus_number", "").strip()

    db = get_db()
    query = {}
    if destination:
        pattern = re.compile(re.escape(destination), re.IGNORECASE)
        query["destination"] = {"$regex": pattern}
    if bus_number:
        pattern = re.compile(re.escape(bus_number), re.IGNORECASE)
        query["bus_number"] = {"$regex": pattern}

    try:
        results = list(db.routes.find(query))
        serialized = [serialize_doc(r) for r in results]
        return jsonify({
            "routes": serialized,
            "count": len(serialized),
            "disclaimer": DEMO_DISCLAIMER
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to search routes: {str(e)}"}), 500

@route_bp.route("/routes", methods=["GET"])
def get_all_routes():
    """Get all routes in the system"""
    try:
        db = get_db()
        routes = list(db.routes.find())
        return jsonify({
            "routes": [serialize_doc(r) for r in routes],
            "count": len(routes),
            "disclaimer": DEMO_DISCLAIMER
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve routes: {str(e)}"}), 500

@route_bp.route("/routes/<route_id>", methods=["GET"])
def get_route(route_id):
    """Get single route details by ID"""
    try:
        oid = ObjectId(route_id)
        db = get_db()
        route = db.routes.find_one({"_id": oid})
        if not route:
            return jsonify({"error": "Route not found."}), 404
        return jsonify(serialize_doc(route)), 200
    except InvalidId:
        return jsonify({"error": "Invalid route ID format."}), 400

@route_bp.route("/routes", methods=["POST"])
def create_route():
    """Create a new bus route (Admin/CRUD)"""
    data = request.get_json() or {}
    bus_number = data.get("bus_number", "").strip()
    source = data.get("source", "").strip()
    destination = data.get("destination", "").strip()
    bus_stop_id = data.get("bus_stop_id", "").strip()

    if not bus_number or not destination or not bus_stop_id:
        return jsonify({"error": "bus_number, destination, and bus_stop_id are required."}), 400

    route_stops = data.get("route_stops", [])
    if isinstance(route_stops, str):
        route_stops = [s.strip() for s in route_stops.split(",") if s.strip()]

    doc = {
        "bus_number": bus_number,
        "bus_stop_id": bus_stop_id,
        "bus_stop_name": data.get("bus_stop_name", "").strip(),
        "source": source or "Origin",
        "destination": destination,
        "route_stops": route_stops,
        "disclaimer": DEMO_DISCLAIMER
    }

    try:
        db = get_db()
        res = db.routes.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        if "_id" in doc:
            del doc["_id"]

        # Also add destination to destinations collection if not existing
        if destination:
            db.destinations.update_one(
                {"name": destination},
                {"$setOnInsert": {"name": destination}},
                upsert=True
            )

        return jsonify(doc), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create route: {str(e)}"}), 500

@route_bp.route("/routes/<route_id>", methods=["PUT"])
def update_route(route_id):
    """Update route details (Admin/CRUD)"""
    try:
        oid = ObjectId(route_id)
    except InvalidId:
        return jsonify({"error": "Invalid route ID."}), 400

    data = request.get_json() or {}
    update_fields = {}
    if "bus_number" in data and data["bus_number"].strip():
        update_fields["bus_number"] = data["bus_number"].strip()
    if "source" in data:
        update_fields["source"] = data["source"].strip()
    if "destination" in data and data["destination"].strip():
        update_fields["destination"] = data["destination"].strip()
    if "bus_stop_id" in data:
        update_fields["bus_stop_id"] = str(data["bus_stop_id"])
    if "bus_stop_name" in data:
        update_fields["bus_stop_name"] = str(data["bus_stop_name"])
    if "route_stops" in data:
        stops = data["route_stops"]
        if isinstance(stops, str):
            stops = [s.strip() for s in stops.split(",") if s.strip()]
        update_fields["route_stops"] = stops

    try:
        db = get_db()
        res = db.routes.update_one({"_id": oid}, {"$set": update_fields})
        if res.matched_count == 0:
            return jsonify({"error": "Route not found."}), 404
        updated = db.routes.find_one({"_id": oid})
        return jsonify(serialize_doc(updated)), 200
    except Exception as e:
        return jsonify({"error": f"Failed to update route: {str(e)}"}), 500

@route_bp.route("/routes/<route_id>", methods=["DELETE"])
def delete_route(route_id):
    """Delete a bus route (Admin/CRUD)"""
    try:
        oid = ObjectId(route_id)
    except InvalidId:
        return jsonify({"error": "Invalid route ID."}), 400

    try:
        db = get_db()
        res = db.routes.delete_one({"_id": oid})
        if res.deleted_count == 0:
            return jsonify({"error": "Route not found."}), 404
        return jsonify({"message": "Route deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to delete route: {str(e)}"}), 500

@route_bp.route("/destinations", methods=["GET"])
def get_destinations():
    """Retrieve distinct destinations for filter dropdowns"""
    try:
        db = get_db()
        dest_docs = list(db.destinations.find())
        names = sorted(list(set([d.get("name") for d in dest_docs if d.get("name")])))
        return jsonify(names), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch destinations: {str(e)}"}), 500

@route_bp.route("/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    """Dashboard statistics: count of landmarks, bus stops, routes, destinations and transit network summary"""
    try:
        from services.distance_service import find_nearest_bus_stop
        db = get_db()
        landmarks = list(db.landmarks.find())
        bus_stops = list(db.bus_stops.find())
        routes = list(db.routes.find())
        destinations = sorted(list(set([d.get("name") for d in db.destinations.find() if d.get("name")])))

        serialized_stops = [serialize_doc(bs) for bs in bus_stops]

        # Compute nearest bus stop for each landmark dynamically
        landmarks_summary = []
        nearest_distances = []
        for lm in landmarks:
            lm_serialized = serialize_doc(lm)
            nearest = find_nearest_bus_stop(lm_serialized, serialized_stops)
            if nearest:
                dist = nearest.get("distance_meters", 0)
                nearest_distances.append(dist)
                landmarks_summary.append({
                    "id": lm_serialized["id"],
                    "name": lm_serialized.get("name"),
                    "category": lm_serialized.get("category"),
                    "nearest_bus_stop": nearest.get("name"),
                    "distance_meters": dist,
                })

        avg_dist = round(sum(nearest_distances) / len(nearest_distances), 1) if nearest_distances else 0

        # Destination connectivity count
        dest_counts = {}
        for r in routes:
            d = r.get("destination", "").strip()
            if d:
                dest_counts[d] = dest_counts.get(d, 0) + 1

        top_destinations = [
            {"destination": k, "route_count": v}
            for k, v in sorted(dest_counts.items(), key=lambda x: x[1], reverse=True)[:8]
        ]

        return jsonify({
            "total_landmarks": len(landmarks),
            "total_bus_stops": len(bus_stops),
            "total_routes": len(routes),
            "total_destinations": len(destinations),
            "avg_nearest_distance": avg_dist,
            "landmarks_summary": landmarks_summary,
            "top_destinations": top_destinations,
            "mathematical_model": "M = (L, B, R, D, U, F)",
            "distance_formula": "Haversine d = 2R * asin(sqrt(sin^2(d_phi/2) + cos(phi1)*cos(phi2)*sin^2(d_lambda/2)))"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch stats: {str(e)}"}), 500
