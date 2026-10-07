import re
from flask import Blueprint, request, jsonify
from bson import ObjectId
from bson.errors import InvalidId
from database.db import get_db

landmark_bp = Blueprint("landmark_bp", __name__)

def serialize_doc(doc):
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc

@landmark_bp.route("/landmarks", methods=["GET"])
def get_landmarks():
    """Retrieve all landmarks"""
    try:
        db = get_db()
        landmarks = list(db.landmarks.find())
        return jsonify([serialize_doc(lm) for lm in landmarks]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch landmarks: {str(e)}"}), 500

@landmark_bp.route("/landmarks/search", methods=["GET"])
def search_landmarks():
    """Search landmarks by query string q"""
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([]), 200

    try:
        db = get_db()
        pattern = re.compile(re.escape(query), re.IGNORECASE)
        results = list(db.landmarks.find({
            "$or": [
                {"name": {"$regex": pattern}},
                {"category": {"$regex": pattern}},
                {"description": {"$regex": pattern}}
            ]
        }))
        return jsonify([serialize_doc(doc) for doc in results]), 200
    except Exception as e:
        return jsonify({"error": f"Search failed: {str(e)}"}), 500

@landmark_bp.route("/landmarks/<landmark_id>", methods=["GET"])
def get_landmark(landmark_id):
    """Retrieve a single landmark by ID"""
    try:
        db = get_db()
        oid = ObjectId(landmark_id)
        lm = db.landmarks.find_one({"_id": oid})
        if not lm:
            return jsonify({"error": "No landmark found. Please try another landmark."}), 404
        return jsonify(serialize_doc(lm)), 200
    except (InvalidId, Exception) as e:
        return jsonify({"error": "Invalid landmark ID format."}), 400

@landmark_bp.route("/landmarks", methods=["POST"])
def create_landmark():
    """Create a new landmark (Admin/CRUD)"""
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
        return jsonify({"error": "Latitude and Longitude must be valid numbers."}), 400

    new_doc = {
        "name": name,
        "description": data.get("description", "").strip(),
        "latitude": lat,
        "longitude": lon,
        "category": data.get("category", "Tourist Attraction").strip(),
        "city": data.get("city", "Chennai").strip(),
        "state": data.get("state", "Tamil Nadu").strip(),
    }

    try:
        db = get_db()
        res = db.landmarks.insert_one(new_doc)
        new_doc["id"] = str(res.inserted_id)
        if "_id" in new_doc:
            del new_doc["_id"]
        return jsonify(new_doc), 201
    except Exception as e:
        return jsonify({"error": f"Creation failed: {str(e)}"}), 500

@landmark_bp.route("/landmarks/<landmark_id>", methods=["PUT"])
def update_landmark(landmark_id):
    """Update landmark details (Admin/CRUD)"""
    data = request.get_json() or {}
    try:
        oid = ObjectId(landmark_id)
    except InvalidId:
        return jsonify({"error": "Invalid landmark ID format."}), 400

    update_fields = {}
    if "name" in data and data["name"].strip():
        update_fields["name"] = data["name"].strip()
    if "description" in data:
        update_fields["description"] = data["description"].strip()
    if "category" in data:
        update_fields["category"] = data["category"].strip()
    if "city" in data:
        update_fields["city"] = data["city"].strip()
    if "latitude" in data:
        try:
            update_fields["latitude"] = float(data["latitude"])
        except ValueError:
            return jsonify({"error": "Latitude must be a valid number."}), 400
    if "longitude" in data:
        try:
            update_fields["longitude"] = float(data["longitude"])
        except ValueError:
            return jsonify({"error": "Longitude must be a valid number."}), 400

    if not update_fields:
        return jsonify({"error": "No fields to update provided."}), 400

    try:
        db = get_db()
        res = db.landmarks.update_one({"_id": oid}, {"$set": update_fields})
        if res.matched_count == 0:
            return jsonify({"error": "Landmark not found."}), 404
        updated = db.landmarks.find_one({"_id": oid})
        return jsonify(serialize_doc(updated)), 200
    except Exception as e:
        return jsonify({"error": f"Update failed: {str(e)}"}), 500

@landmark_bp.route("/landmarks/<landmark_id>", methods=["DELETE"])
def delete_landmark(landmark_id):
    """Delete a landmark (Admin/CRUD)"""
    try:
        oid = ObjectId(landmark_id)
    except InvalidId:
        return jsonify({"error": "Invalid landmark ID format."}), 400

    try:
        db = get_db()
        res = db.landmarks.delete_one({"_id": oid})
        if res.deleted_count == 0:
            return jsonify({"error": "Landmark not found."}), 404
        return jsonify({"message": "Landmark deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": f"Deletion failed: {str(e)}"}), 500
