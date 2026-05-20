import glob
import re
import os

# 1. Re-add viewport-fit=cover to all HTML files
html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'viewport-fit=cover' not in content:
        content = content.replace('user-scalable=no">', 'user-scalable=no, viewport-fit=cover">')
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Fix CSS files for top elements
css_files = glob.glob('www/**/*.css', recursive=True)

css_selectors = [
    r'#devMenuBtn\s*\{[^}]*?top:\s*(\d+)px;',
    r'\.level-control-panel\s*\{[^}]*?top:\s*(\d+)px;',
    r'\.match-state-panel\s*\{[^}]*?top:\s*(\d+)px;',
    r'\.game-back-btn\s*\{[^}]*?top:\s*(\d+)px;',
    r'#windIndicator\s*\{[^}]*?top:\s*(\d+)px;',
    r'\.points-display\s*\{[^}]*?top:\s*(\d+)px;',
    r'\.strikes-display\s*\{[^}]*?top:\s*(\d+)px;',
    r'#sound-toggle-btn\s*\{[^}]*?top:\s*(\d+)px;',
]

for file_path in css_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pattern in css_selectors:
        def repl(match):
            val = match.group(1)
            # Find the whole block
            block_start = content.rfind('{', 0, match.end())
            prop_start = content.rfind('top:', block_start, match.end())
            prop_end = content.find(';', prop_start) + 1
            
            # If it's already using env(), skip
            if 'env(' in content[prop_start:prop_end]:
                return match.group(0)
            
            # Replace top: Xpx; with top: calc(env(safe-area-inset-top) + Xpx);
            original = f"top: {val}px;"
            replacement = f"top: calc(env(safe-area-inset-top) + {val}px);"
            return match.group(0).replace(original, replacement)
        
        content = re.sub(pattern, repl, content, flags=re.DOTALL)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Fix inline styles in HTML files for buttons
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We look for inline styles with top: Xpx and replace them
    # Especially for #sound-toggle-btn, .game-back-btn
    
    def inline_repl(match):
        full_match = match.group(0)
        val = match.group(1)
        if 'env(' in full_match:
            return full_match
        return full_match.replace(f"top: {val}px", f"top: calc(env(safe-area-inset-top) + {val}px)")
        
    content = re.sub(r'style="[^"]*?top:\s*(\d+)px[^"]*"', inline_repl, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("UI Top Offsets Applied Successfully")
