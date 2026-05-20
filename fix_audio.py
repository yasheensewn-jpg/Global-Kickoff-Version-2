import os
import re

files_to_fix = [
    'menu.html',
    'games/crossbar-challenge/index.html',
    'games/shoot-out/index.html',
    'games/dribble-slalom/index.html',
    'features/locker-room/index.html'
]

unlock_block = """        const unlockAudio = () => {
            const bgMusic = document.getElementById('bg-music');
            const isMuted = localStorage.getItem('gk_audio_muted') === 'true';
            
            if (bgMusic && bgMusic.paused && !isMuted) {
                let playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        ['click', 'touchstart', 'touchend'].forEach(evt => document.body.removeEventListener(evt, unlockAudio));
                    }).catch(e => {
                        console.log('Browser requires stronger interaction to unlock audio:', e);
                    });
                }
            }
        };

        ['click', 'touchstart', 'touchend'].forEach(evt => {
            document.body.addEventListener(evt, unlockAudio, { passive: true });
        });"""

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()

    # Update audio tag
    content = content.replace('<audio id="bg-music" preload="none">', '<audio id="bg-music" loop preload="auto">')
    
    # Remove old internal listener
    internal_listener = """            document.body.addEventListener('click', () => {
                if (bgMusic && bgMusic.paused && !bgMusic.muted) bgMusic.play().catch(e => console.log(e));
            }, { once: true });"""
    internal_listener_2 = """            document.body.addEventListener('click', () => {
                if (bgMusic.paused && !bgMusic.muted) bgMusic.play().catch(e => console.log(e));
            }, { once: true });"""
    content = content.replace(internal_listener, "")
    content = content.replace(internal_listener_2, "")

    # Replace end listener
    end_listener_pattern = r"        document\.body\.addEventListener\('click', \(\) => \{\n            const bgMusic.*?\n.*?\n.*?\n.*?\n        \}, \{ once: true \}\);"
    content = re.sub(end_listener_pattern, unlock_block, content, flags=re.DOTALL)
    
    # If it wasn't replaced (maybe spacing differs), we can manually check
    
    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Updated {filepath}")

for f in files_to_fix:
    process_file(f)
