import math
from config import Config

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on the Earth
    using the Haversine formula.

    Formula:
      d = 2R * asin(sqrt(sin^2(d_lat/2) + cos(lat1)*cos(lat2)*sin^2(d_lon/2)))
      Distance_meters = d * 1000

    :param lat1: Latitude of point 1 in decimal degrees
    :param lon1: Longitude of point 1 in decimal degrees
    :param lat2: Latitude of point 2 in decimal degrees
    :param lon2: Longitude of point 2 in decimal degrees
    :return: Distance in meters (float rounded to 2 decimal places)
    """
    R = Config.EARTH_RADIUS_KM  # 6371.0 km

    # Convert decimal degrees to radians
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lon2) - float(lon1))

    # Haversine calculation
    a = (math.sin(delta_phi / 2.0) ** 2) + (
        math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    # Ensure value within domain [-1, 1] for asin/sqrt numerical stability
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.asin(math.sqrt(a))

    distance_km = R * c
    distance_meters = distance_km * 1000.0

    return round(distance_meters, 2)


def calculate_bus_stops_distances(landmark: dict, bus_stops: list) -> list:
    """
    Calculate distance from a landmark to all provided bus stops.
    Appends 'distance_meters' to each bus stop item and sorts ascending by distance.
    """
    l_lat = landmark.get("latitude")
    l_lon = landmark.get("longitude")

    if l_lat is None or l_lon is None:
        return []

    results = []
    for stop in bus_stops:
        s_lat = stop.get("latitude")
        s_lon = stop.get("longitude")
        if s_lat is None or s_lon is None:
            continue
        dist = calculate_distance(l_lat, l_lon, s_lat, s_lon)
        stop_copy = dict(stop)
        stop_copy["distance_meters"] = dist
        results.append(stop_copy)

    results.sort(key=lambda x: x["distance_meters"])
    return results


def find_nearest_bus_stop(landmark: dict, bus_stops: list) -> dict:
    """
    Find the nearest bus stop to a given landmark:
    B* = argmin_{Bi in B} d_i

    :return: Dict containing nearest bus stop object and distance_meters, or None
    """
    if not bus_stops or not landmark:
        return None

    calculated_stops = calculate_bus_stops_distances(landmark, bus_stops)
    if not calculated_stops:
        return None

    # The first element is the minimum distance since calculate_bus_stops_distances is sorted
    return calculated_stops[0]


def filter_by_distance(bus_stops_with_distance: list, max_distance: float) -> list:
    """
    Filter bus stops within the specified maximum distance threshold:
    B' = { B_i | D(L, B_i) <= D_max }
    """
    try:
        max_dist = float(max_distance)
    except (TypeError, ValueError):
        return bus_stops_with_distance

    return [stop for stop in bus_stops_with_distance if stop.get("distance_meters", float("inf")) <= max_dist]


def find_routes_by_destination(routes: list, destination: str) -> list:
    """
    Filter routes where the destination matches:
    Match(R_i, D_u) = 1 if destination matches, else 0
    R* = { R_i in R' | Destination(R_i) == D_u }
    Case-insensitive exact or substring match.
    """
    if not destination:
        return routes

    target = destination.strip().lower()
    matching_routes = []
    for r in routes:
        route_dest = r.get("destination", "").strip().lower()
        if route_dest == target or target in route_dest:
            matching_routes.append(r)
    return matching_routes
