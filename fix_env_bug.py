import glob
import re

# 1. Update gameState.js to inject the iOS safe area variable
with open('www/services/gameState.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

injection = """
// --- iOS Safe Area Fallback ---
if (window.Capacitor && window.Capacitor.getPlatform() === 'ios') {
    document.documentElement.style.setProperty('--ios-safe-top', '50px');
    document.documentElement.style.setProperty('--ios-safe-bottom', '30px');
} else {
    document.documentElement.style.setProperty('--ios-safe-top', '0px');
    document.documentElement.style.setProperty('--ios-safe-bottom', '0px');
}
"""
if '--ios-safe-top' not in js_content:
    js_content = injection + js_content
    with open('www/services/gameState.js', 'w', encoding='utf-8') as f:
        f.write(js_content)

# 2. Update all CSS files to use the new variable
css_files = glob.glob('www/**/*.css', recursive=True)
for file_path in css_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace env(safe-area-inset-top) with var(--ios-safe-top, env(safe-area-inset-top, 0px))
    content = re.sub(r'env\(safe-area-inset-top(?:,\s*0px)?\)', r'var(--ios-safe-top, env(safe-area-inset-top, 0px))', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Update all HTML inline styles
html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'env\(safe-area-inset-top(?:,\s*0px)?\)', r'var(--ios-safe-top, env(safe-area-inset-top, 0px))', content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Environment bug fixed with JS fallback!")
