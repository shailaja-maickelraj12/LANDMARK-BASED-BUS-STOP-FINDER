import logging
import socket
from urllib.parse import urlparse
from config import Config

logger = logging.getLogger(__name__)

_db_instance = None
_is_mock = False

def is_mongo_port_open(uri: str, timeout_sec: float = 0.2) -> bool:
    """Fast non-blocking check to verify if the MongoDB server port is open."""
    try:
        parsed = urlparse(uri)
        host = parsed.hostname or "127.0.0.1"
        if host in ("localhost", "0.0.0.0", "::1"):
            host = "127.0.0.1"
        port = parsed.port or 27017
        with socket.create_connection((host, port), timeout=timeout_sec):
            return True
    except Exception:
        return False

def get_db():
    global _db_instance, _is_mock
    if _db_instance is not None:
        return _db_instance

    # 1. Fast pre-flight check: If port is open, connect using PyMongo
    if is_mongo_port_open(Config.MONGO_URI):
        try:
            from pymongo import MongoClient
            client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=1000)
            client.admin.command("ping")
            _db_instance = client[Config.DB_NAME]
            _is_mock = False
            print(f"[Database] Successfully connected to live MongoDB at {Config.MONGO_URI}")
            return _db_instance
        except Exception as e:
            logger.warning(f"[Database] MongoDB ping failed ({e}). Falling back to in-memory mongomock.")

    # 2. Instant zero-delay fallback to in-memory mongomock
    try:
        import mongomock
        mock_client = mongomock.MongoClient()
        _db_instance = mock_client[Config.DB_NAME]
        _is_mock = True
        print("[Database] Local MongoDB server not detected. Initialized zero-configuration database (mongomock).")
    except Exception as mock_err:
        print(f"[Database] Error initializing mongomock: {mock_err}")
        raise

    return _db_instance

def is_mock_db():
    return _is_mock
