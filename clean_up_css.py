import glob
import re

# 1. Process all HTML files
html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove viewport-fit=cover
    content = content.replace(', viewport-fit=cover">', '">')
    
    # Revert calc(env(safe-area-inset-top...)) to just the pixel value in inline styles
    def inline_repl(match):
        val = match.group(1)
        return match.group(0).replace(f"calc(env(safe-area-inset-top) + {val}px)", f"{val}px")
    
    content = re.sub(r'top:\s*calc\(env\(safe-area-inset-top\)\s*\+\s*(\d+)px\)', r'top: \1px', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Process all CSS files
css_files = glob.glob('www/**/*.css', recursive=True)
for file_path in css_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Revert calc in CSS
    content = re.sub(r'calc\(env\(safe-area-inset-top,\s*0px\)\s*\+\s*(\d+px)\)', r'\1', content)
    content = re.sub(r'calc\(env\(safe-area-inset-top\)\s*\+\s*(\d+px)\)', r'\1', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Cleanup complete!")
