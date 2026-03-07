#!/usr/bin/env python3
"""Convert 5 character JPGs with white backgrounds to transparent PNGs."""

from PIL import Image
import numpy as np

for i in range(1, 6):
    src = f'public/images/char{i}.jpg'
    dst = f'public/images/char{i}.png'
    
    img = Image.open(src).convert('RGBA')
    data = np.array(img)
    h, w = data.shape[:2]
    
    r = data[:,:,0].astype(float)
    g = data[:,:,1].astype(float)
    b = data[:,:,2].astype(float)
    
    # White background: all channels high, low saturation
    max_rgb = np.maximum(np.maximum(r, g), b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    saturation = max_rgb - min_rgb
    brightness = (r + g + b) / 3.0
    
    # Background = near-white, low saturation
    is_bg = (saturation < 20) & (brightness >= 240)
    
    # Flood fill from edges
    from collections import deque
    visited = np.zeros((h, w), dtype=bool)
    bg_mask = np.zeros((h, w), dtype=bool)
    queue = deque()
    
    for x in range(w):
        for y in [0, h-1]:
            if is_bg[y, x] and not visited[y, x]:
                queue.append((y, x))
                visited[y, x] = True
    for y in range(h):
        for x in [0, w-1]:
            if is_bg[y, x] and not visited[y, x]:
                queue.append((y, x))
                visited[y, x] = True
    
    while queue:
        cy, cx = queue.popleft()
        bg_mask[cy, cx] = True
        for dy, dx in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]:
            ny, nx = cy+dy, cx+dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx] and is_bg[ny, nx]:
                visited[ny, nx] = True
                queue.append((ny, nx))
    
    # Make background transparent
    data[bg_mask, 3] = 0
    
    # Soften edges
    from scipy.ndimage import binary_dilation
    dilated = binary_dilation(bg_mask, iterations=2)
    edge_mask = dilated & ~bg_mask
    
    edge_ys, edge_xs = np.where(edge_mask)
    for j in range(len(edge_ys)):
        y, x = edge_ys[j], edge_xs[j]
        pr, pg, pb = float(data[y,x,0]), float(data[y,x,1]), float(data[y,x,2])
        ps = max(pr, pg, pb) - min(pr, pg, pb)
        pbr = (pr + pg + pb) / 3.0
        if ps < 30 and pbr >= 235:
            data[y, x, 3] = 80
        elif ps < 30 and pbr >= 220:
            data[y, x, 3] = 160
    
    result = Image.fromarray(data)
    result.save(dst, 'PNG', optimize=True)
    
    t = np.sum(data[:,:,3] == 0)
    total = h * w
    print(f'char{i}: {w}x{h}, transparent={t} ({t*100//total}%), saved to {dst}')

print('All done!')
