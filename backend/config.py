import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.environ.get("PORT", 5000))
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/bus_stop_finder")
    DB_NAME = os.environ.get("DB_NAME", "bus_stop_finder")
    DEBUG = os.environ.get("DEBUG", "True").lower() in ("true", "1", "yes")
    EARTH_RADIUS_KM = 6371.0
