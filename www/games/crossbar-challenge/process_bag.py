from PIL import Image, ImageDraw

def remove_background(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    
    target_color = (255, 0, 255, 255)
    
    ImageDraw.floodfill(img, (0, 0), target_color, thresh=80)
    
    width, height = img.size
    ImageDraw.floodfill(img, (width-1, 0), target_color, thresh=80)
    ImageDraw.floodfill(img, (0, height-1), target_color, thresh=80)
    ImageDraw.floodfill(img, (width-1, height-1), target_color, thresh=80)

    datas = img.getdata()
    newData = []
    for item in datas:
        if item[0] == 255 and item[1] == 0 and item[2] == 255:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

remove_background("winged_bag.jpg", "winged_bag.png")
