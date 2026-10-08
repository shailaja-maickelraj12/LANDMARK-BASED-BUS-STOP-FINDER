import subprocess
import os
import time

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
output_dir = r'e:\SMT_PROJECT\report_assets'
os.makedirs(output_dir, exist_ok=True)

targets = [
    ('fig_5_4_1_home.png', 'http://localhost:5173/'),
    ('fig_5_4_2_search.png', 'http://localhost:5173/search?q=Marina'),
    ('fig_5_4_3_landmark_detail.png', 'http://localhost:5173/landmark/6ac75384baaed66acff7e227'),
    ('fig_5_4_4_distance_filter.png', 'http://localhost:5173/landmark/6ac75384baaed66acff7e227?max_distance=500'),
    ('fig_5_4_5_dest_filter.png', 'http://localhost:5173/landmark/6ac75384baaed66acff7e227?destination=Tambaram'),
    ('fig_5_4_6_map_view.png', 'http://localhost:5173/landmark/6ac75384baaed66acff7e227'),
    ('fig_5_4_7_bus_stop_detail.png', 'http://localhost:5173/bus-stop/6ac75384baaed66acff7e22c'),
    ('fig_5_4_8_route_timeline.png', 'http://localhost:5173/route/6ac75384baaed66acff7e248'),
    ('fig_5_4_9_bus_search.png', 'http://localhost:5173/search?bus=21G'),
    ('fig_5_4_10_dashboard.png', 'http://localhost:5173/dashboard'),
    ('fig_5_4_11_admin.png', 'http://localhost:5173/admin?tab=landmarks'),
    ('fig_5_4_12_admin_bus_stops.png', 'http://localhost:5173/admin?tab=bus_stops'),
    ('fig_5_4_13_math_tab.png', 'http://localhost:5173/dashboard?mathTab=haversine')
]

for filename, url in targets:
    outpath = os.path.join(output_dir, filename)
    cmd = [
        chrome_path,
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--window-size=1280,850',
        '--virtual-time-budget=4000',
        f'--screenshot={outpath}',
        url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
        size = os.path.getsize(outpath) if os.path.exists(outpath) else 0
        print(f'{filename}: {os.path.exists(outpath)} ({size} bytes)')
    except Exception as e:
        print(f'Error capturing {filename}: {e}')

print('All screenshots captured successfully.')
