from PIL import Image
from rembg import remove, new_session

input_path = "assets/images/raw/pose_sit.jpg"
output_path = "assets/images/avatars/pose_sit.png"

# Try with u2net_human_seg model
try:
    session = new_session("u2net_human_seg")
    input_image = Image.open(input_path)
    output_image = remove(input_image, session=session)
    output_image.save(output_path, "PNG")
    print("Successfully processed with u2net_human_seg")
except Exception as e:
    print(f"Error: {e}")
