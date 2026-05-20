import os
import glob
from PIL import Image
from rembg import remove

def convert_avatars(input_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Find all .jpg files in the input directory
    jpg_files = glob.glob(os.path.join(input_dir, "*.jpg"))
    
    if not jpg_files:
        print(f"No .jpg files found in {input_dir}")
        return

    for img_path in jpg_files:
        try:
            # Open image
            input_image = Image.open(img_path)
            
            # Remove background to create transparency (if applicable)
            output_image = remove(input_image)
            
            # Save as .png
            base_name = os.path.basename(img_path)
            name_without_ext = os.path.splitext(base_name)[0]
            output_path = os.path.join(output_dir, f"{name_without_ext}.png")
            
            output_image.save(output_path, "PNG")
            print(f"Successfully converted {base_name} -> {name_without_ext}.png")
        except Exception as e:
            print(f"Failed to convert {img_path}: {e}")

if __name__ == "__main__":
    # Example usage based on project architecture
    input_folder = "assets/images/raw" # Designated input folder
    output_folder = "assets/images/avatars" # Exact match to SRC data structure
    convert_avatars(input_folder, output_folder)
