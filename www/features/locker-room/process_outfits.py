import os
from PIL import Image
from rembg import remove, new_session

# Input files
file1 = "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777361091427.png"
file2 = "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777361323453.jpg"

output1 = "assets/images/avatars/outfit_competitive.png"
output2 = "assets/images/avatars/outfit_beach.png"

# Copy raw files
import shutil
shutil.copy(file1, "assets/images/raw/outfit_competitive.png")
shutil.copy(file2, "assets/images/raw/outfit_beach.jpg")

session = new_session("u2net_human_seg")

try:
    print("Processing Competitive...")
    img1 = Image.open(file1)
    # Convert to RGB if it's RGBA but has checkerboard
    img1 = img1.convert("RGB")
    out1 = remove(img1, session=session)
    out1.save(output1, "PNG")
    print("Saved output1")
except Exception as e:
    print("Error 1:", e)

try:
    print("Processing Beach...")
    img2 = Image.open(file2)
    img2 = img2.convert("RGB")
    out2 = remove(img2, session=session)
    out2.save(output2, "PNG")
    print("Saved output2")
except Exception as e:
    print("Error 2:", e)
