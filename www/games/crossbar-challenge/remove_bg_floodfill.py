from PIL import Image, ImageDraw

def remove_background(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    
    # Flood fill from the corners with a unique color (magenta)
    target_color = (255, 0, 255, 255)
    
    ImageDraw.floodfill(img, (0, 0), target_color, thresh=50)
    
    width, height = img.size
    ImageDraw.floodfill(img, (width-1, 0), target_color, thresh=50)
    ImageDraw.floodfill(img, (0, height-1), target_color, thresh=50)
    ImageDraw.floodfill(img, (width-1, height-1), target_color, thresh=50)

    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] == 255 and item[1] == 0 and item[2] == 255:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

if __name__ == "__main__":
    remove_background("Soccer gear.png", "soccer_gear_transparent.png")
