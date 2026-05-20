from PIL import Image

def process():
    img = Image.open('Soccer gear.png').convert("RGBA")
    data = img.load()
    width, height = img.size
    
    # Get colors from top-left corners
    c1 = data[0,0]
    c2 = None
    for x in range(width):
        if data[x,0] != c1:
            c2 = data[x,0]
            break
            
    print(f"Background colors: {c1}, {c2}")
    
    # It's a pixel art image, so let's just make any pixel matching c1 or c2 transparent,
    # as long as they are likely background.
    # Wait, the gear itself might use white (255,255,255)! 
    # To be safe, let's do a flood fill or just connected component analysis from the edges.
    
    bg_colors = {c1}
    if c2: bg_colors.add(c2)
    
    # Simple BFS to find all background pixels connected to edges
    from collections import deque
    queue = deque()
    visited = set()
    
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
        
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited: continue
        
        # Check bounds
        if x < 0 or x >= width or y < 0 or y >= height: continue
        
        visited.add((x, y))
        
        # Only process if it strictly matches one of the exact background colors
        pixel = data[x,y]
        
        # We need to compute delta since JPEG could introduce artifacts (but it's a PNG, might be clean)
        # Let's check distance
        def is_bg(p):
            for bc in bg_colors:
                cdiff = abs(p[0]-bc[0]) + abs(p[1]-bc[1]) + abs(p[2]-bc[2])
                if cdiff < 5: return True
            return False
            
        if is_bg(pixel):
            data[x,y] = (0, 0, 0, 0)
            queue.append((x+1, y))
            queue.append((x-1, y))
            queue.append((x, y+1))
            queue.append((x, y-1))

    # Also, we need to remove the "APP SETTINGS" box if it's there. 
    # The box is likely not connected to the edges if surrounded by bg, wait, it IS surrounded by bg which we just cleared.
    # We can just crop out the center gear or erase anything below a certain Y.
    # Find the bounding box of non-transparent pixels
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    
    for y in range(height):
        for x in range(width):
            if data[x,y][3] > 0:
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                
    # The gear is roughly circular. The text box is below it.
    # Let's assume the gear is a square bounding box at the top.
    # The width of the gear should be approx equal to its height.
    gear_size = max_x - min_x
    gear_bottom = min_y + gear_size
    
    # Erase everything below gear_bottom + 5
    for y in range(int(gear_bottom), height):
        for x in range(width):
            data[x,y] = (0, 0, 0, 0)

    # Recalculate bounding box
    min_x, max_x = width, 0
    min_y, max_y = height, 0
    for y in range(height):
        for x in range(width):
            if data[x,y][3] > 0:
                min_x = min(min_x, x)
                max_x = max(max_x, x)
                min_y = min(min_y, y)
                max_y = max(max_y, y)
                
    cropped = img.crop((min_x, min_y, max_x+1, max_y+1))
    cropped.save('Soccer gear.png')

process()
