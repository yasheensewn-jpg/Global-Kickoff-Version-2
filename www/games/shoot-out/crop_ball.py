from PIL import Image, ImageDraw

def crop_border(img_path, out_path, shrink_pixels=80):
    img = Image.open(img_path).convert("RGBA")
    bbox = img.getbbox()
    if not bbox: return
    
    img = img.crop(bbox)
    width, height = img.size
    
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    draw.ellipse((shrink_pixels, shrink_pixels, width - shrink_pixels, height - shrink_pixels), fill=255)
    
    out = Image.new("RGBA", (width, height), (0,0,0,0))
    out.paste(img, (0,0), mask)
    
    # Finally, crop the transparent edges we just created
    out = out.crop(out.getbbox())
    
    out.save(out_path)

crop_border("Images/extracted_red_ball.png", "Images/extracted_red_ball.png", 60)
