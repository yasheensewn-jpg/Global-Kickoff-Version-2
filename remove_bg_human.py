import os
from rembg import remove, new_session
from PIL import Image

def process_image(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    print(f"Processing {filepath}...")
    try:
        # Use the u2net_human_seg model specifically optimized for humans
        session = new_session("u2net_human_seg")
        
        input_img = Image.open(filepath)
        
        # We use alpha_matting for finer edge detection and removal
        output_img = remove(input_img, session=session, alpha_matting=True, alpha_matting_foreground_threshold=240, alpha_matting_background_threshold=10, alpha_matting_erode_size=10)
        
        output_img.save(filepath)
        print(f"Successfully removed background from {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

images = [
    "assets/locker-room/images/avatars/beach_pose_sit.png",
    "assets/locker-room/images/avatars/comp_pose_sit.png",
    "assets/locker-room/images/avatars/pose_sit.png"
]

for img in images:
    process_image(img)
