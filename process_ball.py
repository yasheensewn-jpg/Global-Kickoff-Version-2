import rembg
from PIL import Image
import io

input_path = 'assets/shoot-out/modern soccer ball.jpg'
output_path = 'games/crossbar-challenge/basic_ball.png'

with open(input_path, 'rb') as i:
    input_data = i.read()
    
output_data = rembg.remove(input_data)
img = Image.open(io.BytesIO(output_data)).convert("RGBA")

# Crop to bounding box
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Resize to something reasonable like 200x200
img = img.resize((200, 200), Image.Resampling.LANCZOS)
img.save(output_path, 'PNG')
print('Processed successfully!')
