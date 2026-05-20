import glob

files = [
    'menu.html',
    'games/crossbar-challenge/index.html',
    'games/shoot-out/index.html',
    'games/dribble-slalom/index.html',
    'features/locker-room/index.html'
]

visibility_script = """
        // Pause audio when app is minimized/tab is switched
        document.addEventListener("visibilitychange", function() {
            const bgMusic = document.getElementById('bg-music');
            if (!bgMusic) return;
            
            if (document.hidden) {
                bgMusic.pause();
            } else {
                const isMuted = localStorage.getItem('gk_audio_muted') === 'true';
                if (!isMuted) {
                    bgMusic.play().catch(e => console.log('Resume playback failed:', e));
                }
            }
        });
"""

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    if "visibilitychange" not in content:
        content = content.replace('</script>\n</body>', visibility_script + '</script>\n</body>')
        with open(file, 'w') as f:
            f.write(content)
        print(f"Added to {file}")

