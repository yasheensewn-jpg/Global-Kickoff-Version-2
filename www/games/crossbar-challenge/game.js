const ball = document.getElementById('ball');
const targetBox = document.getElementById('targetBox');
const flashOverlay = document.getElementById('flashOverlay');
const message = document.getElementById('message');
const gameContainer = document.getElementById('gameContainer');
const attemptCountEl = document.getElementById('attemptCount');
const hitCountEl = document.getElementById('hitCount');
const levelDisplayEl = document.getElementById('levelDisplay');
const unlockedDisplayEl = document.getElementById('unlockedDisplay');

const nextBtn = document.getElementById('nextBtn');
const goAgainBtn = document.getElementById('goAgainBtn');
const levelSlider = document.getElementById('levelSlider');
const levelDownBtn = document.getElementById('levelDownBtn');
const levelUpBtn = document.getElementById('levelUpBtn');

// Dev Panel & Wind DOM
const devMenuBtn = document.getElementById('devMenuBtn');
const devPanel = document.getElementById('devPanel');
const windToggle = document.getElementById('windToggle');
const glareToggle = document.getElementById('glareToggle');
const crowdToggle = document.getElementById('crowdToggle');
const windIndicator = document.getElementById('windIndicator');
const windArrow = document.getElementById('windArrow');
const windSpeed = document.getElementById('windSpeed');
const windVisuals = document.getElementById('windVisuals');
const timerToggle = document.getElementById('devDisableTimerToggle');
const shotClock = document.getElementById('shotClock');

// Timer State
let timeLeft = 20;
let timerIntervalId = null;
let isTimerEnabled = true;

// Wind State Variables
let currentWind = 0;
let targetWind = 0;
let windIntervalId = null;
let windVisualElements = [];
let gustEffectTimer = null;
let isWindEnabled = true;
let isGlareEnabled = false;
let isCrowdEnabled = false;
let windInterpolationId = null;
let lastWindTime = 0;
let windVulnerability = 1;
let flareTime = 0;

// Locker Room State
// Locker Room & Moves State linked to Global State
const equipmentCatalogue = window.GK_State.catalogues.crossbar.gear;
const movesCatalogue = window.GK_State.catalogues.crossbar.moves;

// Special Move States
let isRomeoTutorialComplete = false;
let isTutorialsDisabled = false;
let isMoonballTutorialComplete = false;
let isHijinxTutorialComplete = false;
let equippedMove = 'basic_kick'; 
let rocketCharge = 0;
let lastChargeTime = 0;
let lastTouchX = 0;
let currentScrubDirection = 0; 
let currentStrokeDistance = 0; 
let isRocketInFlight = false;
let isMoonballCharged = false;
let isMoonballInFlight = false;
let patternNodes = [];
let currentPatternIndex = 0;
let moonTimerId = null;
let isTracing = false;

let jinxState = 0; 
let isTargetGloballyAligned = false;
let lastGreenTime = 0;
let jinxOrbsData = [];
let jinxActiveLoop = null;
let jinxHasScored = false; 
let isJinxInFlight = false;
// Global Stamina State
const maxStamina = 500;
let currentStamina = 500;
let isInfiniteStamina = false;

// Stamina UI and Dev Toggle
const infiniteStaminaToggle = document.getElementById('infiniteStaminaToggle');
if (infiniteStaminaToggle) {
    infiniteStaminaToggle.addEventListener('change', (e) => {
        isInfiniteStamina = e.target.checked;
    });
}

function updateStaminaUI() {
    const staminaDisplay = document.getElementById('staminaDisplay');
    const staminaFill = document.getElementById('staminaFill');
    if (staminaDisplay) staminaDisplay.innerText = currentStamina;
    if (staminaFill) {
        let percent = (currentStamina / maxStamina) * 100;
        staminaFill.style.width = percent + '%';
        if (percent < 25) {
            staminaFill.style.backgroundColor = '#ff4757';
        } else if (percent < 50) {
            staminaFill.style.backgroundColor = '#ffa502';
        } else {
            staminaFill.style.backgroundColor = '#38ef7d';
        }
    }
}

function checkStamina() {
    if (infiniteStaminaToggle && infiniteStaminaToggle.checked) return true;
    if (hasPaidForCurrentMatch) return true; // Already paid for this match

    if (typeof window.spendStamina === 'function') {
        if (window.spendStamina(10)) { // Flat 10 stamina cost per match
            hasPaidForCurrentMatch = true;
            return true;
        } else {
            showMessage('OUT OF STAMINA!<br><a onclick="window.location.href = &apos;../../features/locker-room/index.html?action=recovery&returnTo=crossbar&apos;;" ontouchend="window.location.href = &apos;../../features/locker-room/index.html?action=recovery&returnTo=crossbar&apos;; event.preventDefault();" style="cursor: pointer; font-size: 1.5rem; text-decoration: underline; color: #00d2ff; display: block; margin-top: 15px; pointer-events: auto;">Recharge in Recovery Hub</a>', '#ff4757');
            setTimeout(hideMessage, 1200);
            resetBall();
            return false;
        }
    }
    return true; // Fallback
}

// Global Economy State
// Removed local totalXP and totalTokens

// Rule 1: Level Tracking Variables
let currentLevel = window.GK_State?.player?.crossbarLevel || parseInt(localStorage.getItem('gk_crossbar_max_level')) || 1;
let highestUnlockedLevel = currentLevel;
let isAllLevelsUnlocked = false;

window.addEventListener('gk_state_updated', () => {
    if (window.GK_State?.player?.crossbarLevel) {
        highestUnlockedLevel = Math.max(highestUnlockedLevel, window.GK_State.player.crossbarLevel);
        if (!isAllLevelsUnlocked) {
            levelSlider.max = highestUnlockedLevel;
            currentLevel = highestUnlockedLevel;
            levelSlider.value = currentLevel;
            triggerLevelUpdate(currentLevel);
        }
    }
});

// Bonus Round State
let isBonusRound = false;
let lastTeleportTime = 0;

// Match State
let matchScore = 0;
let currentAttempt = 1;
let hasPaidForCurrentMatch = false;
const maxAttempts = 3;
let hasHitTarget = false; 
let dynamicFloorY = 0; 
let hasBounced = false; 

// Physical State
let state = 'idle'; // 'idle', 'dragging', 'flying', 'result'
let startX = 0;
let startY = 0;
let touchHistory = []; // Rule 1: Track recent movement, not total holding time
// 2.5D Physics State
let ballX = 0; 
let ballY = 740; // Depth natively anchoring bottom coordinates mathematically backwards mapping strictly 
let ballZ = 0; // Height off ground
let vx = 0;
let vy = 0; 
let vz = 0; 
let crossedGoalLine = false;

const gravityZ = 0.8; // Slashed massively generating floating moon gravity loops natively providing forgiving arcs!
const frictionAir = 0.98;
const frictionGround = 0.85;
let goalLineY = 504; // Static structural base anchoring physics perfectly to 100% rendering identically natively!
let animationFrameId = null;

let gameScale = 1;

function resize() {
    const wrapper = document.getElementById('canvasWrapper');
    if(!wrapper) return;
    const wrapperRect = wrapper.getBoundingClientRect();
    const scaleX = wrapperRect.width / 450;
    const scaleY = wrapperRect.height / 800;
    gameScale = Math.min(scaleX, scaleY) * 0.98; // 0.98 limits screen pushing securely
    gameContainer.style.transform = `scale(${gameScale})`;
    
    // Background width is strictly handled by CSS width: 100% height: 100%
}
window.addEventListener('resize', resize);
setTimeout(resize, 0);



const handleTargetTap = (e) => {
    e.stopPropagation();
    if (e && e.type === 'touchstart' && e.cancelable) {
        e.preventDefault();
    }
    if (state === 'result') return;
    if (equippedMove === 'hi_jinx' && jinxState === 0) {
        if (isTargetGloballyAligned || (Date.now() - lastGreenTime < 250)) {
            jinxState = 1;
            const jinxArrow = document.getElementById('jinx-launch-arrow');
            if (jinxArrow) jinxArrow.classList.remove('hidden');
            flashOverlay.style.background = 'rgba(0, 229, 255, 0.3)';
            flashOverlay.style.opacity = '1';
            setTimeout(() => flashOverlay.style.opacity = '0', 200);
            
            // GLARE BUFF: Upgrades to 5 hovering orbs
            // CROWD DEBUFF: Drops to 1 orb. GLARE BUFF: Upgrades to 5 orbs. Baseline: 3.
            let isGlareActive = isGlareEnabled;
            let orbCount = isCrowdEnabled ? 1 : (isGlareActive ? 5 : 3);
            
            const container = document.getElementById('gameContainer');
            for(let i=0; i<orbCount; i++) {
                let orb = document.createElement('div');
                orb.className = 'jinx-orb';
                orb.id = 'jinxOrb' + i;
                
                let shadow = document.createElement('div');
                shadow.className = 'jinx-orb-shadow';
                shadow.id = 'jinxShadow' + i;
                
                container.appendChild(shadow);
                container.appendChild(orb);
                
                let spreadIndex = i - Math.floor(orbCount / 2);
                let screenX = 225 + (spreadIndex * 40); 
                let screenY = 400; 
                orb.style.left = screenX + 'px';
                orb.style.top = screenY + 'px';
                shadow.style.left = screenX + 'px';
                shadow.style.top = '550px'; 
            }
        } else {
            showMessage('TIMING MISSED!', '#ff4757'); setTimeout(hideMessage, 800);
        }
    }
};

targetBox.addEventListener('mousedown', handleTargetTap);
targetBox.addEventListener('touchstart', handleTargetTap, { passive: false });

// Dragging Mechanics
const gameArea = document.getElementById('gameContainer');
gameArea.addEventListener('mousedown', (e) => {
    if (e.target.closest('button') || e.target.closest('details') || e.target.closest('#devMenuBtn') || e.target.closest('#moveSelectorUI') || e.target.closest('#targetBox')) return;
    handleDragStart(e);
});
gameArea.addEventListener('touchstart', (e) => {
    if (e.target.closest('button') || e.target.closest('details') || e.target.closest('#devMenuBtn') || e.target.closest('#moveSelectorUI') || e.target.closest('#targetBox')) return;
    handleDragStart(e);
}, { passive: false });

document.addEventListener('mousemove', handleDragMove);
document.addEventListener('touchmove', handleDragMove, { passive: false });

document.addEventListener('mouseup', handleDragEnd);
document.addEventListener('touchend', handleDragEnd, { passive: false });
document.addEventListener('touchcancel', handleDragEnd, { passive: false });

let tutorialVisualsIntervals = [];
let tutorialVisualsTimeouts = [];

function clearTutorialVisuals() {
    tutorialVisualsIntervals.forEach(clearInterval);
    tutorialVisualsIntervals = [];
    tutorialVisualsTimeouts.forEach(clearTimeout);
    tutorialVisualsTimeouts = [];
    
    const canvas = document.getElementById('patternCanvas');
    if (canvas) { canvas.classList.add('hidden'); canvas.innerHTML = ''; }
    
    const tutorialTextEl = document.getElementById('special-tutorial-text');
    if (tutorialTextEl) tutorialTextEl.classList.add('hidden');
    for(let i=0; i<3; i++) {
        let orb = document.getElementById('tutOrb'+i);
        let shadow = document.getElementById('tutOrbShadow'+i);
        if(orb) orb.remove();
        if(shadow) shadow.remove();
    }
}

function checkNodeHit(clientX, clientY) {
    if (equippedMove === 'scarlett_moonball' && isTracing && !isMoonballCharged) {
        let targetNode = document.getElementById('node-' + currentPatternIndex);
        if (!targetNode) return;
        let rect = targetNode.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        
        let nodeCenterX = rect.left + (rect.width / 2);
        let nodeCenterY = rect.top + (rect.height / 2);
        
        let dist = Math.hypot(clientX - nodeCenterX, clientY - nodeCenterY);
        
        if (dist < 60) {
            targetNode.setAttribute('fill', '#ff4757');
            targetNode.classList.remove('next-node'); 
            targetNode.style.stroke = '#ff4757';
            targetNode.style.strokeWidth = '2px';
            targetNode.style.filter = 'none';
            
            currentPatternIndex++;
            
            if (currentPatternIndex >= patternNodes.length) {
                isMoonballCharged = true;
                isTracing = false;
                state = 'idle'; // Abort the current drag to force a new swipe for aiming/shooting
                if (moonTimerId) clearTimeout(moonTimerId);
                document.getElementById('patternCanvas').classList.add('hidden');
                document.getElementById('moonTimerBar').classList.add('hidden');
                ball.classList.add('scarlet-moon');
                ball.style.transform = 'translate(-50%, 0) scale(1)'; // Visual feedback that trace is over
            } else {
                let nextCircle = document.getElementById('node-' + currentPatternIndex);
                if (nextCircle) {
                    nextCircle.classList.add('next-node');
                    nextCircle.style.stroke = '#ffd700';
                    nextCircle.style.strokeWidth = '4px';
                    nextCircle.style.filter = 'drop-shadow(0 0 10px #ffd700)';
                }
            }
        }
    }
}

function dismissActiveTutorial() {
    const tutorialGlove = document.getElementById('tutorialGlove');
    if (tutorialGlove && !tutorialGlove.classList.contains('hidden')) {
        tutorialGlove.classList.add('hidden');
        tutorialGlove.classList.remove('tutorial-anim', 'moonball-tutorial-anim', 'hijinx-tutorial-anim');
        
        if (equippedMove === 'romeo_rocket' && !isRomeoTutorialComplete) isRomeoTutorialComplete = true;
        if (equippedMove === 'scarlett_moonball' && !isMoonballTutorialComplete) isMoonballTutorialComplete = true;
        if (equippedMove === 'hi_jinx' && !isHijinxTutorialComplete) isHijinxTutorialComplete = true;
        
        clearTutorialVisuals();
        
        if (equippedMove === 'scarlett_moonball' && !isMoonballCharged) {
            isTracing = true;
            generatePattern();
        }
        
        resumeShotClock(); // Resume timer since tutorial interaction dismissed it
    }
}

// Global listener to dismiss tutorial on any screen tap
['mousedown', 'touchstart'].forEach(evt => {
    document.addEventListener(evt, (e) => {
        // Ignore clicks inside the dev panel or menu button so those function normally
        if (e.target.closest('#devPanel') || e.target.closest('#devMenuBtn')) return;
        dismissActiveTutorial();
    }, { passive: true, capture: true });
});

function handleDragStart(e) {
    const jinxArrow = document.getElementById('jinx-launch-arrow');
    if (jinxArrow) jinxArrow.classList.add('hidden');
    
    if (state === 'result') return;
    
    // Dismiss Active Tutorials on first touch
    dismissActiveTutorial();
    
    let clientX = 0, clientY = 0;
    if (e.type && e.type.startsWith('mouse')) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    }
    
    if (e && e.type === 'touchstart' && e.cancelable) {
        e.preventDefault();
    }
    
    if (equippedMove === 'hi_jinx' && jinxState === 0) {
        let tbRect = targetBox.getBoundingClientRect();
        // Use the actual target box bounds with slight padding to accommodate fast screen shakes
        if (clientX >= tbRect.left - 40 && clientX <= tbRect.right + 40 &&
            clientY >= tbRect.top - 60 && clientY <= tbRect.bottom + 60) {
            
            if (e.cancelable) e.preventDefault();
            
            // They tapped the target box!
            if (isTargetGloballyAligned || (Date.now() - lastGreenTime < 250)) {
                jinxState = 1;
                const jinxArrow = document.getElementById('jinx-launch-arrow');
                if (jinxArrow) jinxArrow.classList.remove('hidden');
                flashOverlay.style.background = 'rgba(0, 229, 255, 0.3)';
                flashOverlay.style.opacity = '1';
                setTimeout(() => flashOverlay.style.opacity = '0', 200);
                
                let isGlareActive = isGlareEnabled;
                let orbCount = isCrowdEnabled ? 1 : (isGlareActive ? 5 : 3);
                
                const container = document.getElementById('gameContainer');
                for(let i=0; i<orbCount; i++) {
                    let orb = document.createElement('div');
                    orb.className = 'jinx-orb';
                    orb.id = 'jinxOrb' + i;
                    
                    let shadow = document.createElement('div');
                    shadow.className = 'jinx-orb-shadow';
                    shadow.id = 'jinxShadow' + i;
                    
                    container.appendChild(shadow);
                    container.appendChild(orb);
                    
                    let spreadIndex = i - Math.floor(orbCount / 2);
                    let screenX = 225 + (spreadIndex * 40); 
                    let screenY = 400; 
                    orb.style.left = screenX + 'px';
                    orb.style.top = screenY + 'px';
                    shadow.style.left = screenX + 'px';
                    shadow.style.top = '550px'; 
                }
            } else {
                showMessage('TIMING MISSED!', '#ff4757'); setTimeout(hideMessage, 800);
            }
            return; // STOP the drag start
        }

        if (!isTutorialsDisabled) {
            showMessage('TAP GREEN TARGET FIRST!', '#00e5ff');
            setTimeout(hideMessage, 1000);
        }
        return; 
    }
    
    if (e.type === 'touchstart' && e.cancelable) e.preventDefault();
    
    if (state !== 'idle') {
        if (equippedMove === 'scarlett_moonball' && isTracing && !isMoonballCharged && e.changedTouches) {
            for(let i=0; i<e.changedTouches.length; i++) {
                checkNodeHit(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
            }
        }
        return;
    }
    
    if (equippedMove === 'scarlett_moonball' && !isMoonballCharged) {
        if (!isTracing) {
            isTracing = true;
            generatePattern();
        }
        if (e.changedTouches) {
            for(let i=0; i<e.changedTouches.length; i++) {
                checkNodeHit(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
            }
        } else {
            checkNodeHit(clientX, clientY);
        }
        return; // DO NOT start a drag state on the ball while tracing!
    }
    
    state = 'dragging';
    
    ball.style.animation = 'none'; 
    ball.style.transform = 'translate(-50%, 0) scale(1.05)'; 
    
    startX = clientX;
    startY = clientY;
    
    // Initialize strictly with start snapshot
    touchHistory = [{ x: clientX, y: clientY, time: Date.now() }];
}

function handleDragMove(e) {
    if (equippedMove === 'scarlett_moonball' && isTracing && !isMoonballCharged) {
        if (e.type === 'touchmove') e.preventDefault();
        let mX, mY;
        if (e.type.startsWith('mouse')) {
            mX = e.clientX;
            mY = e.clientY;
        } else {
            mX = e.changedTouches[0].clientX;
            mY = e.changedTouches[0].clientY;
        }
        checkNodeHit(mX, mY);
        return; 
    }
    
    if (state !== 'dragging') return;
    if (e.type === 'touchmove') e.preventDefault(); 
    
    let clientX, clientY;
    if (e.type.startsWith('mouse')) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    }
    
    if (equippedMove === 'romeo_rocket') {
        let rawDeltaX = clientX - lastTouchX;
        let moveDir = Math.sign(rawDeltaX);
        let absDelta = Math.abs(rawDeltaX);

        if (moveDir !== 0 && moveDir !== currentScrubDirection) {
            currentScrubDirection = moveDir;
            currentStrokeDistance = 0; 
        }
        if (currentStrokeDistance < 60) {
            rocketCharge = Math.min(100, rocketCharge + (absDelta * 0.6)); 
            currentStrokeDistance += absDelta;
        }
        lastTouchX = clientX;
        lastChargeTime = Date.now();
        const fuelGaugeFill = document.getElementById('fuelGaugeFill');
        if (fuelGaugeFill) fuelGaugeFill.style.width = rocketCharge + '%';
        
        // --- NEW: Visual Tracking ---
        // Calculate how far the finger has moved horizontally from the initial touch
        let dragOffsetX = clientX - startX;
        
        // Cap the visual movement so the ball doesn't fly off the screen
        let maxScrub = 60 * gameScale; 
        dragOffsetX = Math.max(-maxScrub, Math.min(maxScrub, dragOffsetX));
        
        // Apply purely visual CSS transform. This is overwritten the millisecond the ball is launched!
        ball.style.transform = `translate(calc(-50% + ${dragOffsetX}px), 0) scale(1.05)`;
        // ----------------------------
        
        touchHistory.push({ x: clientX, y: clientY, time: Date.now() });
        const cutoff = Date.now() - 150;
        while(touchHistory.length > 0 && touchHistory[0].time < cutoff) { touchHistory.shift(); }
        return; 
    }

    touchHistory.push({ x: clientX, y: clientY, time: Date.now() });
    
    // Rule 1: Prune history dynamically to ensure only recent active flick paths survive (150ms bounds)
    const cutoff = Date.now() - 150;
    while(touchHistory.length > 0 && touchHistory[0].time < cutoff) {
        touchHistory.shift();
    }
}

function handleDragEnd(e) {
    if (state !== 'dragging') return;
    
    let clientX, clientY;
    if (e.type.startsWith('mouse')) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        clientX = e.changedTouches ? e.changedTouches[0].clientX : startX;
        clientY = e.changedTouches ? e.changedTouches[0].clientY : startY;
    }
    const endTime = Date.now();
    
    touchHistory.push({ x: clientX, y: clientY, time: endTime });
    
    // Rule 2: Calculate Trailing Velocity grabbing a confident node roughly 50ms into the past
    let trailingPoint = touchHistory[0]; 
    for (let i = touchHistory.length - 1; i >= 0; i--) {
        if (endTime - touchHistory[i].time >= 50) { 
            trailingPoint = touchHistory[i];
            break;
        }
    }
    
    const dt = Math.max(16, endTime - trailingPoint.time); // enforce 16ms min
    
    const dy = (clientY - trailingPoint.y) / gameScale; 
    const dx = (clientX - trailingPoint.x) / gameScale; 

    if (equippedMove === 'scarlett_moonball') {
        if (!isMoonballCharged) {
            if (!isTracing) {
                resetBall();
            } else {
                state = 'idle';
                ball.style.transform = 'translate(-50%, 0) scale(1)';
            }
            return; 
        }
        if (dy < -10) {
            isMoonballInFlight = true;
            document.getElementById('strobeOverlay').classList.remove('hidden');
            document.getElementById('strobeOverlay').classList.add('strobe-anim');
        }
    }
    
    if (equippedMove === 'hi_jinx' && jinxState === 1) {
        if (dy < -10) {
            if (!checkStamina()) return; // Abort if out of stamina
            
            state = 'flying'; jinxState = 2; jinxHasScored = false; isJinxInFlight = true;
            ball.style.display = 'none'; 
            
            let jinxSound = new Audio('../../assets/sound/Hi Jinx effect.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') jinxSound.muted = true;
            jinxSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => {
                jinxSound.pause();
                jinxSound.currentTime = 0;
            }, 500);
            
            let rawVelocityY = Math.abs(dy / dt);
            let rawVelocityX = Math.abs(dx / dt);
            let curvedVy = Math.sqrt(rawVelocityY) * 14; 
            let curvedVz = Math.sqrt(rawVelocityY) * 20; 
            let curvedVx = Math.sqrt(rawVelocityX) * 10 * Math.sign(dx || 0); 
            
            let baseVy = -Math.min(22, Math.max(12, curvedVy)); 
            let baseVz = Math.min(24, Math.max(17, curvedVz)); 
            let baseVx = Math.min(12, Math.max(-12, curvedVx)); 
            
            // Calculate wind vulnerability based on the swipe power (Matches Basic Kick)
            let jinxKickPower = Math.abs(baseVy) + Math.abs(baseVz);
            windVulnerability = Math.max(0.4, 1.3 - (jinxKickPower / 70)); 
            
            // CROWD DEBUFF: Drops to 1 orb. GLARE BUFF: Upgrades to 5 orbs. Baseline: 3.
            let isGlareActive = isGlareEnabled;
            let orbCount = isCrowdEnabled ? 1 : (isGlareActive ? 5 : 3);
            
            // CROWD DEBUFF: Calculates how badly to skew the flight paths
            let isCrowdActive = isCrowdEnabled;
            let crowdError = 0;
            if (isCrowdActive) {
                crowdError = isCrowdEnabled ? 1.0 : 0.0;
            }

            jinxOrbsData = [];
            for(let i=0; i<orbCount; i++) {
                let spreadIndex = i - Math.floor(orbCount / 2);
                
                // Applies the crowd penalty to send them off course
                let sabotageVx = (Math.random() - 0.5) * 20 * crowdError;
                let sabotageVz = (Math.random() - 0.5) * 15 * crowdError;

                jinxOrbsData.push({
                    id: i,
                    x: spreadIndex * 35, 
                    y: 550, 
                    z: 150, 
                    vx: baseVx + (spreadIndex * 1.5) + ((Math.random() - 0.5) * 2) + sabotageVx, 
                    vy: baseVy * 0.35, 
                    vz: (baseVz * 0.45) + sabotageVz, 
                    delayFrames: i * 10, // Staggered slightly faster to accommodate 5 orbs
                    crossed: false, active: true
                });
            }
            jinxActiveLoop = requestAnimationFrame(jinxGameLoop);
            return; 
        } else {
            resetBall(); return;
        }
    }
    
    if (dy < -10) {
        if (equippedMove === 'romeo_rocket' && rocketCharge < 100) {
            showMessage('NEED 100% FUEL!', '#ff4757');
            setTimeout(hideMessage, 1200);
            resetBall();
            return;
        }
        
        if (!checkStamina()) return; // Abort if out of stamina
        
        // Rule 3: Boosted Swipe Responsiveness, base multiplier increased purely to make casual flicks powerful
        let rawVelocityY = Math.abs(dy / dt);
        let rawVelocityX = Math.abs(dx / dt);
        
        // Base multiplier increased by ~35% for dramatic ease
        let curvedVy = Math.sqrt(rawVelocityY) * 19; 
        let curvedVz = Math.sqrt(rawVelocityY) * 26; 
        let curvedVx = Math.sqrt(rawVelocityX) * 13 * Math.sign(dx || 0); 
        
        // Boundaries vastly inflated accommodating massive power spikes directly
        // Rule 1: Remove Swipe Training Wheels severely punishing underpowered weak lobs perfectly appropriately natively
        vy = -Math.min(30, Math.max(6, curvedVy)); 
        vz = Math.min(35, Math.max(10, curvedVz)); 
        vx = Math.min(16, Math.max(-16, curvedVx)); 

        // Calculate how resistant the kick is to the wind
        let kickPower = Math.abs(vy) + Math.abs(vz); // Ranges from roughly 16 (weak) to 65 (explosive)
        // Weaker kicks get magnified wind (up to 1.3x), explosive kicks get shielded (down to 0.4x)
        windVulnerability = Math.max(0.4, 1.3 - (kickPower / 70));
        
        // ROMEO ROCKET WIND DEBUFF: Scaled so it's manageable early on, but punishing late game
        if (equippedMove === 'romeo_rocket') {
            let rocketWindPenalty = 1.2 + ((currentLevel / 100) * 1.0); // Scales 1.2x -> 2.2x
            windVulnerability *= rocketWindPenalty; 
        }

        // SCARLETT MOONBALL WIND BUFF: Constant 60% wind reduction to counter extra hang time
        if (equippedMove === 'scarlett_moonball') {
            windVulnerability *= 0.40; 
        }
        
        // Retired Yips Penalty
        
        state = 'flying';
        pauseShotClock(); // Stop the clock once the shot is in the air
        hasHitTarget = false; 
        crossedGoalLine = false;
        if (windIntervalId) clearInterval(windIntervalId); // Stop picking gusts during shot
        
        if (equippedMove === 'romeo_rocket') {
            isRocketInFlight = true;
            ball.classList.add('rocket-flight');
            let rocketSound = new Audio('../../assets/sound/Rocket launch effect.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') rocketSound.muted = true;
            rocketSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => {
                rocketSound.pause();
                rocketSound.currentTime = 0;
            }, 500);
        } else if (equippedMove === 'basic_kick') {
            let kickSound = new Audio('../../assets/sound/soccer kick.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') kickSound.muted = true;
            kickSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => {
                kickSound.pause();
                kickSound.currentTime = 0;
            }, 500);
        } else if (equippedMove === 'scarlett_moonball') {
            let moonSound = new Audio('../../assets/sound/Moonball effect.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') moonSound.muted = true;
            moonSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => {
                moonSound.pause();
                moonSound.currentTime = 0;
            }, 500);
        }
        
        animationFrameId = requestAnimationFrame(gameLoop);
    } else {
        resetBall();
    }
}

function gameLoop() {
    if (state !== 'flying') return;
    
    // Rule 1: "Thick" Depth Sweeping isolating jumping parameters across bounding limits purely natively capturing true trajectories organically
    let prevBallY = ballY; 
    let prevBallZ = ballZ;
    let prevBallX = ballX;
    
    ballX += vx;
    ballY += vy; // Decreases smoothly crossing towards 504 natively!
    ballZ += vz;
    
    vz -= gravityZ; 
    vy *= frictionAir;
    vx *= frictionAir;
    
    if (ballZ > 0) { vx += (currentWind * 0.035 * 1.25 * windVulnerability); } // Wind only affects airborne ball
    
    // Rule 1: Deadened Sand Physics absorbing impact instantly
    if (ballZ <= 0) {
        ballZ = 0;
        if (vz < -4) {
            vz = -vz * 0.15; 
            vy *= 0.5; 
            vx *= 0.5; 
        } else {
            vz = 0;
            vy *= 0.5;
            vx *= 0.5;
        }
    }
    
    // Rule 2: The Sand Horizon Clamp securing perspective boundaries natively
    let sandHorizonY = 480; 
    let visualY = Math.max(ballY, sandHorizonY);
    
    let depthScale = Math.max(0.2, visualY / 740);
    // Rule 2: Compute exact logical rendering values simulating internal grids strictly dynamically masking CSS translates!
    let screenY = visualY - ballZ; 
    let screenX = 225 + ballX;
    
    ball.style.left = `${screenX - 25}px`;
    ball.style.top = `${screenY - 50}px`;
    ball.style.bottom = 'auto';
    ball.style.transform = `scale(${depthScale})`;
    
    if (isRocketInFlight && (Math.random() > 0.3)) {
        createSmokePlume(screenX, screenY, depthScale);
    }
    
    // Render Ground Shadow bounding vertically strictly to the horizon clamp
    let shadow = document.getElementById('ballShadow');
    if (shadow) {
        let shadowOpacity = Math.max(0.05, 0.6 - (ballZ / 400));
        shadow.style.left = `${screenX - 25}px`;
        shadow.style.top = `${visualY - 7.5}px`;
        shadow.style.bottom = 'auto';
        shadow.style.transform = `scale(${depthScale})`;
        shadow.style.opacity = shadowOpacity;
    }

    // Rule 1: "Thick" Depth Sweeping natively triggering organically only executing mathematically validating boundaries natively identical across jumps flawlessly 
    if (!crossedGoalLine && prevBallY > goalLineY && ballY <= goalLineY) {
        crossedGoalLine = true;
        let fraction = (prevBallY - goalLineY) / (prevBallY - ballY);
        let exactBallZ = prevBallZ + (ballZ - prevBallZ) * fraction;
        let exactBallX = prevBallX + (ballX - prevBallX) * fraction;
        let hit = evaluateCollision(goalLineY, exactBallZ, exactBallX);
        
        // Rule 4: Realistic Post-Hit Physics 
        if (hit && !hasHitTarget) {
            hasHitTarget = true;
            matchScore++;
            updateScoreboard();
            
            let hitSound = new Audio('../../assets/sound/metal clunk.mp3');
            if (localStorage.getItem('gk_audio_muted') === 'true') hitSound.muted = true;
            hitSound.play().catch(e => console.log('Audio play blocked:', e));
            setTimeout(() => {
                hitSound.pause();
                hitSound.currentTime = 0;
            }, 300);
            
            // Magnetic Snapping logic mapping coordinates visually naturally correctly snapping depths logically tracing precisely matching!
            const containerRect = gameContainer.getBoundingClientRect();
            const targetRect = targetBox.getBoundingClientRect();
            const targetY = (targetRect.top - containerRect.top) / gameScale; 
            const targetX = (targetRect.left - containerRect.left) / gameScale;
            const targetWidth = targetRect.width / gameScale;
            
            // Snap Z-height to crossbar organically scaling metrics natively!
            ballZ = ballY - targetY - 25; 
            
            // Snap X-position securely pulling organically scaling intersections flawlessly mathematically!
            let intersectX = 225 + ballX;
            if (intersectX < targetX) ballX = targetX - 225;
            else if (intersectX > targetX + targetWidth) ballX = targetX + targetWidth - 225;
            
            screenY = ballY - ballZ; 
            screenX = 225 + ballX;
            ball.style.left = `${screenX - 25}px`;
            ball.style.top = `${screenY - 50}px`;
            
            vy = Math.abs(vy) * 0.4; // Bounce backward towards player tracking securely natively
            vz = -Math.abs(vz) * 0.6; // Deflect downward sharply terminating flights cleanly
            vx += (Math.random() - 0.5) * 10;
            
            flashOverlay.style.background = 'var(--success)';
            flashOverlay.style.opacity = '1';
            setTimeout(() => flashOverlay.style.opacity = '0', 300);
            showMessage('HIT!');
            createRippleEffect(screenX, screenY);
            
            if (equippedMove === 'romeo_rocket' && isRocketInFlight) {
                targetBox.style.display = 'none'; 
                createTargetShatter();
                const explosion = document.getElementById('rocketExplosion');
                const screenCrack = document.getElementById('crackedScreen');
                if (explosion) {
                    let screenX = 225 + ballX;
                    let screenY = ballY - ballZ;
                    explosion.style.left = screenX + 'px';
                    explosion.style.top = screenY + 'px';
                    explosion.classList.remove('hidden');
                    explosion.classList.add('explode-anim');
                    setTimeout(() => { explosion.classList.remove('explode-anim', 'hidden'); }, 400);
                }
                if (screenCrack) {
                    screenCrack.classList.remove('hidden');
                    screenCrack.classList.add('cracked-anim');
                }
            }
        } else if (!hasHitTarget) {
            showMessage('MISS!', '#ff4757'); 
            createRippleEffect(225 + ballX, ballY - ballZ);
        }
    }
    
    if (ballZ === 0 && Math.abs(vy) < 0.5 && Math.abs(vx) < 1.0) {
        vy = 0; vx = 0; vz = 0;
        if (!hasHitTarget && !crossedGoalLine) {
            showMessage('MISS!', '#ff4757'); // Underpowered
            createRippleEffect(225 + ballX, ballY - ballZ);
        }
        finishKick();
        return;
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

function evaluateCollision(exactBallY = ballY, exactBallZ = ballZ, exactBallX = ballX) {
    let levelClamp = Math.min(100, Math.max(1, currentLevel));
    let t = (levelClamp - 1) / 99;
    let curve = 1 - Math.pow(1 - t, 3);
    
    // Rule 1: GLOBAL NERF - Ball hitbox reduced by 25% across the board
    let ballRadiusX = 12; 
    
    let ballRadiusY;
    if (levelClamp <= 20) {
        let p = (levelClamp - 1) / 19;
        ballRadiusY = 21 - (p * 6); // Scales from 21 down to 15
    } else {
        ballRadiusY = 15; // Permanent phase 2 ceiling
    }
    
    // GLARE DEBUFF: Shrinks the ball significantly, but maintains enough size to prevent visual "phantom misses".
    if (isGlareEnabled) {
        if (equippedMove === 'basic_kick' || equippedMove === 'romeo_rocket') {
            // Both moves are neutral to each other under Glare
            ballRadiusX = 8; // Increased from 4px
            ballRadiusY = 8; // Increased from 4px
        } else if (equippedMove === 'scarlett_moonball') {
            // Moonball is punished even harder
            ballRadiusX = 6; // Increased from 3px
            ballRadiusY = 6; // Increased from 3px
        }
    }
    
    let visualBallY = exactBallY - exactBallZ - 25; 
    let visualBallX = 225 + exactBallX; 
    
    const containerRect = gameContainer.getBoundingClientRect();
    const goal = document.getElementById('goal');
    const goalRect = goal.getBoundingClientRect();
    const targetRect = targetBox.getBoundingClientRect();
    
    // Rule 1: The Crossbar Anchor (Static permanent home of the crossbar natively mapping bounds strictly scaling)
    const crossbarAnchorY = (goalRect.top - containerRect.top) / gameScale; 
    
    const targetY = (targetRect.top - containerRect.top) / gameScale; 
    const targetX = (targetRect.left - containerRect.left) / gameScale; 
    const targetWidth = targetRect.width / gameScale;
    const targetHeight = targetRect.height / gameScale;
    
    let buffMultiplier = 1.0;
    
    // GLOBAL HAZARDS (Applies to Basic Kick)
    if (isGlareEnabled) {
        buffMultiplier = 1.0; 
    } else if (isCrowdEnabled) {
        buffMultiplier = 0.80; // Nerfed from 1.0x to make the target stutter dangerous
    }
    
    if (isRocketInFlight) {
        buffMultiplier = 1.0; // Baseline
        if (isCrowdEnabled) {
            buffMultiplier = 1.30; // Buffed against Crowd, but scaled relative to the 0.80 baseline
        }
        if (isWindEnabled) {
            buffMultiplier = 0.5; 
        }
        if (isGlareEnabled) {
            buffMultiplier = 1.0; 
        }
    }
    
    if (isMoonballInFlight) {
        buffMultiplier = 1.8; 
        if (isWindEnabled) {
            buffMultiplier = 4.5 - ((currentLevel / 100) * 1.3); 
        } else if (isCrowdEnabled) {
            buffMultiplier = 1.20; // Boosted so target stutter is mechanically fair for slow flight
        } else if (isGlareEnabled) {
            buffMultiplier = 0.35; 
        }
    }
    
    if (isJinxInFlight) {
        buffMultiplier = 2.0; // Baseline advantage
        if (isWindEnabled) {
            buffMultiplier = 0.33;
            ballRadiusX = 4;
            ballRadiusY = 4;
        } else if (isCrowdEnabled) {
            buffMultiplier = 0.40; // Brutally nerfed (half the leniency of the Basic Kick)
            ballRadiusX = 4;       // Pinpoint precision required for the single orb
            ballRadiusY = 4;
        }
    }

    // GLOBAL EQUIPMENT BUFF: Grants a permanent 1.25% leniency bonus per equipped item
    let equipmentBuff = 1.0;
    if (equipmentCatalogue['carbon_boots'].equipped) equipmentBuff += 0.025;
    if (equipmentCatalogue['compression_shorts'].equipped) equipmentBuff += 0.025;
    buffMultiplier *= equipmentBuff;
    
    // Rule 1 & 2: Sawtooth Magnetic Padding Logic for collision leniency
    let dynamicPadding = getSawtoothMagneticPadding(levelClamp);
    const magneticPadding = (dynamicPadding / gameScale) * buffMultiplier;
    
    // Rule 3: Mathematics for Alignment perfectly integrating magnetic leniency functionally mirroring visual state
    const targetCenterY = targetY + (targetHeight / 2);
    // Removed the redundant multiplier, as magneticPadding is already scaled
    const alignmentTolerance = (targetHeight * 0.5) + magneticPadding; 
    // The bonus bag can be hit anywhere in the sky, bypassing crossbar alignment constraints
    const isTargetAligned = isBonusRound ? true : (Math.abs(targetCenterY - crossbarAnchorY) <= alignmentTolerance);
    
    // Rule 3: Dynamic Hitbox Expansion giving generous forgiveness compensating reaction times when aligned
    let dynamicHitYPadding = isTargetAligned ? targetHeight * 0.5 * buffMultiplier : 0;
    
    // Rule 3: Fix Upward Frame Jumps freezing bounding constraints statically matching native geometry purely logically mapped
    // Prevents the hitbox from snapping down to the crossbar if the bag is in the sky
    let effectiveTargetY = (isTargetAligned && !isBonusRound) ? crossbarAnchorY - (targetHeight / 2) : targetY;

    // The Bounding Box capturing collision mathematically separating structural planes!
    // Rule 2: Apply Strict X-Axis Logic scaling horizontal hits
    const overlapX = (visualBallX + ballRadiusX >= targetX - magneticPadding) && (visualBallX - ballRadiusX <= targetX + targetWidth + magneticPadding);
    
    // Rule 1: Squeezing explicit hitbounds removing explosive false positives smoothly
    let dynamicUpperHitBox;
    if (levelClamp <= 20) {
        let p = (levelClamp - 1) / 19;
        dynamicUpperHitBox = 20 - (p * 20); // 20 down to 0 safely
    } else {
        dynamicUpperHitBox = 0; // Permanent phase 2 floor
    }
    const upperHitBoxExtension = dynamicUpperHitBox / gameScale;

    // Utilise effectiveTargetY mathematically preventing falling intersection gaps cleanly safely precisely naturally mapping dynamically completely reliably functionally automatically!
    const overlapY = (visualBallY + ballRadiusY >= effectiveTargetY - magneticPadding - dynamicHitYPadding - upperHitBoxExtension) && (visualBallY - ballRadiusY <= effectiveTargetY + targetHeight + magneticPadding + dynamicHitYPadding);
    const checkA = overlapX && overlapY;

    // The Hit Logic guaranteeing tracking resolving perfect impacts cleanly!
    if (checkA && isTargetAligned) {
        return true; 
    } else {
        return false; 
    }
}

function finishKick() {
    state = 'result'; 
    if (!hasHitTarget) {
        flashOverlay.style.background = 'var(--danger)';
        flashOverlay.style.opacity = '1';
        setTimeout(() => flashOverlay.style.opacity = '0', 300);
        showMessage('MISS!');
    }

    // BONUS ROUND INTERCEPT:
    if (isBonusRound) {
        if (hasHitTarget) {
            window.GK_State.economy.tokens += 500;
            if (typeof window.saveGameState === 'function') window.saveGameState(true);
            const tokenDisplay = document.getElementById('tokenDisplay');
            if (tokenDisplay) tokenDisplay.innerText = window.GK_State.economy.tokens;
            showMessage('JACKPOT!\n+500 TOKENS', '#ffd700');
            setTimeout(exitBonusRound, 3000);
        } else if (currentAttempt >= maxAttempts) {
            showMessage('BONUS FAILED!', '#ff4757');
            setTimeout(exitBonusRound, 3000);
        } else {
            nextBtn.style.display = 'block';
        }
        return; // Skip normal progression entirely
    }

    let currentMisses = currentAttempt - matchScore;
    if (matchScore >= 2 || currentMisses >= 2) {
        evaluateProgression();
    } else if (currentAttempt < maxAttempts) {
        nextBtn.style.display = 'block';
    } else {
        evaluateProgression();
    }
}

// Rule 2: Single-Match Progression Gate
function evaluateProgression() {
    if (matchScore >= 2) {
        
        // --- ECONOMY REWARD LOGIC ---
        const xpEarned = currentLevel * 5;
        const tokensEarned = currentLevel * 5;

        if (!window.GK_State) window.GK_State = {};
        if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };

        window.GK_State.economy.xp += xpEarned;
        window.GK_State.economy.tokens += tokensEarned;

        if (typeof window.saveGameState === 'function') window.saveGameState(true);

        // Update the UI displays
        const xpDisplay = document.getElementById('xpDisplay');
        const tokenDisplay = document.getElementById('tokenDisplay');
        if (xpDisplay) xpDisplay.innerText = window.GK_State.economy.xp;
        if (tokenDisplay) tokenDisplay.innerText = window.GK_State.economy.tokens;

        // Update the slide-out drawer displays
        const globalXp = document.getElementById('global-xp');
        const globalTokens = document.getElementById('global-tokens');
        if (globalXp) globalXp.innerText = window.GK_State.economy.xp;
        if (globalTokens) globalTokens.innerText = window.GK_State.economy.tokens;
        
        // Show reward in the popup message
        let avatarUrl = window.getCelebrateAvatarUrl ? window.getCelebrateAvatarUrl() : '../../assets/locker-room/images/avatars/celebrate.png';
        showMessage(`
            <div style="position: absolute; top: -140px; left: 50%; transform: translateX(-50%); width: 100vw;">
                <div style="font-size: 2.2rem; font-weight: 900; text-transform: uppercase; text-shadow: 2px 2px 4px #000; color: #38ef7d;">Match Won!</div>
                <div style="font-size: 1.2rem; margin-top: 5px; color: #fff; text-shadow: 2px 2px 4px #000;">+${xpEarned} XP  |  +${tokensEarned} Tokens</div>
            </div>
            <img src="${avatarUrl}" style="position: absolute; top: 120px; left: 50%; transform: translateX(-50%); max-height: 380px; width: auto; object-fit: contain; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6)); pointer-events: none;">
        `, 'transparent');
        // ----------------------------
        
        // Immediate Level up check (Best 2 out of 3)
        if (currentLevel < 100) {
            // ORGANIC TRIGGER: Every 10 levels after 14 (i.e. Winning 14 triggers 15's bonus, winning 24 triggers 25's bonus)
            if (currentLevel >= 14 && (currentLevel - 4) % 10 === 0) {
                initBonusRound();
            } else {
                highestUnlockedLevel = Math.max(highestUnlockedLevel, currentLevel + 1);
                if (window.GK_State && window.GK_State.player) {
                    window.GK_State.player.crossbarLevel = highestUnlockedLevel;
                    if (typeof window.saveGameState === 'function') window.saveGameState(true);
                } else {
                    localStorage.setItem('gk_crossbar_max_level', highestUnlockedLevel);
                }
                currentLevel++;
                levelSlider.value = currentLevel;
                updateTargetDimensions();
                updateGoalDistance();
            }
        }
    } else {
        showMessage('MATCH LOST!', '#ff4757');
    }
    
    updateScoreboard();
    goAgainBtn.style.display = 'block';
    goAgainBtn.style.marginTop = (matchScore >= 2) ? '-10px' : '150px';
}

// Button Events
nextBtn.addEventListener('click', () => {
    nextBtn.style.display = 'none';
    currentAttempt++;
    updateScoreboard();
    hideMessage();
    resetBall(true); // Force hazard reroll on new attempt
    startShotClock();
});

goAgainBtn.addEventListener('click', () => {
    goAgainBtn.style.display = 'none';
    goAgainBtn.style.marginTop = '150px';
    resetMatchState();
    hideMessage();
    resetBall(true); // Force hazard reroll on new match
    startShotClock();
});

// Minimalist Auto-Hiding Slider Logic
function triggerLevelUpdate(newLevel) {
    let maxAllowed = isAllLevelsUnlocked ? 100 : highestUnlockedLevel;
    
    if (newLevel > maxAllowed) {
        showMessage('LEVEL LOCKED!', '#ffa502');
        setTimeout(hideMessage, 1000);
        newLevel = maxAllowed;
    }
    
    currentLevel = Math.max(1, Math.min(100, newLevel));
    levelSlider.value = currentLevel;
    updateScoreboard();
    updateTargetDimensions();
    updateGoalDistance();
    resetMatchState();
    hideMessage();
    resetBall(true); // Force hazard reroll on level change
    goAgainBtn.style.display = 'none';
    nextBtn.style.display = 'none';
}

if (levelSlider) {
    levelSlider.addEventListener('input', (e) => {
        triggerLevelUpdate(parseInt(e.target.value));
    });
}

if (levelDownBtn && levelUpBtn) {
    levelDownBtn.addEventListener('click', () => {
        triggerLevelUpdate(currentLevel - 1);
    });
    levelUpBtn.addEventListener('click', () => {
        triggerLevelUpdate(currentLevel + 1);
    });
}

// Helper Functions
function updateScoreboard() {
    // Stripped the "/ 3" to leave just the raw attempt number (1, 2, or 3)
    attemptCountEl.innerText = currentAttempt;
    hitCountEl.innerText = matchScore;
    levelDisplayEl.innerText = currentLevel;
    if (unlockedDisplayEl) unlockedDisplayEl.innerText = highestUnlockedLevel;
}

// Rule 1 & 2: Smooth Magnetic Padding Reduction
function getSawtoothMagneticPadding(level) {
    let levelClamp = Math.min(100, Math.max(1, level));
    let progress = (levelClamp - 1) / 99;
    
    // Uses a gentle curve to maintain playability in the mid-game before getting brutal
    let curve = Math.pow(progress, 0.8); 
    
    // Scales from a generous 60px (Level 1) down to a strict 15px (Level 100)
    let dynamicPadding = 60 - (curve * 45); 
    
    return Math.max(15, dynamicPadding); // Enforces the 15px minimum floor
}

// Rule 2 and 5: Dynamic Target Dimensions Formula
// Rule 2 and 5: Dynamic Target Dimensions Formula
function updateTargetDimensions() {
    let levelClamp = Math.min(100, Math.max(1, currentLevel));
    
    // Rule 1: Two-Phase Vertical Height Shrink (Reduced by 25%)
    let targetBoxHeight;
    if (levelClamp <= 20) {
        // Phase 1 (Levels 1 to 20): Interpolate from 24px down to 15px
        let progress = (levelClamp - 1) / 19;
        targetBoxHeight = 24 - (progress * 9);
    } else {
        // Phase 2 (Levels 21 to 100): Interpolate from 15px down to a 13.5px floor
        let progress = (levelClamp - 21) / 79;
        let curve = Math.pow(progress, 2);
        targetBoxHeight = 15 - (curve * 1.5);
        targetBoxHeight = Math.max(13.5, targetBoxHeight);
    }
    
    targetBox.style.height = targetBoxHeight + 'px';
    
    // Rule 2: Early Horizontal Aiming (Reduced by 25% globally)
    let squeezeProgress = (levelClamp - 1) / 99; 
    let squeezeCurve = squeezeProgress; 
    
    // Max width 75%, shrinking aggressively down to ~33.75%
    let targetBoxWidth = 75 - (squeezeCurve * 41.25); 
    targetBox.style.width = targetBoxWidth + '%';
    
    // Maintain Perfect Centring over the physical goalpost globally
    let crossbarY = -8; 
    let crossbarThickness = 8;
    let crossbarCenterY = crossbarY + (crossbarThickness / 2);
    
    let targetBoxY = crossbarCenterY - (targetBoxHeight / 2);
    targetBox.style.top = targetBoxY + 'px';
}

// Rule 1: Static Goalpost locking rendering logic smoothly correctly permanently executing structural anchors directly definitively
function updateGoalDistance() {
    const goal = document.getElementById('goal');
    
    // Terminate scaling interpolations perfectly retaining original geometry coordinates natively purely mapping exactly
    goal.style.transform = 'translateX(-50%) translateY(0px) scale(1.0)';
    
    // Physics arrays precisely trace base mapped bottoms structurally linking statically mapping parameters reliably permanently
    goalLineY = 504;
}

// Rule 4: Delayed & Nerfed Oscillation
let oscillationTime = 0;
let oscillationPeaks = 0;
let currentTargetLeft = '50%';
let currentTargetTransform = 'translateX(-50%)';
let currentYipsOffset = 0; // NEW: Persistent tracker
function animateTargetBox() {
    let crossbarY = -8; 
    let crossbarThickness = 8;
    let crossbarCenterY = crossbarY + (crossbarThickness / 2);
    
    let targetBoxHeight = parseFloat(targetBox.style.height) || 64;
    let baseTargetY = crossbarCenterY - (targetBoxHeight / 2);

    // --- BONUS ROUND TELEPORT HIJACK ---
    if (isBonusRound) {
        if (Date.now() - lastTeleportTime > 2000) {
            lastTeleportTime = Date.now();
            
            // Sky constraints: keep the 195x130 hitbox fully on screen
            // Goal is at X: 67.5px, Y: 304px
            // randomX between 10% and 90%
            let randomX = 10 + (Math.random() * 80); 
            // Absolute Y between 0 and 174px (relative to goal: -304 to -130)
            let randomY = -304 + (Math.random() * 174);
            
            targetBox.style.transition = 'none'; // Instant snap
            targetBox.style.left = randomX + '%';
            targetBox.style.transform = 'translateX(-50%)';
            targetBox.style.top = randomY + 'px';
            
            isTargetGloballyAligned = true; 
        }
        requestAnimationFrame(animateTargetBox);
        return; // SKIP the normal crossbar oscillation
    }
    // -----------------------------------

    // Rule 3: Phase 1 Safe Zone explicitly freezing all movement up to 4 precisely
    if (currentLevel >= 5) {
        // Rule 1: Uncapped scaling from Level 4 to 100 dynamically providing full difficulty range
        let progress = Math.min(1, Math.max(0, (currentLevel - 4) / 96));
        // Rule 3: Keep Oscillation Slower Longer using an Ease-In curve moving lazily through mid-levels
        let easeIn = Math.pow(progress, 3); 
        
        // Rule 3: Widened Min/Max Speed Gap forcing fast reflexes organically late game natively
        let speed = 0.012 + (easeIn * 0.020); 
        
        let currentCos = Math.cos(oscillationTime);
        let nextCos = Math.cos(oscillationTime + speed);
        
        // Exact mathematical inflection tracker detecting the specific physics frame it tops out structurally
        if (currentCos <= 0 && nextCos > 0) {
            oscillationPeaks++;
            
            // Rule 3: Delay X-Axis Teleporting freeing cognitive load mapping horizontally strictly natively
            if (currentLevel >= 55) {
                let updateFreq = currentLevel >= 65 ? 1 : 2;
                if (oscillationPeaks % updateFreq === 0) {
                    let widthPct = parseFloat(targetBox.style.width) || 100;
                    let targetOffsetX = Math.random() * (100 - widthPct);
                    currentTargetLeft = targetOffsetX + '%';
                    currentTargetTransform = 'translateX(0)';
                }
            }
        }
        
        oscillationTime += speed;
        
        let amplitude = 120; // Visual bounds padding
        
        // 1. The Yips (Target Stutter)
        if (isCrowdEnabled) {
            let yipsIntensity = Math.min(1, currentLevel / 100);
            let twitchChance = 0.05 + (yipsIntensity * 0.15); 
            let twitchMagnitude = 10 + (yipsIntensity * 35);
            
            // HI JINX CROWD NERF
            if (equippedMove === 'hi_jinx') {
                twitchChance *= 2.0; 
                twitchMagnitude *= 1.5; 
            }

            if (Math.random() < twitchChance) {
                currentYipsOffset = (Math.random() - 0.5) * twitchMagnitude;
            }
        }

        // Smoothly decay the offset back to zero to prevent 1-frame physics tears
        currentYipsOffset *= 0.85; 
        let offsetY = (Math.sin(oscillationTime) * amplitude) + currentYipsOffset;
        
        targetBox.style.top = (baseTargetY + offsetY) + 'px';
    } else {
        oscillationTime = 0; // Frozen entirely strictly on levels 1-20 naturally targeting safe zones cleanly synchronising accurately
        oscillationPeaks = 0;
        targetBox.style.top = baseTargetY + 'px';
    }
    
    // Logical resets locking early bounds rigidly securely globally safely tracking 55 thresholds cleanly
    if (currentLevel < 55) {
        currentTargetLeft = '50%';
        currentTargetTransform = 'translateX(-50%)';
    }
    
    targetBox.style.left = currentTargetLeft;
    targetBox.style.transform = currentTargetTransform;
    
    // Rule 2: Live Alignment Colour Cue
    const containerRect = gameContainer.getBoundingClientRect();
    const goal = document.getElementById('goal');
    if (goal && containerRect) {
        const goalRect = goal.getBoundingClientRect();
        const crossbarAnchorY = (goalRect.top - containerRect.top) / gameScale;
        
        const targetRect = targetBox.getBoundingClientRect();
        const targetCurrentY = (targetRect.top - containerRect.top) / gameScale;
        const targetHeight = targetRect.height / gameScale;
        const targetCenterY = targetCurrentY + (targetHeight / 2);
        
        // Rule 3: Ensure green visual cues reliably demonstrate 'catchable' hitbox intersections perfectly
        const currentPadding = getSawtoothMagneticPadding(currentLevel) / gameScale;
        const alignmentTolerance = (targetHeight * 0.5) + currentPadding;
        
        const isTargetAligned = Math.abs(targetCenterY - crossbarAnchorY) <= alignmentTolerance;
        isTargetGloballyAligned = isTargetAligned;
        if (isTargetAligned) {
            lastGreenTime = Date.now();
        }
        
        let glareOpacity = 0;
        let finalFlareOpacity = 0;

        if (isGlareEnabled) {
            let overallContrastCeiling;

            if (currentLevel <= 20) {
                // Levels 1-20: Target is stationary. 
                // Ramp up peak contrast aggressively so it "gets relatively strong"
                overallContrastCeiling = (0.15 + ((currentLevel / 20) * 0.7)) * 1.25;
                
                // Intermittent pulses showing up for longer as level increases
                let timeWave = Math.sin(Date.now() / 600); 
                // Threshold drops from 0.9 (short pulses) to 0.0 (50% uptime)
                let threshold = 0.9 - ((currentLevel / 20) * 0.9); 
                
                if (timeWave > threshold) {
                    let pulseAlpha = (timeWave - threshold) / (1 - threshold);
                    glareOpacity = pulseAlpha * overallContrastCeiling;
                }
            } else {
                // Level 21-100: Target starts moving!
                let levelProgress = Math.min(1, Math.max(0, (currentLevel - 21) / 79)); 
                
                // See-saw logic: Drop the ceiling down sharply at Level 21 (0.3), then ramp back up to 1.0 (Level 100)
                overallContrastCeiling = (0.3 + (levelProgress * 0.7)) * 1.25;
                
                // Baseline permanent washout that grows to a constant peak by Level 100
                let baselineGlare = Math.pow(levelProgress, 3);
                
                // Proximity Pulse: Peaks exactly when aligned inside the green tolerance hit-zone
                let distanceToCrossbar = Math.abs(targetCenterY - crossbarAnchorY);
                let proximityFactor = Math.max(0, 1 - (distanceToCrossbar / (alignmentTolerance * 2)));
                
                glareOpacity = Math.min(1, baselineGlare + (proximityFactor * (1 - baselineGlare))) * overallContrastCeiling;
            }
        }

        // SCARLETT MOONBALL GLARE DEBUFF: Amplifies background washout
        if (equippedMove === 'scarlett_moonball' && glareOpacity > 0) {
            let glareBump = 1.1 + ((currentLevel / 100) * 0.3); // 10% to 40% increase in blindness
            glareOpacity = Math.min(1.0, glareOpacity * glareBump);
        }
        const glareOverlay = document.getElementById('glareOverlay');
        if (glareOverlay) {
            glareOverlay.style.opacity = glareOpacity;
            glareOverlay.style.height = '100%';
        }
        
        const flareContainer = document.getElementById('flareContainer');
        const lensFlare = document.getElementById('lensFlare');
        
        if (lensFlare && flareContainer) {
            // Flare activates natively from Level 5 upwards, or when Forced
            if (isGlareEnabled) {
                let flareLevelProgress = Math.min(1, currentLevel / 100);
                
                // 1. BUFFED SCALE: Pushes much larger at all levels
                let flareScale = (0.8 + (flareLevelProgress * 2.2)) * 1.25;
                let flareBaseOpacity = 0.35 + (flareLevelProgress * 0.65); 
                
                // 2. DYNAMIC FADE CYCLES (No more sliding or darting)
                // "longer fade out / remain longer" -> speed drops as level increases
                let flareSpeed = 0.015 - (flareLevelProgress * 0.008); 
                flareTime += flareSpeed; 
                
                let currentCycle = Math.floor(flareTime);
                let cyclePos = flareTime % 1; 
                
                // Generates a smooth, gradual fade IN and OUT (0 -> 1 -> 0)
                let fadeEnvelope = Math.sin(cyclePos * Math.PI); 
                
                // Combine our visual washout opacity with our independent flare pulse envelope. 
                // MISMATCH: As levels increase, heavily decouple the flare pulse from the washout sync!
                let syncStrength = 0.8 - (flareLevelProgress * 0.8); // Drops to 0 at max level
                finalFlareOpacity = fadeEnvelope * Math.min(1, flareBaseOpacity + (glareOpacity * syncStrength));
                
                // 3. SPAWN LOCATION ALGORITHM
                if (lensFlare.dataset.cycle != currentCycle) {
                    lensFlare.dataset.cycle = currentCycle;
                    
                    // Scatter Focus: Low levels scatter wildly. High levels lock directly onto the hitbox!
                    let scatterFactor = 1 - flareLevelProgress; 
                    
                    let targetY_Px = targetCenterY * gameScale;
                    let centerX_Px = containerRect.width / 2;
                    
                    // Range decreases from wild random bounds to pinpoint accuracy over the green zone
                    let maxScatterOffset = 250 * scatterFactor; 
                    
                    let randomX = centerX_Px + (Math.random() - 0.5) * (maxScatterOffset * 1.5);
                    let randomY = targetY_Px + (Math.random() - 0.5) * (maxScatterOffset * 1.5);
                    
                    // Directly move the container bounding box instantly while opacity is 0
                    flareContainer.style.transform = `translate(${randomX}px, ${randomY}px)`;
                }
                
                // SCARLETT MOONBALL GLARE DEBUFF: Amplifies moving flare size and opacity
                if (equippedMove === 'scarlett_moonball' && finalFlareOpacity > 0) {
                    let flareBump = 1.15 + ((currentLevel / 100) * 0.3);
                    finalFlareOpacity = Math.min(1.0, finalFlareOpacity * flareBump);
                    flareScale *= (1.1 + ((currentLevel / 100) * 0.3));
                }
                lensFlare.style.opacity = finalFlareOpacity;
                lensFlare.style.transform = `scale(${flareScale})`;
            } else {
                lensFlare.style.opacity = 0; 
            }
        }
        
        // Final Challenge Mechanic: Diminishing returns on the green Hitbox cue
        if (isTargetAligned) {
            // Natively drop visibility ceilings as levels get harder
            let baseAlpha = 0.6 - (Math.min(1, currentLevel / 100) * 0.35);
            
            // Hard penalty on visibility while hazards are blinding the screen
            let hazardPenalty = Math.max(glareOpacity, finalFlareOpacity) * 0.35;
            
            // Hard floor at 5% opacity so it's barely a whisper at Level 100 + full glare
            let currentAlpha = Math.max(0.05, baseAlpha - hazardPenalty);
            
            // HI JINX GLARE BUFF: Reveal the target box to assist the initial tap mechanic
            if (equippedMove === 'hi_jinx' && isGlareEnabled) {
                currentAlpha = Math.min(1.0, currentAlpha + 0.35); // Flat 35% opacity boost
            }
            
            // Apply green alignment cue only during standard gameplay
            targetBox.style.backgroundColor = isBonusRound ? 'transparent' : `rgba(0, 255, 0, ${currentAlpha})`;
        } else {
            targetBox.style.backgroundColor = '';
        }
    }
    

    // 2. Stadium Rumble (Screen Shake)
    let shakeX = 0;
    let shakeY = 0;
    // Activates forced, or naturally from Level 25+
    if (isCrowdEnabled) {
        let rumbleIntensity = Math.min(1, currentLevel / 100);

        // Constant vibration that gets violently wider at high levels
        let maxShake = (2 + (rumbleIntensity * 12)) * 1.25;
        shakeX = (Math.random() - 0.5) * maxShake;
        shakeY = (Math.random() - 0.5) * maxShake;
    }

    // Apply the shake while maintaining the critical gameScale for responsiveness
    if (gameContainer) {
        gameContainer.style.transform = `scale(${gameScale})`;
    }
    
    // Apply shake to specific elements instead of the whole container
    let bgWrapper = document.getElementById('bgWrapper');
    let goalElement = document.getElementById('goal');
    
    if (bgWrapper) bgWrapper.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
    
    if (goalElement) {
        goalElement.style.transform = `translateX(calc(-50% + ${shakeX}px)) translateY(${shakeY}px) scale(1.0)`;
    }

    // Add shake dynamically to targetBox
    if (targetBox) {
        targetBox.style.transform = `${currentTargetTransform} translate(${shakeX}px, ${shakeY}px)`;
    }
    if (isRocketInFlight) {
        targetBox.classList.add('digital-lock');
    } else {
        targetBox.classList.remove('digital-lock');
    }

    requestAnimationFrame(animateTargetBox);
}
// Start continuous loop
animateTargetBox();

function resetMatchState() {
    matchScore = 0;
    currentAttempt = 1;
    hasPaidForCurrentMatch = false; 
    updateScoreboard();
}

function showMessage(text, color = 'white') {
    message.innerHTML = text;
    message.style.color = color;
    message.style.transform = 'translate(-50%, -50%) scale(1)';
    message.style.opacity = '1';
    if(text.includes('<a')) {
        message.style.pointerEvents = 'auto';
    } else {
        message.style.pointerEvents = 'none';
    }
}

function hideMessage() {
    message.style.opacity = '0';
    message.style.transform = 'translate(-50%, -50%) scale(0.5)';
    message.style.pointerEvents = 'none';
}

// --- DEV PANEL UI RESET HELPERS ---
function disableGlareVisuals() {
    const glareOverlay = document.getElementById('glareOverlay');
    const lensFlare = document.getElementById('lensFlare');
    if (glareOverlay) glareOverlay.style.opacity = 0;
    if (lensFlare) lensFlare.style.opacity = 0;
}

function disableCrowdVisuals() {
    if (gameContainer) gameContainer.style.transform = `scale(${gameScale})`;
}

// --- DEV PANEL EVENT LISTENERS ---
if (devMenuBtn) {
    devMenuBtn.addEventListener('click', (e) => {
        if (state === 'flying' || state === 'dragging') return;
        if (devPanel.style.right !== '0px') {
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) backdrop.style.display = 'block';
            devPanel.style.right = '0px';
            pauseShotClock();
        } else {
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
            devPanel.style.right = '-100%';
            resumeShotClock();
        }
    });
    
    const closeDevBtn = document.getElementById('closeDevBtn');
    if (closeDevBtn) {
        closeDevBtn.addEventListener('click', () => {
            devPanel.style.right = '-100%';
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
            resumeShotClock();
        });
    }
}
const randomToggle = document.getElementById('randomHazardToggle');

if (randomToggle) {
    randomToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (windToggle) windToggle.checked = false;
            if (glareToggle) glareToggle.checked = false;
            if (crowdToggle) crowdToggle.checked = false;
        }
        resetBall(true);
    });
}

if (windToggle) {
    windToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            if (randomToggle) randomToggle.checked = false;
            if (glareToggle) glareToggle.checked = false;
            if (crowdToggle) crowdToggle.checked = false;
        }
        resetBall(true);
    });
}

if (glareToggle) {
    glareToggle.addEventListener('change', (e) => { 
        if (e.target.checked) {
            if (randomToggle) randomToggle.checked = false;
            if (windToggle) windToggle.checked = false;
            if (crowdToggle) crowdToggle.checked = false;
        }
        resetBall(true);
    });
}

if (crowdToggle) {
    crowdToggle.addEventListener('change', (e) => { 
        if (e.target.checked) {
            if (randomToggle) randomToggle.checked = false;
            if (windToggle) windToggle.checked = false;
            if (glareToggle) glareToggle.checked = false;
        }
        resetBall(true);
    });
}

// Click outside to close Dev Panel cleanly
function handleOutsideClickForDevPanel(e) {
    if (devPanel && devPanel.style.right === '0px') {
        if (!devPanel.contains(e.target) && (!devMenuBtn || !devMenuBtn.contains(e.target))) {
            devPanel.style.right = '-100%';
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
            resumeShotClock();
            e.stopPropagation();
            if (e.type === 'touchstart') e.preventDefault();
        }
    }
}
document.addEventListener('mousedown', handleOutsideClickForDevPanel, true);
document.addEventListener('touchstart', handleOutsideClickForDevPanel, { capture: true, passive: false });
if (timerToggle) timerToggle.addEventListener('change', (e) => { 
    isTimerEnabled = !e.target.checked; 
    if (!isTimerEnabled) {
        if (timerIntervalId) clearInterval(timerIntervalId);
        if (shotClock) shotClock.style.display = 'none';
    } else {
        if (shotClock) shotClock.style.display = 'block';
        if (state === 'idle') startShotClock();
    }
});

// --- WIND LOGIC ---
function clearWindAndVisuals() {
    if (windIntervalId) clearInterval(windIntervalId);
    if (gustEffectTimer) clearTimeout(gustEffectTimer);
    if (windInterpolationId) cancelAnimationFrame(windInterpolationId);
    windIntervalId = null;
    gustEffectTimer = null;
    windInterpolationId = null;
    currentWind = 0;
    targetWind = 0;
    windVisualElements = [];
    if (typeof windCtx !== 'undefined' && windCtx && windCanvas) {
        windCtx.clearRect(0, 0, windCanvas.width, windCanvas.height);
        windCanvas.style.display = 'none';
    }
}

function calculateWind() {
    clearWindAndVisuals();
    if (!isWindEnabled) return;
    
    if (currentLevel <= 30) {
        targetWind = (Math.random() * 15 + 10) * 1.25 * (Math.random() > 0.5 ? 1 : -1);
        currentWind = targetWind; 
    } else if (currentLevel > 30 && currentLevel <= 70) {
        let scale = (currentLevel - 30) / 40;
        let maxWind = (25 + (scale * 30)) * 1.25;
        targetWind = maxWind * (Math.random() > 0.5 ? 1 : -1);
        currentWind = targetWind;
    } else if (currentLevel >= 71) {
        pickNewGust();
        currentWind = targetWind * 0.4; // Start with some initial wind
        let intervalTime = (Math.random() * 3 + 4) * 1000;
        windIntervalId = setInterval(() => {
            pickNewGust();
            triggerGustVisual();
        }, intervalTime);
    }
    
    createWindVisuals();
    updateWindHUD();
    
    if (!windInterpolationId) {
        lastWindTime = Date.now();
        manageWindContinuous();
    }
}

function pickNewGust() {
    let scale = Math.min(1, (currentLevel - 70) / 30);
    let maxWind = (40 + (scale * 35)) * 1.25;
    targetWind = maxWind * (Math.random() > 0.5 ? 1 : -1);
}

function triggerGustVisual() {
    if(windVisuals) windVisuals.classList.add('gusting');
    if (gustEffectTimer) clearTimeout(gustEffectTimer);
    gustEffectTimer = setTimeout(() => {
        if(windVisuals) windVisuals.classList.remove('gusting');
    }, 800); 
}

let windCtx = null;
let windCanvas = null;

function createWindVisuals() {
    if (!windVisuals) return;
    windVisualElements = [];
    if (!isWindEnabled || Math.abs(currentWind) === 0) {
        if(typeof windCanvas !== 'undefined' && windCanvas) windCanvas.style.display = 'none';
        return;
    }
    
    if (typeof windCanvas === 'undefined' || !windCanvas) {
        windCanvas = document.createElement('canvas');
        windCanvas.width = 450;
        windCanvas.height = 800; // Native game boundaries locking visuals cleanly
        windCanvas.style.width = '100%';
        windCanvas.style.height = '100%';
        windCanvas.style.position = 'absolute';
        windCanvas.style.top = '0';
        windCanvas.style.left = '0';
        windCanvas.style.pointerEvents = 'none';
        windCtx = windCanvas.getContext('2d');
        windVisuals.appendChild(windCanvas);
    }
    windCanvas.style.display = 'block';
    
    let absWind = Math.abs(currentWind) || Math.abs(targetWind);
    let numLines = Math.floor(absWind * 0.35) + 6; 
    for (let i = 0; i < numLines; i++) {
        windVisualElements.push({
            x: Math.random() * 450,
            y: Math.random() * 800,
            length: Math.random() * 160 + 100, 
            speedBase: Math.random() * 2.5 + 1.2,
            opacity: Math.random() * 0.7 + 0.3, 
            life: Math.random(), 
            fadeSpeed: Math.random() * 0.015 + 0.005,
            curlAmplitude: Math.random() * 28 + 12, 
            curlFrequency: Math.random() * 0.035 + 0.015,
            curlPhase: Math.random() * Math.PI * 2
        });
    }
}

function updateWindVisuals() {
    if (!windCanvas || !windCtx) return;
    if (windVisualElements.length === 0 && Math.abs(currentWind) > 1) {
        createWindVisuals();
    }
    
    windCtx.clearRect(0, 0, windCanvas.width, windCanvas.height);
    
    let gustMult = windVisuals && windVisuals.classList.contains('gusting') ? 3.5 : 1;
    let direction = currentWind < 0 ? -1 : 1;
    let baseSpeed = Math.abs(currentWind) * 0.16 * gustMult;
    
    windCtx.lineCap = 'round';
    windCtx.lineJoin = 'round';
    
    windVisualElements.forEach(line => {
        line.x += direction * (baseSpeed * line.speedBase);
        line.curlPhase -= 0.12 * gustMult;
        
        line.life += line.fadeSpeed * gustMult * 0.4;
        if(line.life > 1) {
            line.life = 0;
            line.x = direction === 1 ? -300 : windCanvas.width + 300;
            line.y = Math.random() * windCanvas.height;
        }
        
        if (direction === 1 && line.x > windCanvas.width + 300) {
            line.x = -300; line.life = 0;
        } else if (direction === -1 && line.x < -300) {
            line.x = windCanvas.width + 300; line.life = 0;
        }
        
        let alpha = Math.sin(line.life * Math.PI) * line.opacity;
        if (alpha < 0) alpha = 0;
        
        windCtx.beginPath();
        windCtx.moveTo(line.x, line.y);
        
        let pathDist = 0;
        let segments = 30;
        let segDist = line.length / segments;
        
        for(let j=1; j<=segments; j++) {
            pathDist += segDist;
            let cx = line.x + (direction * -1 * pathDist);
            let wave = Math.sin(line.curlPhase + (pathDist * line.curlFrequency));
            let cy = line.y + (wave * line.curlAmplitude * (1 - (j/segments))); 
            windCtx.lineTo(cx, cy);
        }
        
        // Thick Ethereal Light-Blue Base Stroke
        windCtx.lineWidth = 5.0;
        windCtx.strokeStyle = `rgba(215, 245, 255, ${alpha * 0.6})`; 
        windCtx.stroke();
        
        // Inner Brilliant White Core Stroke
        windCtx.lineWidth = 2.0;
        windCtx.strokeStyle = `rgba(255, 255, 255, ${alpha})`; 
        windCtx.stroke();
    });
}

function manageWindContinuous() {
    if (!isWindEnabled) {
        windInterpolationId = null;
        return;
    }
    
    let now = Date.now();
    let dt = Math.min(now - lastWindTime, 32);
    lastWindTime = now;
    
    if (currentLevel >= 71 && state !== 'flying') {
        if (currentWind < targetWind) {
            currentWind += dt * 0.05;
            if (currentWind > targetWind) currentWind = targetWind;
        } else if (currentWind > targetWind) {
            currentWind -= dt * 0.05;
            if (currentWind < targetWind) currentWind = targetWind;
        }
    }
    
    updateWindHUD();
    updateWindVisuals();
    
    windInterpolationId = requestAnimationFrame(manageWindContinuous);
}

function updateWindHUD() {
    if (!windIndicator) return;
    
    // Shift the UI down to prevent overlapping the shot clock
    windIndicator.style.top = '80px'; 
    
    if (!isWindEnabled || Math.abs(currentWind) < 0.5) {
        windIndicator.classList.add('hidden');
    } else {
        windIndicator.classList.remove('hidden');
        if (windSpeed) windSpeed.innerText = Math.abs(Math.round(currentWind)) + ' km/h';
        if (windArrow) windArrow.style.transform = currentWind < 0 ? 'scaleX(-1)' : 'scaleX(1)';
    }
}

function resetBall(rerollHazard = false) {
    // 1. Check for UI exploits: Auto-advance the attempt if the player resets the ball while the Next button is showing
    if (state === 'result' && nextBtn && nextBtn.style.display === 'block') {
        currentAttempt++;
        updateScoreboard();
        hideMessage();
    }
    
    // 2. Eradicate any ghost buttons stuck on the screen
    if (nextBtn) nextBtn.style.display = 'none';
    if (goAgainBtn) goAgainBtn.style.display = 'none';

    // 3. Standard reset mechanics
    targetBox.style.display = 'block';
    rocketCharge = 0;
    currentScrubDirection = 0;
    currentStrokeDistance = 0;
    isRocketInFlight = false;
    ball.classList.remove('rocket-flight', 'scarlet-moon', 'jinx-levitate', 'jinx-flight');
    const fuelGaugeFill = document.getElementById('fuelGaugeFill');
    if (fuelGaugeFill) fuelGaugeFill.style.width = '0%';
    const screenCrack = document.getElementById('crackedScreen');
    if (screenCrack) {
        screenCrack.classList.remove('cracked-anim');
        screenCrack.classList.add('hidden');
    }
    const explosion = document.getElementById('rocketExplosion');
    if (explosion) explosion.classList.remove('explode-anim', 'hidden');

    isMoonballCharged = false;
    isMoonballInFlight = false;
    if (equippedMove === 'scarlett_moonball') {
        isTracing = true;
        generatePattern();
    } else {
        isTracing = false;
    }
    jinxState = 0;
    isJinxInFlight = false;
    if (moonTimerId) clearTimeout(moonTimerId);
    
    const strobe = document.getElementById('strobeOverlay');
    if (strobe) {
        strobe.classList.add('hidden');
        strobe.classList.remove('strobe-anim');
    }
    
    const canvas = document.getElementById('patternCanvas');
    if (canvas && equippedMove !== 'scarlett_moonball') {
        canvas.classList.add('hidden');
        canvas.innerHTML = ''; 
    }
    
    const timerBar = document.getElementById('moonTimerBar');
    if (timerBar && equippedMove !== 'scarlett_moonball') {
        timerBar.classList.add('hidden');
        timerBar.style.transition = 'none'; 
        timerBar.style.width = '200px'; 
    }

    jinxState = 0; jinxHasScored = false;
    if (jinxActiveLoop) cancelAnimationFrame(jinxActiveLoop);
    const jinxArrowReset = document.getElementById('jinx-launch-arrow');
    if (jinxArrowReset) jinxArrowReset.classList.add('hidden');
    ball.style.display = 'block';
    for(let i=0; i<5; i++) {
        let orb = document.getElementById('jinxOrb' + i);
        let shadow = document.getElementById('jinxShadow' + i);
        if (orb) orb.remove();
        if (shadow) shadow.remove();
    }

    if (typeof windIntervalId !== 'undefined' && windIntervalId) clearInterval(windIntervalId);
    if (typeof gustEffectTimer !== 'undefined' && gustEffectTimer) clearTimeout(gustEffectTimer);
    ballX = 0;
    ballY = 740;
    ballZ = 0;
    vx = 0;
    vy = 0;
    vz = 0;
    hasHitTarget = false;
    crossedGoalLine = false;
    
    ball.style.left = '50%';
    ball.style.top = '';
    ball.style.bottom = '12%';
    ball.style.transform = 'translateX(-50%) scale(1)';
    ball.style.animation = 'pulse 2s infinite ease-in-out';
    
    let shadow = document.getElementById('ballShadow');
    if (shadow) {
        shadow.style.left = '50%';
        shadow.style.top = '';
        shadow.style.bottom = '10%';
        shadow.style.transform = 'translateX(-50%) scale(1)';
        shadow.style.opacity = '0.6';
    }
    state = 'idle';
    
    // Only reroll the hazard if explicitly told to (e.g., new attempt)
    if (rerollHazard) {
        applyRandomHazard(); 
    }
    
    resumeShotClock();
    
    if (window.checkJITTutorials && window.checkJITTutorials()) {
        pauseShotClock();
    }
}

function pauseShotClock() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

function resumeShotClock() {
    // Only resume if the timer is enabled and the player is actually waiting to kick
    if (!isTimerEnabled || !shotClock || state !== 'idle' || window.isCountdownActive) return;
    if (timerIntervalId) return; // Prevent double intervals
    
    timerIntervalId = setInterval(() => {
        timeLeft--;
        if (shotClock) {
            const percentage = Math.max(0, (timeLeft / 20) * 100);
            shotClock.style.width = percentage + '%';
            if (timeLeft <= 5) {
                shotClock.style.backgroundColor = '#ff4757';
            } else {
                shotClock.style.backgroundColor = '#00ff00';
            }
        }
        
        if (timeLeft <= 0) {
            pauseShotClock();
            state = 'flying';
            vy = 0; vz = 0; vx = 0;
            finishKick();
        }
    }, 1000);
}

function startShotClock() {
    pauseShotClock();
    if (!isTimerEnabled || !shotClock) {
        if (shotClock) shotClock.style.display = 'none';
        return;
    }
    
    shotClock.style.display = 'block';
    timeLeft = 20;
    shotClock.style.width = '100%';
    shotClock.style.backgroundColor = '#00ff00';
    
    resumeShotClock();
}

// Initialize Game
updateTargetDimensions();
updateGoalDistance();
updateScoreboard();
resetBall(true); // Force initial hazard roll on load
startShotClock();

// Move Selector UI Logic
const moveToggleBtn = document.getElementById('moveToggleBtn');
const moveDropdownMenu = document.getElementById('moveDropdownMenu');
const currentMoveLabel = document.getElementById('currentMoveLabel');
const currentMoveIcon = document.getElementById('currentMoveIcon');

if (moveToggleBtn && moveDropdownMenu) {
    moveToggleBtn.addEventListener('click', () => {
        if (state === 'flying' || state === 'dragging') return;
        moveDropdownMenu.classList.toggle('open');
        if (moveDropdownMenu.classList.contains('open')) pauseShotClock();
        else resumeShotClock();
    });

    const menuItems = moveDropdownMenu.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        const moveId = item.dataset.move;
        
        const setupItemVisuals = () => {
            if (moveId !== 'basic_kick' && !movesCatalogue[moveId].owned) {
                item.style.opacity = '0.6';
                if (!item.querySelector('.price-tag')) {
                    const priceTag = document.createElement('span');
                    priceTag.className = 'price-tag';
                    const price = movesCatalogue[moveId] ? movesCatalogue[moveId].cost : 150;
                    priceTag.innerText = ` 🪙${price}`;
                    priceTag.style.fontSize = '10px';
                    priceTag.style.color = '#ffd700';
                    item.appendChild(priceTag);
                }
            } else {
                item.style.opacity = '1';
                const tag = item.querySelector('.price-tag');
                if (tag) tag.remove();
            }
        };
        
        setupItemVisuals();

        item.addEventListener('click', (e) => {
            if (moveId === 'basic_kick' || movesCatalogue[moveId].owned) {
                // Select Move Logic
                selectMove(item, moveId);
            } else {
                // Purchase Logic
                let success = window.purchaseItem && window.purchaseItem('crossbar', 'moves', moveId);
                if (success) {
                    movesCatalogue[moveId].owned = true;
                    
                    // Update UI
                    item.style.opacity = '1';
                    const tag = item.querySelector('.price-tag');
                    if (tag) tag.remove();
                    
                    selectMove(item, moveId);
                    showMessage('MOVE UNLOCKED!', '#38ef7d');
                    setTimeout(hideMessage, 1000);
                } else {
                    showMessage('NOT ENOUGH TOKENS!', '#ff4757');
                    setTimeout(hideMessage, 1000);
                }
            }
        });
    });

    function selectMove(element, moveId) {
        menuItems.forEach(i => i.classList.remove('active'));
        element.classList.add('active');
        
        const textEl = element.querySelector('.m-text');
        if (currentMoveLabel && textEl) currentMoveLabel.innerText = textEl.innerText;
        if (currentMoveIcon) currentMoveIcon.innerText = element.dataset.icon;
        
        if (moonTimerId) clearTimeout(moonTimerId);
        isTracing = false;
        const canvas = document.getElementById('patternCanvas');
        if (canvas) { canvas.classList.add('hidden'); canvas.innerHTML = ''; }
        const activeTimer = document.getElementById('moonTimerBar');
        if (activeTimer) { activeTimer.classList.add('hidden'); activeTimer.style.transition = 'none'; }
        
        equippedMove = moveId;
        
        if (equippedMove === 'romeo_rocket') {
            ball.classList.add('romeo-ball-img');
            ball.classList.remove('moon-ball-img');
        } else if (equippedMove === 'scarlett_moonball') {
            ball.classList.add('moon-ball-img');
            ball.classList.remove('romeo-ball-img');
        } else {
            ball.classList.remove('romeo-ball-img', 'moon-ball-img');
        }
        
        // Unified Tutorial Trigger Logic
        const fuelGaugeContainer = document.getElementById('fuelGaugeContainer');
        const tutorialGlove = document.getElementById('tutorialGlove');
        
        if (fuelGaugeContainer) fuelGaugeContainer.style.display = (moveId === 'romeo_rocket') ? 'flex' : 'none';
        
        if (tutorialGlove) {
            tutorialGlove.classList.add('hidden');
            tutorialGlove.classList.remove('tutorial-anim', 'moonball-tutorial-anim', 'hijinx-tutorial-anim');
            clearTutorialVisuals();
            
            let shouldPlayTutorial = false;
            let animClass = '';
            
            if (!isTutorialsDisabled) {
                if (moveId === 'romeo_rocket' && !isRomeoTutorialComplete) {
                    shouldPlayTutorial = true;
                    animClass = 'tutorial-anim';
                } else if (moveId === 'scarlett_moonball' && !isMoonballTutorialComplete) {
                    shouldPlayTutorial = true;
                    animClass = 'moonball-tutorial-anim';
                } else if (moveId === 'hi_jinx' && !isHijinxTutorialComplete) {
                    shouldPlayTutorial = true;
                    animClass = 'hijinx-tutorial-anim';
                }
            }
            
            if (shouldPlayTutorial) {
                tutorialGlove.classList.remove('hidden');
                tutorialGlove.classList.add(animClass);
                playTutorialVisuals(moveId);

                const tutorialTextEl = document.getElementById('special-tutorial-text');
                if (tutorialTextEl) {
                    if (moveId === 'romeo_rocket') {
                        tutorialTextEl.innerHTML = '<h3 style="color: #ff4757; font-size: 1.4rem; font-family: sans-serif; line-height: 1.3; margin: 0;">Press and hold, scrub back and forth to charge, then launch</h3>';
                    } else if (moveId === 'scarlett_moonball') {
                        tutorialTextEl.innerHTML = '<h3 style="color: #ffd700; font-size: 1.4rem; font-family: sans-serif; margin: 0 0 5px 0;">Tap or trace the pattern, then swipe</h3><p style="font-size: 1rem; color: #fff; font-family: sans-serif; margin: 0;">Follow the yellow flashing dot</p>';
                    } else if (moveId === 'hi_jinx') {
                        tutorialTextEl.innerHTML = '<h3 style="color: #00e5ff; font-size: 1.4rem; font-family: sans-serif; margin: 0 0 5px 0;">FIRST: tap on the Crossbar when it goes green</h3><p style="font-size: 1rem; color: #fff; font-family: sans-serif; margin: 0;">Then launch the ball like normal from the BOTTOM of the screen</p>';
                    }
                    tutorialTextEl.classList.remove('hidden');
                }
            }
        }
        
        resetBall(); 
        moveDropdownMenu.classList.remove('open');
        
        // Ensure the shot clock always resumes after selecting a move
        resumeShotClock();
    }
    
    ['mousedown', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, (e) => {
            if (!moveToggleBtn.contains(e.target) && !moveDropdownMenu.contains(e.target)) {
                if (moveDropdownMenu.classList.contains('open')) {
                    moveDropdownMenu.classList.remove('open');
                    resumeShotClock();
                }
            }
        });
    });

    window.refreshMoveMenu = function() {
        menuItems.forEach(item => {
            const moveId = item.dataset.move;
            if (moveId !== 'basic_kick' && !movesCatalogue[moveId].owned) {
                item.style.opacity = '0.6';
                if (!item.querySelector('.price-tag')) {
                    const priceTag = document.createElement('span');
                    priceTag.className = 'price-tag';
                    const price = movesCatalogue[moveId] ? movesCatalogue[moveId].cost : 150;
                    priceTag.innerText = ` 🪙${price}`;
                    priceTag.style.fontSize = '10px';
                    priceTag.style.color = '#ffd700';
                    item.appendChild(priceTag);
                }
            } else {
                item.style.opacity = '1';
                const tag = item.querySelector('.price-tag');
                if (tag) tag.remove();
            }
        });
    };
}
function decayChargeLoop() {
    if (equippedMove === 'romeo_rocket' && (state === 'idle' || state === 'dragging')) {
        let lingerDelay = 100;
        if (rocketCharge >= 100) {
            let levelFactor = Math.min(100, Math.max(1, currentLevel)) / 100;
            lingerDelay = 2000 - (1800 * levelFactor); // Minimum 200ms grace period at level 100
        }
        if (Date.now() - lastChargeTime > lingerDelay && rocketCharge > 0) {
            rocketCharge -= 2.5; 
            if (rocketCharge < 0) rocketCharge = 0;
            const fuelGaugeFill = document.getElementById('fuelGaugeFill');
            if (fuelGaugeFill) fuelGaugeFill.style.width = rocketCharge + '%';
        }
    }
    requestAnimationFrame(decayChargeLoop);
}
decayChargeLoop();

function createSmokePlume(x, y, scale) {
    const smoke = document.createElement('div');
    smoke.className = 'smoke-plume';
    smoke.style.left = `${x - 12}px`;
    smoke.style.top = `${y - 12}px`;
    smoke.style.marginLeft = `${(Math.random() - 0.5) * 15}px`;
    gameContainer.appendChild(smoke);
    setTimeout(() => { if(smoke && smoke.parentElement) smoke.remove(); }, 800);

    const fire = document.createElement('div');
    fire.className = 'fire-plume';
    fire.style.left = `${x - 10}px`;
    fire.style.top = `${y - 10}px`;
    fire.style.marginLeft = `${(Math.random() - 0.5) * 5}px`;
    gameContainer.appendChild(fire);
    setTimeout(() => { if(fire && fire.parentElement) fire.remove(); }, 400);
}

function createRippleEffect(x, y) {
    if (equippedMove !== 'scarlett_moonball') return;
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    gameContainer.appendChild(ripple);
    setTimeout(() => { if(ripple && ripple.parentElement) ripple.remove(); }, 800);
}

function createTargetShatter() {
    const targetRect = targetBox.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    const targetX = targetRect.left - containerRect.left;
    const targetY = targetRect.top - containerRect.top;

    for (let i = 0; i < 15; i++) {
        let piece = document.createElement('div');
        piece.className = 'target-shatter-piece';
        piece.style.left = (targetX + Math.random() * targetRect.width) + 'px';
        piece.style.top = (targetY + Math.random() * targetRect.height) + 'px';
        let size = 4 + Math.random() * 8;
        piece.style.width = size + 'px'; piece.style.height = size + 'px';
        piece.style.setProperty('--vx', ((Math.random() - 0.5) * 200) + 'px');
        piece.style.setProperty('--vy', ((Math.random() - 0.5) * 200 - 50) + 'px');
        piece.style.setProperty('--rot', ((Math.random() - 0.5) * 720) + 'deg');
        gameContainer.appendChild(piece);
        setTimeout(() => { if(piece && piece.parentElement) piece.remove(); }, 600);
    }
}

function generatePattern() {
    const canvas = document.getElementById('patternCanvas');
    canvas.innerHTML = '';
    patternNodes = [];
    currentPatternIndex = 0;
    
    let nodeCount = Math.floor(3 + ((currentLevel / 100) * 5));
    for(let i=0; i<nodeCount; i++) {
        let containerRect = document.getElementById('gameContainer').getBoundingClientRect();
        let maxWidth = Math.max(300, containerRect.width - 60); // Keep dots inside
        
        let x, y, isValid;
        do {
            x = 30 + Math.random() * (maxWidth - 30); 
            y = 300 + Math.random() * 300; 
            isValid = true;
            for(let node of patternNodes) {
                if (Math.hypot(x - node.x, y - node.y) < 60) {
                    isValid = false;
                    break;
                }
            }
        } while(!isValid);
        
        patternNodes.push({x: x, y: y});
        
        let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '12'); 
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', '#ff4757');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('id', 'node-'+i);
        if (i === 0) {
            circle.classList.add('next-node');
            circle.style.stroke = '#ffd700';
            circle.style.strokeWidth = '4px';
            circle.style.filter = 'drop-shadow(0 0 10px #ffd700)';
        }
        canvas.appendChild(circle);
    }
    canvas.classList.remove('hidden');
    
    const timerBar = document.getElementById('moonTimerBar');
    if (timerBar) {
        timerBar.classList.remove('hidden');
        timerBar.style.transition = 'none';
        timerBar.style.width = '200px';
        void timerBar.offsetWidth;
        timerBar.style.transition = 'width 4s linear';
        timerBar.style.width = '0px';
    }
    
    moonTimerId = setTimeout(() => {
        if(!isMoonballCharged) {
            showMessage('TOO SLOW!', '#ff4757');
            setTimeout(hideMessage, 1200);
            resetBall();
        }
    }, 4000);
}

function jinxGameLoop() {
    if (jinxState !== 2) return;
    let activeCount = 0;
    
    jinxOrbsData.forEach(p => {
        if (!p.active) return;
        activeCount++;
        
        if (p.delayFrames > 0) { p.delayFrames--; return; }
        
        let prevY = p.y;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        p.vz -= (gravityZ * 0.8);
        p.vy *= frictionAir; p.vx *= frictionAir;
        
        // Apply crosswind drift while the orb is in the air
        if (p.z > 0) { 
            p.vx += (currentWind * 0.035 * windVulnerability); 
        }
        
        if (p.z < 0) {
            p.z = 0;
            if (p.vz < -4) { p.vz = -p.vz * 0.4; p.vy *= frictionGround; } 
            else { p.vz = 0; p.vy *= frictionGround; p.vx *= frictionGround; }
        }
        
        let orb = document.getElementById('jinxOrb' + p.id);
        let shadow = document.getElementById('jinxShadow' + p.id);
        let depthScale = Math.max(0.2, p.y / 740);
        let screenX = 225 + p.x;
        let screenY = p.y - p.z;
        
        if (orb) {
            orb.style.left = `${screenX}px`; orb.style.top = `${screenY}px`;
            orb.style.transform = `translate(-50%, -50%) scale(${depthScale})`;
        }
        if (shadow) {
            shadow.style.left = `${screenX}px`; shadow.style.top = `${p.y}px`;
            shadow.style.transform = `translate(-50%, -50%) scale(${depthScale})`;
            shadow.style.opacity = Math.max(0, 0.6 - (p.z/300));
        }
        
        if (!p.crossed && prevY > goalLineY && p.y <= goalLineY) {
            p.crossed = true;
            
            // Route the orb directly through our master collision logic
            let hit = evaluateCollision(p.y, p.z, p.x);
            
            if (hit) {
                const containerRect = gameContainer.getBoundingClientRect();
                const targetRect = targetBox.getBoundingClientRect();
                const targetY = (targetRect.top - containerRect.top) / gameScale; 
                const targetX = (targetRect.left - containerRect.left) / gameScale; 
                const targetWidth = targetRect.width / gameScale;
                
                p.z = p.y - targetY - 25; 
                let intersectX = 225 + p.x;
                if (intersectX < targetX) p.x = targetX - 225;
                else if (intersectX > targetX + targetWidth) p.x = targetX + targetWidth - 225;
                
                p.vy = Math.abs(p.vy) * 0.4;
                p.vz = -Math.abs(p.vz) * 0.6;
                p.vx += (Math.random() - 0.5) * 10;
                
                if (orb) { 
                    orb.style.background = '#38ef7d'; 
                    orb.style.boxShadow = '0 0 20px #38ef7d'; 
                }

                if (!jinxHasScored) {
                    jinxHasScored = true; 
                    hasHitTarget = true;
                    matchScore++; 
                    updateScoreboard();
                    flashOverlay.style.background = 'var(--success)';
                    flashOverlay.style.opacity = '1'; 
                    setTimeout(() => flashOverlay.style.opacity = '0', 300);
                    showMessage('HIT!');
                }
            }
        }
        
        if ((p.z === 0 && Math.abs(p.vy) < 0.5 && Math.abs(p.vx) < 0.5) || p.y < -200) p.active = false;
    });
    
    if (activeCount === 0) {
        if (!jinxHasScored) { showMessage('MISS!', '#ff4757'); hasHitTarget = false; }
        finishKick(); return;
    }
    jinxActiveLoop = requestAnimationFrame(jinxGameLoop);
}

// --- DYNAMIC HAZARD ALLOCATION ---
function applyRandomHazard() {
    const randomToggle = document.getElementById('randomHazardToggle');
    const windToggle = document.getElementById('windToggle');
    const glareToggle = document.getElementById('glareToggle');
    const crowdToggle = document.getElementById('crowdToggle');

    let randomEnabled = randomToggle ? randomToggle.checked : true;
    
    // 1. Read manual developer overrides first
    isWindEnabled = windToggle ? windToggle.checked : false;
    isGlareEnabled = glareToggle ? glareToggle.checked : false;
    isCrowdEnabled = crowdToggle ? crowdToggle.checked : false;

    // 1.5 Forced Teaching Levels (Overrides Random)
    if (!isWindEnabled && !isGlareEnabled && !isCrowdEnabled) {
        if (currentLevel === 10 || currentLevel === 11) {
            isCrowdEnabled = true;
            randomEnabled = false; // Bypass the random roll to lock the hazard
        } else if (currentLevel === 12 || currentLevel === 13) {
            isWindEnabled = true;
            randomEnabled = false;
        } else if (currentLevel === 14 || currentLevel === 15) {
            isGlareEnabled = true;
            randomEnabled = false;
        }
    }

    // 2. If Random is enabled AND no manual overrides are set, roll dynamically for Level 10+
    if (randomEnabled && !isWindEnabled && !isGlareEnabled && !isCrowdEnabled) {
        if (currentLevel >= 10) {
            const hazards = ['wind', 'glare', 'crowd'];
            const activeHazard = hazards[Math.floor(Math.random() * hazards.length)];

            if (activeHazard === 'wind') isWindEnabled = true;
            if (activeHazard === 'glare') isGlareEnabled = true;
            if (activeHazard === 'crowd') isCrowdEnabled = true;
        }
    }

    // 3. Trigger or clear the relevant visual effects
    if (isWindEnabled) {
        calculateWind(); 
    } else {
        clearWindAndVisuals();
        updateWindHUD();
    }

    if (!isGlareEnabled) disableGlareVisuals();
    if (!isCrowdEnabled) disableCrowdVisuals();
}

// --- DEVELOPER ECONOMY CHEATS ---
const devAddXpBtn = document.getElementById('devAddXpBtn');
const devAddTokensBtn = document.getElementById('devAddTokensBtn');
const devUnlockMovesToggle = document.getElementById('devUnlockMovesToggle');

const devDisableTutorialsToggle = document.getElementById('devDisableTutorialsToggle');
if (devDisableTutorialsToggle) {
    devDisableTutorialsToggle.addEventListener('change', (e) => {
        isTutorialsDisabled = e.target.checked;
        
        // If disabled, immediately hide any active tutorial gloves
        if (isTutorialsDisabled) {
            const tutorialGlove = document.getElementById('tutorialGlove');
            if (tutorialGlove) {
                tutorialGlove.classList.add('hidden');
                tutorialGlove.classList.remove('tutorial-anim', 'moonball-tutorial-anim', 'hijinx-tutorial-anim');
            }
            clearTutorialVisuals();
        }
    });
}

if (devUnlockMovesToggle) {
    devUnlockMovesToggle.addEventListener('change', (e) => {
        const isUnlocked = e.target.checked;
        Object.keys(movesCatalogue).forEach(key => {
            movesCatalogue[key].owned = isUnlocked;
        });
        
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const moveId = item.dataset.move;
            if (moveId !== 'basic_kick') {
                if (isUnlocked) {
                    item.style.opacity = '1';
                    const tag = item.querySelector('.price-tag');
                    if (tag) tag.remove();
                } else {
                    item.style.opacity = '0.6';
                    const existingTag = item.querySelector('.price-tag');
                    if (!existingTag) {
                        const priceTag = document.createElement('span');
                        priceTag.className = 'price-tag';
                        priceTag.innerText = ' 🪙1500';
                        priceTag.style.fontSize = '10px';
                        priceTag.style.color = '#ffd700';
                        item.appendChild(priceTag);
                    }
                }
            }
        });
        

    });
}

const devUnlockLevelsToggle = document.getElementById('devUnlockLevelsToggle');
if (devUnlockLevelsToggle) {
    devUnlockLevelsToggle.addEventListener('change', (e) => {
        isAllLevelsUnlocked = e.target.checked;
        if (!isAllLevelsUnlocked) {
            // Force user back to their highest unlocked level if they were cheating
            if (currentLevel > highestUnlockedLevel) {
                triggerLevelUpdate(highestUnlockedLevel);
            }
        }
    });
}

if (devAddXpBtn) {
    devAddXpBtn.addEventListener('click', () => {
        window.GK_State.economy.xp += 5000;
        if (typeof window.saveGameState === 'function') window.saveGameState(true);
        const xpDisplay = document.getElementById('xpDisplay');
        if (xpDisplay) xpDisplay.innerText = window.GK_State.economy.xp;
    });
}

if (devAddTokensBtn) {
    devAddTokensBtn.addEventListener('click', () => {
        window.GK_State.economy.tokens += 5000;
        if (typeof window.saveGameState === 'function') window.saveGameState(true);
        const tokenDisplay = document.getElementById('tokenDisplay');
        if (tokenDisplay) tokenDisplay.innerText = window.GK_State.economy.tokens;
    });
}

// --- LOCKER ROOM LOGIC ---
const equipmentList = document.getElementById('equipmentList');
const lockerTokenDisplay = document.getElementById('lockerTokenDisplay');

function initLockerRoom() {
    if (lockerTokenDisplay) lockerTokenDisplay.innerText = window.GK_State.economy.tokens;
    renderLockerRoom();
}

function renderLockerRoom() {
    if (!equipmentList) return;
    equipmentList.innerHTML = '';

    Object.entries(equipmentCatalogue).forEach(([itemId, item]) => {
        const itemCard = document.createElement('div');
        itemCard.style.cssText = 'background: rgba(255,255,255,0.05); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; border: 1px solid rgba(255,255,255,0.1);';
        
        // Header (Name and Cost/Status)
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center;';
        
        const title = document.createElement('span');
        title.style.cssText = 'color: white; font-weight: bold; font-family: sans-serif;';
        title.innerText = item.name;

        const statusBadge = document.createElement('span');
        statusBadge.style.cssText = 'font-family: monospace; font-size: 14px;';
        if (item.owned) {
            statusBadge.innerText = 'OWNED';
            statusBadge.style.color = '#38ef7d';
        } else {
            statusBadge.innerText = `🪙 ${item.cost}`;
            statusBadge.style.color = '#ffd700';
        }

        header.appendChild(title);
        header.appendChild(statusBadge);

        // Description
        const desc = document.createElement('div');
        desc.style.cssText = 'color: #888; font-size: 12px; font-family: sans-serif; line-height: 1.4;';
        desc.innerText = item.desc;

        // Action Button
        const actionBtn = document.createElement('button');
        actionBtn.style.cssText = 'padding: 8px; border: none; border-radius: 4px; font-weight: bold; font-family: sans-serif; text-transform: uppercase; margin-top: 5px; transition: all 0.2s;';
        
        if (!item.owned) {
            actionBtn.innerText = 'Purchase';
            actionBtn.style.background = '#ffd700';
            actionBtn.style.color = '#000';
            actionBtn.style.cursor = 'pointer';
            actionBtn.disabled = false;
            
            actionBtn.onclick = () => {
                if (window.purchaseItem && window.purchaseItem('crossbar', 'gear', itemId)) {
                    item.equipped = true; // Auto-equip on purchase
                    renderLockerRoom(); // Refresh UI
                } else {
                    showMessage('NOT ENOUGH TOKENS!', '#ff4757');
                    setTimeout(hideMessage, 1500);
                }
            };
        } else {
            actionBtn.innerText = 'Purchased';
            actionBtn.style.background = 'rgba(255,255,255,0.2)';
            actionBtn.style.color = 'rgba(255,255,255,0.5)';
            actionBtn.style.cursor = 'default';
            actionBtn.disabled = true;
        }

        itemCard.appendChild(header);
        itemCard.appendChild(desc);
        itemCard.appendChild(actionBtn);
        equipmentList.appendChild(itemCard);
    });
}

// Re-Trigger Tutorial Logic explicitly across all moves
function triggerRulesTutorial(moveId, name, iconObj, cssAnimClass) {
    if (!movesCatalogue[moveId] || !movesCatalogue[moveId].owned) {
        showMessage(`PURCHASE THE ${name.toUpperCase()} FIRST!`, '#ff4757');
        setTimeout(hideMessage, 1500);
        return;
    }

    equippedMove = moveId;
    if (equippedMove === 'romeo_rocket') {
        ball.classList.add('romeo-ball-img');
        ball.classList.remove('moon-ball-img');
    } else if (equippedMove === 'scarlett_moonball') {
        ball.classList.add('moon-ball-img');
        ball.classList.remove('romeo-ball-img');
    } else {
        ball.classList.remove('romeo-ball-img', 'moon-ball-img');
    }
    const fuelGaugeContainer = document.getElementById('fuelGaugeContainer');
    if (fuelGaugeContainer) fuelGaugeContainer.style.display = (moveId === 'romeo_rocket') ? 'flex' : 'none';
        
    const currentMoveLabel = document.getElementById('currentMoveLabel');
    const currentMoveIcon = document.getElementById('currentMoveIcon');
    if (currentMoveLabel) currentMoveLabel.innerText = name;
    if (currentMoveIcon) currentMoveIcon.innerText = iconObj;
    
    resetBall(false);

    // Reset completion trackers
    if (moveId === 'romeo_rocket') isRomeoTutorialComplete = false;
    else if (moveId === 'scarlett_moonball') isMoonballTutorialComplete = false;
    else if (moveId === 'hi_jinx') isHijinxTutorialComplete = false;

    const tutorialGlove = document.getElementById('tutorialGlove');
    if (tutorialGlove) {
        tutorialGlove.classList.remove('hidden');
        tutorialGlove.classList.remove('tutorial-anim', 'moonball-tutorial-anim', 'hijinx-tutorial-anim'); 
        clearTutorialVisuals();
        
        // Force a reflow
        void tutorialGlove.offsetWidth; 
        tutorialGlove.classList.add(cssAnimClass);
        playTutorialVisuals(moveId);

        const tutorialTextEl = document.getElementById('special-tutorial-text');
        if (tutorialTextEl) {
            if (moveId === 'romeo_rocket') {
                tutorialTextEl.innerHTML = '<h3 style="color: #ff4757; font-size: 1.4rem; font-family: sans-serif; line-height: 1.3; margin: 0;">Press and hold, scrub back and forth to charge, then launch</h3>';
            } else if (moveId === 'scarlett_moonball') {
                tutorialTextEl.innerHTML = '<h3 style="color: #ffd700; font-size: 1.4rem; font-family: sans-serif; margin: 0 0 5px 0;">Tap or trace the pattern, then swipe</h3><p style="font-size: 1rem; color: #fff; font-family: sans-serif; margin: 0;">Follow the yellow flashing dot</p>';
            } else if (moveId === 'hi_jinx') {
                tutorialTextEl.innerHTML = '<h3 style="color: #00e5ff; font-size: 1.4rem; font-family: sans-serif; margin: 0 0 5px 0;">FIRST: tap on the Crossbar when it goes green</h3><p style="font-size: 1rem; color: #fff; font-family: sans-serif; margin: 0;">Then launch the ball like normal from the BOTTOM of the screen</p>';
            }
            tutorialTextEl.classList.remove('hidden');
        }
    }
}

function playTutorialVisuals(moveId) {
    if (moveId === 'scarlett_moonball') {
        const renderMoonballSim = () => {
            const canvas = document.getElementById('patternCanvas');
            if(!canvas) return;
            canvas.innerHTML = '';
            canvas.classList.remove('hidden');
            
            const pathList = [
                {x: 200, y: 680}, // Start (0,0 relative)
                {x: 140, y: 600}, // (-60, -80)
                {x: 200, y: 520}, // (0, -160)
                {x: 260, y: 600}, // (60, -80)
                {x: 200, y: 680}  // (0, 0)
            ];
            
            pathList.forEach((pt, i) => {
                let circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', pt.x);
                circle.setAttribute('cy', pt.y);
                circle.setAttribute('r', '8');
                circle.setAttribute('fill', '#fff');
                circle.setAttribute('stroke', '#ff4757');
                circle.setAttribute('stroke-width', '2');
                canvas.appendChild(circle);
            });
            
            // Sync turning nodes yellow and then red as traced
            pathList.forEach((pt, i) => {
                let t = (i === 0) ? 0 : (i === 1 ? 1200 : (i === 2 ? 2000 : (i === 3 ? 2800 : 3200)));
                tutorialVisualsTimeouts.push(setTimeout(() => {
                    let c = canvas.children[i+1];
                    if(c) {
                        c.setAttribute('fill', '#ffd700'); 
                        tutorialVisualsTimeouts.push(setTimeout(() => { if(c) c.setAttribute('fill', '#ff4757'); }, 300));
                    }
                }, t));
            });
        };
        renderMoonballSim();
        tutorialVisualsIntervals.push(setInterval(renderMoonballSim, 4000));
    }
    else if (moveId === 'hi_jinx') {
        const renderHijinxSim = () => {
            const container = document.getElementById('gameContainer');
            for(let i=0; i<3; i++) {
                let existing = document.getElementById('tutOrb'+i);
                let existingS = document.getElementById('tutOrbShadow'+i);
                if(existing) existing.remove();
                if(existingS) existingS.remove();
            }
            
            // Glove taps target at 15% of 3.5s = ~525ms. Then orbs spawn.
            tutorialVisualsTimeouts.push(setTimeout(() => {
                for(let i=0; i<3; i++) {
                    let orb = document.createElement('div');
                    orb.className = 'jinx-orb';
                    orb.id = 'tutOrb'+i;
                    
                    let shadow = document.createElement('div');
                    shadow.className = 'jinx-orb-shadow';
                    shadow.id = 'tutOrbShadow'+i;

                    container.appendChild(shadow);
                    container.appendChild(orb);
                    
                     let spreadIndex = i - 1;
                     let screenX = 225 + (spreadIndex * 40); 
                     
                     orb.style.left = screenX + 'px';
                     orb.style.top = '480px';
                     shadow.style.left = screenX + 'px';
                     shadow.style.top = '550px';

                     // Glove flicks phantom ball locally syncing to 70% milestone
                     tutorialVisualsTimeouts.push(setTimeout(() => {
                         orb.style.transition = 'all 0.4s ease-out';
                         orb.style.top = '50px'; 
                         orb.style.opacity = '0';
                         shadow.style.opacity = '0';
                     }, 2450 - 525 + (i * 60))); // Launch concurrently with tiny organic stagger
                }
            }, 525));
        };
        renderHijinxSim();
        tutorialVisualsIntervals.push(setInterval(renderHijinxSim, 3500));
    }
}

const showTutorialBtn = document.getElementById('showTutorialBtn');
if (showTutorialBtn) {
    showTutorialBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        triggerRulesTutorial('romeo_rocket', 'Romeo Rocket', '🚀', 'tutorial-anim');
        if (typeof devPanel !== 'undefined' && devPanel) {
            devPanel.style.right = '-100%';
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) backdrop.style.display = 'none';
        }
    });
}

const showTutorialBtn_moonball = document.getElementById('showTutorialBtn_moonball');
if (showTutorialBtn_moonball) {
    showTutorialBtn_moonball.addEventListener('click', (e) => {
        e.stopPropagation(); 
        triggerRulesTutorial('scarlett_moonball', 'Scarlett Moonball', '🌙', 'moonball-tutorial-anim');
        if (typeof devPanel !== 'undefined' && devPanel) {
            devPanel.style.right = '-100%';
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) backdrop.style.display = 'none';
        }
    });
}

const showTutorialBtn_hijinx = document.getElementById('showTutorialBtn_hijinx');
if (showTutorialBtn_hijinx) {
    showTutorialBtn_hijinx.addEventListener('click', (e) => {
        e.stopPropagation(); 
        triggerRulesTutorial('hi_jinx', 'Hi-Jinx', '🎭', 'hijinx-tutorial-anim');
        if (typeof devPanel !== 'undefined' && devPanel) {
            devPanel.style.right = '-100%';
            const backdrop = document.getElementById('hub-backdrop');
            if (backdrop) backdrop.style.display = 'none';
        }
    });
}

// --- BONUS ROUND LOGIC ---
function initBonusRound() {
    isBonusRound = true;
    matchScore = 0;
    currentAttempt = 1;
    
    // Force Basic Kick
    equippedMove = 'basic_kick';
    ball.classList.remove('romeo-ball-img', 'moon-ball-img');
    if (currentMoveLabel) currentMoveLabel.innerText = 'Basic Kick';
    if (currentMoveIcon) currentMoveIcon.innerText = '⚡';
    const fuelContainer = document.getElementById('fuelGaugeContainer');
    if (fuelContainer) fuelContainer.style.display = 'none';

    // Disable Hazards
    isWindEnabled = false; isGlareEnabled = false; isCrowdEnabled = false;
    clearWindAndVisuals(); updateWindHUD(); disableGlareVisuals(); disableCrowdVisuals();

    // Transform Target into Winged Bag
    targetBox.innerHTML = '<div class="bonus-aura"></div><img src="../../assets/crossbar/winged_bag.png" class="bonus-bag-anim">';
    targetBox.style.background = 'transparent';
    targetBox.style.border = 'none';
    targetBox.style.outline = 'none';
    targetBox.style.boxShadow = 'none';
    targetBox.style.width = '195px';
    targetBox.style.height = '130px';
    
    // Visually hide the goalpost frame without hiding the nested bag
    const goal = document.getElementById('goal');
    if (goal) {
        goal.style.borderColor = 'transparent';
        goal.style.background = 'transparent';
    }
    
    showMessage('BONUS ROUND!\nHIT THE BAG FOR 500 TOKENS', '#ffd700');
    setTimeout(hideMessage, 2500);
    updateScoreboard();
    resetBall(false);
    startShotClock();
}

function exitBonusRound() {
    isBonusRound = false;
    hideMessage();
    targetBox.innerHTML = '';
    targetBox.style.background = '';
    targetBox.style.border = '';
    targetBox.style.boxShadow = '';
    
    // Restore the physical goalpost visibility
    const goal = document.getElementById('goal');
    if (goal) {
        goal.style.borderColor = '';
        goal.style.background = '';
    }
    
    // Proceed to the next level seamlessly
    if (currentLevel < 100) {
        highestUnlockedLevel = Math.max(highestUnlockedLevel, currentLevel + 1);
        if (window.GK_State && window.GK_State.player) {
            window.GK_State.player.crossbarLevel = highestUnlockedLevel;
            if (typeof window.saveGameState === 'function') window.saveGameState(true);
        } else {
            localStorage.setItem('gk_crossbar_max_level', highestUnlockedLevel);
        }
        currentLevel++;
        levelSlider.value = currentLevel;
        updateTargetDimensions();
        updateGoalDistance();
    }
    hasPaidForCurrentMatch = false;
    resetMatchState();
    resetBall(true);
    startShotClock();
}

const devLaunchBonusBtn = document.getElementById('devLaunchBonusBtn');
if (devLaunchBonusBtn) devLaunchBonusBtn.addEventListener('click', () => {
    if (devPanel) {
        devPanel.style.right = '-100%';
        const backdrop = document.getElementById('hub-backdrop');
        if (backdrop) setTimeout(() => backdrop.style.display = 'none', 300);
    }
    resumeShotClock();
    initBonusRound();
});

// Initialize locker room items on load
initLockerRoom();

window.updateCrossbarUI = function() {
    if (!window.GK_State) return;
    const moves = window.GK_State.catalogues.crossbar.moves;
    
    // Helper to update a single button
    const updateBtn = (id, moveKey) => {
        const btn = document.getElementById(id);
        if (btn && moves[moveKey]) {
            if (moves[moveKey].owned) {
                btn.textContent = 'Purchased';
                btn.style.background = 'rgba(255,255,255,0.2)';
                btn.style.color = 'rgba(255,255,255,0.5)';
                btn.style.cursor = 'default';
                btn.onclick = null;
            } else {
                btn.textContent = `Purchase: ${moves[moveKey].cost} Tokens`;
                btn.style.background = '#00d2ff';
                btn.style.color = '#000';
                btn.style.cursor = 'pointer';
            }
        }
    };
    
    updateBtn('btn-crossbar-romeo', 'romeo_rocket');
    updateBtn('btn-crossbar-moonball', 'scarlett_moonball');
    updateBtn('btn-crossbar-hijinx', 'hi_jinx');
    
    if (window.refreshMoveMenu) {
window.refreshMoveMenu();
    }
};

window.checkJITTutorials = function() {
    const devDisablePrompts = window.GK_State?.developer?.disableCountdowns || false;
    
    const hasSeenHijinxTip = localStorage.getItem('gk_crossbar_hijinx_tip_seen');
    const hijinxTipOverlay = document.getElementById('crossbar-hijinx-tip-overlay');

    const hasSeenGlareIntro = localStorage.getItem('gk_crossbar_glare_seen');
    const glareOverlay = document.getElementById('crossbar-glare-tutorial-overlay');

    const hasSeenMoonballTip = localStorage.getItem('gk_crossbar_moonball_tip_seen');
    const moonballTipOverlay = document.getElementById('crossbar-moonball-tip-overlay');

    const hasSeenWindIntro = localStorage.getItem('gk_crossbar_wind_seen');
    const windOverlay = document.getElementById('crossbar-wind-tutorial-overlay');

    const hasSeenRocketTip = localStorage.getItem('gk_crossbar_rocket_tip_seen');
    const rocketTipOverlay = document.getElementById('crossbar-rocket-tip-overlay');

    const hasSeenCrowdIntro = localStorage.getItem('gk_crossbar_crowd_seen');
    const crowdOverlay = document.getElementById('crossbar-crowd-tutorial-overlay');

    const hasSeenMovingIntro = localStorage.getItem('gk_crossbar_moving_seen');
    const movingOverlay = document.getElementById('crossbar-moving-tutorial-overlay');

    const hasSeenCrossbarIntro = localStorage.getItem('gk_crossbar_intro_seen');
    const introOverlay = document.getElementById('crossbar-tutorial-overlay');

    if (currentLevel === 15 && !hasSeenHijinxTip && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (hijinxTipOverlay) {
            hijinxTipOverlay.classList.remove('hidden');
            hijinxTipOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (currentLevel === 14 && !hasSeenGlareIntro && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (glareOverlay) {
            glareOverlay.classList.remove('hidden');
            glareOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (currentLevel === 13 && !hasSeenMoonballTip && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (moonballTipOverlay) {
            moonballTipOverlay.classList.remove('hidden');
            moonballTipOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (currentLevel === 12 && !hasSeenWindIntro && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (windOverlay) {
            windOverlay.classList.remove('hidden');
            windOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (currentLevel === 11 && !hasSeenRocketTip && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (rocketTipOverlay) {
            rocketTipOverlay.classList.remove('hidden');
            rocketTipOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (currentLevel === 10 && !hasSeenCrowdIntro && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (crowdOverlay) {
            crowdOverlay.classList.remove('hidden');
            crowdOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (currentLevel === 5 && !hasSeenMovingIntro && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (movingOverlay) {
            movingOverlay.classList.remove('hidden');
            movingOverlay.style.zIndex = '100001';
        }
        return true;
    } else if (!hasSeenCrossbarIntro && currentLevel < 5 && !devDisablePrompts) {
        const countdownOverlay = document.getElementById('gameCountdownOverlay');
        if (countdownOverlay) countdownOverlay.style.display = 'none';

        pauseShotClock();
        if (introOverlay) {
            introOverlay.classList.remove('hidden');
            introOverlay.style.zIndex = '100001';
        }
        return true;
    }
    return false;
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

    if (window.updateCrossbarUI) window.updateCrossbarUI();

    triggerLevelUpdate(currentLevel);
    
    // We already call checkJITTutorials inside resetBall() which fires on initial load,
    // but the initial load explicitly calls startCountdownSequence() below.
    // So if a tutorial is active, skip the initial countdown start.
    if (!window.checkJITTutorials()) {
        window.startCountdownSequence();
    }
    
    const closeTutorialBtn = document.getElementById('closeCrossbarTutorialBtn');
    if (closeTutorialBtn) {
        closeTutorialBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_intro_seen', 'true');
            const introOverlay = document.getElementById('crossbar-tutorial-overlay');
            if (introOverlay) introOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence(); 
        });
    }

    const closeMovingBtn = document.getElementById('closeMovingTutorialBtn');
    if (closeMovingBtn) {
        closeMovingBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_moving_seen', 'true');
            const movingOverlay = document.getElementById('crossbar-moving-tutorial-overlay');
            if (movingOverlay) movingOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence(); 
        });
    }

    const closeCrowdBtn = document.getElementById('closeCrowdTutorialBtn');
    if (closeCrowdBtn) {
        closeCrowdBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_crowd_seen', 'true');
            const crowdOverlay = document.getElementById('crossbar-crowd-tutorial-overlay');
            if (crowdOverlay) crowdOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence(); // Resume the normal launch sequence
        });
    }

    const closeRocketTipBtn = document.getElementById('closeRocketTipBtn');
    if (closeRocketTipBtn) {
        closeRocketTipBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_rocket_tip_seen', 'true');
            const rocketTipOverlay = document.getElementById('crossbar-rocket-tip-overlay');
            if (rocketTipOverlay) rocketTipOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence(); 
        });
    }

    const closeWindBtn = document.getElementById('closeWindTutorialBtn');
    if (closeWindBtn) {
        closeWindBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_wind_seen', 'true');
            const windOverlay = document.getElementById('crossbar-wind-tutorial-overlay');
            if (windOverlay) windOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence();
        });
    }

    const closeMoonballBtn = document.getElementById('closeMoonballTipBtn');
    if (closeMoonballBtn) {
        closeMoonballBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_moonball_tip_seen', 'true');
            const moonballTipOverlay = document.getElementById('crossbar-moonball-tip-overlay');
            if (moonballTipOverlay) moonballTipOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence();
        });
    }

    const closeGlareBtn = document.getElementById('closeGlareTutorialBtn');
    if (closeGlareBtn) {
        closeGlareBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_glare_seen', 'true');
            const glareOverlay = document.getElementById('crossbar-glare-tutorial-overlay');
            if (glareOverlay) glareOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence();
        });
    }

    const closeHijinxBtn = document.getElementById('closeHijinxTipBtn');
    if (closeHijinxBtn) {
        closeHijinxBtn.addEventListener('click', () => {
            localStorage.setItem('gk_crossbar_hijinx_tip_seen', 'true');
            const hijinxTipOverlay = document.getElementById('crossbar-hijinx-tip-overlay');
            if (hijinxTipOverlay) hijinxTipOverlay.classList.add('hidden');
            
            const countdownOverlay = document.getElementById('gameCountdownOverlay');
            if (countdownOverlay) countdownOverlay.style.display = 'flex';
            window.startCountdownSequence();
        });
    }
});

window.isCountdownActive = true;
window.startCountdownSequence = function() {
    window.isCountdownActive = true;
    const overlay = document.getElementById('gameCountdownOverlay');
    const text = document.getElementById('gameCountdownText');
    const rulesBtn = document.getElementById('countdownRulesBtn');
    
    if (window.GK_State?.developer?.disableCountdowns) {
        if (overlay) overlay.style.display = 'none';
        window.isCountdownActive = false;
        resumeShotClock();
        return;
    }
    
    if (!overlay) {
        window.isCountdownActive = false;
        resumeShotClock();
        return;
    }
    
    pauseShotClock(); // Pause immediately
    
    let count = 3;
    let timer = setInterval(() => {
        count--;
        if (count > 0) {
            text.innerText = count;
        } else if (count === 0) {
            text.innerText = 'GO!';
        } else {
            clearInterval(timer);
            overlay.style.display = 'none';
            window.isCountdownActive = false;
            resumeShotClock();
        }
    }, 1000);

    rulesBtn.onclick = () => {
        clearInterval(timer);
        overlay.style.display = 'none';
        window.isCountdownActive = false;
        
        const devMenuBtn = document.getElementById('devMenuBtn');
        if (devMenuBtn) devMenuBtn.click();
        
        const rulesDetails = Array.from(document.querySelectorAll('details')).find(d => d.innerHTML.includes('Rules'));
        if(rulesDetails) rulesDetails.open = true;
    };

    const skipBtn = document.getElementById('skipCountdownBtn');
    if (skipBtn) {
        skipBtn.onclick = () => {
            clearInterval(timer);
            overlay.style.display = 'none';
            window.isCountdownActive = false;
            resumeShotClock();
        };
    }
}
