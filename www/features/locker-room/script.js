// Global Avatar Assets Data Structure (SRC format)
window.avatarAssets = {
    standardGear: {
        front: '../../assets/locker-room/images/avatars/base_front.png',
        back: '../../assets/locker-room/images/avatars/base_back.png'
    },
    specialMoves: [
        { id: 'sm_crossbar', name: 'Crossbar Challenge', src: '../../assets/locker-room/images/avatars/crossbar_target.png' },
        { id: 'sm_dribble', name: 'Dribble Slalom', src: '../../assets/locker-room/images/avatars/dribble_cone.png' },
        { id: 'sm_shootout', name: 'Shoot Out', src: '../../assets/locker-room/images/avatars/shoot_out_ball.png' }
    ],
    outfits: [
        { 
            id: 'beginner', 
            name: 'Beginner Gear', 
            cost: 0,
            owned: true,
            equipped: true,
            src: '../../assets/locker-room/images/avatars/base_front.png',
            poses: [
                { id: 'p0_front', name: 'Front View', src: '../../assets/locker-room/images/avatars/base_front.png' },
                { id: 'p0_back', name: 'Back View', src: '../../assets/locker-room/images/avatars/base_back.png' },
                { id: 'p_cel', name: 'Celebrate', src: '../../assets/locker-room/images/avatars/celebrate.png' },
                { id: 'p_jmp', name: 'Jump', src: '../../assets/locker-room/images/avatars/jump.png' },
                { id: 'p1', name: 'Downward Dog', src: '../../assets/locker-room/images/avatars/downward_dog.png' },
                { id: 'p2', name: 'Sit Stretch', src: '../../assets/locker-room/images/avatars/pose_sit_edit1.png' },
                { id: 'p3', name: 'Cobra Stretch', src: '../../assets/locker-room/images/avatars/pose_cobra.png' },
                { id: 'p4', name: 'Quad Stretch', src: '../../assets/locker-room/images/avatars/pose_quad.png' },
                { id: 'p5', name: 'Arm Stretch', src: '../../assets/locker-room/images/avatars/pose_arm.png' }
            ]
        },
        { 
            id: 'competitive', 
            name: 'Competitive Attire', 
            cost: 150,
            owned: false,
            equipped: false,
            src: '../../assets/locker-room/images/avatars/comp_front.png',
            poses: [
                { id: 'p0_front', name: 'Front View', src: '../../assets/locker-room/images/avatars/comp_front.png' },
                { id: 'p0_back', name: 'Back View', src: '../../assets/locker-room/images/avatars/comp_back.png' },
                { id: 'p_cel', name: 'Celebrate', src: '../../assets/locker-room/images/avatars/comp_celebrate.png' },
                { id: 'p_jmp', name: 'Jump', src: '../../assets/locker-room/images/avatars/comp_jump.png' },
                { id: 'p1', name: 'Downward Dog', src: '../../assets/locker-room/images/avatars/comp_downward_dog.png' },
                { id: 'p2', name: 'Sit Stretch', src: '../../assets/locker-room/images/avatars/comp_pose_sit_edit1.png' },
                { id: 'p3', name: 'Cobra Stretch', src: '../../assets/locker-room/images/avatars/comp_pose_cobra_edit1.png' },
                { id: 'p4', name: 'Quad Stretch', src: '../../assets/locker-room/images/avatars/comp_pose_quad.png' },
                { id: 'p5', name: 'Arm Stretch', src: '../../assets/locker-room/images/avatars/comp_pose_arm_edit1.png' }
            ]
        },
        { 
            id: 'beach', 
            name: 'Beach Style', 
            cost: 150,
            owned: false,
            equipped: false,
            src: '../../assets/locker-room/images/avatars/beach_front.png',
            poses: [
                { id: 'p0_front', name: 'Front View', src: '../../assets/locker-room/images/avatars/beach_front.png' },
                { id: 'p0_back', name: 'Back View', src: '../../assets/locker-room/images/avatars/beach_back.png' },
                { id: 'p_cel', name: 'Celebrate', src: '../../assets/locker-room/images/avatars/beach_celebrate.png' },
                { id: 'p_jmp', name: 'Jump', src: '../../assets/locker-room/images/avatars/beach_jump.png' },
                { id: 'p1', name: 'Downward Dog', src: '../../assets/locker-room/images/avatars/beach_downward_dog.png' },
                { id: 'p2', name: 'Sit Stretch', src: '../../assets/locker-room/images/avatars/beach_pose_sit_edit1.png' },
                { id: 'p3', name: 'Cobra Stretch', src: '../../assets/locker-room/images/avatars/beach_pose_cobra.png' },
                { id: 'p4', name: 'Quad Stretch', src: '../../assets/locker-room/images/avatars/beach_pose_quad.png' },
                { id: 'p5', name: 'Arm Stretch', src: '../../assets/locker-room/images/avatars/beach_pose_arm.png' }
            ]
        },
        { 
            id: 'suit', 
            name: 'Suited up', 
            cost: 150,
            owned: false,
            equipped: false,
            src: '../../assets/locker-room/images/avatars/suit_front.png',
            poses: [
                { id: 'p0_front', name: 'Front View', src: '../../assets/locker-room/images/avatars/suit_front.png' },
                { id: 'p0_back', name: 'Back View', src: '../../assets/locker-room/images/avatars/suit_back.png' },
                { id: 'p_cel', name: 'Celebrate', src: '../../assets/locker-room/images/avatars/suit_celebrate.png' },
                { id: 'p_jmp', name: 'Jump', src: '../../assets/locker-room/images/avatars/suit_jump.png' },
                { id: 'p1', name: 'Downward Dog', src: '../../assets/locker-room/images/avatars/suit_downward_dog.png' },
                { id: 'p2', name: 'Sit Stretch', src: '../../assets/locker-room/images/avatars/suit_sit_edit1.png' },
                { id: 'p3', name: 'Cobra Stretch', src: '../../assets/locker-room/images/avatars/suit_cobra.png' },
                { id: 'p4', name: 'Quad Stretch', src: '../../assets/locker-room/images/avatars/suit_quad.png' },
                { id: 'p5', name: 'Arm Stretch', src: '../../assets/locker-room/images/avatars/suit_arm_edit1.png' }
            ]
        }
    ],
    specialGear: [
        { id: 'sg_crossbar', name: 'Crossbar Challenge', src: '../../assets/locker-room/images/avatars/crossbar_target.png' },
        { id: 'sg_dribble', name: 'Dribble Slalom', src: '../../assets/locker-room/images/avatars/dribble_cone.png' },
        { id: 'sg_shootout', name: 'Shoot Out', src: '../../assets/locker-room/images/avatars/shoot_out_ball.png' }
    ],
    recoveryHub: [
        { id: 'rh1', name: 'Stamina regeneration', src: '../../assets/locker-room/yoga_mat.png' }
    ],
    developerOptions: []
};

// Placeholder State Management for the Locker Room
const gameState = {
    player: {
        name: "Ash",
        level: 12,
        coins: 1250
    },
    stats: [
        { id: 'xp', name: 'XP', value: '14,500', type: 'number' },
        { id: 'stamina', name: 'Stamina', value: 350, max: 500, type: 'slider', color: 'linear-gradient(90deg, #3b82f6, #06b6d4)' },
        { id: 'tokens', name: 'Tokens', value: 12, type: 'number' }
    ]
};

// DOM Elements
const elements = {
    playerName: document.getElementById('playerName'),
    coinBalance: document.getElementById('coinBalance'),
    statsContainer: document.getElementById('statsContainer'),
    movesCarousel: document.getElementById('movesCarousel'),
    gearCarousel: document.getElementById('gearCarousel'),
    posesCarousel: document.getElementById('posesCarousel'),
    outfitsCarousel: document.getElementById('outfitsCarousel'),
    heroImage: document.querySelector('.avatar-image'),
    prevPoseBtn: document.getElementById('prevPoseBtn'),
    nextPoseBtn: document.getElementById('nextPoseBtn'),
    inventoryDrawer: document.getElementById('inventoryDrawer'),
    openDrawerBtn: document.getElementById('openDrawerBtn'),
    closeDrawerBtn: document.getElementById('closeDrawerBtn'),
    drawerOverlay: document.getElementById('drawerOverlay'),
    recoveryCarousel: document.getElementById('recoveryCarousel'),
    developerCarousel: document.getElementById('developerCarousel')
};

let currentPoseIndex = 0;
let isPreviewing = false;
let activeOutfit = window.avatarAssets.outfits[0];

// Initialize UI
function initUI() {
    // Header
    if (window.GK_State && window.GK_State.profile && window.GK_State.profile["avatar name"]) {
        gameState.player.name = window.GK_State.profile["avatar name"];
    } else if (window.GK_State && window.GK_State.player && window.GK_State.player.name) {
        gameState.player.name = window.GK_State.player.name;
    } else {
        gameState.player.name = 'Guest Player';
    }
    elements.playerName.textContent = gameState.player.name;
    if (elements.coinBalance) {
        const currentTokens = window.GK_State?.economy?.tokens || gameState.player.coins || 0;
        elements.coinBalance.textContent = currentTokens.toLocaleString();
    }

    // Name Change Logic
    elements.playerName.addEventListener('blur', validateAndSaveName);
    elements.playerName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.playerName.blur();
        }
    });

    function validateAndSaveName() {
        const newName = elements.playerName.textContent;
        if (!newName || newName.trim() === '') {
            elements.playerName.textContent = gameState.player.name;
            return;
        }

        // Basic profanity filter
        const swearWords = /\b(fuck|shit|bitch|ass|cunt|dick|nigger|nigga|faggot|whore|slut)\b/i;
        if (swearWords.test(newName)) {
            alert('Please choose a more appropriate name.');
            elements.playerName.textContent = gameState.player.name;
            return;
        }

        gameState.player.name = newName.trim().substring(0, 15); // Max 15 chars
        elements.playerName.textContent = gameState.player.name;
        
        if (window.GK_State) {
            if (!window.GK_State.player) window.GK_State.player = {};
            if (!window.GK_State.profile) window.GK_State.profile = {};
            
            window.GK_State.player.name = gameState.player.name;
            window.GK_State.profile["avatar name"] = gameState.player.name;
            if (window.saveGameState) {
                window.saveGameState(true);
            }
        }
    }

    // Stats
    renderStats();

    // DIRECT LOCAL STORAGE READ
    let savedOutfitId = localStorage.getItem('gk_equipped_outfit') || window.GK_State?.player?.equippedOutfitId || 'beginner';
    if (savedOutfitId === 'basic') savedOutfitId = 'beginner'; 
    
    // Ensure global state matches the hard save
    if (window.GK_State && window.GK_State.player) {
        window.GK_State.player.equippedOutfitId = savedOutfitId;
    }
    
    const ownedOutfits = window.GK_State?.player?.ownedOutfits || ['beginner'];
    window.avatarAssets.outfits.forEach(o => {
        if (ownedOutfits.includes(o.id) || o.id === 'beginner') o.owned = true;
        o.equipped = (o.id === savedOutfitId);
    });
    
    activeOutfit = window.avatarAssets.outfits.find(o => o.id === savedOutfitId) || window.avatarAssets.outfits[0];

    // Set Default Hero Image
    if (elements.heroImage) {
        const frontPose = activeOutfit.poses.find(p => p.id === 'p0_front') || activeOutfit.poses[0];
        elements.heroImage.src = frontPose.src;
    }

    if (elements.prevPoseBtn) elements.prevPoseBtn.style.display = 'block';
    if (elements.nextPoseBtn) elements.nextPoseBtn.style.display = 'block';

    // View Toggle Logic
    if (elements.prevPoseBtn) {
        elements.prevPoseBtn.addEventListener('click', () => {
            if (isPreviewing) return; // Prevent toggle during preview
            currentPoseIndex--;
            if (currentPoseIndex < 0) currentPoseIndex = activeOutfit.poses.length - 1;
            elements.heroImage.src = activeOutfit.poses[currentPoseIndex].src;
        });
    }

    if (elements.nextPoseBtn) {
        elements.nextPoseBtn.addEventListener('click', () => {
            if (isPreviewing) return; // Prevent toggle during preview
            currentPoseIndex++;
            if (currentPoseIndex >= activeOutfit.poses.length) currentPoseIndex = 0;
            elements.heroImage.src = activeOutfit.poses[currentPoseIndex].src;
        });
    }

    // Setup Game Selectors per Category
    const gameSelectorContainers = document.querySelectorAll('.game-selector-container');
    gameSelectorContainers.forEach(container => {
        const category = container.getAttribute('data-category'); // 'moves' or 'gear'
        const buttons = container.querySelectorAll('.game-select-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'white';
                });
                
                btn.classList.add('active');
                btn.style.background = '#38ef7d';
                btn.style.color = 'black';
                
                const selectedGame = btn.getAttribute('data-game');
                renderMasterLockerRoom(category, selectedGame);
            });
        });
    });

    // Initial Render
    renderMasterLockerRoom('moves', 'crossbar');
    renderMasterLockerRoom('gear', 'crossbar');
    if (elements.outfitsCarousel) {
        renderInventory(window.avatarAssets.outfits, elements.outfitsCarousel);
    }
    if (elements.posesCarousel) {
        renderInventory(activeOutfit.poses, elements.posesCarousel);
    }
    if (elements.recoveryCarousel) {
        renderInventory(window.avatarAssets.recoveryHub, elements.recoveryCarousel);
    }
    if (elements.developerCarousel) {
        renderInventory(window.avatarAssets.developerOptions, elements.developerCarousel);
    }
    
    // Drawer Toggle Logic
    if (elements.openDrawerBtn) {
        elements.openDrawerBtn.addEventListener('click', () => {
            elements.inventoryDrawer.style.right = '0px';
            elements.drawerOverlay.style.display = 'block';
            setTimeout(() => elements.drawerOverlay.classList.add('active'), 10);
        });
    }

    const closeDrawer = () => {
        elements.inventoryDrawer.style.right = '-100%';
        elements.drawerOverlay.classList.remove('active');
        setTimeout(() => { elements.drawerOverlay.style.display = 'none'; }, 300);
    };

    if (elements.closeDrawerBtn) elements.closeDrawerBtn.addEventListener('click', closeDrawer);
    if (elements.drawerOverlay) elements.drawerOverlay.addEventListener('click', closeDrawer);

    // Accordion Toggle Logic
    document.querySelectorAll('.toggle-header').forEach(header => {
        header.addEventListener('click', () => {
            header.parentElement.classList.toggle('collapsed');
        });
    });

    const devSelectAnyOutfit = document.getElementById('devSelectAnyOutfit');
    if (devSelectAnyOutfit) {
        devSelectAnyOutfit.addEventListener('change', () => {
            renderInventory(window.avatarAssets.outfits, elements.outfitsCarousel);
        });
    }
}

function renderStats() {
    // Safely fetch from the global state, defaulting to 0 if the object isn't perfectly hydrated
    const currentTokens = window.GK_State?.economy?.tokens || 0;
    const currentXP = window.GK_State?.economy?.xp || 0;
    const currentStamina = window.GK_State?.player?.currentStamina || 0;

    const staminaPercentage = Math.min(100, Math.max(0, (currentStamina / 500) * 100));

    // Sync Slider Drawer Stats
    const globalTokens = document.getElementById('global-tokens');
    const globalXp = document.getElementById('global-xp');
    const globalStamina = document.getElementById('global-stamina');
    const globalStaminaBar = document.getElementById('global-stamina-bar');
    
    if (globalTokens) globalTokens.innerText = currentTokens.toLocaleString();
    if (globalXp) globalXp.innerText = currentXP.toLocaleString();
    if (globalStamina) globalStamina.innerText = currentStamina;
    if (globalStaminaBar) globalStaminaBar.style.width = staminaPercentage + '%';

    // If stats container hasn't been initialized with our specific elements yet
    if (!elements.statsContainer.querySelector('.stats-initialized')) {
        elements.statsContainer.innerHTML = `
            <div class="stats-initialized" style="padding: 15px; text-align: center; border-bottom: 2px solid #00d2ff; margin-bottom: 20px; display: flex; justify-content: space-around;">
                <div>
                    <div style="color: #888; font-size: 12px; font-weight: bold; letter-spacing: 1px;">TOKENS</div>
                    <div id="lockerTokenDisplay" style="color: #ffd700; font-size: 24px; font-weight: bold; margin-top: 5px;">${currentTokens.toLocaleString()}</div>
                </div>
                <div>
                    <div style="color: #888; font-size: 12px; font-weight: bold; letter-spacing: 1px;">TOTAL XP</div>
                    <div id="lockerXpDisplay" style="color: #00ff00; font-size: 24px; font-weight: bold; margin-top: 5px;">${currentXP.toLocaleString()}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px; padding: 0 15px;">
                <div id="lockerStaminaText" style="font-weight: bold; font-family: sans-serif; margin-bottom: 8px; font-size: 1rem; color: white;">Stamina: ${currentStamina}/500</div>
                <div style="width: 100%; height: 20px; background: #444; border-radius: 8px; overflow: hidden;">
                    <div class="progress-bar-fill" id="lockerStaminaBar" style="width: 0%; height: 100%; background: #38ef7d; transition: width 0.3s ease;" data-target="${staminaPercentage}"></div>
                </div>
                <div style="font-size: 11px; color: #aaa; margin-top: 8px; line-height: 1.3; text-align: center; font-family: sans-serif;">Increase your stamina in the recovery hub to keep playing. Otherwise wait for the daily stamina reset.</div>
            </div>
        `;

        // Animate progress bars on initial load
        setTimeout(() => {
            const bar = document.getElementById('lockerStaminaBar');
            if (bar) bar.style.width = bar.getAttribute('data-target') + '%';
        }, 100);
    } else {
        // Just update values in place to avoid UI blinking
        const tokenDisplay = document.getElementById('lockerTokenDisplay');
        const xpDisplay = document.getElementById('lockerXpDisplay');
        const staminaText = document.getElementById('lockerStaminaText');
        const staminaBar = document.getElementById('lockerStaminaBar');

        if (tokenDisplay) tokenDisplay.innerText = currentTokens.toLocaleString();
        if (xpDisplay) xpDisplay.innerText = currentXP.toLocaleString();
        if (staminaText) staminaText.innerText = `Stamina: ${currentStamina}/500`;
        if (staminaBar) {
            staminaBar.setAttribute('data-target', staminaPercentage);
            staminaBar.style.width = staminaPercentage + '%';
        }
    }
}

window.updateHUD = function() {
    renderStats();
    const stateName = window.GK_State?.profile?.["avatar name"] || window.GK_State?.player?.name;
    if (stateName) {
        gameState.player.name = stateName;
        if (elements.playerName) {
            elements.playerName.textContent = gameState.player.name;
        }
    }
};

window.addEventListener('gk_state_updated', () => {
    if (typeof window.updateHUD === 'function') {
        window.updateHUD();
    }
});

window.purchaseOutfit = function(outfitId, cost) {
    if (window.GK_State.economy.tokens >= cost) {
        window.GK_State.economy.tokens -= cost;
        const outfit = window.avatarAssets.outfits.find(o => o.id === outfitId);
        if (outfit) outfit.owned = true;
        
        window.GK_State.player = window.GK_State.player || {};
        window.GK_State.player.ownedOutfits = window.GK_State.player.ownedOutfits || ['beginner'];
        if (!window.GK_State.player.ownedOutfits.includes(outfitId)) {
            window.GK_State.player.ownedOutfits.push(outfitId);
        }

        if (typeof window.saveGameState === 'function') window.saveGameState(true);
        if (typeof window.syncToCloud === 'function') window.syncToCloud();
        renderInventory(window.avatarAssets.outfits, elements.outfitsCarousel);
        renderStats();
    } else {
        if (window.showGKNotification) {
            window.showGKNotification('Not enough tokens!', true);
        } else {
            alert("Not enough tokens to purchase this outfit.");
        }
    }
};

window.equipOutfit = function(outfitId) {
    if (outfitId === 'basic') outfitId = 'beginner'; // Legacy failsafe
    
    // 1. HARD SAVE DIRECT TO LOCAL STORAGE
    localStorage.setItem('gk_equipped_outfit', outfitId);

    // 2. Update visual assets
    window.avatarAssets.outfits.forEach(o => o.equipped = (o.id === outfitId));
    const selectedOutfit = window.avatarAssets.outfits.find(o => o.id === outfitId);
    
    if (selectedOutfit) {
        activeOutfit = selectedOutfit;
        const heroImage = document.querySelector('.avatar-image');
        if (heroImage) {
            const frontPose = activeOutfit.poses.find(p => p.id === 'p0_front') || activeOutfit.poses[0];
            heroImage.src = frontPose.src;
        }
        currentPoseIndex = 0;
        isPreviewing = false;
        
        const posesCarousel = document.getElementById('posesCarousel');
        if (posesCarousel) renderInventory(activeOutfit.poses, posesCarousel);
        
        const prevBtn = document.getElementById('prevPoseBtn');
        const nextBtn = document.getElementById('nextPoseBtn');
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    // 3. Keep global state updated as a backup
    if (!window.GK_State) window.GK_State = {};
    if (!window.GK_State.player) window.GK_State.player = {};
    window.GK_State.player.equippedOutfitId = outfitId;
    if (window.GK_State.catalogues && window.GK_State.catalogues.outfits) {
        Object.keys(window.GK_State.catalogues.outfits).forEach(key => {
            window.GK_State.catalogues.outfits[key].equipped = (key === outfitId);
        });
    }
    if (typeof window.saveGameState === 'function') window.saveGameState(true);
    if (typeof window.syncToCloud === 'function') window.syncToCloud();
    
    // 4. Force UI refresh
    const outfitsCarousel = document.getElementById('outfitsCarousel');
    if (outfitsCarousel) renderInventory(window.avatarAssets.outfits, outfitsCarousel);
};

function renderInventory(items, container) {
    if (!container || !items) return;
    container.innerHTML = '';
    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'inventory-item';
        itemEl.dataset.id = item.id;
        let outfitBtnHTML = '';
        if (item.cost !== undefined) {
            let unlockAll = document.getElementById('devSelectAnyOutfit') && document.getElementById('devSelectAnyOutfit').checked;
            let isOwned = item.owned || unlockAll;
            if (!isOwned) {
                outfitBtnHTML = `<button style="padding:4px 8px; font-size:10px; background:#ffd700; color:#000; border:none; border-radius:4px; margin-top:5px; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); window.purchaseOutfit('${item.id}', ${item.cost})">Purchase (🪙 ${item.cost})</button>`;
            } else {
                let btnText = item.equipped ? 'Equipped' : 'Equip';
                let btnBg = item.equipped ? 'transparent' : 'rgba(56,239,125,0.2)';
                let btnCol = item.equipped ? '#888' : '#38ef7d';
                let disabledAttr = item.equipped ? 'disabled' : '';
                outfitBtnHTML = `<button ${disabledAttr} style="padding:4px 8px; font-size:10px; background:${btnBg}; color:${btnCol}; border:1px solid ${btnCol}; border-radius:4px; margin-top:5px; font-weight:bold; cursor:${item.equipped ? 'default' : 'pointer'}; position: relative; z-index: 20;" onclick="event.preventDefault(); event.stopPropagation(); window.equipOutfit('${item.id}')">${btnText}</button>`;
            }
        }

        itemEl.innerHTML = `
            <img class="item-thumbnail" src="${item.src}" alt="${item.name}" onerror="this.onerror = null; this.style.display = 'none';">
            <div class="item-name">${item.name}</div>
            ${outfitBtnHTML}
        `;
        
        itemEl.addEventListener('click', () => {
            // If this is the Stamina Regeneration item, launch recovery modal instead of standard preview
            if (item.id === 'rh1') {
                openRecoveryModal();
                return;
            }
            
            // Preview logic
            container.querySelectorAll('.inventory-item').forEach(el => el.classList.remove('selected'));
            itemEl.classList.add('selected');
            
            isPreviewing = true;
            if (elements.heroImage) {
                elements.heroImage.src = item.src;
            }
            if (elements.prevPoseBtn) {
                elements.prevPoseBtn.style.display = 'none'; // Dynamically hide the arrows
            }
            if (elements.nextPoseBtn) {
                elements.nextPoseBtn.style.display = 'none';
            }

            // Outfit Swap Logic: Update poses if this item is an outfit
            if (item.poses) {
                activeOutfit = item;
                currentPoseIndex = 0; // reset to front view
                if (elements.posesCarousel) {
                    renderInventory(item.poses, elements.posesCarousel);
                }
            }
        });
        container.appendChild(itemEl);
    });
}

function renderMasterLockerRoom(activeCategory, activeGame) {
    const containerId = activeCategory === 'moves' ? 'movesCarousel' : 'gearCarousel';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!window.GK_State || !window.GK_State.catalogues[activeGame] || !window.GK_State.catalogues[activeGame][activeCategory]) {
        return;
    }
    
    const items = window.GK_State.catalogues[activeGame][activeCategory];
    
    Object.entries(items).forEach(([itemId, item]) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'inventory-item';
        itemEl.style.flexDirection = 'column';
        itemEl.style.alignItems = 'stretch';
        itemEl.style.padding = '10px';
        itemEl.style.gap = '8px';
        itemEl.style.height = 'auto'; // override fixed height
        
        const iconHTML = item.icon ? `<div style="font-size: 32px; text-align: center;">${item.icon}</div>` : '';
        
        let buttonHTML = '';
        if (!item.owned) {
            buttonHTML = `<button style="padding: 8px; background: #ffd700; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: auto;">Purchase (🪙 ${item.cost})</button>`;
        } else {
            if (activeCategory === 'moves' || (activeCategory === 'gear' && (activeGame === 'slalom' || activeGame === 'crossbar'))) {
                buttonHTML = `<button disabled style="padding: 8px; background: #333; color: #888; border: none; border-radius: 4px; font-weight: bold; cursor: not-allowed; margin-top: auto;">Purchased</button>`;
            } else {
                const btnText = item.equipped ? 'Unequip' : 'Equip';
                const btnBg = item.equipped ? 'rgba(255,71,87,0.2)' : 'rgba(56,239,125,0.2)';
                const btnCol = item.equipped ? '#ff4757' : '#38ef7d';
                buttonHTML = `<button style="padding: 8px; background: ${btnBg}; color: ${btnCol}; border: 1px solid ${btnCol}; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: auto;">${btnText}</button>`;
            }
        }

        itemEl.innerHTML = `
            ${iconHTML}
            <div class="item-name" style="text-align: center; margin-bottom: 5px; font-weight: bold;">${item.name}</div>
            <div style="font-size: 11px; color: #888; text-align: center; margin-bottom: 5px; line-height: 1.2;">${item.desc || ''}</div>
            ${buttonHTML}
        `;
        
        const btn = itemEl.querySelector('button');
        if (btn) {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (!item.owned) {
                    if (window.purchaseItem && window.purchaseItem(activeGame, activeCategory, itemId)) {
                        renderStats();
                        renderMasterLockerRoom(activeCategory, activeGame);
                    } else {
                        // Handled globally by window.purchaseItem notification toast
                    }
                } else {
                    if (!(activeCategory === 'moves' || (activeCategory === 'gear' && (activeGame === 'slalom' || activeGame === 'crossbar')))) {
                        item.equipped = !item.equipped;
                        if (window.saveGameState) window.saveGameState();
                        renderMasterLockerRoom(activeCategory, activeGame);
                    }
                }
            };
        }
        
        container.appendChild(itemEl);
    });
}

// Recovery Modal Logic
let recoveryTimerInterval = null;
let wakeLock = null;

const requestWakeLock = async () => {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        }
    } catch (err) {
        console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    }
};

const releaseWakeLock = async () => {
    if (wakeLock !== null) {
        await wakeLock.release();
        wakeLock = null;
        console.log('Wake Lock released');
    }
};

document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});

function openRecoveryModal() {
    const modal = document.getElementById('recoveryModal');
    const imageEl = document.getElementById('recoveryImage');
    const timerEl = document.getElementById('recoveryTimer');
    const messageEl = document.getElementById('recoveryMessage');
    const beginBtn = document.getElementById('beginRecoveryBtn');
    const endBtn = document.getElementById('endRecoveryBtn');
    const instructionEl = document.getElementById('recoveryInstruction');
    
    // Reset state
    timerEl.textContent = '01:00';
    messageEl.style.display = 'none';
    if (instructionEl) instructionEl.style.display = 'block';
    endBtn.style.display = 'none';
    beginBtn.style.display = 'block';
    beginBtn.disabled = false;
    imageEl.style.opacity = 0;
    
    // Set initial image (front base pose)
    imageEl.src = activeOutfit.src;
    setTimeout(() => imageEl.style.opacity = 1, 50);

    // Move sound toggle button into the header placeholder
    const soundBtn = document.getElementById('soundToggleBtn');
    const placeholder = document.getElementById('soundBtnPlaceholder');
    if (soundBtn && placeholder) {
        placeholder.appendChild(soundBtn);
        soundBtn.style.position = 'relative';
        soundBtn.style.top = '0';
        soundBtn.style.left = '0';
    }
    
    // Prevent screen timeout
    requestWakeLock();

    modal.classList.add('active');
}

document.getElementById('beginRecoveryBtn').addEventListener('click', () => {
    const maxStamina = window.GK_State?.player?.maxStamina || 500;
    const currentStamina = window.GK_State?.player?.currentStamina || 0;
    if (currentStamina >= maxStamina) {
        if (window.showGKNotification) {
            window.showGKNotification('Stamina is already full!', true);
        }
        return;
    }
    const beginBtn = document.getElementById('beginRecoveryBtn');
    const endBtn = document.getElementById('endRecoveryBtn');
    const timerEl = document.getElementById('recoveryTimer');
    const imageEl = document.getElementById('recoveryImage');
    const messageEl = document.getElementById('recoveryMessage');
    const instructionEl = document.getElementById('recoveryInstruction');
    
    beginBtn.disabled = true;
    beginBtn.style.display = 'none';
    if (instructionEl) instructionEl.style.display = 'none';
    
    const returnToGameBtn = document.getElementById('returnToGameBtn');
    if (returnToGameBtn) returnToGameBtn.style.display = 'none';
    
    // Gather all stretch poses from active outfit (exclude basic ones like front/back/jump/celebrate)
    // Looking at poses, stretches are usually Downward Dog (p1), Sit Stretch (p2), Cobra (p3), Quad (p4), Arm (p5)
    const stretchPoses = activeOutfit.poses.filter(p => p.id.startsWith('p') && p.id !== 'p0_front' && p.id !== 'p0_back' && p.id !== 'p_cel' && p.id !== 'p_jmp');
    
    // Randomize 3 distinct stretches
    const shuffled = stretchPoses.sort(() => 0.5 - Math.random());
    const selectedStretches = shuffled.slice(0, 3);
    
    // Fallback if there aren't enough stretches
    while(selectedStretches.length < 3) {
        selectedStretches.push(activeOutfit.poses[0] || activeOutfit);
    }
    
    // Show first stretch immediately
    imageEl.style.opacity = 0;
    setTimeout(() => {
        imageEl.src = selectedStretches[0].src;
        imageEl.style.opacity = 1;
    }, 500);

    let timeLeft = 60;
    
    recoveryTimerInterval = setInterval(() => {
        timeLeft--;
        
        // Format time mm:ss
        const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const sec = (timeLeft % 60).toString().padStart(2, '0');
        timerEl.textContent = `${min}:${sec}`;
        
        // Change image at 40s
        if (timeLeft === 40) {
            imageEl.style.opacity = 0;
            setTimeout(() => {
                imageEl.src = selectedStretches[1].src;
                imageEl.style.opacity = 1;
            }, 500);
        }
        
        // Change image at 20s
        if (timeLeft === 20) {
            imageEl.style.opacity = 0;
            setTimeout(() => {
                imageEl.src = selectedStretches[2].src;
                imageEl.style.opacity = 1;
            }, 500);
        }
        
        // End recovery
        if (timeLeft <= 0) {
            clearInterval(recoveryTimerInterval);
            timerEl.textContent = '00:00';
            
            // Explicitly restore the global state variable
            if (window.GK_State && window.GK_State.player) {
                window.GK_State.player.currentStamina = window.GK_State.player.maxStamina || 500;
            }
            // Force the system to save locally and sync to the cloud
            if (window.saveGameState) {
                window.saveGameState(true);
            }
            // Update local UI
            if (typeof renderStats === 'function') {
                renderStats();
            }

            messageEl.style.display = 'block';
            endBtn.style.display = 'block';
            
            const returnToGameBtn = document.getElementById('returnToGameBtn');
            if (returnToGameBtn) returnToGameBtn.style.display = 'block';
        }
    }, 1000);
});

function closeRecoveryModal() {
    if (recoveryTimerInterval) {
        clearInterval(recoveryTimerInterval);
        recoveryTimerInterval = null;
    }
    const modal = document.getElementById('recoveryModal');
    modal.classList.remove('active');
    
    // Reset sound toggle button position back to body
    const soundBtn = document.getElementById('soundToggleBtn');
    const appContainer = document.querySelector('.app-container');
    if (soundBtn && appContainer) {
        appContainer.appendChild(soundBtn);
        soundBtn.style.position = 'absolute';
        soundBtn.style.top = 'calc(var(--ios-safe-top, env(safe-area-inset-top, 0px)) + 65px)';
        soundBtn.style.left = '15px';
    }
    
    // Release wake lock to allow screen timeout again
    releaseWakeLock();
}

document.getElementById('exitRecoveryBtn').addEventListener('click', () => {
    closeRecoveryModal();
});

document.getElementById('endRecoveryBtn').addEventListener('click', () => {
    closeRecoveryModal();
    
    // Restore Stamina globally
    if (typeof window.addStamina === 'function') {
        window.addStamina(200); // Add 200 stamina
    } else {
        const staminaStat = gameState.stats.find(s => s.id === 'stamina');
        if (staminaStat) {
            staminaStat.value = Math.min(staminaStat.max, staminaStat.value + 200);
        }
    }
    renderStats();
});

// Start
document.addEventListener('DOMContentLoaded', () => {
    initUI();
    const urlParams = new URLSearchParams(window.location.search);
    
    const returnTo = urlParams.get('returnTo');
    if (returnTo) {
        const returnBtn = document.createElement('button');
        returnBtn.id = 'returnToGameBtn';
        returnBtn.className = 'primary-button';
        returnBtn.textContent = 'Back to Game';
        returnBtn.style.marginTop = '10px';
        returnBtn.style.background = 'linear-gradient(135deg, #00d2ff, #3a7bd5)';
        
        let targetHref = '';
        if (returnTo === 'shootout') targetHref = '../../games/shoot-out/index.html';
        else if (returnTo === 'slalom') targetHref = '../../games/dribble-slalom/index.html';
        else if (returnTo === 'crossbar') targetHref = '../../games/crossbar-challenge/index.html';
        
        returnBtn.addEventListener('click', () => {
            window.location.href = targetHref;
        });
        
        const actionsContainer = document.querySelector('.recovery-actions');
        if (actionsContainer) {
            actionsContainer.appendChild(returnBtn);
        }
    }

    if (urlParams.get('action') === 'recovery') {
        setTimeout(openRecoveryModal, 200);
    }
});

// Developer Economy Option Functions
window.modifyStatByPercentage = function(statName, percentage) {
    if (!window.GK_State) return;
    
    if (statName === 'xp') {
        window.GK_State.economy = window.GK_State.economy || {};
        let current = window.GK_State.economy.xp || 0;
        window.GK_State.economy.xp = Math.max(0, Math.round(current + (current * (percentage / 100))));
    } else if (statName === 'tokens') {
        window.GK_State.economy = window.GK_State.economy || {};
        let current = window.GK_State.economy.tokens || 0;
        window.GK_State.economy.tokens = Math.max(0, Math.round(current + (current * (percentage / 100))));
    } else if (statName === 'stamina') {
        window.GK_State.player = window.GK_State.player || {};
        let current = window.GK_State.player.currentStamina || 0;
        let change = Math.round(current * (percentage / 100));
        window.GK_State.player.currentStamina = Math.min(500, Math.max(0, current + change));
    }
    
    if (window.saveGameState) window.saveGameState();
    renderStats();
};

window.addXP = function(amount) {
    if (!window.GK_State) return;
    window.GK_State.economy = window.GK_State.economy || {};
    window.GK_State.economy.xp = Math.max(0, (window.GK_State.economy.xp || 0) + amount);
    if (window.saveGameState) window.saveGameState();
    renderStats();
};

window.addTokens = function(amount) {
    if (!window.GK_State) return;
    window.GK_State.economy = window.GK_State.economy || {};
    window.GK_State.economy.tokens = Math.max(0, (window.GK_State.economy.tokens || 0) + amount);
    if (window.saveGameState) window.saveGameState();
    renderStats();
};

window.addStamina = function(amount) {
    if (!window.GK_State) return;
    window.GK_State.player = window.GK_State.player || {};
    let current = window.GK_State.player.currentStamina || 0;
    window.GK_State.player.currentStamina = Math.min(500, Math.max(0, current + amount));
    if (window.saveGameState) window.saveGameState();
    renderStats();
};

// Intercept Android hardware back button
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
        window.location.href = '../../menu.html';
    });
}
