from rembg import remove
from PIL import Image

for i in range(1, 6):
    in_path = f"/Users/yash/Desktop/avatar/opponent{i}.jpg"
    out_path = f"Images/opponent{i}.png"
    try:
        input_image = Image.open(in_path)
        output_image = remove(input_image)
        output_image.save(out_path)
        print(f"Saved {out_path}")
    except Exception as e:
        print(f"Error processing {in_path}: {e}")
