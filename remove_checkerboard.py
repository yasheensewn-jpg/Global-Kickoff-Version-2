import cv2
import numpy as np
import os

images_to_process = [
    "assets/locker-room/images/avatars/beach_pose_sit.png",
    "assets/locker-room/images/avatars/comp_pose_sit.png",
    "assets/locker-room/images/avatars/pose_sit.png"
]

for path in images_to_process:
    if not os.path.exists(path):
        print(f"File not found: {path}")
        continue
    
    # Read the image
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Failed to read: {path}")
        continue
        
    print(f"Processing {path} - shape: {img.shape}")
    
    # If the image has an alpha channel, we'll use it, but the checkerboard might be opaque.
    if img.shape[2] == 4:
        b, g, r, a = cv2.split(img)
    else:
        b, g, r = cv2.split(img)
        a = np.ones_like(b) * 255
        
    # The checkerboard is usually composed of two shades of gray.
    # Let's find areas that are strictly gray (R=G=B).
    gray_diff = np.abs(r.astype(int) - g.astype(int)) + np.abs(g.astype(int) - b.astype(int)) + np.abs(b.astype(int) - r.astype(int))
    
    # Let's also look at the specific intensity. Typical checkerboard is around 255 (white) and 204 (gray) or similar.
    # We can create a mask for pixels where R=G=B and intensity is > 150
    # The screenshots show a standard checkerboard.
    
    # Actually, a better approach to remove the background is to use a floodfill from the edges, 
    # but the checkerboard might be inside the bounding box.
    # Let's just target the specific gray and white colors of the checkerboard.
    # The squares are usually alternating. Let's find exactly the unique colors in the background.
    
    # Another approach: since the user said "can still be seen", it might be a watermark or a leftover.
    # Let's try to remove anything that is perfectly gray/white and not part of the character.
    # The character might have some gray/white, so we need to be careful.
    
    # Let's use rembg, if it's installed.
    pass

