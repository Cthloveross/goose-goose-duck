#!/usr/bin/env python3
"""Remove checkerboard background from characters.png and make it truly transparent."""

from PIL import Image
import numpy as np
from collections import deque
import shutil

INPUT = 'public/images/characters.png'
BACKUP = 'public/images/characters_backup.png'

# Load image
img = Image.open(INPUT).convert('RGBA')
data = np.array(img)
h, w = data.shape[:2]
print(f"Image size: {w}x{h}")

r = data[:,:,0].astype(float)
g = data[:,:,1].astype(float)
b = data[:,:,2].astype(float)

# Background colors: grey ~(204-207) and white ~(254-255), both near-greyscale
max_rgb = np.maximum(np.maximum(r, g), b)
min_rgb = np.minimum(np.minimum(r, g), b)
saturation = max_rgb - min_rgb  # low = greyscale
brightness = (r + g + b) / 3.0

# Identify background-like pixels (low saturation + grey or white brightness)
is_grey_bg = (saturation < 15) & (brightness >= 190) & (brightness <= 215)
is_white_bg = (saturation < 15) & (brightness >= 240)
is_bg_color = is_grey_bg | is_white_bg

print(f"Background-colored pixels: {is_bg_color.sum()}")

# Flood fill from edges to find connected background region
visited = np.zeros((h, w), dtype=bool)
bg_mask = np.zeros((h, w), dtype=bool)
queue = deque()

# Seed from all 4 edges
for x in range(w):
    for y in [0, h-1]:
        if is_bg_color[y, x] and not visited[y, x]:
            queue.append((y, x))
            visited[y, x] = True
for y in range(h):
    for x in [0, w-1]:
        if is_bg_color[y, x] and not visited[y, x]:
            queue.append((y, x))
            visited[y, x] = True

print(f"Edge seeds: {len(queue)}")

# BFS flood fill
while queue:
    cy, cx = queue.popleft()
    bg_mask[cy, cx] = True
    for dy, dx in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]:
        ny, nx = cy+dy, cx+dx
        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg_color[ny, nx]:
            visited[ny, nx] = True
            queue.append((ny, nx))

bg_count = bg_mask.sum()
print(f"Connected background pixels: {bg_count} ({bg_count*100//(h*w)}%)")

# Make background transparent
data[bg_mask, 3] = 0

# Soften edges: find border pixels (next to background but not background)
# Use numpy for speed
from scipy.ndimage import binary_dilation
dilated = binary_dilation(bg_mask, iterations=1)
edge_mask = dilated & ~bg_mask

edge_count = edge_mask.sum()
print(f"Edge pixels to soften: {edge_count}")

# For edge pixels that look bg-like, make semi-transparent
edge_ys, edge_xs = np.where(edge_mask)
for i in range(len(edge_ys)):
    y, x = edge_ys[i], edge_xs[i]
    px_r, px_g, px_b = float(data[y,x,0]), float(data[y,x,1]), float(data[y,x,2])
    px_sat = max(px_r, px_g, px_b) - min(px_r, px_g, px_b)
    px_bright = (px_r + px_g + px_b) / 3.0
    if px_sat < 25 and (190 <= px_bright <= 215 or px_bright >= 240):
        data[y, x, 3] = 100

# Save
shutil.copy(INPUT, BACKUP)
print(f"Backup saved to {BACKUP}")

result = Image.fromarray(data)
result.save(INPUT, 'PNG', optimize=True)

# Verify
check = np.array(Image.open(INPUT))
t = np.sum(check[:,:,3] == 0)
s = np.sum((check[:,:,3] > 0) & (check[:,:,3] < 255))
o = np.sum(check[:,:,3] == 255)
print(f"Result — Transparent: {t}, Semi-transparent: {s}, Opaque: {o}")
print("Done! Checkerboard background removed.")
