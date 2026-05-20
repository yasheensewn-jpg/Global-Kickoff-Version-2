from rembg import remove
from PIL import Image

images = [
    "/Users/yash/.gemini/antigravity/brain/da28aa96-a212-40ed-8bbb-5bb0cec2bef2/media__1777360969171.jpg",
    "/Users/yash/.gemini/antigravity/brain/da28aa96-a212-40ed-8bbb-5bb0cec2bef2/media__1777360969206.jpg",
    "/Users/yash/.gemini/antigravity/brain/da28aa96-a212-40ed-8bbb-5bb0cec2bef2/media__1777360969179.jpg"
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
