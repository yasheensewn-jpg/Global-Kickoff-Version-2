import re

with open('features/locker-room/index.html', 'r') as f:
    content = f.read()

# 1. Replace the Stat Board section with the new Tab System
tab_system = """            <!-- Native Tab Bar -->
            <div class="locker-tab-bar" style="display: flex; background: #222; border-radius: 12px; overflow: hidden; margin-bottom: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                <button class="locker-tab active" onclick="switchLockerTab('tab-stats')" style="flex: 1; padding: 12px 5px; border: none; background: #38ef7d; color: black; font-weight: bold; cursor: pointer; font-size: 14px;">Stats</button>
                <button class="locker-tab" onclick="switchLockerTab('tab-moves')" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; font-weight: bold; cursor: pointer; font-size: 14px;">Moves</button>
                <button class="locker-tab" onclick="switchLockerTab('tab-gear')" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; font-weight: bold; cursor: pointer; font-size: 14px;">Gear</button>
                <button class="locker-tab" onclick="switchLockerTab('tab-poses')" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; font-weight: bold; cursor: pointer; font-size: 14px;">Poses</button>
                <button class="locker-tab" onclick="switchLockerTab('tab-outfits')" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; font-weight: bold; cursor: pointer; font-size: 14px;">Outfits</button>
            </div>

            <!-- Tab Contents -->
            <div id="tab-stats" class="locker-tab-content" style="display: block;">
                <!-- 3. Stat Board -->
                <section class="stat-board" style="flex-shrink: 0; background: #222; border-radius: 12px; overflow: hidden; margin-bottom: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    <div id="statsContainer">
                        <!-- Stats injected via JS -->
                    </div>
                </section>
                
                <div style="background: #222; padding: 15px; text-align: center; border-radius: 12px; margin-bottom: 15px; display: flex; justify-content: space-around; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    <div>
                        <div style="color: #888; font-size: 12px; font-weight: bold; letter-spacing: 1px;">TOKENS</div>
                        <div id="global-tokens" style="color: #ffd700; font-size: 24px; font-weight: bold; margin-top: 5px;">0</div>
                    </div>
                    <div>
                        <div style="color: #888; font-size: 12px; font-weight: bold; letter-spacing: 1px;">TOTAL XP</div>
                        <div id="global-xp" style="color: #00ff00; font-size: 24px; font-weight: bold; margin-top: 5px;">0</div>
                    </div>
                </div>
                
                <div style="background: #222; padding: 15px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    <div style="font-weight: bold; font-family: sans-serif; margin-bottom: 8px; font-size: 1rem; color: white;">Stamina: <span id="global-stamina">500</span>/500</div>
                    <div style="width: 100%; height: 20px; background: #444; border-radius: 8px; overflow: hidden;">
                        <div id="global-stamina-bar" style="width: 100%; height: 100%; background: #38ef7d; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            </div>

            <div id="tab-moves" class="locker-tab-content" style="display: none;">
                <div class="game-selector-container" data-category="moves" style="display: flex; gap: 5px; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 8px; width: 100%;">
                    <button class="game-select-btn active" data-game="crossbar" style="flex: 1; padding: 12px 5px; border: none; background: #38ef7d; color: black; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Crossbar</button>
                    <button class="game-select-btn" data-game="shootout" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Shootout</button>
                    <button class="game-select-btn" data-game="slalom" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Slalom</button>
                </div>
                <div class="vertical-list" id="movesCarousel" style="width: 100%; justify-content: center;"></div>
            </div>

            <div id="tab-gear" class="locker-tab-content" style="display: none;">
                <div class="game-selector-container" data-category="gear" style="display: flex; gap: 5px; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 5px; border-radius: 8px; width: 100%;">
                    <button class="game-select-btn active" data-game="crossbar" style="flex: 1; padding: 12px 5px; border: none; background: #38ef7d; color: black; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Crossbar</button>
                    <button class="game-select-btn" data-game="shootout" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Shootout</button>
                    <button class="game-select-btn" data-game="slalom" style="flex: 1; padding: 12px 5px; border: none; background: transparent; color: white; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px;">Slalom</button>
                </div>
                <div class="vertical-list" id="gearCarousel" style="width: 100%; justify-content: center;"></div>
            </div>

            <div id="tab-poses" class="locker-tab-content" style="display: none;">
                <div class="vertical-list" id="posesCarousel" style="width: 100%; justify-content: center;"></div>
            </div>

            <div id="tab-outfits" class="locker-tab-content" style="display: none;">
                <div class="vertical-list" id="outfitsCarousel" style="width: 100%; justify-content: center;"></div>
            </div>"""

stat_board_pattern = r'<!-- 3\. Stat Board -->\s*<section class="stat-board".*?</section>'
content = re.sub(stat_board_pattern, tab_system, content, flags=re.DOTALL)

# 2. Clean out the old drawer and modals
drawer_start = content.find('<!-- 4. Customisation Drawer -->')
drawer_overlay = content.find('<!-- Drawer Overlay -->')
end_of_overlay = content.find('<!-- Recovery Modal Overlay -->')

new_drawer = """<!-- 4. Customisation Drawer -->
        <aside id="inventoryDrawer" style="position: absolute; top: 0; right: -100%; width: 70%; max-width: 350px; height: 100%; background: #222; z-index: 10000; transition: right 0.3s ease-in-out; box-shadow: -5px 0 15px rgba(0,0,0,0.5); padding: 20px; color: white; display: flex; flex-direction: column; pointer-events: auto;">
            <div class="drawer-header" style="display: flex; justify-content: flex-end; align-items: center; padding-bottom: 15px; margin-bottom: 10px;">
                <button class="icon-button close-drawer-btn" id="closeDrawerBtn" aria-label="Close" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer; font-weight: bold; padding: 0;">X</button>
            </div>
            
            <div class="drawer-content" style="overflow-y: auto; flex: 1;">
                <div class="category-section" onclick="openRecoveryModal()" style="cursor: pointer; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">
                    <h3 class="category-title toggle-header" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
                        <span>Recovery Hub</span>
                        <span style="color: #888;">➔</span>
                    </h3>
                </div>
                <div class="category-section collapsed" id="devOptions">
                    <h3 class="category-title toggle-header">
                        <span>Developer Options</span>
                        <svg class="chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </h3>
                    <div class="collapsible-content">
                        <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer; background: #1a1a1a; padding: 10px; border-radius: 8px;">
                            <input type="checkbox" id="drawer-mute-audio" style="margin-right: 10px; width: 18px; height: 18px;" onchange="toggleGlobalAudio(this.checked)"> 
                            Mute All Audio
                        </label>
                        <label style="display: flex; align-items: center; margin-bottom: 15px; cursor: pointer; background: #1a1a1a; padding: 10px; border-radius: 8px;">
                            <input type="checkbox" id="devAnyOutfit" style="margin-right: 10px; width: 18px; height: 18px;"> 
                            Select any outfit
                        </label>
                        <button onclick="window.clearAllPurchases()" style="width: 100%; padding: 10px; background: #ff4757; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; margin-bottom: 15px; text-transform: uppercase;">Clear All Purchases</button>
                        
                        <h4 style="margin-top: 15px; margin-bottom: 10px; color: #ffd700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; padding: 0 15px;">Economy Modifiers</h4>
                        <div style="display: flex; gap: 10px; margin-bottom: 10px; padding: 0 15px;">
                            <button onclick="window.modifyStatByPercentage('xp', -5)" style="flex: 1; padding: 8px; background: #ff4757; color: white; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">-5% XP</button>
                            <button onclick="window.modifyStatByPercentage('xp', 5)" style="flex: 1; padding: 8px; background: #00ff00; color: black; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">+5% XP</button>
                            <button onclick="window.addXP(2500)" style="flex: 1; padding: 8px; background: #00ff00; color: black; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">+2500</button>
                        </div>
                        <div style="display: flex; gap: 10px; margin-bottom: 10px; padding: 0 15px;">
                            <button onclick="window.modifyStatByPercentage('tokens', -5)" style="flex: 1; padding: 8px; background: #ff4757; color: white; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">-5% TKN</button>
                            <button onclick="window.modifyStatByPercentage('tokens', 5)" style="flex: 1; padding: 8px; background: #ffd700; color: black; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">+5% TKN</button>
                            <button onclick="window.addTokens(2500)" style="flex: 1; padding: 8px; background: #ffd700; color: black; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">+2500</button>
                        </div>
                        <div style="display: flex; gap: 10px; margin-bottom: 15px; padding: 0 15px;">
                            <button onclick="window.modifyStatByPercentage('stamina', -5)" style="flex: 1; padding: 8px; background: #ff4757; color: white; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">-5% STM</button>
                            <button onclick="window.modifyStatByPercentage('stamina', 5)" style="flex: 1; padding: 8px; background: #38ef7d; color: black; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">+5% STM</button>
                            <button onclick="window.addStamina(200)" style="flex: 1; padding: 8px; background: #38ef7d; color: black; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">+200</button>
                        </div>
                        
                        <div class="carousel vertical-list" id="developerCarousel">
                            <!-- Items injected via JS -->
                        </div>
                        <button onclick="if(window.logoutUser) window.logoutUser('../../index.html'); else { localStorage.removeItem('gk_player_id'); window.location.href='../../index.html'; }" style="width: calc(100% - 30px); margin: 15px; padding: 12px; background: #ff4757; color: white; border: none; border-radius: 20px; font-weight: bold; cursor: pointer; text-transform: uppercase;">Log Out</button>
                    </div>
                </div>
            </div>

        </aside>
    </div>
    <!-- Drawer Overlay -->
    <div class="drawer-overlay" id="drawerOverlay" style="background: rgba(0,0,0,0.5); z-index: 9500;"></div>
"""

content = content[:drawer_start] + new_drawer + content[end_of_overlay:]

# 3. Add JS function for tabs right before closing </body>
tab_js = """
    <script>
        function switchLockerTab(targetId) {
            document.querySelectorAll('.locker-tab-content').forEach(el => el.style.display = 'none');
            document.getElementById(targetId).style.display = 'block';
            
            document.querySelectorAll('.locker-tab').forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = 'transparent';
                btn.style.color = 'white';
            });
            
            const activeBtn = Array.from(document.querySelectorAll('.locker-tab')).find(b => b.dataset.target === targetId || b.getAttribute('onclick').includes(targetId));
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.style.background = '#38ef7d';
                activeBtn.style.color = 'black';
            }
        }
    </script>
</body>
"""
content = content.replace('</body>', tab_js)

# And fix the audio block logic since we just overwrote index.html with the backup!
# Update audio tag
content = content.replace('<audio id="bg-music" preload="none">', '<audio id="bg-music" loop preload="auto">')
    
# Replace end listener
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

end_listener_pattern = r"        document\.body\.addEventListener\('click', \(\) => \{\n            if \(bgMusic\.paused && !bgMusic\.muted\) bgMusic\.play\(\)\.catch\(e => console\.log\(e\)\);\n        \}, \{ once: true \}\);"
content = re.sub(end_listener_pattern, unlock_block, content, flags=re.DOTALL)

with open('features/locker-room/index.html', 'w') as f:
    f.write(content)
