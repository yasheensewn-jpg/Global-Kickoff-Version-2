import cv2
import numpy as np

images = [
    "assets/locker-room/images/avatars/beach_pose_sit.png",
    "assets/locker-room/images/avatars/comp_pose_sit.png",
    "assets/locker-room/images/avatars/pose_sit.png"
]

for path in images:
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None: continue
    
    # Check if there is an alpha channel
    has_alpha = img.shape[2] == 4
    if has_alpha:
        b, g, r, a = cv2.split(img)
    else:
        b, g, r = cv2.split(img)
        a = np.ones_like(b) * 255
    
    # Convert to grayscale to find checkerboard
    gray = cv2.cvtColor(cv2.merge([b,g,r]), cv2.COLOR_BGR2GRAY)
    
    # We want to identify the exact colors of the checkerboard. Let's find dominant gray levels in the image
    # by plotting a histogram of the gray channel.
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    peaks = np.argsort(hist.flatten())[::-1][:5]
    print(f"{path} dominant gray levels: {peaks}")
