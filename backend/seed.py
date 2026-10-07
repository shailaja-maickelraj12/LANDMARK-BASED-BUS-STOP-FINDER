import os
import sys
from bson import ObjectId

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import get_db

DEMO_DISCLAIMER = "Notice: Route and timing data provided is demonstration data for academic and project evaluation purposes, and does not represent real-time official transit schedules."

def seed_database():
    db = get_db()
    print("[Seed] Seeding database collections...")

    # Drop existing collections for clean seed
    db.landmarks.drop()
    db.bus_stops.drop()
    db.routes.drop()
    db.destinations.drop()

    # 1. Insert Destinations
    destinations_list = [
        {"name": "Central"},
        {"name": "Tambaram"},
        {"name": "Saidapet"},
        {"name": "Guindy"},
        {"name": "Broadway"},
        {"name": "T. Nagar"},
        {"name": "Adyar"},
        {"name": "Kelambakkam"},
        {"name": "Besant Nagar"},
        {"name": "K.K. Nagar"},
        {"name": "Thiruvanmiyur"},
        {"name": "West Mambalam"},
    ]
    res_dest = db.destinations.insert_many(destinations_list)
    print(f"[Seed] Inserted {len(res_dest.inserted_ids)} destinations.")

    # 2. Insert Landmarks
    landmarks_data = [
        {
            "name": "Marina Beach",
            "description": "World's second longest natural urban beach along the Bay of Bengal, iconic gathering hub and premier tourist attraction in Chennai.",
            "latitude": 13.0500,
            "longitude": 80.2824,
            "category": "Tourist Attraction",
            "city": "Chennai",
            "state": "Tamil Nadu"
        },
        {
            "name": "Kapaleeshwarar Temple",
            "description": "Historic 7th-century Dravidian Hindu temple dedicated to Lord Shiva and Goddess Karpagambal located in the cultural heart of Mylapore.",
            "latitude": 13.0334,
            "longitude": 80.2699,
            "category": "Religious Heritage",
            "city": "Chennai",
            "state": "Tamil Nadu"
        },
        {
            "name": "Fort St. George",
            "description": "The first English fortress built in India (1644), now the administrative headquarters of the Tamil Nadu Legislative Assembly and the Fort Museum.",
            "latitude": 13.0797,
            "longitude": 80.2874,
            "category": "Historical Monument",
            "city": "Chennai",
            "state": "Tamil Nadu"
        },
        {
            "name": "Government Museum",
            "description": "Established in 1851 in Egmore, India's second oldest museum complex housing world-famous Chola bronzes, archaeological relics, and Roman antiquities.",
            "latitude": 13.0732,
            "longitude": 80.2609,
            "category": "Cultural & Museum",
            "city": "Chennai",
            "state": "Tamil Nadu"
        },
        {
            "name": "Valluvar Kottam",
            "description": "Impressive memorial chariot and modern monument honouring ancient Tamil poet-philosopher Thiruvalluvar, located in Nungambakkam.",
            "latitude": 13.0528,
            "longitude": 80.2415,
            "category": "Memorial & Cultural",
            "city": "Chennai",
            "state": "Tamil Nadu"
        }
    ]

    landmark_map = {}
    for lm in landmarks_data:
        inserted = db.landmarks.insert_one(lm)
        landmark_map[lm["name"]] = str(inserted.inserted_id)
    print(f"[Seed] Inserted {len(landmark_map)} landmarks.")

    # 3. Insert Bus Stops associated with landmarks
    bus_stops_data = [
        # Marina Beach
        {
            "name": "Marina Beach Bus Stop",
            "latitude": 13.0515,
            "longitude": 80.2840,
            "landmark_id": landmark_map["Marina Beach"],
            "landmark_name": "Marina Beach"
        },
        {
            "name": "Vivekanandar Illam Bus Stop",
            "latitude": 13.0538,
            "longitude": 80.2818,
            "landmark_id": landmark_map["Marina Beach"],
            "landmark_name": "Marina Beach"
        },
        {
            "name": "Triplicane Bus Stop",
            "latitude": 13.0545,
            "longitude": 80.2769,
            "landmark_id": landmark_map["Marina Beach"],
            "landmark_name": "Marina Beach"
        },
        {
            "name": "Light House Bus Stop",
            "latitude": 13.0396,
            "longitude": 80.2785,
            "landmark_id": landmark_map["Marina Beach"],
            "landmark_name": "Marina Beach"
        },

        # Kapaleeshwarar Temple
        {
            "name": "Kapaleeshwarar Temple Stop",
            "latitude": 13.0340,
            "longitude": 80.2708,
            "landmark_id": landmark_map["Kapaleeshwarar Temple"],
            "landmark_name": "Kapaleeshwarar Temple"
        },
        {
            "name": "Mylapore Tank Bus Stop",
            "latitude": 13.0330,
            "longitude": 80.2685,
            "landmark_id": landmark_map["Kapaleeshwarar Temple"],
            "landmark_name": "Kapaleeshwarar Temple"
        },
        {
            "name": "Luz Corner Bus Stop",
            "latitude": 13.0390,
            "longitude": 80.2650,
            "landmark_id": landmark_map["Kapaleeshwarar Temple"],
            "landmark_name": "Kapaleeshwarar Temple"
        },
        {
            "name": "Mandaveli Bus Terminus",
            "latitude": 13.0270,
            "longitude": 80.2645,
            "landmark_id": landmark_map["Kapaleeshwarar Temple"],
            "landmark_name": "Kapaleeshwarar Temple"
        },

        # Fort St. George
        {
            "name": "Fort St. George Bus Stop",
            "latitude": 13.0805,
            "longitude": 80.2882,
            "landmark_id": landmark_map["Fort St. George"],
            "landmark_name": "Fort St. George"
        },
        {
            "name": "Secretariat / Reserve Bank Bus Stop",
            "latitude": 13.0788,
            "longitude": 80.2890,
            "landmark_id": landmark_map["Fort St. George"],
            "landmark_name": "Fort St. George"
        },
        {
            "name": "High Court Bus Stop",
            "latitude": 13.0875,
            "longitude": 80.2885,
            "landmark_id": landmark_map["Fort St. George"],
            "landmark_name": "Fort St. George"
        },
        {
            "name": "Central Bus Stop",
            "latitude": 13.0827,
            "longitude": 80.2755,
            "landmark_id": landmark_map["Fort St. George"],
            "landmark_name": "Fort St. George"
        },

        # Government Museum
        {
            "name": "Government Museum Bus Stop (Egmore)",
            "latitude": 13.0738,
            "longitude": 80.2616,
            "landmark_id": landmark_map["Government Museum"],
            "landmark_name": "Government Museum"
        },
        {
            "name": "Pantheon Road Bus Stop",
            "latitude": 13.0718,
            "longitude": 80.2600,
            "landmark_id": landmark_map["Government Museum"],
            "landmark_name": "Government Museum"
        },
        {
            "name": "Egmore Railway Station Bus Stop",
            "latitude": 13.0780,
            "longitude": 80.2612,
            "landmark_id": landmark_map["Government Museum"],
            "landmark_name": "Government Museum"
        },
        {
            "name": "Commissioner Office Bus Stop",
            "latitude": 13.0760,
            "longitude": 80.2550,
            "landmark_id": landmark_map["Government Museum"],
            "landmark_name": "Government Museum"
        },

        # Valluvar Kottam
        {
            "name": "Valluvar Kottam Bus Stop",
            "latitude": 13.0532,
            "longitude": 80.2422,
            "landmark_id": landmark_map["Valluvar Kottam"],
            "landmark_name": "Valluvar Kottam"
        },
        {
            "name": "Vidyodaya School Bus Stop",
            "latitude": 13.0515,
            "longitude": 80.2440,
            "landmark_id": landmark_map["Valluvar Kottam"],
            "landmark_name": "Valluvar Kottam"
        },
        {
            "name": "Nungambakkam Police Station Stop",
            "latitude": 13.0560,
            "longitude": 80.2445,
            "landmark_id": landmark_map["Valluvar Kottam"],
            "landmark_name": "Valluvar Kottam"
        },
        {
            "name": "Gemini / Anna Flyover Bus Stop",
            "latitude": 13.0510,
            "longitude": 80.2520,
            "landmark_id": landmark_map["Valluvar Kottam"],
            "landmark_name": "Valluvar Kottam"
        }
    ]

    stop_map = {}
    for stop in bus_stops_data:
        inserted = db.bus_stops.insert_one(stop)
        stop_map[stop["name"]] = str(inserted.inserted_id)
    print(f"[Seed] Inserted {len(stop_map)} bus stops.")

    # 4. Insert Bus Routes operating at these bus stops
    routes_data = [
        # At Marina Beach Bus Stop
        {
            "bus_number": "27B",
            "bus_stop_id": stop_map["Marina Beach Bus Stop"],
            "bus_stop_name": "Marina Beach Bus Stop",
            "source": "Marina Beach",
            "destination": "Central",
            "route_stops": ["Marina Beach", "Vivekanandar Illam", "Triplicane", "Simpsons", "Central"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "21G",
            "bus_stop_id": stop_map["Marina Beach Bus Stop"],
            "bus_stop_name": "Marina Beach Bus Stop",
            "source": "Broadway",
            "destination": "Tambaram",
            "route_stops": ["Broadway", "Secretariat", "Marina Beach", "Mylapore Tank", "Saidapet", "Guindy", "Tambaram"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "29C",
            "bus_stop_id": stop_map["Marina Beach Bus Stop"],
            "bus_stop_name": "Marina Beach Bus Stop",
            "source": "Perambur",
            "destination": "Saidapet",
            "route_stops": ["Perambur", "Central", "Triplicane", "Marina Beach", "Mylapore", "Saidapet"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "5E",
            "bus_stop_id": stop_map["Marina Beach Bus Stop"],
            "bus_stop_name": "Marina Beach Bus Stop",
            "source": "Besant Nagar",
            "destination": "Guindy",
            "route_stops": ["Besant Nagar", "Marina Beach", "Triplicane", "Saidapet", "Guindy"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Vivekanandar Illam Bus Stop
        {
            "bus_number": "12G",
            "bus_stop_id": stop_map["Vivekanandar Illam Bus Stop"],
            "bus_stop_name": "Vivekanandar Illam Bus Stop",
            "source": "Anna Square",
            "destination": "K.K. Nagar",
            "route_stops": ["Anna Square", "Marina Beach", "Vivekanandar Illam", "Royapettah", "T. Nagar", "K.K. Nagar"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "45B",
            "bus_stop_id": stop_map["Vivekanandar Illam Bus Stop"],
            "bus_stop_name": "Vivekanandar Illam Bus Stop",
            "source": "Anna Square",
            "destination": "Guindy",
            "route_stops": ["Anna Square", "Vivekanandar Illam", "Mylapore Tank", "Mandaveli", "Guindy"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Triplicane Bus Stop
        {
            "bus_number": "27B",
            "bus_stop_id": stop_map["Triplicane Bus Stop"],
            "bus_stop_name": "Triplicane Bus Stop",
            "source": "Marina Beach",
            "destination": "Central",
            "route_stops": ["Marina Beach", "Vivekanandar Illam", "Triplicane", "Simpsons", "Central"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "29C",
            "bus_stop_id": stop_map["Triplicane Bus Stop"],
            "bus_stop_name": "Triplicane Bus Stop",
            "source": "Perambur",
            "destination": "Saidapet",
            "route_stops": ["Perambur", "Central", "Triplicane", "Mylapore", "Saidapet"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Light House Bus Stop
        {
            "bus_number": "102",
            "bus_stop_id": stop_map["Light House Bus Stop"],
            "bus_stop_name": "Light House Bus Stop",
            "source": "Broadway",
            "destination": "Kelambakkam",
            "route_stops": ["Broadway", "Fort St. George", "Marina Beach", "Light House", "Adyar", "Sholinganallur", "Kelambakkam"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "1A",
            "bus_stop_id": stop_map["Light House Bus Stop"],
            "bus_stop_name": "Light House Bus Stop",
            "source": "Thiruvottiyur",
            "destination": "Thiruvanmiyur",
            "route_stops": ["Thiruvottiyur", "High Court", "Marina Beach", "Light House", "Santhome", "Thiruvanmiyur"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Kapaleeshwarar Temple Stop
        {
            "bus_number": "12G",
            "bus_stop_id": stop_map["Kapaleeshwarar Temple Stop"],
            "bus_stop_name": "Kapaleeshwarar Temple Stop",
            "source": "Anna Square",
            "destination": "K.K. Nagar",
            "route_stops": ["Anna Square", "Mylapore", "Kapaleeshwarar Temple Stop", "Alwarpet", "T. Nagar", "K.K. Nagar"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "21G",
            "bus_stop_id": stop_map["Kapaleeshwarar Temple Stop"],
            "bus_stop_name": "Kapaleeshwarar Temple Stop",
            "source": "Broadway",
            "destination": "Tambaram",
            "route_stops": ["Broadway", "Secretariat", "Kapaleeshwarar Temple Stop", "Saidapet", "Tambaram"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Mylapore Tank Bus Stop
        {
            "bus_number": "5E",
            "bus_stop_id": stop_map["Mylapore Tank Bus Stop"],
            "bus_stop_name": "Mylapore Tank Bus Stop",
            "source": "Besant Nagar",
            "destination": "Guindy",
            "route_stops": ["Besant Nagar", "Adyar", "Mylapore Tank", "Saidapet", "Guindy"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "45B",
            "bus_stop_id": stop_map["Mylapore Tank Bus Stop"],
            "bus_stop_name": "Mylapore Tank Bus Stop",
            "source": "Anna Square",
            "destination": "Guindy",
            "route_stops": ["Anna Square", "Marina Beach", "Mylapore Tank", "Mandaveli", "Guindy"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "27B",
            "bus_stop_id": stop_map["Mylapore Tank Bus Stop"],
            "bus_stop_name": "Mylapore Tank Bus Stop",
            "source": "Mylapore",
            "destination": "Central",
            "route_stops": ["Mylapore Tank", "Royapettah", "Simpsons", "Central"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Luz Corner Bus Stop
        {
            "bus_number": "29C",
            "bus_stop_id": stop_map["Luz Corner Bus Stop"],
            "bus_stop_name": "Luz Corner Bus Stop",
            "source": "Perambur",
            "destination": "Saidapet",
            "route_stops": ["Perambur", "Central", "Luz Corner", "Saidapet"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Mandaveli Bus Terminus
        {
            "bus_number": "21G",
            "bus_stop_id": stop_map["Mandaveli Bus Terminus"],
            "bus_stop_name": "Mandaveli Bus Terminus",
            "source": "Broadway",
            "destination": "Tambaram",
            "route_stops": ["Broadway", "Mandaveli", "Adyar", "Guindy", "Tambaram"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Fort St. George Bus Stop
        {
            "bus_number": "27B",
            "bus_stop_id": stop_map["Fort St. George Bus Stop"],
            "bus_stop_name": "Fort St. George Bus Stop",
            "source": "Fort St. George",
            "destination": "Central",
            "route_stops": ["Fort St. George", "Secretariat", "Central"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "102",
            "bus_stop_id": stop_map["Fort St. George Bus Stop"],
            "bus_stop_name": "Fort St. George Bus Stop",
            "source": "Broadway",
            "destination": "Kelambakkam",
            "route_stops": ["Broadway", "Fort St. George", "Marina Beach", "Adyar", "Kelambakkam"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Secretariat / RBI Bus Stop
        {
            "bus_number": "21G",
            "bus_stop_id": stop_map["Secretariat / Reserve Bank Bus Stop"],
            "bus_stop_name": "Secretariat / Reserve Bank Bus Stop",
            "source": "Broadway",
            "destination": "Tambaram",
            "route_stops": ["Broadway", "Secretariat", "Marina Beach", "Guindy", "Tambaram"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "11G",
            "bus_stop_id": stop_map["Secretariat / Reserve Bank Bus Stop"],
            "bus_stop_name": "Secretariat / Reserve Bank Bus Stop",
            "source": "Broadway",
            "destination": "West Mambalam",
            "route_stops": ["Broadway", "Secretariat", "Government Museum", "Valluvar Kottam", "West Mambalam"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Central Bus Stop
        {
            "bus_number": "27B",
            "bus_stop_id": stop_map["Central Bus Stop"],
            "bus_stop_name": "Central Bus Stop",
            "source": "Central",
            "destination": "Central",
            "route_stops": ["Central", "Simpsons", "Triplicane", "Marina Beach"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At High Court Bus Stop
        {
            "bus_number": "1A",
            "bus_stop_id": stop_map["High Court Bus Stop"],
            "bus_stop_name": "High Court Bus Stop",
            "source": "Thiruvottiyur",
            "destination": "Thiruvanmiyur",
            "route_stops": ["Thiruvottiyur", "High Court", "Marina Beach", "Thiruvanmiyur"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Government Museum Bus Stop (Egmore)
        {
            "bus_number": "29C",
            "bus_stop_id": stop_map["Government Museum Bus Stop (Egmore)"],
            "bus_stop_name": "Government Museum Bus Stop (Egmore)",
            "source": "Perambur",
            "destination": "Saidapet",
            "route_stops": ["Perambur", "Central", "Government Museum", "Valluvar Kottam", "Saidapet"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "11G",
            "bus_stop_id": stop_map["Government Museum Bus Stop (Egmore)"],
            "bus_stop_name": "Government Museum Bus Stop (Egmore)",
            "source": "Broadway",
            "destination": "West Mambalam",
            "route_stops": ["Broadway", "Egmore", "Government Museum", "Valluvar Kottam", "T. Nagar", "West Mambalam"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "23C",
            "bus_stop_id": stop_map["Government Museum Bus Stop (Egmore)"],
            "bus_stop_name": "Government Museum Bus Stop (Egmore)",
            "source": "Ayanavaram",
            "destination": "Besant Nagar",
            "route_stops": ["Ayanavaram", "Government Museum", "Valluvar Kottam", "Adyar", "Besant Nagar"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Egmore Railway Station Bus Stop
        {
            "bus_number": "27B",
            "bus_stop_id": stop_map["Egmore Railway Station Bus Stop"],
            "bus_stop_name": "Egmore Railway Station Bus Stop",
            "source": "Marina Beach",
            "destination": "Central",
            "route_stops": ["Marina Beach", "Egmore", "Central"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "23C",
            "bus_stop_id": stop_map["Egmore Railway Station Bus Stop"],
            "bus_stop_name": "Egmore Railway Station Bus Stop",
            "source": "Ayanavaram",
            "destination": "Besant Nagar",
            "route_stops": ["Ayanavaram", "Egmore Station", "Valluvar Kottam", "Besant Nagar"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Valluvar Kottam Bus Stop
        {
            "bus_number": "11G",
            "bus_stop_id": stop_map["Valluvar Kottam Bus Stop"],
            "bus_stop_name": "Valluvar Kottam Bus Stop",
            "source": "Broadway",
            "destination": "West Mambalam",
            "route_stops": ["Broadway", "Egmore", "Valluvar Kottam", "T. Nagar", "West Mambalam"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "29C",
            "bus_stop_id": stop_map["Valluvar Kottam Bus Stop"],
            "bus_stop_name": "Valluvar Kottam Bus Stop",
            "source": "Perambur",
            "destination": "Saidapet",
            "route_stops": ["Perambur", "Central", "Government Museum", "Valluvar Kottam", "Saidapet"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "23C",
            "bus_stop_id": stop_map["Valluvar Kottam Bus Stop"],
            "bus_stop_name": "Valluvar Kottam Bus Stop",
            "source": "Ayanavaram",
            "destination": "Besant Nagar",
            "route_stops": ["Ayanavaram", "Government Museum", "Valluvar Kottam", "Adyar", "Besant Nagar"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "12G",
            "bus_stop_id": stop_map["Valluvar Kottam Bus Stop"],
            "bus_stop_name": "Valluvar Kottam Bus Stop",
            "source": "Anna Square",
            "destination": "K.K. Nagar",
            "route_stops": ["Anna Square", "Marina Beach", "Valluvar Kottam", "T. Nagar", "K.K. Nagar"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Vidyodaya School Bus Stop
        {
            "bus_number": "11G",
            "bus_stop_id": stop_map["Vidyodaya School Bus Stop"],
            "bus_stop_name": "Vidyodaya School Bus Stop",
            "source": "Broadway",
            "destination": "West Mambalam",
            "route_stops": ["Broadway", "Valluvar Kottam", "Vidyodaya School", "T. Nagar", "West Mambalam"],
            "disclaimer": DEMO_DISCLAIMER
        },

        # At Gemini / Anna Flyover Bus Stop
        {
            "bus_number": "5E",
            "bus_stop_id": stop_map["Gemini / Anna Flyover Bus Stop"],
            "bus_stop_name": "Gemini / Anna Flyover Bus Stop",
            "source": "Besant Nagar",
            "destination": "Guindy",
            "route_stops": ["Besant Nagar", "Anna Flyover", "Saidapet", "Guindy"],
            "disclaimer": DEMO_DISCLAIMER
        },
        {
            "bus_number": "21G",
            "bus_stop_id": stop_map["Gemini / Anna Flyover Bus Stop"],
            "bus_stop_name": "Gemini / Anna Flyover Bus Stop",
            "source": "Broadway",
            "destination": "Tambaram",
            "route_stops": ["Broadway", "Anna Flyover", "Saidapet", "Guindy", "Tambaram"],
            "disclaimer": DEMO_DISCLAIMER
        }
    ]

    res_routes = db.routes.insert_many(routes_data)
    print(f"[Seed] Inserted {len(res_routes.inserted_ids)} bus routes.")
    print("[Seed] Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
