import os
from PIL import Image
from rembg import remove, new_session
import shutil

files = {
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777366751442.jpg": "beach_pose_sit",
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777366751451.jpg": "beach_pose_arm",
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777366751491.jpg": "beach_pose_quad",
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777366751496.jpg": "beach_pose_cobra"
}

session = new_session("u2net_human_seg")

for src, name in files.items():
    raw_dest = f"/Users/yash/Desktop/Locker room/assets/images/raw/{name}.jpg"
    out_dest = f"/Users/yash/Desktop/Locker room/assets/images/avatars/{name}.png"
    
    shutil.copy(src, raw_dest)
    try:
        print(f"Processing {name}...")
        img = Image.open(src).convert("RGB")
        out = remove(img, session=session)
        out.save(out_dest, "PNG")
        print(f"Saved {name}.png")
    except Exception as e:
        print(f"Error on {name}: {e}")
