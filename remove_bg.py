import os
from rembg import remove
from PIL import Image

def process_image(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    print(f"Processing {filepath}...")
    try:
        input_img = Image.open(filepath)
        output_img = remove(input_img)
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
