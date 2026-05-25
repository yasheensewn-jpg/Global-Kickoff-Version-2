const container = document.getElementById('game-container');
const gameWorld = document.getElementById('game-world');

let pointerStartX = 0;
let pointerStartY = 0;
let isSwiping = false;

// Rocket State Variables
let isRocketArmed = false;
let rocketCharge = 0;
let lastTouchX = 0;
let currentScrubDirection = 0;
let currentStrokeDistance = 0;
let lastChargeTime = 0;
let startedInRed = false;
let hasSeenSpecialTutorial = false;

// State Variables
let currentLevel = window.GK_State?.player?.shootoutLevel || parseInt(localStorage.getItem('gk_shootout_max_level')) || 1;
let highestUnlockedLevel = currentLevel;
let isAllLevelsUnlocked = false;

window.addEventListener('gk_state_updated', () => {
    if (window.GK_State?.player?.shootoutLevel) {
        highestUnlockedLevel = Math.max(highestUnlockedLevel, window.GK_State.player.shootoutLevel);
        if (!isAllLevelsUnlocked) {
            difficultySlider.max = highestUnlockedLevel;
            currentLevel = highestUnlockedLevel;
            difficultySlider.value = currentLevel;
            levelDisplay.textContent = currentLevel;
        }
    }
});
let score = 0;
let targetScore = 3;
let totalTime = 15;
let timeLeft = 15;
let isGameOver = false;
let currentStrikes = 0;
let maxStrikes = 1;
let hasPaidForCurrentMatch = false;

const strikeDisplay = document.getElementById('strike-display');

// Timers
let gameTimer = null;
let headacheTimer = null;
let spawnTimer = null;
let moveTimer = null;
let drinkSpawnTimer = null;
let drinkEffectTimer = null;
let skyCarouselTimer = null;
let extraSkyItemTimer = null;
let currentSkyItemIndex = 0;
let activeSkyItem = null;
let activeSkyItems = [];
let isHeadacheSuspended = false;
let isGamePaused = false;


const timerBarFill = document.getElementById('timer-bar-fill');
const scoreDisplay = document.getElementById('score-display');
const levelDisplay = document.getElementById('level-display');
const difficultySlider = document.getElementById('difficulty-slider');
const levelDownBtn = document.getElementById('level-down-btn');
const levelUpBtn = document.getElementById('level-up-btn');

// Opponent System
const opponentAssets = [
    '../../assets/shoot-out/opponent1.png',
    '../../assets/shoot-out/opponent2.png',
    '../../assets/shoot-out/opponent3.png',
    '../../assets/shoot-out/opponent4.png',
    '../../assets/shoot-out/opponent5.png',
    '../../assets/shoot-out/opponent6.png',
    '../../assets/shoot-out/opponent7.png',
    '../../assets/shoot-out/opponent8.png'
];
let activeOpponents = [];

function getOpponentHP(level) {
    if (level <= 3) return 1;
    if (level <= 6) return Math.floor(Math.random() * 2) + 1; // 1 to 2
    if (level <= 10) return Math.floor(Math.random() * 3) + 1; // 1 to 3
    if (level <= 12) return Math.floor(Math.random() * 4) + 1; // 1 to 4
    return Math.floor(Math.random() * 3) + 2; // 2 to 4
}

function getMaxOpponents(level) {
    if (level === 1) return 1;
    if (level >= 2 && level <= 4) return 2;
    if (level >= 5 && level <= 9) return 3;
    if (level >= 10 && level <= 17) return 4;
    return 5; // Levels 18, 19, 20
}

function spawnOpponent() {
    if (isGameOver) return;
    if (activeOpponents.length >= getMaxOpponents(currentLevel)) return;
    
    const el = document.createElement('div');
    el.classList.add('opponent-sprite');
    
    // Hide initially for preloading
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.2s ease-in';
    
    const activeAssets = activeOpponents.map(opp => opp.assetUrl);
    const availableAssets = opponentAssets.filter(asset => !activeAssets.includes(asset));
    
    // If all assets are currently on screen, don't spawn
    if (availableAssets.length === 0) return;
    
    const asset = availableAssets[Math.floor(Math.random() * availableAssets.length)];
    
    // Preload image before fading in
    const preloader = new Image();
    preloader.onload = () => {
        el.style.opacity = '1';
    };
    preloader.src = asset;
    
    el.style.backgroundImage = `url('${asset}')`;
    
    el.style.bottom = '42%';
    el.style.top = 'auto';
    el.style.zIndex = 100 - parseInt(el.style.bottom);
    
    let randomLeft;
    let attempts = 0;
    let overlap = true;
    const minDistance = 25; // Require at least 25% horizontal spacing
    
    while (overlap && attempts < 20) {
        randomLeft = Math.floor(Math.random() * 60) + 20; // 20% to 80%
        overlap = activeOpponents.some(opp => {
            const oppLeft = parseFloat(opp.element.style.left);
            return Math.abs(randomLeft - oppLeft) < minDistance;
        });
        attempts++;
    }
    
    // If we couldn't find a clear spot after 20 attempts, abort spawn to prevent overlap
    if (overlap) return;
    
    el.style.left = `${randomLeft}%`;
    el.style.transform = 'translateX(-50%) scale(0.5)';
    
    const hp = getOpponentHP(currentLevel);
    
    const badge = document.createElement('div');
    badge.classList.add('hp-badge');
    badge.textContent = hp;
    el.appendChild(badge);
    
    gameWorld.appendChild(el);
    
    const opponentObject = {
        element: el,
        badge: badge,
        initialHP: hp,
        currentHP: hp,
        movesTaken: 0,
        assetUrl: asset
    };
    
    activeOpponents.push(opponentObject);
}

function moveOpponents() {
    if (isGameOver || isGamePaused) return;
    activeOpponents.forEach((opp) => {
        // Allow lateral zig-zag from Level 7+
        if (currentLevel >= 7 && opp.movesTaken < 4) {
            // 50% chance to attempt a lateral shift
            if (Math.random() > 0.5) {
                let currentLeft = parseFloat(opp.element.style.left);
                
                // Randomly choose left or right shift (10% to 20% distance)
                let shiftAmount = (Math.floor(Math.random() * 11) + 10);
                let direction = Math.random() > 0.5 ? 1 : -1;
                let proposedLeft = currentLeft + (shiftAmount * direction);
                
                // Boundary checks (keep between 10% and 90% screen width)
                if (proposedLeft < 10) proposedLeft = 10;
                if (proposedLeft > 90) proposedLeft = 90;
                
                // AABB Collision Check: Ensure the proposed position doesn't overlap another opponent
                const minDistance = 20; // 20% horizontal spacing required
                let overlap = activeOpponents.some(otherOpp => {
                    if (otherOpp === opp) return false;
                    const otherLeft = parseFloat(otherOpp.element.style.left);
                    // Check if they are roughly on the same 'bottom' row to prevent horizontal stacking
                    const sameRow = otherOpp.element.style.bottom === opp.element.style.bottom;
                    return sameRow && Math.abs(proposedLeft - otherLeft) < minDistance;
                });
                
                if (!overlap) {
                    opp.element.style.left = `${proposedLeft}%`;
                }
            }
        }

        opp.movesTaken++;
        if (opp.movesTaken === 1) {
            opp.element.style.bottom = '34%';
            opp.element.style.transform = 'translateX(-50%) scale(0.8)';
        } else if (opp.movesTaken === 2) {
            opp.element.style.bottom = '26%';
            opp.element.style.transform = 'translateX(-50%) scale(1.2)';
        } else if (opp.movesTaken === 3) {
            opp.element.style.bottom = '19%'; // Just behind the 18% line
            opp.element.style.transform = 'translateX(-50%) scale(1.6)';
        } else if (opp.movesTaken >= 4) {
            opp.element.style.bottom = '10%'; // Crossed the line
            opp.element.style.transform = 'translateX(-50%) scale(2.2)';
            
            // 1. Apply Strike
            currentStrikes++;
            if (strikeDisplay) strikeDisplay.textContent = `${currentStrikes} / ${maxStrikes}`;
            
            // 2. Remove the opponent so it stops striking
            opp.element.remove();
            activeOpponents = activeOpponents.filter(o => o !== opp);
            
            // 3. Check for Game Over
            const devIgnoreStrikes = document.getElementById('dev-ignore-strikes');
            if (currentStrikes >= maxStrikes && (!devIgnoreStrikes || !devIgnoreStrikes.checked)) {
                isGameOver = true;
                clearInterval(gameTimer);
                clearTimeout(headacheTimer);
                clearInterval(spawnTimer);
                clearInterval(moveTimer);
                clearInterval(drinkSpawnTimer);
                clearTimeout(drinkEffectTimer);
                clearTimeout(skyCarouselTimer);
                clearTimeout(extraSkyItemTimer);
                
                const overlay = document.getElementById('game-over-overlay');
                const overlayTitle = document.getElementById('overlay-title');
                const overlayBtn = document.getElementById('overlay-btn');
                
                overlayTitle.textContent = "GAME OVER";
                overlayBtn.textContent = "Try Again";
                
                const overlayImageDiv = document.getElementById('overlay-image');
                if (overlayImageDiv) {
                    overlayImageDiv.innerHTML = '';
                    overlayImageDiv.style.display = 'none';
                }
                
                overlay.classList.remove('hidden');
                
                overlayBtn.onclick = () => {
                    overlay.classList.add('hidden');
                    startGame();
                };
            }
        }
        
        if (opp.element && opp.element.parentElement) {
            opp.element.style.zIndex = 100 - parseInt(opp.element.style.bottom || 0);
        }
    });
}

function updateLevelState(level) {
    if (level <= 5) {
        targetScore = 3;
        maxStrikes = 1;
    } else if (level <= 10) {
        targetScore = 5;
        maxStrikes = 3;
    } else if (level <= 15) {
        targetScore = 10;
        maxStrikes = 4;
    } else {
        targetScore = 15;
        maxStrikes = 5;
    }
    
    if (level <= 10) {
        totalTime = 10;
    } else {
        totalTime = 15; // Reduced from 20
    }
    
    score = 0;
    timeLeft = totalTime;
    isGameOver = false;
    isGamePaused = false;
    isHeadacheSuspended = false;
    
    // Clear old opponents
    activeOpponents.forEach(opp => opp.element.remove());
    activeOpponents = [];
    
    // Clear old sky items
    activeSkyItems.forEach(item => item.element.remove());
    activeSkyItems = [];
    
    if (timerBarFill) {
        timerBarFill.style.width = '100%';
        timerBarFill.style.backgroundColor = '#00ff00';
    }
    scoreDisplay.textContent = `${score} / ${targetScore}`;
    
    currentStrikes = 0;
    if (strikeDisplay) strikeDisplay.textContent = `${currentStrikes} / ${maxStrikes}`;
    
    // Reset ammo positions
    const redAmmo = document.getElementById('red-ammo');
    if (redAmmo) {
        if (level >= 5) {
            let driftSpeed = 4.0 - (((level - 5) / 15) * 2.5);
            redAmmo.style.animation = `driftAmmo ${driftSpeed}s infinite ease-in-out`;
        } else {
            redAmmo.style.animation = 'none';
            redAmmo.style.left = '50%';
            redAmmo.style.transform = 'translateX(-50%)';
        }
    }
    

    
    gameWorld.style.filter = 'none';
    
    hasPaidForCurrentMatch = false;
    
    isRocketArmed = false;
    rocketCharge = 0;
    const fuelContainer = document.getElementById('rocket-fuel-container');
    if (fuelContainer) {
        fuelContainer.classList.add('hidden');
    }
    
    if (typeof disarmRocket === 'function') disarmRocket();
    if (typeof disarmLightning === 'function') disarmLightning();
    

}

function showTutorial(title, htmlContent, callback) {
    pauseGame();
    isGamePaused = true;
    const tutOverlay = document.getElementById('tutorial-overlay');
    if (!tutOverlay) return;

    document.getElementById('tutorial-title').textContent = title;
    document.getElementById('tutorial-text').innerHTML = htmlContent;
    tutOverlay.classList.remove('hidden');

    const btn = document.getElementById('tutorial-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        tutOverlay.classList.add('hidden');
        if (callback) callback();
    });
}

function startGame() {
    clearInterval(gameTimer);
    clearTimeout(headacheTimer);
    clearInterval(spawnTimer);
    clearInterval(moveTimer);
    clearInterval(drinkSpawnTimer);
    clearTimeout(drinkEffectTimer);
    clearTimeout(skyCarouselTimer);
    clearTimeout(extraSkyItemTimer);
    if (activeSkyItem) {
        activeSkyItem.remove();
        activeSkyItem = null;
    }
    
    updateLevelState(currentLevel);
    
    spawnTimer = setInterval(() => { if (!isGamePaused) spawnOpponent(); }, 2000);
    
    let currentMoveInterval = 2000;
    if (currentLevel >= 11) {
        let progress = (currentLevel - 11) / 9;
        currentMoveInterval = 2000 - (progress * 1000);
    }
    moveTimer = setInterval(() => { if (!isGamePaused) moveOpponents(); }, currentMoveInterval);
    
    if (currentLevel >= 2) {
        skyCarouselTimer = setTimeout(function skyLoop() {
            if (!isGamePaused && !isGameOver) spawnSkyItem();
            skyCarouselTimer = setTimeout(skyLoop, 3000);
        }, 2000);
    }
    
    if (currentLevel >= 14) {
        extraSkyItemTimer = setTimeout(function extraSkyLoop() {
            if (!isGamePaused && !isGameOver) spawnExtraSkyItem();
            extraSkyItemTimer = setTimeout(extraSkyLoop, 6000);
        }, 6000);
    }
    
    gameTimer = setInterval(() => {
        if (isGameOver || isGamePaused) return;
        
        const devStopTimer = document.getElementById('dev-stop-timer');
        if (devStopTimer && devStopTimer.checked) return;
        
        timeLeft--;
        
        if (timerBarFill) {
            const percentage = (timeLeft / totalTime) * 100;
            timerBarFill.style.width = `${percentage}%`;
            
            // Turn orange at 50%, red at 20%
            if (percentage <= 20) {
                timerBarFill.style.backgroundColor = '#ff0000';
            } else if (percentage <= 50) {
                timerBarFill.style.backgroundColor = '#ffa500';
            }
        }
        
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            isGameOver = true;
            clearTimeout(headacheTimer);
            clearInterval(spawnTimer);
            clearInterval(moveTimer);
            clearInterval(drinkSpawnTimer);
            clearTimeout(drinkEffectTimer);
            clearTimeout(skyCarouselTimer);
            clearTimeout(extraSkyItemTimer);
            
            const overlay = document.getElementById('game-over-overlay');
            const overlayTitle = document.getElementById('overlay-title');
            const overlayBtn = document.getElementById('overlay-btn');
            
            if (score >= targetScore) {
                // Win
                if (currentLevel === highestUnlockedLevel && highestUnlockedLevel < 20) {
                    highestUnlockedLevel++;
                    if (window.GK_State && window.GK_State.player) {
                        window.GK_State.player.shootoutLevel = highestUnlockedLevel;
                        if (typeof window.saveGameState === 'function') window.saveGameState(true);
                    } else {
                        localStorage.setItem('gk_shootout_max_level', highestUnlockedLevel);
                    }
                }
                let reward = currentLevel * 5;
                
                if (!window.GK_State) window.GK_State = {};
                if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };

                window.GK_State.economy.xp += reward;
                window.GK_State.economy.tokens += reward;

                if (!window.GK_State.player) window.GK_State.player = {};
                if (window.GK_State.player.tournamentDailyXP === undefined) window.GK_State.player.tournamentDailyXP = 0;
                window.GK_State.player.tournamentDailyXP += reward;

                if (typeof window.saveGameState === 'function') window.saveGameState(true);

                // Update local displays (if applicable)
                const xpDisplay = document.getElementById('xpDisplay');
                const tokenDisplay = document.getElementById('tokenDisplay');
                if (xpDisplay) xpDisplay.innerText = window.GK_State.economy.xp;
                if (tokenDisplay) tokenDisplay.innerText = window.GK_State.economy.tokens;

                // Sync the drawer displays immediately
                const globalXp = document.getElementById('global-xp');
                const globalTokens = document.getElementById('global-tokens');
                if (globalXp) globalXp.innerText = window.GK_State.economy.xp;
                if (globalTokens) globalTokens.innerText = window.GK_State.economy.tokens;


                overlayTitle.innerHTML = "LEVEL CLEARED!<br><span style='font-size:1rem; color:#ffd700;'>+" + reward + " XP | +" + reward + " Tokens</span>";
                overlayBtn.textContent = "Next Level";
                
                const overlayImageDiv = document.getElementById('overlay-image');
                if (overlayImageDiv) {
                    let avatarUrl = window.getCelebrateAvatarUrl ? window.getCelebrateAvatarUrl() : '../../assets/locker-room/images/avatars/celebrate.png';
                    overlayImageDiv.innerHTML = `<img src="${avatarUrl}" style="max-height: 280px; width: auto; object-fit: contain; margin: 0 auto 20px auto; display: block; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6)); position: relative; top: 140px;">`;
                    overlayImageDiv.style.display = 'block';
                }
                
                overlay.classList.remove('hidden');
                overlayBtn.onclick = () => {
                    overlay.classList.add('hidden');
                    if (currentLevel < 20) {
                        currentLevel++;
                        updateLevelUI();
                    } else {
                        startGame();
                    }
                };
            } else {
                // Loss
                overlayTitle.textContent = "GAME OVER";
                overlayBtn.textContent = "Try Again";
                
                const overlayImageDiv = document.getElementById('overlay-image');
                if (overlayImageDiv) {
                    overlayImageDiv.innerHTML = '';
                    overlayImageDiv.style.display = 'none';
                }
                
                overlay.classList.remove('hidden');
                overlayBtn.onclick = () => {
                    overlay.classList.add('hidden');
                    startGame();
                };
            }
        }
    }, 1000);
    
    if (currentLevel >= 5) {
        runHeadache();
    }
    
    // JIT: Sky Items Tutorial (Level 2+)
    if (currentLevel === 2 && !localStorage.getItem('shootout_sky_tut_seen_v3')) {
        showTutorial(
            "LOOK UP!", 
            "Items will now float across the sky.<br><br>Tap the <strong>Winged Bag</strong> for Tokens or the <strong>Clock</strong> for extra time, or shoot them with the ball!", 
            () => {
                localStorage.setItem('shootout_sky_tut_seen_v3', 'true');
                isGamePaused = false;
                resumeGame();
            }
        );
    } 
    // JIT: Headache & Drink Tutorial (Level 5+)
    else if (currentLevel === 5 && !localStorage.getItem('shootout_drink_tut_seen_v3')) {
        const demoHTML = `
            Your player is getting a headache! The screen will blur.<br><br>
            <div class="tutorial-demo-box">
                <div class="tutorial-demo-item" style="background-image: url('../../assets/shoot-out/power_up_drink.png');"></div>
                <div class="tutorial-glove"></div>
            </div>
            Tap the <strong>Sports Drink</strong> when it appears to clear your vision!
        `;
        showTutorial(
            "HEADACHE WARNING!", 
            demoHTML, 
            () => {
                localStorage.setItem('shootout_drink_tut_seen_v3', 'true');
                isGamePaused = false;
                resumeGame();
            }
        );
    }
}

function runHeadache() {
    if (isGameOver) return;
    
    const intensity = Math.max(0, (currentLevel - 5) / 15);
    const blurDuration = 2000 + (intensity * 2500); // 2000 to 4500
    const clearDuration = 3000 - (intensity * 2500); // 3000 to 500
    
    const devDisableBlur = document.getElementById('dev-disable-blur');
    if (devDisableBlur && devDisableBlur.checked) {
        gameWorld.style.filter = 'none';
        // Keep the cycle running but without the effect, so it can resume if unchecked
    } else if (!isHeadacheSuspended && !isGamePaused) {
        gameWorld.style.filter = 'blur(5px)';
        clearTimeout(drinkSpawnTimer);
        drinkSpawnTimer = setTimeout(() => {
            if (!isGameOver && !isGamePaused) spawnSportsDrink();
        }, Math.random() * 1000);
    }
    
    headacheTimer = setTimeout(() => {
        if (isGameOver) {
            gameWorld.style.filter = 'none';
            return;
        }
        
        gameWorld.style.filter = 'none';
        
        headacheTimer = setTimeout(() => {
            if (!isGameOver) {
                runHeadache();
            }
        }, clearDuration);
        
    }, blurDuration);
}

function spawnSportsDrink() {
    if (isGameOver || currentLevel < 5 || isGamePaused) return;
    
    const drink = document.createElement('div');
    drink.classList.add('sports-drink');
    
    const hitbox = document.createElement('div');
    hitbox.style.position = 'absolute';
    hitbox.style.top = '-40px';
    hitbox.style.bottom = '-40px';
    hitbox.style.left = '-40px';
    hitbox.style.right = '-40px';
    drink.appendChild(hitbox);
    
    drink.style.bottom = '-20px';
    drink.style.right = '-2%';
    drink.style.top = 'auto';
    drink.style.left = 'auto';
    
    container.appendChild(drink);
    
    drink.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        drink.remove();
        
        isHeadacheSuspended = true;
        gameWorld.style.filter = 'none';
        
        clearTimeout(drinkEffectTimer);
        drinkEffectTimer = setTimeout(() => {
            isHeadacheSuspended = false;
        }, 5000);
    });
    
    setTimeout(() => {
        if (drink.parentElement) drink.remove();
    }, 4500);
}

function pauseGame() {
    clearInterval(gameTimer);
    clearInterval(spawnTimer);
    clearInterval(moveTimer);
    clearInterval(drinkSpawnTimer);
    clearTimeout(skyCarouselTimer);
    clearTimeout(extraSkyItemTimer);
}

function resumeGame() {
    spawnTimer = setInterval(() => { if (!isGamePaused) spawnOpponent(); }, 2000);
    let currentMoveInterval = 2000;
    if (currentLevel >= 11) {
        let progress = (currentLevel - 11) / 9;
        currentMoveInterval = 2000 - (progress * 1000);
    }
    moveTimer = setInterval(() => { if (!isGamePaused) moveOpponents(); }, currentMoveInterval);
    if (currentLevel >= 2) {
        skyCarouselTimer = setTimeout(function skyLoop() {
            if (!isGamePaused && !isGameOver) spawnSkyItem();
            skyCarouselTimer = setTimeout(skyLoop, 3000);
        }, 3000); // Resume at 3000ms offset
    }
    if (currentLevel >= 14) {
        extraSkyItemTimer = setTimeout(function extraSkyLoop() {
            if (!isGamePaused && !isGameOver) spawnExtraSkyItem();
            extraSkyItemTimer = setTimeout(extraSkyLoop, 6000);
        }, 6000);
    }
    gameTimer = setInterval(() => {
        if (isGameOver || isGamePaused) return;
        const devStopTimer = document.getElementById('dev-stop-timer');
        if (devStopTimer && devStopTimer.checked) return;
        
        timeLeft--;
        if (timerBarFill) {
            const percentage = (timeLeft / totalTime) * 100;
            timerBarFill.style.width = `${percentage}%`;
            if (percentage <= 20) timerBarFill.style.backgroundColor = '#ff0000';
            else if (percentage <= 50) timerBarFill.style.backgroundColor = '#ffa500';
        }
        
        if (timeLeft <= 0) {
            isGameOver = true;
            clearInterval(gameTimer);
            clearTimeout(headacheTimer);
            clearInterval(spawnTimer);
            clearInterval(moveTimer);
            clearInterval(drinkSpawnTimer);
            clearTimeout(drinkEffectTimer);
            clearInterval(skyCarouselTimer);
            
            const overlay = document.getElementById('game-over-overlay');
            const overlayTitle = document.getElementById('overlay-title');
            const overlayBtn = document.getElementById('overlay-btn');
            
            if (score >= targetScore) {
                overlayTitle.textContent = "LEVEL CLEARED!";
                overlayBtn.textContent = "Next Level";
                overlay.classList.remove('hidden');
                
                const overlayImageDiv = document.getElementById('overlay-image');
                if (overlayImageDiv) {
                    let avatarUrl = window.getCelebrateAvatarUrl ? window.getCelebrateAvatarUrl() : '../../assets/locker-room/images/avatars/celebrate.png';
                    overlayImageDiv.innerHTML = `<img src="${avatarUrl}" style="max-height: 280px; width: auto; object-fit: contain; margin: 0 auto 20px auto; display: block; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6)); position: relative; top: 140px;">`;
                    overlayImageDiv.style.display = 'block';
                }
                
                overlayBtn.onclick = () => {
                    overlay.classList.add('hidden');
                    if (currentLevel < 20) {
                        currentLevel++;
                        updateLevelUI();
                    } else startGame();
                };
            } else {
                overlayTitle.textContent = "GAME OVER";
                overlayBtn.textContent = "Try Again";
                overlay.classList.remove('hidden');
                
                const overlayImageDiv = document.getElementById('overlay-image');
                if (overlayImageDiv) {
                    overlayImageDiv.innerHTML = '';
                    overlayImageDiv.style.display = 'none';
                }
                
                overlayBtn.onclick = () => {
                    overlay.classList.add('hidden');
                    startGame();
                };
            }
        }
    }, 1000);
    if (currentLevel >= 5) {
        drinkSpawnTimer = setInterval(() => { if (!isGamePaused) spawnSportsDrink(); }, 3000);
    }
}

function triggerChargeOverlay(type) {
    pauseGame();
    isGamePaused = true;
    
    // Clean up all old listeners by cloning the entire overlay
    let oldOverlay = document.getElementById('charge-overlay');
    let overlay = oldOverlay.cloneNode(true);
    oldOverlay.parentNode.replaceChild(overlay, oldOverlay);
    
    const title = document.getElementById('charge-title');
    const newBall = document.getElementById('charge-ball');
    const fill = document.getElementById('charge-progress-fill');
    const tutorialHand = document.getElementById('tutorial-hand');
    
    overlay.classList.remove('hidden');
    fill.style.width = '0%';
    
    let overlayCharge = 0;
    let overlayTaps = 0;
    let lastX = null;
    
    if (tutorialHand) {
        tutorialHand.classList.remove('hidden', 'scrub-tutorial-anim', 'tap-tutorial-anim');
        tutorialHand.style.bottom = '120px';
        tutorialHand.style.left = '50%';
        tutorialHand.style.marginLeft = '-30px';
        if (hasSeenSpecialTutorial) {
            tutorialHand.classList.add('hidden');
        } else {
            hasSeenSpecialTutorial = true;
        }
    }
    
    if (type === 'rocket') {
        fill.style.background = 'linear-gradient(90deg, #ff9800, #f44336)';
        title.textContent = "SCRUB TO CHARGE!";
        newBall.style.backgroundImage = "url('../../assets/shoot-out/special_ball_2.png')";
        
        if (tutorialHand && !tutorialHand.classList.contains('hidden')) {
            tutorialHand.classList.add('scrub-tutorial-anim');
        }
        
        let ballOffsetX = 0;
        
        const startScrub = (e) => {
            lastX = e.clientX;
            if (tutorialHand) tutorialHand.classList.add('hidden');
        };
        
        newBall.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            startScrub(e);
        });
        
        overlay.addEventListener('pointerdown', (e) => {
            startScrub(e);
        });
        
        overlay.addEventListener('pointermove', (e) => {
            if (lastX === null) return;
            let dist = Math.abs(e.clientX - lastX);
            overlayCharge += dist;
            
            let deltaX = e.clientX - lastX;
            ballOffsetX += deltaX;
            ballOffsetX = Math.max(-100, Math.min(100, ballOffsetX));
            newBall.style.transform = `translateX(${ballOffsetX}px)`;
            
            lastX = e.clientX;
            
            fill.style.width = `${Math.min(100, (overlayCharge / 1000) * 100)}%`;
            
            if (overlayCharge >= 1000) {
                lastX = null;
                newBall.style.transform = 'translateX(0px)';
                overlay.classList.add('hidden');
                isRocketArmed = true;
                const redAmmo = document.getElementById('red-ammo');
                if (redAmmo) {
                    redAmmo.classList.add('glow-yellow');
                    redAmmo.classList.add('rocket-projectile');
                    let driftSpeed = currentLevel >= 5 ? (4.0 - (((currentLevel - 5) / 15) * 2.5)) : 4.0;
                    redAmmo.style.animation = `driftAmmo ${driftSpeed}s infinite ease-in-out`;
                }
                isGamePaused = false;
                resumeGame();
            }
        });
        
        overlay.addEventListener('pointerup', () => { 
            lastX = null; 
            ballOffsetX = 0;
            newBall.style.transform = 'translateX(0px)';
        });
    } else if (type === 'lightning') {
        fill.style.background = 'linear-gradient(90deg, #00e5ff, #007bff)';
        title.textContent = "TAP 10 TIMES!";
        newBall.style.backgroundImage = "url('../../assets/shoot-out/special_ball_1.png')";
        
        if (tutorialHand && !tutorialHand.classList.contains('hidden')) {
            tutorialHand.classList.add('tap-tutorial-anim');
        }
        
        const tapLightning = () => {
            overlayTaps++;
            fill.style.width = `${Math.min(100, (overlayTaps / 10) * 100)}%`;
            
            if (tutorialHand) tutorialHand.classList.add('hidden');
            
            if (overlayTaps >= 10) {
                overlay.classList.add('hidden');
                isLightningArmed = true;
                const redAmmo = document.getElementById('red-ammo');
                if (redAmmo) {
                    redAmmo.style.filter = 'drop-shadow(0 0 30px #00e5ff) brightness(2)';
                    redAmmo.classList.add('lightning-projectile');
                    let driftSpeed = currentLevel >= 5 ? (4.0 - (((currentLevel - 5) / 15) * 2.5)) : 4.0;
                    redAmmo.style.animation = `driftAmmo ${driftSpeed}s infinite ease-in-out`;
                }
                isGamePaused = false;
                resumeGame();
            }
        };
        
        newBall.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            tapLightning();
        });
        
        newBall.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            e.preventDefault();
            tapLightning();
        }, { passive: false });
        
        overlay.addEventListener('pointerdown', () => {
            tapLightning();
        });
    }
}

function spawnSkyItem() {
    if (isGameOver || isGamePaused || currentLevel < 2) return;
    
    let options = ['bag', 'clock']; 
    if (window.GK_State?.catalogues?.shootout?.moves['romeo_rocket']?.owned) options.push('rocket');
    if (window.GK_State?.catalogues?.shootout?.moves['lightning_ball']?.owned) options.push('lightning');
    const pick = options[Math.floor(Math.random() * options.length)];
    
    const item = document.createElement('div');
    item.classList.add('sky-item');
    
    const hitbox = document.createElement('div');
    hitbox.style.position = 'absolute';
    hitbox.style.top = '-40px';
    hitbox.style.bottom = '-40px';
    hitbox.style.left = '-40px';
    hitbox.style.right = '-40px';
    item.appendChild(hitbox);
    
    const skyObj = { element: item };
    activeSkyItems.push(skyObj);
    
    const cleanupItem = () => {
        if (item.parentElement) item.remove();
        activeSkyItems = activeSkyItems.filter(o => o !== skyObj);
    };
    
    if (pick === 'bag') {
        item.classList.add('winged-bag');
        item.style.backgroundImage = `url('../../assets/shoot-out/winged_money_bag.png')`;
        item.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            cleanupItem();
            
            if (window.addTokens) window.addTokens(20);
            
            const floatText = document.createElement('div');
            floatText.classList.add('floating-token-text');
            floatText.textContent = '+20 TOKENS';
            floatText.style.left = `${e.clientX}px`;
            floatText.style.top = `${e.clientY}px`;
            document.body.appendChild(floatText);
            
            setTimeout(() => floatText.remove(), 1000);
        });
    } else if (pick === 'clock') {
        item.classList.add('has-wings');
        item.style.backgroundImage = `url('../../assets/shoot-out/soccer_clock.png')`;
        item.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            cleanupItem();
            timeLeft += 5;
            if (timerBarFill) {
                let percentage = (timeLeft / totalTime) * 100;
                if (percentage > 100) percentage = 100;
                timerBarFill.style.width = `${percentage}%`;
                if (percentage > 50) timerBarFill.style.backgroundColor = '#00ff00';
                else if (percentage > 20) timerBarFill.style.backgroundColor = '#ffa500';
            }
        });
    } else if (pick === 'rocket') {
        item.classList.add('has-wings');
        item.style.backgroundImage = `url('../../assets/shoot-out/special_ball_2.png')`;
        item.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            cleanupItem();
            triggerChargeOverlay('rocket');
        });
    } else if (pick === 'lightning') {
        item.classList.add('has-wings');
        item.style.backgroundImage = `url('../../assets/shoot-out/special_ball_1.png')`;
        item.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            cleanupItem();
            triggerChargeOverlay('lightning');
        });
    }
    
    item.style.left = `${Math.floor(Math.random() * 60) + 15}%`; 
    item.style.top = `${Math.floor(Math.random() * 25) + 5}%`;
    item.style.animation = 'flyFloat 2s infinite ease-in-out alternate';
    
    container.appendChild(item);
    
    setTimeout(() => {
        cleanupItem();
    }, 3000);
}

function spawnExtraSkyItem() {
    if (isGameOver || isGamePaused || currentLevel < 14) return;
    
    const options = ['bag', 'clock'];
    if (window.GK_State?.catalogues?.shootout?.moves['romeo_rocket']?.owned) options.push('rocket');
    if (window.GK_State?.catalogues?.shootout?.moves['lightning_ball']?.owned) options.push('lightning');
    const pick = options[Math.floor(Math.random() * options.length)];
    
    const item = document.createElement('div');
    item.classList.add('sky-item');
    
    const hitbox = document.createElement('div');
    hitbox.style.position = 'absolute';
    hitbox.style.top = '-40px';
    hitbox.style.bottom = '-40px';
    hitbox.style.left = '-40px';
    hitbox.style.right = '-40px';
    item.appendChild(hitbox);
    
    const skyObj = { element: item };
    activeSkyItems.push(skyObj);
    
    const cleanupItem = () => {
        if (item.parentElement) item.remove();
        activeSkyItems = activeSkyItems.filter(o => o !== skyObj);
    };
    
    if (pick === 'bag') {
        item.classList.add('winged-bag');
        item.style.backgroundImage = `url('../../assets/shoot-out/winged_money_bag.png')`;
        item.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            cleanupItem();
            
            if (window.addTokens) window.addTokens(20);
            
            const floatText = document.createElement('div');
            floatText.classList.add('floating-token-text');
            floatText.textContent = '+20 TOKENS';
            floatText.style.left = `${e.clientX}px`;
            floatText.style.top = `${e.clientY}px`;
            document.body.appendChild(floatText);
            
            setTimeout(() => floatText.remove(), 1000);
        });
    } else if (pick === 'clock') {
        item.classList.add('has-wings');
        item.style.backgroundImage = `url('../../assets/shoot-out/soccer_clock.png')`;
        item.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            cleanupItem();
            timeLeft += 5;
            if (timerBarFill) {
                let percentage = (timeLeft / totalTime) * 100;
                if (percentage > 100) percentage = 100;
                timerBarFill.style.width = `${percentage}%`;
                if (percentage > 50) timerBarFill.style.backgroundColor = '#00ff00';
                else if (percentage > 20) timerBarFill.style.backgroundColor = '#ffa500';
            }
        });
    }
    
    item.style.left = `${Math.floor(Math.random() * 60) + 15}%`; 
    item.style.top = `${Math.floor(Math.random() * 25) + 5}%`;
    item.style.animation = 'flyFloat 2s infinite ease-in-out alternate';
    
    container.appendChild(item);
    
    setTimeout(() => {
        cleanupItem();
    }, 2000);
}

function updateLevelUI() {
    difficultySlider.value = currentLevel;
    levelDisplay.textContent = currentLevel;
    startGame();
}

difficultySlider.addEventListener('input', (e) => {
    let requestedLevel = parseInt(e.target.value);
    const devUnlockAll = document.getElementById('dev-unlock-levels');
    let maxAllowed = (devUnlockAll && devUnlockAll.checked) ? 20 : highestUnlockedLevel;

    if (requestedLevel > maxAllowed) {
        e.target.value = maxAllowed;
        currentLevel = maxAllowed;
    } else {
        currentLevel = requestedLevel;
    }
    levelDisplay.textContent = currentLevel;
    startGame();
});

levelDownBtn.addEventListener('click', () => {
    if (currentLevel > 1) {
        currentLevel--;
        updateLevelUI();
    }
});

levelUpBtn.addEventListener('click', () => {
    const devUnlockAll = document.getElementById('dev-unlock-levels');
    let maxAllowed = (devUnlockAll && devUnlockAll.checked) ? 20 : highestUnlockedLevel;

    if (currentLevel < maxAllowed) {
        currentLevel++;
        updateLevelUI();
    }
});

const settingsBtn = document.getElementById('open-drawer-btn');
const sideDrawer = document.getElementById('side-drawer');
const backdrop = document.getElementById('hub-backdrop');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

settingsBtn.addEventListener('click', () => {
    backdrop.style.display = 'block';
    sideDrawer.style.right = '0';
    isGamePaused = true;
    pauseGame();
});

closeDrawerBtn.addEventListener('click', () => {
    sideDrawer.style.right = '-100%';
    setTimeout(() => { backdrop.style.display = 'none'; }, 300);
    if (!isGameOver) {
        isGamePaused = false;
        resumeGame();
    }
});

function gameLoop(timestamp) {
  requestAnimationFrame(gameLoop);
}


function disarmRocket() {
    isRocketArmed = false;
    isGamePaused = false;
    rocketCharge = 0;
    const fuelContainer = document.getElementById('rocket-fuel-container');
    if (fuelContainer) fuelContainer.classList.add('hidden');
    
    const redAmmo = document.getElementById('red-ammo');
    if (redAmmo) {
        redAmmo.classList.remove('glow-yellow'); 
        redAmmo.classList.remove('rocket-projectile');
        if (currentLevel >= 5) {
            let driftSpeed = 4.0 - (((currentLevel - 5) / 15) * 2.5);
            redAmmo.style.animation = `driftAmmo ${driftSpeed}s infinite ease-in-out`;
            redAmmo.style.left = '50%';
        } else {
            redAmmo.style.animation = 'none';
            redAmmo.style.left = '50%';
            redAmmo.style.transform = 'translateX(-50%)';
        }
    }
    const counterBtn = document.getElementById('rocket-counter-btn');
    if (counterBtn) counterBtn.style.filter = 'none';
}

function disarmLightning() {
    isLightningArmed = false;
    isGamePaused = false;
    lightningTaps = 0;
    
    const lightningBtn = document.getElementById('lightning-counter-btn');
    if (lightningBtn) lightningBtn.style.filter = 'none';
    
    const redAmmo = document.getElementById('red-ammo');
    if (redAmmo) {
        redAmmo.style.filter = 'none';
        redAmmo.classList.remove('lightning-projectile');
        if (currentLevel >= 5) {
            let driftSpeed = 4.0 - (((currentLevel - 5) / 15) * 2.5);
            redAmmo.style.animation = `driftAmmo ${driftSpeed}s infinite ease-in-out`;
            redAmmo.style.left = '50%';
        } else {
            redAmmo.style.animation = 'none';
            redAmmo.style.left = '50%';
            redAmmo.style.transform = 'translateX(-50%)';
        }
    }
}

let isLightningArmed = false;
let lightningTaps = 0;

function checkOpponentDeath(targetObj) {
    if (targetObj.currentHP <= 0) {
        score += targetObj.initialHP;
        scoreDisplay.textContent = `${score} / ${targetScore}`;
        
        targetObj.element.remove();
        activeOpponents = activeOpponents.filter(o => o !== targetObj);
        
        if (score >= targetScore) {
            isGameOver = true;
            clearInterval(gameTimer);
            clearTimeout(headacheTimer);
            clearInterval(spawnTimer);
            clearInterval(moveTimer);
            clearInterval(drinkSpawnTimer);
            clearTimeout(drinkEffectTimer);
            clearInterval(skyCarouselTimer);
            
            const overlay = document.getElementById('game-over-overlay');
            const overlayTitle = document.getElementById('overlay-title');
            const overlayBtn = document.getElementById('overlay-btn');
            
            if (currentLevel === highestUnlockedLevel && highestUnlockedLevel < 20) {
                highestUnlockedLevel++;
                if (window.GK_State && window.GK_State.player) {
                    window.GK_State.player.shootoutLevel = highestUnlockedLevel;
                    if (typeof window.saveGameState === 'function') window.saveGameState(true);
                } else {
                    localStorage.setItem('gk_shootout_max_level', highestUnlockedLevel);
                }
            }
            let reward = currentLevel * 5;
            
            if (!window.GK_State) window.GK_State = {};
            if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };

            window.GK_State.economy.xp += reward;
            window.GK_State.economy.tokens += reward;

            if (!window.GK_State.player) window.GK_State.player = {};
            if (window.GK_State.player.tournamentDailyXP === undefined) window.GK_State.player.tournamentDailyXP = 0;
            window.GK_State.player.tournamentDailyXP += reward;

            if (typeof window.saveGameState === 'function') window.saveGameState(true);

            // Update local displays (if applicable)
            const xpDisplay = document.getElementById('xpDisplay');
            const tokenDisplay = document.getElementById('tokenDisplay');
            if (xpDisplay) xpDisplay.innerText = window.GK_State.economy.xp;
            if (tokenDisplay) tokenDisplay.innerText = window.GK_State.economy.tokens;

            // Sync the drawer displays immediately
            const globalXp = document.getElementById('global-xp');
            const globalTokens = document.getElementById('global-tokens');
            if (globalXp) globalXp.innerText = window.GK_State.economy.xp;
            if (globalTokens) globalTokens.innerText = window.GK_State.economy.tokens;


            overlayTitle.innerHTML = "LEVEL CLEARED!<br><span style='font-size:1rem; color:#ffd700;'>+" + reward + " XP | +" + reward + " Tokens</span>";
            overlayBtn.textContent = "Next Level";
            
            const overlayImageDiv = document.getElementById('overlay-image');
            if (overlayImageDiv) {
                let avatarUrl = window.getCelebrateAvatarUrl ? window.getCelebrateAvatarUrl() : '../../assets/locker-room/images/avatars/celebrate.png';
                overlayImageDiv.innerHTML = `<img src="${avatarUrl}" style="max-height: 280px; width: auto; object-fit: contain; margin: 0 auto 20px auto; display: block; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6)); position: relative; top: 140px;">`;
                overlayImageDiv.style.display = 'block';
            }
            
            overlay.classList.remove('hidden');
            overlayBtn.onclick = () => {
                overlay.classList.add('hidden');
                if (currentLevel < 20) {
                    currentLevel++;
                    updateLevelUI();
                } else {
                    startGame();
                }
            };
        }
    }
}

function fireProjectile(targetObj, useRocket = false, useLightning = false) {
    const proj = document.createElement('div');
    proj.classList.add('projectile');
    if (useRocket) {
        proj.classList.add('rocket-projectile');
    } else if (useLightning) {
        proj.classList.add('lightning-projectile');
    }
    gameWorld.appendChild(proj);
    
    const redAmmo = document.getElementById('red-ammo');
    const redRect = redAmmo.getBoundingClientRect();
    const worldRect = gameWorld.getBoundingClientRect();
    
    // Calculate exact center of the red ball relative to the game world
    proj.style.left = `${redRect.left - worldRect.left + (redRect.width / 2)}px`;
    proj.style.top = `${redRect.top - worldRect.top + (redRect.height / 2)}px`; 
    proj.style.transform = 'translate(-50%, -50%)'; // Center the projectile on the coordinate
    
    const targetRect = targetObj.element.getBoundingClientRect();
    const targetCenterX = targetRect.left - worldRect.left + (targetRect.width / 2);
    const targetCenterY = targetRect.top - worldRect.top + (targetRect.height / 2);
    
    // Animate to target
    setTimeout(() => {
        proj.style.left = `${targetCenterX}px`;
        proj.style.top = `${targetCenterY}px`;
    }, 10);
    
    if (useRocket) {
        let trailInterval = setInterval(() => {
            if (!proj.parentElement) return;
            const currentRect = proj.getBoundingClientRect();
            const trail = document.createElement('div');
            trail.style.position = 'absolute';
            trail.style.width = '30px';
            trail.style.height = '30px';
            trail.style.background = 'rgba(200,200,200,0.8)';
            trail.style.borderRadius = '50%';
            trail.style.zIndex = '5';
            
            trail.style.left = `${currentRect.left - worldRect.left + (currentRect.width / 2)}px`;
            trail.style.top = `${currentRect.top - worldRect.top + (currentRect.height / 2)}px`;
            trail.style.transform = 'translate(-50%, -50%)';
            trail.style.filter = 'blur(5px)';
            gameWorld.appendChild(trail);
            
            setTimeout(() => {
                trail.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
                trail.style.opacity = '0';
                trail.style.transform = 'translate(-50%, -50%) scale(2.5)';
            }, 20);
            
            setTimeout(() => trail.remove(), 500);
        }, 30);
        
        setTimeout(() => clearInterval(trailInterval), 400);
    }
    
    setTimeout(() => {
        proj.remove();
        if (activeOpponents.includes(targetObj)) {
            let dmg = 1;
            if (useRocket) dmg = 3;
            else if (useLightning) dmg = 2;
            
            // Get coordinates BEFORE checkOpponentDeath removes the element
            const targetRect = targetObj.element.getBoundingClientRect();
            const targetCenterX = targetRect.left + (targetRect.width / 2);
            const targetCenterY = targetRect.top + (targetRect.height / 2);
            
            targetObj.currentHP -= dmg;
            targetObj.badge.textContent = targetObj.currentHP;
            
            let clapSound = new Audio('../../assets/sound/clap.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') clapSound.muted = true;
            clapSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => { clapSound.pause(); clapSound.currentTime = 0; }, 300);

            checkOpponentDeath(targetObj);
            
            if (useRocket) {
                const explosion = document.createElement('div');
                explosion.style.position = 'absolute';
                explosion.style.width = '150px';
                explosion.style.height = '150px';
                explosion.style.borderRadius = '50%';
                explosion.style.background = 'radial-gradient(circle, #ffeb3b 0%, #ff5722 40%, rgba(255,0,0,0) 80%)';
                explosion.style.mixBlendMode = 'screen';
                explosion.style.zIndex = '60';
                
                const worldRect = gameWorld.getBoundingClientRect();
                explosion.style.left = `${targetCenterX - worldRect.left - 75}px`;
                explosion.style.top = `${targetCenterY - worldRect.top - 75}px`;
                explosion.style.animation = 'rocketExplosion 0.4s ease-out forwards';
                
                gameWorld.appendChild(explosion);
                setTimeout(() => explosion.remove(), 400);
            }
            
            if (useLightning) {
                // Lightning falling from the sky
                const skyBolt = document.createElement('div');
                skyBolt.style.position = 'absolute';
                skyBolt.style.width = '15px';
                skyBolt.style.height = '1000px';
                skyBolt.style.background = 'white';
                skyBolt.style.boxShadow = '0 0 15px #00e5ff, 0 0 30px #00e5ff';
                skyBolt.style.left = `${targetCenterX - worldRect.left - 7.5}px`;
                skyBolt.style.bottom = `${worldRect.height - targetCenterY + worldRect.top}px`;
                skyBolt.style.transformOrigin = 'bottom center';
                skyBolt.style.transform = 'scaleY(0)';
                skyBolt.style.zIndex = '100';
                gameWorld.appendChild(skyBolt);
                
                requestAnimationFrame(() => {
                    skyBolt.style.transition = 'transform 0.1s ease-in';
                    skyBolt.style.transform = 'scaleY(1)';
                });
                
                setTimeout(() => {
                    skyBolt.style.transition = 'opacity 0.2s ease-out';
                    skyBolt.style.opacity = '0';
                    setTimeout(() => skyBolt.remove(), 200);
                }, 150);

                // Primary hit visual flash
                const flash = document.createElement('div');
                flash.style.position = 'absolute';
                flash.style.width = '120px';
                flash.style.height = '120px';
                flash.style.borderRadius = '50%';
                flash.style.background = 'radial-gradient(circle, rgba(0,229,255,1) 0%, rgba(0,229,255,0) 70%)';
                flash.style.mixBlendMode = 'screen';
                flash.style.zIndex = '60';
                
                flash.style.left = `${targetCenterX - worldRect.left - 60}px`;
                flash.style.top = `${targetCenterY - worldRect.top - 60}px`;
                gameWorld.appendChild(flash);
                setTimeout(() => flash.remove(), 200);
                
                let closestDist = Infinity;
                let secondaryTarget = null;
                
                for (let opp of activeOpponents) {
                    if (opp === targetObj) continue;
                    const oppRect = opp.element.getBoundingClientRect();
                    const oppCenterX = oppRect.left + (oppRect.width / 2);
                    const oppCenterY = oppRect.top + (oppRect.height / 2);
                    
                    const dist = Math.sqrt(Math.pow(oppCenterX - targetCenterX, 2) + Math.pow(oppCenterY - targetCenterY, 2));
                    if (dist < closestDist) {
                        closestDist = dist;
                        secondaryTarget = opp;
                    }
                }
                
                if (secondaryTarget) {
                    secondaryTarget.currentHP -= 1;
                    secondaryTarget.badge.textContent = secondaryTarget.currentHP;
                    
                    const secRect = secondaryTarget.element.getBoundingClientRect();
                    const secCenterX = secRect.left + (secRect.width / 2);
                    const secCenterY = secRect.top + (secRect.height / 2);
                    const angle = Math.atan2(secCenterY - targetCenterY, secCenterX - targetCenterX);
                    
                    const arc = document.createElement('div');
                    arc.classList.add('lightning-arc');
                    const localStartX = targetCenterX - worldRect.left;
                    const localStartY = targetCenterY - worldRect.top;
                    
                    arc.style.width = `${closestDist}px`;
                    arc.style.left = `${localStartX}px`;
                    arc.style.top = `${localStartY}px`;
                    arc.style.transform = `translateY(-50%) rotate(${angle}rad)`;
                    
                    gameWorld.appendChild(arc);
                    
                    setTimeout(() => {
                        arc.remove();
                    }, 150);
                    
                    checkOpponentDeath(secondaryTarget);
                }
            }
        } else if (activeSkyItems.includes(targetObj)) {
            let clapSound = new Audio('../../assets/sound/clap.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') clapSound.muted = true;
            clapSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => { clapSound.pause(); clapSound.currentTime = 0; }, 300);

            const targetRect = targetObj.element.getBoundingClientRect();
            const pointerEvent = new PointerEvent('pointerdown', { 
                bubbles: true, 
                clientX: targetRect.left + (targetRect.width / 2),
                clientY: targetRect.top + (targetRect.height / 2)
            });
            targetObj.element.dispatchEvent(pointerEvent);
            
            if (useRocket) {
                const explosion = document.createElement('div');
                explosion.style.position = 'absolute';
                explosion.style.width = '100px';
                explosion.style.height = '100px';
                explosion.style.borderRadius = '50%';
                explosion.style.background = 'radial-gradient(circle, #ffeb3b 0%, #ff5722 40%, rgba(255,0,0,0) 80%)';
                explosion.style.mixBlendMode = 'screen';
                explosion.style.zIndex = '60';
                
                const targetCenterX = targetRect.left + (targetRect.width / 2);
                const targetCenterY = targetRect.top + (targetRect.height / 2);
                const worldRect = gameWorld.getBoundingClientRect();
                explosion.style.left = `${targetCenterX - worldRect.left - 50}px`;
                explosion.style.top = `${targetCenterY - worldRect.top - 50}px`;
                explosion.style.animation = 'rocketExplosion 0.3s ease-out forwards';
                
                gameWorld.appendChild(explosion);
                setTimeout(() => explosion.remove(), 300);
            }
        }
    }, 200);
}

function fireMissProjectile(angle) {
    const proj = document.createElement('div');
    proj.classList.add('projectile');
    container.appendChild(proj);
    
    const redAmmo = document.getElementById('red-ammo');
    const redRect = redAmmo.getBoundingClientRect();
    const worldRect = gameWorld.getBoundingClientRect();
    
    // Calculate exact center of the red ball relative to the game world
    const startX = redRect.left - worldRect.left + (redRect.width / 2);
    const startY = redRect.top - worldRect.top + (redRect.height / 2);
    
    proj.style.left = `${startX}px`;
    proj.style.top = `${startY}px`; 
    proj.style.transform = 'translate(-50%, -50%)'; 
    
    // Calculate a point far off screen
    const destX = startX + Math.cos(angle) * 1000;
    const destY = startY + Math.sin(angle) * 1000;
    
    setTimeout(() => {
        proj.style.left = `${destX}px`;
        proj.style.top = `${destY}px`;
    }, 10);
    
    setTimeout(() => {
        if (proj.parentElement) proj.remove();
    }, 400);
    
    const missText = document.createElement('div');
    missText.classList.add('miss-text');
    missText.textContent = "MISS!";
    container.appendChild(missText);
    
    setTimeout(() => {
        if (missText.parentElement) missText.remove();
    }, 600);
}

container.addEventListener('pointerdown', (e) => {
    // If the drawer is open and the user clicks outside of it and not on the gear icon, close it
    if (sideDrawer.style.right === '0px' && 
        !e.target.closest('#side-drawer') && 
        !e.target.closest('#open-drawer-btn')) {
        sideDrawer.style.right = '-100%';
        const backdrop = document.getElementById('hub-backdrop');
        if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
        if (!isGameOver) {
            isGamePaused = false;
            resumeGame();
        }
        return;
    }

    if (isGamePaused && !isRocketArmed && !isLightningArmed) return;

    // Ignore clicks on HUD, Score, Timer, OR the Overlay
    if (e.target.closest('.level-control-panel') || 
        e.target.closest('#open-drawer-btn') || 
        e.target.closest('#sound-toggle-btn') || 
        e.target.closest('.game-back-btn') || 
        e.target.closest('#side-drawer') || 
        e.target.closest('.match-state-panel') || 
        e.target.closest('#timer-bar-container') || 
        e.target.closest('#game-over-overlay')) {
        return;
    }
    
    e.preventDefault(); 
    container.setPointerCapture(e.pointerId);
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    isSwiping = true;
    
    const redAmmo = document.getElementById('red-ammo');
    if (redAmmo) {
        const redRect = redAmmo.getBoundingClientRect();
        const padding = 40;
        startedInRed = (
            e.clientX >= (redRect.left - padding) && 
            e.clientX <= (redRect.right + padding) && 
            e.clientY >= (redRect.top - padding) && 
            e.clientY <= (redRect.bottom + padding)
        );
        lastTouchX = e.clientX;
    }
});

container.addEventListener('pointermove', (e) => {
    if (!isSwiping || !startedInRed || !isRocketArmed) return;
    
    // Calculate scrub distance
    const dist = Math.abs(e.clientX - lastTouchX);
    rocketCharge += dist;
    lastTouchX = e.clientX;
    
    // Update UI
    const fuelFill = document.getElementById('rocket-fuel-fill');
    if (fuelFill) {
        const percentage = Math.min(100, (rocketCharge / 1000) * 100);
        fuelFill.style.width = `${percentage}%`;
    }
    
    // Visual scrub feedback for ball
    const redAmmo = document.getElementById('red-ammo');
    if (redAmmo) {
        // slight jitter for feedback
        let jitter = (Math.random() - 0.5) * 10;
        redAmmo.style.transform = `translateX(calc(-50% + ${jitter}px))`;
    }
});

container.addEventListener('pointerup', (e) => {
    if (container.hasPointerCapture && container.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
    }
    
    if (!isSwiping) return;
    
    if (isGameOver) {
        isSwiping = false;
        return;
    }
    
    const pointerEndX = e.clientX;
    const pointerEndY = e.clientY;
    
    const deltaX = pointerEndX - pointerStartX;
    const deltaY = pointerEndY - pointerStartY;
    
    // Reset state early so we don't double fire
    isSwiping = false;
    pointerStartX = 0;
    pointerStartY = 0;
    
    const redAmmo = document.getElementById('red-ammo');
    if (!redAmmo) return;
    
    const redRect = redAmmo.getBoundingClientRect();
    const padding = 40;
    const startInRed = (
        (e.clientX - deltaX) >= (redRect.left - padding) && 
        (e.clientX - deltaX) <= (redRect.right + padding) &&
        (e.clientY - deltaY) >= (redRect.top - padding) && 
        (e.clientY - deltaY) <= (redRect.bottom + padding)
    );
    
    if (startInRed) {
        // Calculate total swipe distance to ensure it is a swipe, not a tap
        const swipeDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (swipeDistance > 30) {
            
            if (!hasPaidForCurrentMatch) {
                const devInfiniteStamina = document.getElementById('dev-infinite-stamina');
                let hasInfinite = devInfiniteStamina && devInfiniteStamina.checked;
                if (!hasInfinite) {
                    if (window.GK_State.player.currentStamina < 10) {
                        const overlay = document.getElementById('game-over-overlay');
                        const overlayTitle = document.getElementById('overlay-title');
                        const overlayBtn = document.getElementById('overlay-btn');
                        overlayTitle.innerHTML = 'OUT OF STAMINA!<br><a onclick="window.location.href = &apos;../../features/locker-room/index.html?action=recovery&returnTo=shootout&apos;;" ontouchend="window.location.href = &apos;../../features/locker-room/index.html?action=recovery&returnTo=shootout&apos;; event.preventDefault();" style="cursor: pointer; font-size: 1.5rem; text-decoration: underline; color: #00d2ff; display: block; margin-top: 15px; pointer-events: auto;">Recharge in Recovery Hub</a>';
                        overlayBtn.textContent = "Close";
                        overlay.classList.remove('hidden');
                        overlayBtn.onclick = () => overlay.classList.add('hidden');
                        return;
                    }
                    if (typeof window.spendStamina === 'function') {
                        window.spendStamina(10);
                    }
                }
                hasPaidForCurrentMatch = true;
            }
            
            if (isRocketArmed) {
                const fuelContainer = document.getElementById('rocket-fuel-container');
                if (fuelContainer && !fuelContainer.classList.contains('hidden')) {
                    if (rocketCharge < 1000) {
                        const warn = document.createElement('div');
                        warn.className = 'charge-warning';
                        warn.textContent = 'CHARGE ROCKET FIRST!';
                        gameWorld.appendChild(warn);
                        setTimeout(() => warn.remove(), 1000);
                        return;
                    }
                }
            }
            
            const ballCenterX = redRect.left + (redRect.width / 2);
            const ballCenterY = redRect.top + (redRect.height / 2);
            const swipeAngle = Math.atan2(deltaY, deltaX);
            
            // Fire projectiles without charge checks since charging is done in overlay
            
            // Define the strict hit cone (approx 45 degrees total, slightly wider for rocket)
            let currentTolerance = isRocketArmed ? ((Math.PI / 8) * 1.25) : (Math.PI / 8);
            let hitTarget = null;
            let minAngleDiff = Infinity;
            
            const potentialTargets = [...activeOpponents, ...activeSkyItems];
            
            // Loop through all opponents and sky items to find the best match for the swipe angle
            for (let opp of potentialTargets) {
                const targetRect = opp.element.getBoundingClientRect();
                const targetCenterX = targetRect.left + (targetRect.width / 2);
                const targetCenterY = targetRect.top + (targetRect.height / 2);
                const targetAngle = Math.atan2(targetCenterY - ballCenterY, targetCenterX - ballCenterX);
                
                let angleDiff = Math.abs(swipeAngle - targetAngle);
                if (angleDiff > Math.PI) {
                    angleDiff = (2 * Math.PI) - angleDiff;
                }
                
                // STRICT CHECK: The swipe MUST be within the tolerance cone of the opponent.
                // If they swipe into empty space, this never triggers, resulting in a MISS.
                if (angleDiff <= currentTolerance && angleDiff < minAngleDiff) {
                    minAngleDiff = angleDiff;
                    hitTarget = opp;
                }
            }
            
            let kickSound = new Audio('../../assets/sound/soccer kick.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') kickSound.muted = true;
            kickSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => { kickSound.pause(); kickSound.currentTime = 0; }, 500);

            if (hitTarget) {
                fireProjectile(hitTarget, isRocketArmed, isLightningArmed);
            } else {
                // Punish wild swipes that weren't close enough to any opponent
                fireMissProjectile(swipeAngle);
            }
            
            // Cleanup specials after shot
            if (isRocketArmed) disarmRocket();
            if (isLightningArmed) disarmLightning();
            
        }
    }
});

// Init
const rocketBtn = document.getElementById('rocket-counter-btn');
if (rocketBtn) {
    rocketBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); // prevent misfiring on container
        
        if (isRocketArmed) {
            disarmRocket();
            specialBallCount2++;
            const c2 = document.getElementById('count-special-2');
            if (c2) c2.textContent = specialBallCount2;
            return;
        }
        
        if (isLightningArmed) {
            disarmLightning();
            specialBallCount1++;
            const c1 = document.getElementById('count-special-1');
            if (c1) c1.textContent = specialBallCount1;
        }
        
        if (specialBallCount2 > 0 && !isRocketArmed) {
            isRocketArmed = true;
            isGamePaused = true;
            specialBallCount2--;
            const c2 = document.getElementById('count-special-2');
            if (c2) c2.textContent = specialBallCount2;
            rocketCharge = 0;
            
            const fuelContainer = document.getElementById('rocket-fuel-container');
            if (fuelContainer) fuelContainer.classList.remove('hidden');
            const fuelFill = document.getElementById('rocket-fuel-fill');
            if (fuelFill) fuelFill.style.width = '0%';
            
            rocketBtn.style.filter = 'drop-shadow(0 0 10px yellow)'; // Armed visual feedback
            
            const redAmmo = document.getElementById('red-ammo');
            if (redAmmo) {
                redAmmo.classList.add('rocket-projectile');
                redAmmo.style.animation = 'none'; // Stop drifting
            }
        }
    });
}

const lightningBtn = document.getElementById('lightning-counter-btn');
if (lightningBtn) {
    lightningBtn.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        
        if (isLightningArmed) {
            disarmLightning();
            specialBallCount1++;
            const c1 = document.getElementById('count-special-1');
            if (c1) c1.textContent = specialBallCount1;
            return;
        }
        
        if (isRocketArmed) {
            disarmRocket();
            specialBallCount2++;
            const c2 = document.getElementById('count-special-2');
            if (c2) c2.textContent = specialBallCount2;
        }
        
        if (specialBallCount1 > 0 && !isLightningArmed) {
            isLightningArmed = true;
            isGamePaused = true;
            lightningTaps = 0;
            specialBallCount1--;
            const c1 = document.getElementById('count-special-1');
            if (c1) c1.textContent = specialBallCount1;
            
            lightningBtn.style.filter = 'drop-shadow(0 0 10px #00e5ff)';
            
            const redAmmo = document.getElementById('red-ammo');
            if (redAmmo) {
                redAmmo.classList.add('lightning-projectile');
                redAmmo.style.animation = 'none'; // Stop drifting
            }
        }
    });
}

difficultySlider.value = currentLevel;
levelDisplay.textContent = currentLevel;
startGame();
requestAnimationFrame(gameLoop);

const devDisableBlur = document.getElementById('dev-disable-blur');
if (devDisableBlur) {
    devDisableBlur.addEventListener('change', (e) => {
        if (e.target.checked) {
            gameWorld.style.filter = 'none';
        }
    });
}

const devAddBalls = document.getElementById('dev-add-balls');
if (devAddBalls) {
    devAddBalls.addEventListener('click', () => {
        // Obsolete but kept just in case
    });
}

const devTestRocket = document.getElementById('dev-test-rocket');
if (devTestRocket) {
    devTestRocket.addEventListener('click', () => {
        const sideDrawer = document.getElementById('side-drawer');
        if (sideDrawer) sideDrawer.style.right = '-100%';
        const backdrop = document.getElementById('hub-backdrop');
        if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
        triggerChargeOverlay('rocket');
    });
}

const devTestLightning = document.getElementById('dev-test-lightning');
if (devTestLightning) {
    devTestLightning.addEventListener('click', () => {
        const sideDrawer = document.getElementById('side-drawer');
        if (sideDrawer) sideDrawer.style.right = '-100%';
        const backdrop = document.getElementById('hub-backdrop');
        if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
        triggerChargeOverlay('lightning');
    });
}

// Show initial tutorial based on daily/level logic
isGamePaused = true;
const mainTutorialOverlay = document.getElementById('main-tutorial-overlay');

function triggerGameStartSequence() {
    const countdownOverlay = document.getElementById('gameCountdownOverlay');
    const text = document.getElementById('gameCountdownText');
    const rulesBtn = document.getElementById('countdownRulesBtn');
    
    if (window.GK_State?.developer?.disableCountdowns) {
        if (countdownOverlay) countdownOverlay.style.display = 'none';
        isGamePaused = false;
    } else if (countdownOverlay) {
        countdownOverlay.style.display = 'flex';
        let count = 3;
        text.innerText = count;
        
        let timer = setInterval(() => {
            count--;
            if (count > 0) {
                text.innerText = count;
            } else if (count === 0) {
                text.innerText = 'GO!';
            } else {
                clearInterval(timer);
                countdownOverlay.style.display = 'none';
                isGamePaused = false;
            }
        }, 1000);

        if (rulesBtn) {
            rulesBtn.onclick = () => {
                clearInterval(timer);
                countdownOverlay.style.display = 'none';
                isGamePaused = false;
                
                const btn = document.getElementById('open-drawer-btn');
                if (btn) btn.click();
                
                const rulesDetails = Array.from(document.querySelectorAll('details')).find(d => d.innerHTML.includes('Rules'));
                if(rulesDetails) rulesDetails.open = true;
            };
        }

        const skipBtn = document.getElementById('skipCountdownBtn');
        if (skipBtn) {
            skipBtn.onclick = () => {
                clearInterval(timer);
                countdownOverlay.style.display = 'none';
                isGamePaused = false;
            };
        }
    } else {
        isGamePaused = false;
    }
}

if (mainTutorialOverlay) {
    const today = new Date().toDateString();
    const lastTutorialDate = localStorage.getItem('gk_shootout_tutorial_date');

    if (currentLevel <= 2 && lastTutorialDate !== today) {
        mainTutorialOverlay.classList.remove('hidden');
        const mainGlove = document.getElementById('main-tutorial-glove');
        if (mainGlove) {
            mainGlove.classList.add('main-flick-anim');
        }
        
        localStorage.setItem('gk_shootout_tutorial_date', today);
        
        mainTutorialOverlay.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            mainTutorialOverlay.classList.add('hidden');
            if (mainGlove) mainGlove.classList.remove('main-flick-anim');
            triggerGameStartSequence();
        }, { once: true });

        const skipTutorialBtn = document.getElementById('skipTutorialBtn');
        if (skipTutorialBtn) {
            skipTutorialBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                mainTutorialOverlay.classList.add('hidden');
                if (mainGlove) mainGlove.classList.remove('main-flick-anim');
                triggerGameStartSequence();
            });
        }
    } else {
        // Logic to immediately bypass the tutorial and start the game/first wave
        mainTutorialOverlay.classList.add('hidden');
        triggerGameStartSequence();
    }
}

window.updateShootOutUI = function() {
    if (!window.GK_State) return;

    const btnRomeo = document.getElementById('btn-romeo');
    if (btnRomeo) {
        if (window.GK_State.catalogues.shootout.moves['romeo_rocket']?.owned) {
            btnRomeo.innerText = 'Purchased';
            btnRomeo.disabled = true;
            btnRomeo.style.background = '#333';
            btnRomeo.style.color = '#888';
            btnRomeo.style.cursor = 'not-allowed';
        }
    }

    const btnLightning = document.getElementById('btn-lightning');
    if (btnLightning) {
        if (window.GK_State.catalogues.shootout.moves['lightning_ball']?.owned) {
            btnLightning.innerText = 'Purchased';
            btnLightning.disabled = true;
            btnLightning.style.background = '#333';
            btnLightning.style.color = '#888';
            btnLightning.style.cursor = 'not-allowed';
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    // UI Hydration on Load
    if (!window.GK_State) window.GK_State = {};
    if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };
    
    const xpDisplay = document.getElementById('xpDisplay');
    const tokenDisplay = document.getElementById('tokenDisplay');
    if (xpDisplay) xpDisplay.innerText = window.GK_State.economy.xp;
    if (tokenDisplay) tokenDisplay.innerText = window.GK_State.economy.tokens;
    
    const globalXp = document.getElementById('global-xp');
    const globalTokens = document.getElementById('global-tokens');
    if (globalXp) globalXp.innerText = window.GK_State.economy.xp;
    if (globalTokens) globalTokens.innerText = window.GK_State.economy.tokens;

    if (typeof window.updateShootOutUI === 'function') window.updateShootOutUI();
});

// Intercept Android hardware back button
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
        window.location.href = '../../menu.html';
    });
}
