import glob
import re

# 1. HTML Files: Re-add viewport-fit=cover
html_files = glob.glob('www/**/*.html', recursive=True)
for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'viewport-fit=cover' not in content:
        content = content.replace('user-scalable=no">', 'user-scalable=no, viewport-fit=cover">')
    
    # Inline styles: replace top: Xpx with top: calc(env(safe-area-inset-top) + Xpx)
    def inline_repl(match):
        full_match = match.group(0)
        val = match.group(1)
        if 'env(' in full_match:
            return full_match
        return full_match.replace(f"top: {val}px", f"top: calc(env(safe-area-inset-top) + {val}px)")
        
    content = re.sub(r'style="[^"]*?top:\s*(\d+)px[^"]*"', inline_repl, content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. CSS Files: Re-add calc()
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
    r'#levelSelectorContainer\s*\{[^}]*?top:\s*(\d+)px;',
    r'#hub-btn\s*\{[^}]*?top:\s*(\d+)px;',
    r'#close-hub-btn\s*\{[^}]*?top:\s*(\d+)px;',
]

for file_path in css_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for pattern in css_selectors:
        def repl(match):
            val = match.group(1)
            block_start = content.rfind('{', 0, match.end())
            prop_start = content.rfind('top:', block_start, match.end())
            prop_end = content.find(';', prop_start) + 1
            if 'env(' in content[prop_start:prop_end]:
                return match.group(0)
            original = f"top: {val}px;"
            replacement = f"top: calc(env(safe-area-inset-top) + {val}px);"
            return match.group(0).replace(original, replacement)
        content = re.sub(pattern, repl, content, flags=re.DOTALL)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("The Real Fix Applied!")
