import os
from PIL import Image
from rembg import remove, new_session
import shutil

input_file = "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777361630379.jpg"
output_file = "/Users/yash/Desktop/Locker room/assets/images/avatars/outfit_competitive.png"
raw_dest = "/Users/yash/Desktop/Locker room/assets/images/raw/outfit_competitive.jpg"

shutil.copy(input_file, raw_dest)

session = new_session("u2net_human_seg")

try:
    print("Processing Competitive Attire...")
    img = Image.open(input_file)
    img = img.convert("RGB")
    out = remove(img, session=session)
    out.save(output_file, "PNG")
    print("Successfully processed and saved to outfit_competitive.png")
except Exception as e:
    print("Error:", e)
