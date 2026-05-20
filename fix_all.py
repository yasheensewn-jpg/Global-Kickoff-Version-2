import os
import glob
import re

# 1. Process all HTML files
html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove viewport-fit=cover
    content = content.replace(', viewport-fit=cover">', '">')
    
    # Revert calc(env(safe-area-inset-top...)) to just the pixel value
    # E.g., top: calc(env(safe-area-inset-top, 0px) + 65px); -> top: 65px;
    content = re.sub(r'calc\(env\(safe-area-inset-top,\s*0px\)\s*\+\s*(\d+px)\)', r'\1', content)
    content = re.sub(r'calc\(env\(safe-area-inset-top\)\s*\+\s*(\d+px)\)', r'\1', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Process all CSS files
css_files = glob.glob('www/**/*.css', recursive=True)
for file_path in css_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove padding-top: env(...)
    content = re.sub(r'padding-top:\s*env\(safe-area-inset-top\);\n?', '', content)
    content = re.sub(r'padding-bottom:\s*env\(safe-area-inset-bottom\);\n?', '', content)
    content = re.sub(r'padding:\s*env\(safe-area-inset-top\).*?;\n?', '', content)
    
    # Revert calc in CSS
    content = re.sub(r'calc\(env\(safe-area-inset-top,\s*0px\)\s*\+\s*(\d+px)\)', r'\1', content)
    content = re.sub(r'calc\(env\(safe-area-inset-top\)\s*\+\s*(\d+px)\)', r'\1', content)
    
    # Revert 100dvh back to 100vh just to be safe, or leave it as 100%
    # We changed it to 100% earlier. Let's keep 100% or 100vh. 
    # Actually, 100vh is standard.
    content = content.replace('height: 100%;\n    width: 100vw;', 'height: 100vh;\n    width: 100vw;')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Cleanup complete!")
