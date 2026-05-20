from rembg import remove
from PIL import Image

images = [
    ("/Users/yash/.gemini/antigravity/brain/da28aa96-a212-40ed-8bbb-5bb0cec2bef2/media__1777368777182.jpg", "Images/teammate_celebrate_1.png"),
    ("/Users/yash/.gemini/antigravity/brain/da28aa96-a212-40ed-8bbb-5bb0cec2bef2/media__1777368779223.jpg", "Images/teammate_celebrate_2.png")
]

for img_path, output_name in images:
    try:
        input_image = Image.open(img_path)
        output_image = remove(input_image)
        output_image.save(output_name)
        print(f"Saved {output_name}")
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
