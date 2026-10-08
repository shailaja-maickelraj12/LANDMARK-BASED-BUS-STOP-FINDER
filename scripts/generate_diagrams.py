import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs(r'e:\SMT_PROJECT\report_assets', exist_ok=True)

# 1. System Workflow Diagram (Fig 3.1) - strictly Black & White
fig, ax = plt.subplots(figsize=(8, 12.5), dpi=300)
ax.set_xlim(0, 10)
ax.set_ylim(0, 15)
ax.axis('off')

# Title
ax.text(5, 14.6, 'Figure 3.1: Complete System Workflow Architecture (B&W)', 
        ha='center', va='center', fontsize=12, fontweight='bold', fontfamily='serif')

steps = [
    'Tourist User (Input Query)',
    'Search Landmark (L_i)',
    'Select Landmark & Fetch Coordinates (Lat_i, Long_i)',
    'Spatial Query: Retrieve Bus Stop Candidates (B)',
    'Haversine Geodesic Distance Engine: d_i = Distance(L_i, B_i)',
    'Sort & Identify Nearest Bus Stop: B* = arg min d_i',
    'Apply Distance Filter: B\' = {B_i | d_i <= D_max}',
    'Query Available Transit Routes Passing Through B\'',
    'Tourist Selects Desired Destination (D_u)',
    'Match Suitable Bus: Match(R_i, D_u) = 1',
    'Retrieve Complete Route Trajectory (P_i)',
    'Interactive OpenStreetMap & Polyline Rendering',
    'Directions & Step-by-Step Walking Trajectory'
]

y_pos = 13.8
box_height = 0.58
box_width = 7.5
gap = 0.98

for i, step in enumerate(steps):
    rect = patches.FancyBboxPatch((5 - box_width/2, y_pos - box_height/2), 
                                 box_width, box_height,
                                 boxstyle='round,pad=0.15',
                                 edgecolor='black', facecolor='white', linewidth=1.5)
    ax.add_patch(rect)
    ax.text(5, y_pos, step, ha='center', va='center', fontsize=9.5, fontfamily='serif')
    
    if i < len(steps) - 1:
        ax.annotate('', xy=(5, y_pos - box_height/2 - 0.38), xytext=(5, y_pos - box_height/2),
                    arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))
    y_pos -= gap

plt.tight_layout()
plt.savefig(r'e:\SMT_PROJECT\report_assets\fig_3_1_workflow_bw.png', dpi=300, bbox_inches='tight')
plt.close()
print('Generated fig_3_1_workflow_bw.png')

# 2. Mathematical Model Architecture Diagram (Fig 4.1) - strictly Black & White
fig, ax = plt.subplots(figsize=(10.5, 7.5), dpi=300)
ax.set_xlim(0, 12)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(6, 8.5, 'Figure 4.1: Mathematical Model Formulation & Geodesic Transformation Engine', 
        ha='center', va='center', fontsize=11, fontweight='bold', fontfamily='serif')

boxes = [
    (2.0, 6.8, 'Landmark Set (L)\nL_i = (Lat_i, Long_i)\nCoordinates in Degrees'),
    (6.0, 6.8, 'Geodesic Haversine Engine\nd = 2R * arcsin(sqrt(h))\nR = 6371 km, d_m = d * 1000'),
    (10.0, 6.8, 'Bus Stop Set (B)\nB_j = (Lat_j, Long_j)\nCandidate Stop Geometries'),
    (3.5, 4.0, 'Nearest Stop Optimization\nB* = arg min d_i\nDynamic Spherical Ranking'),
    (8.5, 4.0, 'Radius Filter Module\nB\' = {B_i | d(L, B_i) <= D_max}\nD_max in {500m, 1km, 2km, 5km}'),
    (6.0, 1.4, 'Route Matching System\nR_i = (N_i, S_i, D_i, P_i)\nMatch(R_i, D_u) = 1 iff Destination(R_i) = D_u')
]

for x, y, text in boxes:
    rect = patches.FancyBboxPatch((x - 1.8, y - 0.65), 3.6, 1.3,
                                 boxstyle='round,pad=0.15',
                                 edgecolor='black', facecolor='white', linewidth=1.5)
    ax.add_patch(rect)
    ax.text(x, y, text, ha='center', va='center', fontsize=8.5, fontfamily='serif')

ax.annotate('', xy=(4.1, 6.8), xytext=(3.9, 6.8), arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))
ax.annotate('', xy=(7.9, 6.8), xytext=(8.1, 6.8), arrowprops=dict(arrowstyle='<-', lw=1.5, color='black'))

ax.annotate('', xy=(4.2, 4.7), xytext=(5.2, 6.1), arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))
ax.annotate('', xy=(7.8, 4.7), xytext=(6.8, 6.1), arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))

ax.annotate('', xy=(5.0, 2.1), xytext=(4.2, 3.3), arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))
ax.annotate('', xy=(7.0, 2.1), xytext=(7.8, 3.3), arrowprops=dict(arrowstyle='->', lw=1.5, color='black'))

plt.tight_layout()
plt.savefig(r'e:\SMT_PROJECT\report_assets\fig_4_1_math_model_bw.png', dpi=300, bbox_inches='tight')
plt.close()
print('Generated fig_4_1_math_model_bw.png')
