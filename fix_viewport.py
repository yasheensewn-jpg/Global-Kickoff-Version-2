import os
import glob

html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove viewport-fit=cover
    content = content.replace(', viewport-fit=cover', '')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
print("Updated viewports")
