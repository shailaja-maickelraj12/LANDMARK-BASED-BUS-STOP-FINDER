from flask import Blueprint, request, jsonify
from bson import ObjectId
from bson.errors import InvalidId
from database.db import get_db
from services.distance_service import (
    calculate_bus_stops_distances,
    find_nearest_bus_stop,
    filter_by_distance,
)

bus_stop_bp = Blueprint("bus_stop_bp", __name__)

def serialize_doc(doc):
    if not doc:
        return None
    d = dict(doc)
    d["id"] = str(d["_id"])
    del d["_id"]
    return d

@bus_stop_bp.route("/nearby-bus-stops/<landmark_id>", methods=["GET"])
def get_nearby_bus_stops(landmark_id):
    """
    Get nearby bus stops for a given landmark.
    Calculates Haversine distance in meters dynamically.
    Optional query parameter: max_distance (in meters).
    """
    try:
        oid = ObjectId(landmark_id)
    except InvalidId:
        return jsonify({"error": "Invalid landmark ID format."}), 400

    db = get_db()
    landmark = db.landmarks.find_one({"_id": oid})
    if not landmark:
        return jsonify({"error": "Landmark not found."}), 404

    bus_stops = list(db.bus_stops.find())
    serialized_stops = [serialize_doc(bs) for bs in bus_stops]

    # Calculate Haversine distance for each bus stop and sort ascending
    stops_with_distance = calculate_bus_stops_distances(landmark, serialized_stops)

    # Apply distance filter if specified
    max_distance_param = request.args.get("max_distance")
    if max_distance_param is not None and max_distance_param.strip() != "":
        try:
            max_dist = float(max_distance_param)
            stops_with_distance = filter_by_distance(stops_with_distance, max_dist)
        except ValueError:
            return jsonify({"error": "Invalid max_distance parameter. Must be a numeric value."}), 400

    return jsonify({
        "landmark": {
            "id": str(landmark["_id"]),
            "name": landmark.get("name"),
            "latitude": landmark.get("latitude"),
            "longitude": landmark.get("longitude"),
            "category": landmark.get("category"),
            "description": landmark.get("description")
        },
        "bus_stops": stops_with_distance,
        "count": len(stops_with_distance)
    }), 200

@bus_stop_bp.route("/nearest-bus-stop/<landmark_id>", methods=["GET"])
def get_nearest_bus_stop(landmark_id):
    """
    Find the single nearest bus stop to a given landmark:
    B* = argmin_{Bi in B} d_i
    Returns landmark name, nearest bus stop name, and distance in meters.
    """
    try:
        oid = ObjectId(landmark_id)
    except InvalidId:
        return jsonify({"error": "Invalid landmark ID format."}), 400

    db = get_db()
    landmark = db.landmarks.find_one({"_id": oid})
    if not landmark:
        return jsonify({"error": "Landmark not found."}), 404

    bus_stops = list(db.bus_stops.find())
    serialized_stops = [serialize_doc(bs) for bs in bus_stops]

    nearest = find_nearest_bus_stop(landmark, serialized_stops)
    if not nearest:
        return jsonify({"error": "No bus stops available in system."}), 404

    return jsonify({
        "landmark": landmark.get("name"),
        "landmark_id": str(landmark["_id"]),
        "nearest_bus_stop": nearest.get("name"),
        "bus_stop_id": nearest.get("id"),
        "latitude": nearest.get("latitude"),
        "longitude": nearest.get("longitude"),
        "distance_meters": nearest.get("distance_meters")
    }), 200

@bus_stop_bp.route("/bus-stops", methods=["GET"])
def get_all_bus_stops():
    """Get all bus stops"""
    try:
        db = get_db()
        stops = list(db.bus_stops.find())
        return jsonify([serialize_doc(s) for s in stops]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve bus stops: {str(e)}"}), 500

@bus_stop_bp.route("/bus-stops/<bus_stop_id>", methods=["GET"])
def get_bus_stop(bus_stop_id):
    """Get single bus stop by ID"""
    try:
        oid = ObjectId(bus_stop_id)
        db = get_db()
        stop = db.bus_stops.find_one({"_id": oid})
        if not stop:
            return jsonify({"error": "Bus stop not found."}), 404
        return jsonify(serialize_doc(stop)), 200
    except InvalidId:
        return jsonify({"error": "Invalid bus stop ID format."}), 400

@bus_stop_bp.route("/bus-stops", methods=["POST"])
def create_bus_stop():
    """Create a new bus stop (Admin/CRUD)"""
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not name or latitude is None or longitude is None:
        return jsonify({"error": "Name, latitude, and longitude are required."}), 400

    try:
        lat = float(latitude)
        lon = float(longitude)
    except ValueError:
        return jsonify({"error": "Latitude and Longitude must be numbers."}), 400

    doc = {
        "name": name,
        "latitude": lat,
        "longitude": lon,
        "landmark_id": data.get("landmark_id", ""),
        "landmark_name": data.get("landmark_name", "")
    }

    try:
        db = get_db()
        res = db.bus_stops.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        if "_id" in doc:
            del doc["_id"]
        return jsonify(doc), 201
    except Exception as e:
        return jsonify({"error": f"Failed to create bus stop: {str(e)}"}), 500

@bus_stop_bp.route("/bus-stops/<bus_stop_id>", methods=["PUT"])
def update_bus_stop(bus_stop_id):
    """Update bus stop (Admin/CRUD)"""
    try:
        oid = ObjectId(bus_stop_id)
    except InvalidId:
        return jsonify({"error": "Invalid bus stop ID."}), 400

    data = request.get_json() or {}
    update_fields = {}
    if "name" in data and data["name"].strip():
        update_fields["name"] = data["name"].strip()
    if "latitude" in data:
        try:
            update_fields["latitude"] = float(data["latitude"])
        except ValueError:
            return jsonify({"error": "Latitude must be numeric."}), 400
    if "longitude" in data:
        try:
            update_fields["longitude"] = float(data["longitude"])
        except ValueError:
            return jsonify({"error": "Longitude must be numeric."}), 400
    if "landmark_id" in data:
        update_fields["landmark_id"] = str(data["landmark_id"])
    if "landmark_name" in data:
        update_fields["landmark_name"] = str(data["landmark_name"])

    try:
        db = get_db()
        res = db.bus_stops.update_one({"_id": oid}, {"$set": update_fields})
        if res.matched_count == 0:
            return jsonify({"error": "Bus stop not found."}), 404
        updated = db.bus_stops.find_one({"_id": oid})
        return jsonify(serialize_doc(updated)), 200
    except Exception as e:
        return jsonify({"error": f"Update failed: {str(e)}"}), 500

@bus_stop_bp.route("/bus-stops/<bus_stop_id>", methods=["DELETE"])
def delete_bus_stop(bus_stop_id):
    """Delete bus stop (Admin/CRUD)"""
    try:
        oid = ObjectId(bus_stop_id)
    except InvalidId:
        return jsonify({"error": "Invalid bus stop ID."}), 400

    try:
        db = get_db()
        res = db.bus_stops.delete_one({"_id": oid})
        if res.deleted_count == 0:
            return jsonify({"error": "Bus stop not found."}), 404
        return jsonify({"message": "Bus stop deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Delete failed: {str(e)}"}), 500
