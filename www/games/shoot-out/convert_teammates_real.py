from rembg import remove
from PIL import Image

images = [
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777358929378.jpg",
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777358929305.jpg",
    "/Users/yash/.gemini/antigravity/brain/97d76594-8d4d-456d-bcb6-002f59b4ee7e/media__1777358929275.jpg"
]

output_names = [
    "Images/teammate_1.png",
    "Images/teammate_2.png",
    "Images/teammate_3.png"
]

for i, img_path in enumerate(images):
    try:
        input_image = Image.open(img_path)
        output_image = remove(input_image)
        output_image.save(output_names[i])
        print(f"Saved {output_names[i]}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
