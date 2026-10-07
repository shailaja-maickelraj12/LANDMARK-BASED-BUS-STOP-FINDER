import os
import sys

# Ensure backend root directory is always on Python module search path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database.db import get_db, is_mock_db
from routes.landmark_routes import landmark_bp
from routes.bus_stop_routes import bus_stop_bp
from routes.route_routes import route_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all frontend interactions
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(landmark_bp, url_prefix="/api")
    app.register_blueprint(bus_stop_bp, url_prefix="/api")
    app.register_blueprint(route_bp, url_prefix="/api")

    @app.route("/")
    def index():
        return jsonify({
            "project": "Landmark-Based Bus Stop Finder",
            "version": "1.0.0",
            "status": "online",
            "documentation": "/api/dashboard/stats"
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "database_mock": is_mock_db()
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error. Unable to connect to the server."}), 500

    return app

# Check if database has data; if empty, run initial seed
def auto_seed_if_empty():
    try:
        db = get_db()
        if db.landmarks.count_documents({}) == 0:
            print("[Startup] Database is empty. Running auto-seeding...")
            from seed import seed_database
            seed_database()
        else:
            print(f"[Startup] Found existing data: {db.landmarks.count_documents({})} landmarks.")
    except Exception as e:
        print(f"[Startup] Auto-seed warning: {e}")

if __name__ == "__main__":
    auto_seed_if_empty()
    app = create_app()
    print(f"Starting Landmark-Based Bus Stop Finder API on http://127.0.0.1:{Config.PORT}...")
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)
