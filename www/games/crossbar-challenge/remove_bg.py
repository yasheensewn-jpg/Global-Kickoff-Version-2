from PIL import Image

def remove_white_background(img_path, out_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check if pixel is white or close to white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)
    img.save(out_path, "PNG")

if __name__ == "__main__":
    remove_white_background("Soccer gear.png", "soccer_gear_transparent.png")
