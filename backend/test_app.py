import unittest
import json
import math
from app import create_app, auto_seed_if_empty
from services.distance_service import (
    calculate_distance,
    find_nearest_bus_stop,
    filter_by_distance,
    find_routes_by_destination,
)
from database.db import get_db

class TestLandmarkBusStopFinder(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        auto_seed_if_empty()
        cls.app = create_app()
        cls.client = cls.app.test_client()
        cls.db = get_db()

    def test_haversine_distance_calculation(self):
        """Verify Haversine formula calculates accurate distance in meters"""
        # Marina Beach (13.0500, 80.2824) to Marina Beach Bus Stop (13.0515, 80.2840)
        dist = calculate_distance(13.0500, 80.2824, 13.0515, 80.2840)
        self.assertIsInstance(dist, float)
        # Expected distance is approx 240 meters
        self.assertGreater(dist, 200)
        self.assertLess(dist, 300)
        print(f"[TEST] Haversine calculation verified: {dist} meters")

    def test_landmarks_endpoints(self):
        """Test GET /api/landmarks and search"""
        res = self.client.get('/api/landmarks')
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertGreaterEqual(len(data), 5)

        # Search for Marina
        search_res = self.client.get('/api/landmarks/search?q=Marina')
        self.assertEqual(search_res.status_code, 200)
        search_data = json.loads(search_res.data)
        self.assertTrue(any("Marina Beach" in item["name"] for item in search_data))

    def test_nearest_bus_stop_endpoint(self):
        """Test GET /api/nearest-bus-stop/<landmark_id>"""
        res = self.client.get('/api/landmarks/search?q=Marina%20Beach')
        landmark_id = json.loads(res.data)[0]['id']

        nearest_res = self.client.get(f'/api/nearest-bus-stop/{landmark_id}')
        self.assertEqual(nearest_res.status_code, 200)
        nearest_data = json.loads(nearest_res.data)

        self.assertEqual(nearest_data['landmark'], 'Marina Beach')
        self.assertIn('distance_meters', nearest_data)
        self.assertGreater(nearest_data['distance_meters'], 0)
        print(f"[TEST] Nearest stop for Marina Beach: {nearest_data['nearest_bus_stop']} ({nearest_data['distance_meters']} m)")

    def test_nearby_bus_stops_and_distance_filter(self):
        """Test GET /api/nearby-bus-stops/<id> with max_distance filter"""
        res = self.client.get('/api/landmarks/search?q=Marina%20Beach')
        landmark_id = json.loads(res.data)[0]['id']

        # Unfiltered
        all_nearby = self.client.get(f'/api/nearby-bus-stops/{landmark_id}')
        self.assertEqual(all_nearby.status_code, 200)
        stops = json.loads(all_nearby.data)['bus_stops']
        self.assertGreater(len(stops), 1)

        # Verify ascending order of distance
        distances = [s['distance_meters'] for s in stops]
        self.assertEqual(distances, sorted(distances))

        # Filter: max_distance=500m
        filtered_500 = self.client.get(f'/api/nearby-bus-stops/{landmark_id}?max_distance=500')
        self.assertEqual(filtered_500.status_code, 200)
        stops_500 = json.loads(filtered_500.data)['bus_stops']
        for s in stops_500:
            self.assertLessEqual(s['distance_meters'], 500)
        print(f"[TEST] Distance filtering verified: {len(stops_500)} stops <= 500m")

    def test_routes_endpoints_and_search(self):
        """Test /api/routes and search by destination and bus number"""
        # Search by destination Central
        res_dest = self.client.get('/api/routes/search?destination=Central')
        self.assertEqual(res_dest.status_code, 200)
        data_dest = json.loads(res_dest.data)
        self.assertTrue(len(data_dest['routes']) > 0)
        self.assertTrue(all('Central' in r['destination'] for r in data_dest['routes']))

        # Search by bus number 27B
        res_bus = self.client.get('/api/routes/search?bus_number=27B')
        self.assertEqual(res_bus.status_code, 200)
        data_bus = json.loads(res_bus.data)
        self.assertTrue(len(data_bus['routes']) > 0)
        self.assertTrue(all('27B' in r['bus_number'] for r in data_bus['routes']))

    def test_dashboard_stats(self):
        """Test GET /api/dashboard/stats"""
        res = self.client.get('/api/dashboard/stats')
        self.assertEqual(res.status_code, 200)
        stats = json.loads(res.data)
        self.assertGreaterEqual(stats['total_landmarks'], 5)
        self.assertGreaterEqual(stats['total_bus_stops'], 5)
        self.assertGreaterEqual(stats['total_routes'], 5)
        self.assertGreaterEqual(stats['total_destinations'], 5)
        self.assertIn("M = (L, B, R, D, U, F)", stats['mathematical_model'])

    def test_crud_operations(self):
        """Test full CRUD lifecycle for landmarks and bus stops"""
        # 1. Create Landmark
        new_lm = {
            "name": "Guindy National Park",
            "description": "Protected park in Chennai",
            "latitude": 13.0067,
            "longitude": 80.2206,
            "category": "National Park"
        }
        res_create = self.client.post('/api/landmarks', json=new_lm)
        self.assertEqual(res_create.status_code, 201)
        created_id = json.loads(res_create.data)['id']

        # 2. Update Landmark
        res_update = self.client.put(f'/api/landmarks/{created_id}', json={"category": "Wildlife Sanctuary"})
        self.assertEqual(res_update.status_code, 200)
        self.assertEqual(json.loads(res_update.data)['category'], "Wildlife Sanctuary")

        # 3. Delete Landmark
        res_del = self.client.delete(f'/api/landmarks/{created_id}')
        self.assertEqual(res_del.status_code, 200)

        # 4. Verify Not Found
        res_get = self.client.get(f'/api/landmarks/{created_id}')
        self.assertEqual(res_get.status_code, 404)
        print("[TEST] Full CRUD test passed successfully!")

if __name__ == '__main__':
    unittest.main()
