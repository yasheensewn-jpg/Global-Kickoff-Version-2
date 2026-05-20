import os

files = [
    'www/games/crossbar-challenge/game.js',
    'www/games/shoot-out/src/js/game.js',
    'www/games/dribble-slalom/main.js'
]

for fpath in files:
    with open(fpath, 'r') as f:
        content = f.read()

    # Find the line with OUT OF STAMINA
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'OUT OF STAMINA' in line:
            if 'crossbar' in fpath:
                lines[i] = "            showMessage('OUT OF STAMINA!<br><a onclick=\"window.location.href = &apos;../../features/locker-room/index.html?action=recovery&apos;;\" ontouchend=\"window.location.href = &apos;../../features/locker-room/index.html?action=recovery&apos;; event.preventDefault();\" style=\"cursor: pointer; font-size: 1.5rem; text-decoration: underline; color: #00d2ff; display: block; margin-top: 15px; pointer-events: auto;\">Recharge in Recovery Hub</a>', '#ff4757');"
            elif 'shoot-out' in fpath:
                lines[i] = "        overlayTitle.innerHTML = 'OUT OF STAMINA!<br><a onclick=\"window.location.href = &apos;../../features/locker-room/index.html?action=recovery&apos;;\" ontouchend=\"window.location.href = &apos;../../features/locker-room/index.html?action=recovery&apos;; event.preventDefault();\" style=\"cursor: pointer; font-size: 1.5rem; text-decoration: underline; color: #00d2ff; display: block; margin-top: 15px; pointer-events: auto;\">Recharge in Recovery Hub</a>';"
            elif 'dribble-slalom' in fpath:
                lines[i] = "                  resultText.innerHTML = 'OUT OF STAMINA!<br><a onclick=\"window.location.href = &apos;../../features/locker-room/index.html?action=recovery&apos;;\" ontouchend=\"window.location.href = &apos;../../features/locker-room/index.html?action=recovery&apos;; event.preventDefault();\" style=\"cursor: pointer; font-size: 1.5rem; text-decoration: underline; color: #00d2ff; display: block; margin-top: 15px; pointer-events: auto;\">Recharge in Recovery Hub</a>';"

    with open(fpath, 'w') as f:
        f.write('\n'.join(lines))

print("Fixed syntax")
