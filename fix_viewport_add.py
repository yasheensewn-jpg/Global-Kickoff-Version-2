import os
import glob

html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add viewport-fit=cover back
    content = content.replace('user-scalable=no">', 'user-scalable=no, viewport-fit=cover">')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print("Re-added viewport-fit=cover")
