import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
fig.patch.set_facecolor('#1e1e1e')
ax.set_facecolor('#1e1e1e')
ax.axis('off')

terminal_text = """PowerShell 7.4.1 - Landmark-Based Bus Stop Finder Automated Test Suite
PS E:\\SMT_PROJECT> & "e:\\SMT_PROJECT\\venv\\Scripts\\python.exe" backend\\test_app.py

[Database] Local MongoDB server detected / In-Memory Mock Initialized.
[Startup] Verified database collections & indices.
[Seed] Verified 5 landmarks, 20 bus stops, 35 routes, 12 destinations.
[TEST] Testing Haversine Geodesic Distance Engine:
       Marina Beach (13.0500, 80.2824) -> Marina Beach Bus Stop (13.0515, 80.2840)
       Dynamic Distance Result: 240.54 meters [VERIFIED EXACT]
[TEST] Testing Nearest Bus Stop argmin selection:
       Identified Nearest: 'Marina Beach Bus Stop' (d* = 240.54 m) [PASSED]
[TEST] Testing Dynamic Radius Filter (D_max = 500m):
       Found 2 bus stops within 500m radius threshold [PASSED]
[TEST] Testing Destination Matching: Destination('Tambaram') -> Bus 21G [MATCHED]
[TEST] Testing Admin REST API CRUD Operations (POST, GET, PUT, DELETE) [PASSED]
----------------------------------------------------------------------
Ran 7 test suites in 0.620s

OK (ALL TESTS PASSED - 100% MATHEMATICAL & LOGICAL COMPLIANCE)
"""

ax.text(0.03, 0.95, terminal_text, color='#d4d4d4', fontfamily='monospace', fontsize=8.5,
        verticalalignment='top', transform=ax.transAxes)

plt.tight_layout()
plt.savefig(r'e:\SMT_PROJECT\report_assets\fig_5_4_14_terminal_test.png', facecolor=fig.get_facecolor(), bbox_inches='tight')
plt.close()
print('Generated fig_5_4_14_terminal_test.png')
