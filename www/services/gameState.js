
// --- Safe Area Fallback ---
(function() {
    var updateSafeArea = function() {
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        var isAndroidNative = window.Capacitor && window.Capacitor.getPlatform && window.Capacitor.getPlatform() === 'android';
        
        if (isIOS) {
            document.documentElement.style.setProperty('--ios-safe-top', '50px');
            document.documentElement.style.setProperty('--ios-safe-bottom', '30px');
            document.documentElement.classList.add('platform-ios');
        } else if (isAndroidNative) {
            document.documentElement.style.setProperty('--ios-safe-top', '40px');
            document.documentElement.style.setProperty('--ios-safe-bottom', '20px');
            document.documentElement.classList.add('platform-android');
        } else {
            document.documentElement.style.setProperty('--ios-safe-top', '0px');
            document.documentElement.style.setProperty('--ios-safe-bottom', '0px');
        }
    };
    
    updateSafeArea();
    document.addEventListener('DOMContentLoaded', updateSafeArea);
})();
// services/gameState.js

// AUDIO COMPRESSION REMINDER:
// All MP3 assets must be capped at 128kbps to reduce egress bandwidth costs 
// and improve initial load times for new players on cellular networks.
console.log("[GK_State] Audio Egress Optimization: Ensure all MP3s are <=128kbps.");
window.GK_State = {
    economy: {
        tokens: 0,
        xp: 0
    },
    player: {
        currentStamina: 500,
        maxStamina: 500,
        ownedOutfits: ['beginner'],
        equippedOutfitId: 'beginner'
    },
    catalogues: {
        crossbar: {
            moves: {
                'romeo_rocket': { name: 'Romeo Rocket', cost: 150, owned: false, icon: '🚀', desc: 'Explosive swipe attack.' },
                'scarlett_moonball': { name: 'Scarlett Moonball', cost: 150, owned: false, icon: '🌙', desc: 'Pattern tracing lob.' },
                'hi_jinx': { name: 'Hi Jinx', cost: 150, owned: false, icon: '🎭', desc: '3-orb trick shot.' }
            },
            gear: {
                'carbon_boots': { name: 'Carbon Spike Boots', cost: 150, owned: false, equipped: false, desc: 'Improves accuracy.' },
                'compression_shorts': { name: 'Compression Shorts', cost: 150, owned: false, equipped: false, desc: 'Improves accuracy.' }
            }
        },
        shootout: {
            moves: {
                'romeo_rocket': { name: 'Romeo Rocket', cost: 100, owned: false, icon: '🚀', desc: 'Scrub the screen to charge an explosive blast! (Reduces opponent hit count by 2).' },
                'lightning_ball': { name: 'Lightning Ball', cost: 100, owned: false, icon: '⚡', desc: 'Tap rapidly 10 times to summon a chain-lightning strike! (Reduces 1 hit on 2 opponents at once).' }
            },
            gear: {} 
        },
        slalom: {
            moves: {
                'ashDash': { name: 'Ash Dash', cost: 150, owned: false, icon: '🌀', desc: 'allows the user to skip ahead two cones.' },
                'chrisCross': { name: 'Chris Cross Control', cost: 150, owned: false, icon: '🛑', desc: 'reduces the effect of the environmental hazard.' },
                'zarasZap': { name: 'Zara\'s Zap', cost: 150, owned: false, icon: '✨', desc: 'stuns the ghost for 10 seconds.' }
            },
            gear: {
                'cleats': { name: 'Soft Ground Cleats', cost: 200, owned: false, equipped: false, desc: 'Neutralize environmental hazards.' },
                'shades': { name: 'Sun Shades', cost: 200, owned: false, equipped: false, desc: 'Neutralize sun glare hazards.' },
                'muffs': { name: 'Ear Muffs', cost: 200, owned: false, equipped: false, desc: 'Neutralize crowd noise hazards.' }
            }
        }
    },
    notifications: {
        seenShootOutUnlock: false
    },
    system: {
        lastResetDate: null
    }
};

const DEFAULT_STATE = window.GK_State;

// Initialize or load state
function initGameState() {
    let stateStr = localStorage.getItem('gk_state_v3');
    if (stateStr) {
        try {
            let savedState = JSON.parse(stateStr);
            // Deep merge saved state over the default GK_State structure
            window.GK_State = deepMerge(window.GK_State, savedState);
        } catch (e) {
            console.error("Failed to parse saved state", e);
        }
    }
    // Also check legacy if they had tokens/xp
    let legacyStr = localStorage.getItem('gk_state');
    if (legacyStr && !stateStr) {
        try {
            let legacyState = JSON.parse(legacyStr);
            window.GK_State.player.currentStamina = legacyState.stamina !== undefined ? legacyState.stamina : 500;
            window.GK_State.economy.xp = legacyState.xp || 0;
            window.GK_State.economy.tokens = legacyState.tokens || 250;
            window.GK_State.player.isInfiniteStamina = legacyState.isInfiniteStamina || false;
        } catch (e) {}
    }
    // Extra brace removed
    // Migrate game level progress into GK_State
    if (window.GK_State.player.crossbarLevel === undefined) {
        window.GK_State.player.crossbarLevel = parseInt(localStorage.getItem('gk_crossbar_max_level')) || 1;
    }
    if (window.GK_State.player.shootoutLevel === undefined) {
        window.GK_State.player.shootoutLevel = parseInt(localStorage.getItem('gk_shootout_max_level')) || 1;
    }
    if (window.GK_State.player.slalomLevel === undefined) {
        window.GK_State.player.slalomLevel = parseInt(localStorage.getItem('dribbleSlalomMaxLevel')) || 1;
    }
    
    saveGameState();
    
    // Check for daily midnight reset on load
    checkDailyReset();
}

window.addEventListener('pageshow', function() {
    if (typeof window.checkDailyReset === 'function') {
        window.checkDailyReset();
    }
});

// Daily Midnight Reset Logic
function checkDailyReset() {
    const today = new Date().toDateString();
    
    // Ensure system object exists (for backwards compatibility)
    if (!window.GK_State.system) {
        window.GK_State.system = { lastResetDate: null };
    }
    
    const savedDate = window.GK_State.system.lastResetDate;
    
    // If dates don't match, or it's the first time
    if (today !== savedDate) {
        // Reset stamina to max
        const maxStamina = window.GK_State.player.maxStamina || 500;
        window.GK_State.player.currentStamina = maxStamina;
        
        // Update the saved date
        window.GK_State.system.lastResetDate = today;
        
        // Save state
        saveGameState();
        
        // Visually update the UI if the function exists
        if (typeof window.updateHUD === 'function') {
            window.updateHUD();
        }
    }
}
window.checkDailyReset = checkDailyReset;

// Simple deep merge helper
function deepMerge(target, source) {
    if (typeof source !== 'object' || source === null) return source;
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Object && key in target) {
                target[key] = deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function getGameState() {
    return window.GK_State;
}

function saveGameState(shouldSync = false) {
    window.GK_State.lastUpdated = Date.now();
    localStorage.setItem('gk_state_v3', JSON.stringify(window.GK_State));
    
    // Safely ensure properties exist to prevent ReferenceErrors
    if (!window.GK_State.player) window.GK_State.player = { currentStamina: 500, isInfiniteStamina: false };
    if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };

    const legacyState = {
        stamina: window.GK_State.player.currentStamina || 500,
        xp: window.GK_State.economy.xp || 0,
        tokens: window.GK_State.economy.tokens || 0,
        version: 3,
        isInfiniteStamina: window.GK_State.player.isInfiniteStamina || false
    };
    localStorage.setItem('gk_state', JSON.stringify(legacyState));
    if (typeof window.updateHUD === 'function') window.updateHUD();
    
    // Explicit checkpoint save only!
    if (shouldSync && window.syncToCloud) {
        window.syncToCloud();
    }
}

window.saveGameState = saveGameState;
window.getGameState = getGameState;

window.syncToCloud = async function() {
    if (!navigator.onLine) {
        console.log("Offline: Skipping cloud sync.");
        return;
    }
    
    if (localStorage.getItem('gk_is_guest') === 'true') {
        console.log("Guest mode: Skipping cloud sync.");
        return;
    }

    try {
        const user = window.GK_FirebaseAuth ? window.GK_FirebaseAuth.currentUser : null;
        if (!user) {
            console.error("Save aborted: No authenticated user found.");
            return;
        }

        if (!window.GK_FirebaseDB) {
            console.error("Save aborted: GK_FirebaseDB is not initialized.");
            return;
        }

        let stateStr = localStorage.getItem('gk_state_v3');
        if (!stateStr) {
            console.error("Save aborted: No local game state found.");
            return;
        }

        let stateToSave = JSON.parse(stateStr);
        // Ensure role is not sent to avoid Security Rules rejection
        if (stateToSave.role !== undefined) {
            delete stateToSave.role;
        }
        // Also ensure we update the timestamp to signal a successful write!
        stateToSave.lastUpdated = new Date().toISOString();

        const { setDoc, doc, db } = window.GK_FirebaseDB;
        
        console.log("Attempting to save data to UID:", user.uid);
        
        // Target root user document directly as requested, with role stripped
        await setDoc(doc(db, "users", user.uid), stateToSave, { merge: true });
        
        console.log("Save successful!");
    } catch (error) {
        console.error("FIREBASE WRITE FAILED:", error.code, error.message);
    }
};

window.clearAllPurchases = function() {
    if (window.GK_State) {
        if (window.GK_State.catalogues) {
            for (let gameKey in window.GK_State.catalogues) {
                let game = window.GK_State.catalogues[gameKey];
                if (game.moves) {
                    for (let moveKey in game.moves) {
                        game.moves[moveKey].owned = false;
                    }
                }
                if (game.gear) {
                    for (let gearKey in game.gear) {
                        game.gear[gearKey].owned = false;
                        game.gear[gearKey].equipped = false;
                    }
                }
            }
        }
        
        if (window.GK_State.player) {
            window.GK_State.player.ownedOutfits = ['beginner'];
            window.GK_State.player.equippedOutfitId = 'beginner';
        }
        
        window.saveGameState(true);
        
        // update avatar UI
        if (typeof renderInventory === 'function' && window.avatarAssets && window.avatarAssets.outfits) {
            window.avatarAssets.outfits.forEach(o => {
                o.owned = (o.id === 'beginner');
                o.equipped = (o.id === 'beginner');
            });
            let outfitsCarousel = document.getElementById('outfitsCarousel');
            if (outfitsCarousel) {
                renderInventory(window.avatarAssets.outfits, outfitsCarousel);
            }
            if (window.equipOutfit) window.equipOutfit('beginner');
        }
        
        // update gear/moves UI
        if (typeof renderMasterLockerRoom === 'function') {
            const activeBtn = document.querySelector('.game-filter-btn.active');
            if (activeBtn) {
                const game = activeBtn.getAttribute('data-game');
                renderMasterLockerRoom('moves', game);
                renderMasterLockerRoom('gear', game);
            }
        }
        
        alert("All purchases have been cleared. Items are re-locked. The page will now reload to apply changes globally.");
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
};

window.purchaseItem = function(game, category, itemId) {
    const item = window.GK_State.catalogues[game][category][itemId];
    if (!item || item.owned) return false;
    
    if (window.GK_State.economy.tokens >= item.cost) {
        window.GK_State.economy.tokens -= item.cost;
        item.owned = true;
        saveGameState(true);
        return true;
    }
    return false;
};

// Globally accessible function to update HUD
window.updateHUD = function() {
    const state = window.GK_State;
    
    // Update elements if they exist
    const staminaEl = document.getElementById('global-stamina');
    if (staminaEl) staminaEl.innerText = state.player.currentStamina;
    
    // Also support width-based stamina bars if they exist
    const staminaBarEl = document.getElementById('global-stamina-bar');
    if (staminaBarEl) staminaBarEl.style.width = Math.min(100, Math.max(0, (state.player.currentStamina / state.player.maxStamina) * 100)) + '%';

    const xpElements = document.querySelectorAll('#global-xp, #xpDisplay');
    xpElements.forEach(el => el.innerText = state.economy.xp);

    const tokenElements = document.querySelectorAll('#global-tokens, #tokenDisplay, #lockerTokenDisplay');
    tokenElements.forEach(el => el.innerText = state.economy.tokens);

    // Sync dev checkboxes
    ['infiniteStaminaToggle', 'dev-infinite-stamina', 'dev-infinite-stamina-cb', 'dev-infinite-stamina-menu'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) toggle.checked = !!state.player.isInfiniteStamina;
    });
};

window.setInfiniteStamina = function(isInfinite) {
    window.GK_State.player.isInfiniteStamina = isInfinite;
    if (isInfinite) {
        window.GK_State.player.currentStamina = window.GK_State.player.maxStamina;
    }
    saveGameState(true);
};

// Globally accessible action functions
window.spendStamina = function(amount) {
    if (window.GK_State.player.isInfiniteStamina) {
        window.GK_State.player.currentStamina = window.GK_State.player.maxStamina;
        saveGameState(true);
        return true;
    }

    if (window.GK_State.player.currentStamina >= amount) {
        window.GK_State.player.currentStamina -= amount;
        saveGameState(true);
        return true;
    }
    return false; // Not enough stamina
};

window.addStamina = function(amount) {
    window.GK_State.player.currentStamina = Math.min(window.GK_State.player.maxStamina, window.GK_State.player.currentStamina + amount);
    saveGameState(true);
};

window.addXP = function(amount) {
    window.GK_State.economy.xp += amount;
    saveGameState(true);
};

window.addTokens = function(amount) {
    window.GK_State.economy.tokens += amount;
    saveGameState(true);
};

window.modifyStatByPercentage = function(stat, percent) {
    let state = window.GK_State;
    if (stat === 'stamina') {
        let amt = state.player.maxStamina * (percent / 100);
        state.player.currentStamina = Math.max(0, Math.min(state.player.maxStamina, state.player.currentStamina + amt));
    } else if (stat === 'xp') {
        let base = Math.max(state.economy.xp, 1000);
        let amt = base * (percent / 100);
        state.economy.xp = Math.max(0, Math.floor(state.economy.xp + amt));
    } else if (stat === 'tokens') {
        let base = Math.max(state.economy.tokens, 1000);
        let amt = base * (percent / 100);
        state.economy.tokens = Math.max(0, Math.floor(state.economy.tokens + amt));
    }
    saveGameState(true);
};

// Initialize on load
initGameState();
window.addEventListener('DOMContentLoaded', () => {
    window.updateHUD();
    
    // Attach change listeners to infinite stamina toggles
    ['infiniteStaminaToggle', 'dev-infinite-stamina', 'dev-infinite-stamina-cb', 'dev-infinite-stamina-menu'].forEach(id => {
        const toggle = document.getElementById(id);
        if (toggle) {
            toggle.addEventListener('change', (e) => {
                window.setInfiniteStamina(e.target.checked);
            });
        }
    });

    setupDeveloperOptions();

    initializeMicroInteractions();
});

function initializeMicroInteractions() {
    const gearIcons = document.querySelectorAll('img[src*="Soccer%20gear"], img[src*="Soccer gear"]');
    gearIcons.forEach(icon => {
        // If the icon is inside a button and pointer-events is none on the icon, 
        // we add the event listener to the parent button instead to ensure it fires.
        const trigger = icon.closest('button') || icon;
        trigger.addEventListener('click', () => {
            icon.classList.add('is-spinning');
            setTimeout(() => {
                icon.classList.remove('is-spinning');
            }, 500);
        });
    });
}

// --- FIREBASE BACKEND INTEGRATION ---

// 1. Establish or retrieve a unique Player ID
let playerId = localStorage.getItem('gk_player_id');
if (!playerId) {
    playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('gk_player_id', playerId);
}
window.GK_PlayerId = playerId;

// 2. Dynamically load Firebase SDKs without breaking synchronous window.GK_State
if (localStorage.getItem('gk_is_guest') === 'true') {
    console.log("Guest mode active. Bypassing Firebase SDK initialization.");
    window.GK_State_Hydrated = true;
    window.dispatchEvent(new Event('gk_state_updated'));
} else {
import('https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js').then((appModule) => {
    import('https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js').then((firestoreModule) => {
        const { initializeApp } = appModule;
        const { initializeFirestore, doc, getDoc, setDoc, deleteDoc } = firestoreModule;
        
        const firebaseConfig = {
            apiKey: "AIzaSyCZGf-ZTiyGvLyHO8ZYxNH5FQZVkupVipc",
            authDomain: "global-kickoff-76ae0.firebaseapp.com",
            projectId: "global-kickoff-76ae0",
            storageBucket: "global-kickoff-76ae0.firebasestorage.app",
            messagingSenderId: "870153058574",
            appId: "1:870153058574:web:48a6f3e8328b587190bf5f",
            measurementId: "G-9FL6QM52YP"
        };

        const app = initializeApp(firebaseConfig);
        const db = initializeFirestore(app, { experimentalForceLongPolling: true });

        import('https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js').then((authModule) => {
            const { getAuth, initializeAuth, browserLocalPersistence, indexedDBLocalPersistence, signOut, deleteUser, onAuthStateChanged } = authModule;
            
            let auth;
            try {
                auth = initializeAuth(app, {
                    persistence: [indexedDBLocalPersistence, browserLocalPersistence]
                });
            } catch (e) {
                auth = getAuth(app);
            }
            window.GK_FirebaseAuth = auth;
            window.GK_FirebaseDeleteUser = deleteUser;
            
            window.checkDeveloperStatus = function() {
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                
                const lockDevOptions = () => {
                    const panel = document.getElementById('dev-options-panel');
                    if (panel) panel.style.display = 'none';
                    
                    const devCheckboxes = [
                        'dev-enable-all', 'dev-disable-countdowns', 'dev-unlock-all-games', 'dev-infinite-stamina-menu',
                        'devAnyOutfit', 'devDisableTimerToggle', 'infiniteStaminaToggle', 'devUnlockMovesToggle', 
                        'devUnlockLevelsToggle', 'devDisableTutorialsToggle', 'dev-disable-blur', 'dev-stop-timer',
                        'dev-ignore-strikes', 'dev-unlock-levels', 'dev-infinite-stamina', 'dev-unlock-cb',
                        'dev-infinite-stamina-cb', 'dev-prompts-cb', 'dev-locker-cb', 'dev-specials-cb',
                        'dev-timer-main-cb', 'dev-timer-special-cb'
                    ];
                    
                    devCheckboxes.forEach(id => {
                        const el = document.getElementById(id);
                        if (el && el.checked) {
                            el.checked = false;
                            el.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        if (el) el.disabled = true;
                    });
            
                    document.querySelectorAll('button').forEach(btn => {
                        const str = btn.onclick ? btn.onclick.toString() : '';
                        if (str.includes('modifyStatByPercentage') || str.includes('addXP') || str.includes('addTokens') || str.includes('addStamina') || str.includes('clearAllPurchases') || btn.id.startsWith('dev-test-')) {
                            btn.disabled = true;
                            btn.style.opacity = '0.5';
                            btn.style.cursor = 'not-allowed';
                        }
                    });
                };
            
                const unlockDevOptions = () => {
                    const panel = document.getElementById('dev-options-panel');
                    if (panel) panel.style.display = 'block';
                    
                    const devCheckboxes = [
                        'dev-enable-all', 'dev-disable-countdowns', 'dev-unlock-all-games', 'dev-infinite-stamina-menu',
                        'devAnyOutfit', 'devDisableTimerToggle', 'infiniteStaminaToggle', 'devUnlockMovesToggle', 
                        'devUnlockLevelsToggle', 'devDisableTutorialsToggle', 'dev-disable-blur', 'dev-stop-timer',
                        'dev-ignore-strikes', 'dev-unlock-levels', 'dev-infinite-stamina', 'dev-unlock-cb',
                        'dev-infinite-stamina-cb', 'dev-prompts-cb', 'dev-locker-cb', 'dev-specials-cb',
                        'dev-timer-main-cb', 'dev-timer-special-cb'
                    ];
                    
                    devCheckboxes.forEach(id => {
                        const el = document.getElementById(id);
                        if (el) el.disabled = false;
                    });
                    
                    document.querySelectorAll('button').forEach(btn => {
                        const str = btn.onclick ? btn.onclick.toString() : '';
                        if (str.includes('modifyStatByPercentage') || str.includes('addXP') || str.includes('addTokens') || str.includes('addStamina') || str.includes('clearAllPurchases') || btn.id.startsWith('dev-test-')) {
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.cursor = 'pointer';
                        }
                    });
                };
            
                if (isLocalhost) {
                    console.log("Localhost detected. Bypassing auth for Dev panel.");
                    unlockDevOptions();
                    return;
                }
            
                lockDevOptions(); // Lock initially until verified
            
                onAuthStateChanged(window.GK_FirebaseAuth, (user) => {
                    if (user) {
                        if (user.email === 'yasheen.sewn@gmail.com') {
                            unlockDevOptions();
                        } else {
                            // Check role in db
                            getDoc(doc(db, "users", user.uid)).then(snap => {
                                if (snap.exists() && snap.data().role === 'owner') {
                                    unlockDevOptions();
                                } else {
                                    lockDevOptions();
                                }
                            }).catch(() => lockDevOptions());
                        }
                    } else {
                        lockDevOptions();
                    }
                });
            };
            
            // Execute the check now that auth is ready
            window.checkDeveloperStatus();
            
            window.logoutUser = function(redirectPath = 'index.html') {
                const proceedLogout = () => {
                    localStorage.removeItem('gk_player_id');
                    localStorage.removeItem('gk_state_v3');
                    localStorage.removeItem('gk_state');
                    localStorage.removeItem('gk_user_profile');
                    localStorage.removeItem('gk_user_profile_skipped');
                    localStorage.removeItem('gk_equipped_outfit');
                    signOut(window.GK_FirebaseAuth).then(() => {
                        window.location.href = redirectPath;
                    }).catch(err => {
                        console.error("Logout error", err);
                        window.location.href = redirectPath;
                    });
                };
                proceedLogout();
            };
            
            // Store globals so saveGameState() can access them
            window.GK_FirebaseDB = { db, doc, setDoc, deleteDoc };
            
            // 3. Fetch remote state on load ONLY if local state is missing
            const hasLocalState = !!localStorage.getItem('gk_state_v3');
        
        onAuthStateChanged(window.GK_FirebaseAuth, (user) => {
            if (user) {
                // Ensure player ID matches authenticated UID
                window.GK_PlayerId = user.uid;
                localStorage.setItem('gk_player_id', user.uid);
                
                getDoc(doc(db, "users", user.uid)).then(snap => {
                    if (snap.exists()) {
                        let cloudState = snap.data();
                        
                        // Strict read: Always trust the cloud on initialization to prevent overwriting with local defaults
                        window.GK_State = deepMerge(window.GK_State, cloudState);
                        
                        if (window.GK_State.player && window.GK_State.player.equippedOutfitId) {
                            localStorage.setItem('gk_equipped_outfit', window.GK_State.player.equippedOutfitId);
                        }
                        
                        localStorage.setItem('gk_state_v3', JSON.stringify(window.GK_State));
                        console.log("Successfully hydrated state from Firebase.");
                        window.GK_State_Hydrated = true;
                        window.dispatchEvent(new Event('gk_state_updated'));
                        
                        if (typeof window.updateHUD === 'function') window.updateHUD();
                        if (typeof window.renderStats === 'function') window.renderStats();
                    } else {
                        console.log("No cloud data found. Waiting for registration to seed data.");
                        window.GK_State_Hydrated = true;
                        window.dispatchEvent(new Event('gk_state_updated'));
                    }
                }).catch(err => {
                    console.error("Firebase load error:", err);
                    window.GK_State_Hydrated = true;
                    window.dispatchEvent(new Event('gk_state_updated'));
                });
            }
        });
        
    }); // End of authModule import
}); // End of firestoreModule import
}); // End of appModule import
} // End of Guest bypass else block

// Removed unload and visibilitychange listeners for checkpoint-save architecture

function setupDeveloperOptions() {
    window.GK_State.developer = window.GK_State.developer || { enableAll: false, disableCountdowns: false };
    
    const enableAllCb = document.getElementById('dev-enable-all');
    const disableCountdownsCb = document.getElementById('dev-disable-countdowns');

    if (enableAllCb) {
        enableAllCb.checked = window.GK_State.developer.enableAll;
        enableAllCb.addEventListener('change', (e) => {
            window.GK_State.developer.enableAll = e.target.checked;
            saveGameState(true);
            
            if (e.target.checked) {
                // Check all dev checkboxes on the page
                document.querySelectorAll('input[type="checkbox"][id^="dev"], #infiniteStaminaToggle').forEach(cb => {
                    if (cb !== enableAllCb && !cb.checked) {
                        cb.checked = true;
                        cb.dispatchEvent(new Event('change'));
                    }
                });
            }
        });
    }

    if (disableCountdownsCb) {
        disableCountdownsCb.checked = window.GK_State.developer.disableCountdowns;
        disableCountdownsCb.addEventListener('change', (e) => {
            window.GK_State.developer.disableCountdowns = e.target.checked;
            saveGameState(true);
        });
    }

    // Attach listener to all dev checkboxes to untick "enableAll" if one is unchecked
    document.querySelectorAll('input[type="checkbox"][id^="dev"], #infiniteStaminaToggle').forEach(cb => {
        if (cb !== enableAllCb) {
            cb.addEventListener('change', (e) => {
                if (!e.target.checked && enableAllCb && enableAllCb.checked) {
                    enableAllCb.checked = false;
                    window.GK_State.developer.enableAll = false;
                    saveGameState(true);
                }
            });
        }
    });

    // We also need to automatically check all on load if enableAll is true
    if (window.GK_State.developer.enableAll) {
        setTimeout(() => {
            document.querySelectorAll('input[type="checkbox"][id^="dev"], #infiniteStaminaToggle').forEach(cb => {
                if (cb !== enableAllCb && !cb.checked) {
                    cb.checked = true;
                    cb.dispatchEvent(new Event('change'));
                }
            });
        }, 150);
    }
}

window.getCelebrateAvatarUrl = function() {
    const equippedId = localStorage.getItem('gk_equipped_outfit') || window.GK_State?.player?.equippedOutfitId || 'beginner';
    
    if (equippedId === 'competitive') return '../../assets/locker-room/images/avatars/comp_celebrate.png';
    if (equippedId === 'beach') return '../../assets/locker-room/images/avatars/beach_celebrate.png';
    if (equippedId === 'suit') return '../../assets/locker-room/images/avatars/suit_celebrate.png';
    return '../../assets/locker-room/images/avatars/celebrate.png'; // Default beginner
};
