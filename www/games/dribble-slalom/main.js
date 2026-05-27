let moveIntervalTimer = null;
let chaserPx = 0, chaserPy = 0;
let chaserVelX = 0, chaserVelY = 0;
let chaserPath = [];
let chaserTargetIndex = 0;
let isChaserActive = false;
let testRainActive = false;
let testGlareActive = false;
let testNoiseActive = false;
let equippedCleats = false; // Lvl 31+
let equippedShades = false; // Lvl 31+
let equippedMuffs = false; // Lvl 31+
let specialCharges = 0;
function syncSpecialCharges() {
    if (!window.GK_State) window.GK_State = {};
    if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };
    window.GK_State.economy.specialCharges = specialCharges;
    if (typeof window.saveGameState === 'function') window.saveGameState(false);
}
let inMiniGame = false;
let constellationNodes = [];
let isAshDashDragging = false;
let miniGameTimer = null;
let isAshDashAnimating = false;
let ashDashDestX = 0, ashDashDestY = 0;
let ashDashAnimT = 0;
let ashDashStartX = 0, ashDashStartY = 0;
let ashDashTargetIndex = 0;
let currentSpecialType = null; 
let chaserStunnedUntil = 0;
let chaserStrobeUntil = 0;
let weatherNerfUntil = 0; 
let flareX = 50, flareY = 50, flareVelX = 0.5, flareVelY = 0.3;
let maxUnlockedLevel = window.GK_State?.player?.slalomLevel || parseInt(localStorage.getItem('dribbleSlalomMaxLevel')) || 1;
let devUnlockAllLevels = false;
let devDisablePrompts = false;
let devEnableLocker = false;
let devEnableSpecials = false;
let devDisableMainTimer = false;
let devDisableSpecialTimer = false;

let hasCollectedFirstTokenGate = false;
let winsSinceLastTokenGate = 0;
let tokenGateAttemptsLeft = 0;

let purchasedCleats = false;
let purchasedShades = false;
let purchasedMuffs = false;
const isMoveOwned = (key) => window.GK_State?.catalogues?.slalom?.moves?.[key]?.owned || false;

window.showMessage = function(text, color = '#ff4757') {
    if (window.showGKNotification && (text.toUpperCase().includes('NOT ENOUGH') || text.toUpperCase().includes('TOKENS') || text.toUpperCase().includes('XP'))) {
        window.showGKNotification(text, true);
        return;
    }
    const msg = document.createElement('div');
    msg.textContent = text;
    msg.style.position = 'fixed';
    msg.style.top = '20%';
    msg.style.left = '50%';
    msg.style.transform = 'translate(-50%, -50%)';
    msg.style.background = color;
    msg.style.color = '#fff';
    msg.style.padding = '10px 20px';
    msg.style.borderRadius = '5px';
    msg.style.zIndex = '10000';
    msg.style.fontWeight = 'bold';
    msg.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
    msg.style.transition = 'opacity 0.5s ease-in-out';
    document.body.appendChild(msg);
    setTimeout(() => {
        msg.style.opacity = '0';
        setTimeout(() => msg.remove(), 500);
    }, 2000);
};

const economyPrice = 1500;
const itemXpLock = 2500;
const moveXpLock = 1000;
let maxTimeMs = 45000;
let currentTimeMs = 45000;

let hasSeenConeRule = false;
let isRulePaused = false;
let hasSeenBatteryRule = false;
let hasSeenAshDashRule = false;
let hasSeenChaserRule = false;
let hasSeenZarasZapRule = false;
let hasSeenChrisCrossRule = false;
let hasSeenCleatTip = false;
let hasSeenShadesTip = false;
let hasSeenMuffsTip = false;
let hasSeenRainRule = false;
let hasSeenGlareRule = false;
let hasSeenNoiseRule = false;
let hasSeenHazardTip = false;

let raindrops = [];
const maxRaindrops = 188;
// Initialize raindrops
for (let i = 0; i < maxRaindrops; i++) {
    raindrops.push({
        x: Math.random() * 2000 - 500, // Wide spawn area to account for wind
        y: Math.random() * 2000 - 1000,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 15 + 15,
        opacity: Math.random() * 0.5 + 0.1
    });
}

document.addEventListener('DOMContentLoaded', () => {
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
    
    if (window.GK_State.economy.specialCharges !== undefined) {
        specialCharges = window.GK_State.economy.specialCharges;
        const badge = document.getElementById('special-badge');
        if (badge) badge.textContent = specialCharges;
    }

  const levelSlider = document.getElementById('level-slider');
  let currentLvl = maxUnlockedLevel;
  
  if (!devUnlockAllLevels) {
      levelSlider.max = maxUnlockedLevel;
      currentLvl = Math.min(currentLvl, maxUnlockedLevel);
  }
  levelSlider.value = currentLvl;
  const levelDisplay = document.getElementById('level-display');
  if (levelDisplay) levelDisplay.textContent = currentLvl;

  window.addEventListener('gk_state_updated', () => {
      if (window.GK_State?.economy?.specialCharges !== undefined) {
          specialCharges = window.GK_State.economy.specialCharges;
          const badge = document.getElementById('special-badge');
          if (badge) badge.textContent = specialCharges;
      }
      if (window.GK_State?.player?.slalomLevel) {
          maxUnlockedLevel = Math.max(maxUnlockedLevel, window.GK_State.player.slalomLevel);
          if (!devUnlockAllLevels) {
              levelSlider.max = maxUnlockedLevel;
              currentLvl = maxUnlockedLevel;
              levelSlider.value = currentLvl;
              if (levelDisplay) levelDisplay.textContent = currentLvl;
              renderCones(currentLvl);
          }
      }
  });
  const conesContainer = document.getElementById('cones-container');

  function calculateCones(level) {
    if (level < 4) return 3;
    if (level < 10) return 4;
    if (level >= 70) return 10;
    return 3 + Math.floor(level / 10);
  }

  // Overlap check calculates distance using rudimentary pseudo-percentage units
  function checkOverlap(newCone, placedCones, minDistance) {
    for (let c of placedCones) {
      const dx = newCone.x - c.x;
      const dy = newCone.y - c.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) return true; // overlap found
    }
    // Check distance against the ball (anchored near x: 50%, y: 10%)
    const ballDx = newCone.x - 50;
    const ballDy = newCone.y - 10;
    if (Math.sqrt(ballDx * ballDx + ballDy * ballDy) < minDistance) return true;

    return false;
  }

function renderCones(level) {
  const coneCount = calculateCones(level);
  conesContainer.innerHTML = ''; // Clear existing cones

  const minX = 22, maxX = 78;
  const minY = 25, maxY = 70;

  // FIX 1: Increased minimum distance to aggressively force spacing
  const dynamicMinDistance = Math.max(15, 36 - (coneCount * 2.5));
  const placedCones = [];
  const generatedPoints = [];
  let attemptsTotal = 0;

  while (generatedPoints.length < coneCount && attemptsTotal < 1000) {
      let x = minX + Math.random() * (maxX - minX);
      let y = minY + Math.random() * (maxY - minY);

      if (!checkOverlap({x, y}, generatedPoints, dynamicMinDistance)) {
          generatedPoints.push({x, y});
      }
      attemptsTotal++;
  }

  if (level <= 10) {
      generatedPoints.sort((a, b) => a.y - b.y);
  }

  for (let i = 0; i < generatedPoints.length; i++) {
      const pt = generatedPoints[i];
      const coneNumber = i + 1; 

      placedCones.push(pt);

      const coneWrapper = document.createElement('div');
      coneWrapper.className = 'cone-wrapper';
      coneWrapper.style.left = `${pt.x}%`;
      coneWrapper.style.bottom = `${pt.y}%`;
      coneWrapper.style.transform = `translate(-50%, 50%)`;

      const targetZone = document.createElement('div');
      targetZone.className = 'target-zone';

      const angle = Math.random() * 2 * Math.PI;
      // FIX 2: TIGHTENED RADIUS from 45 to 26 so target zones stay glued to their parent cone
      const radius = 26; 
      const offsetX = Math.cos(angle) * radius;
      const offsetY = Math.sin(angle) * radius;
      pt.offsetX = offsetX;
      pt.offsetY = offsetY;

      targetZone.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;

      const coneGraphic = document.createElement('div');
      coneGraphic.className = 'cone-graphic';

      const coneLabel = document.createElement('div');
      coneLabel.className = 'cone-label';
      coneLabel.textContent = coneNumber;

      coneWrapper.appendChild(targetZone);
      coneWrapper.appendChild(coneGraphic);
      coneWrapper.appendChild(coneLabel);

      conesContainer.appendChild(coneWrapper);
  }

  // FIX 3: FINISH LINE OVERLAP FIX
  let validFinish = false;
  let fAttempts = 0;
  let finishX = 50;
  let finishY = 70;

  // Start with a strict distance to stay well clear of target zone orbits
  let requiredClearance = Math.max(18, dynamicMinDistance); 

  while (!validFinish && fAttempts < 500) {
      // If the board is too crowded and it's struggling, lower the strictness
      if (fAttempts === 250) requiredClearance = 12; 

      finishX = minX + Math.random() * (maxX - minX);
      // Spawn strictly between 50% (middle) and 75% (top penalty box)
      finishY = 50 + Math.random() * 25; 

      if (!checkOverlap({x: finishX, y: finishY}, placedCones, requiredClearance)) {
          validFinish = true;
      }
      fAttempts++;
  }

  // Strict physical clamps to keep it on the grass
  if (finishY > 75) finishY = 75; 
  if (finishX < 22) finishX = 22;
  if (finishX > 78) finishX = 78;

  const finishTarget = document.createElement('div');
  finishTarget.className = 'finish-target-zone';
  finishTarget.style.left = `${finishX}%`;
  finishTarget.style.bottom = `${finishY}%`;
  finishTarget.style.transform = `translate(-50%, 50%)`;
  conesContainer.appendChild(finishTarget);

  const finishFlag = document.createElement('div');
  finishFlag.className = 'finish-flag';
  finishFlag.textContent = '🏁';
  finishFlag.style.left = `${finishX}%`;
  finishFlag.style.bottom = `${finishY}%`;
  finishFlag.style.transform = `translate(-50%, 50%)`;
  conesContainer.appendChild(finishFlag);

  let specialIndices = [];
  if (level >= 10 && level < 20) {
      specialIndices.push(Math.floor(Math.random() * Math.min(3, coneCount)));
  } else if (level >= 20) {
      while (specialIndices.length < 2) {
          let r = Math.floor(Math.random() * coneCount);
          if (!specialIndices.includes(r)) specialIndices.push(r);
      }
  }

  const allWrappers = conesContainer.querySelectorAll('.cone-wrapper');
  allWrappers.forEach((w, idx) => {
      if (specialIndices.includes(idx)) {
          const tz = w.querySelector('.target-zone');
          if (tz) tz.classList.add('target-special');
      }
  });

  window.gameObstacles = placedCones.map((c, idx) => {
    return {
      percentX: c.x,
      percentY: c.y,
      cleared: false,
      isFinish: false,
      targetOffsetX: c.offsetX,
      targetOffsetY: c.offsetY,
      isSpecialGate: specialIndices.includes(idx)
    };
  });

  window.gameObstacles.push({
    percentX: finishX,
    percentY: finishY,
    cleared: false,
    isFinish: true,
    targetOffsetX: 0,
    targetOffsetY: 0,
    isSpecialGate: false
  });

  // FIX 4: STANDALONE GATE OVERLAP FIX
  if (level >= 50) {
      let standalonePerX = 50;
      let standalonePerY = 50;
      let saValid = false;
      let saAttempts = 0;
      const allExistingGeom = [...placedCones, {x: finishX, y: finishY}];

      while (!saValid && saAttempts < 500) {
          let tempX = minX + Math.random() * (maxX - minX);
          let tempY = minY + Math.random() * (maxY - minY);
          if (!checkOverlap({x: tempX, y: tempY}, allExistingGeom, dynamicMinDistance)) {
              standalonePerX = tempX;
              standalonePerY = tempY;
              saValid = true;
          }
          saAttempts++;
      }

      const standaloneGate = document.createElement('div');
      standaloneGate.className = 'target-standalone';
      standaloneGate.style.position = 'absolute';
      standaloneGate.style.left = `${standalonePerX}%`;
      standaloneGate.style.bottom = `${standalonePerY}%`;

      standaloneGate.style.width = '50px';
      standaloneGate.style.height = '50px';
      standaloneGate.style.borderRadius = '50%';
      standaloneGate.style.backgroundColor = 'rgba(0, 200, 255, 0.4)';
      standaloneGate.style.border = '4px solid #00d2ff'; 
      standaloneGate.style.boxShadow = '0 0 15px #00d2ff';
      standaloneGate.style.transform = 'translate(-50%, 50%)';
      standaloneGate.style.display = 'flex';
      standaloneGate.style.justifyContent = 'center';
      standaloneGate.style.alignItems = 'center';
      standaloneGate.style.fontSize = '24px'; 
      standaloneGate.innerHTML = '⚡';

      conesContainer.appendChild(standaloneGate);

      window.gameObstacles.push({
          percentX: standalonePerX,
          percentY: standalonePerY,
          cleared: false,
          isFinish: false,
          targetOffsetX: 0,
          targetOffsetY: 0,
          isStandaloneSpecial: true,
          isSpecialGate: false
      });
  }

    // TOKEN GATE SPAWN LOGIC
    let spawnTokenGate = false;
    if (!hasCollectedFirstTokenGate && level >= 14) {
        spawnTokenGate = true;
    } else if (hasCollectedFirstTokenGate && tokenGateAttemptsLeft > 0) {
        spawnTokenGate = true;
        tokenGateAttemptsLeft--;
        if (tokenGateAttemptsLeft === 0) {
            winsSinceLastTokenGate = 0; // They burned their extra attempt, reset the grind
        }
    }

    if (spawnTokenGate) {
        let tokenPerX = 50;
        let tokenPerY = 50;
        let tkValid = false;
        let tkAttempts = 0;
        // Ensure it doesn't overlap with cones, finish line, or special gates
        const allExistingGeomForToken = window.gameObstacles.map(o => ({x: o.percentX, y: o.percentY}));

        while (!tkValid && tkAttempts < 500) {
            let tempX = minX + Math.random() * (maxX - minX);
            let tempY = minY + Math.random() * (maxY - minY);
            if (!checkOverlap({x: tempX, y: tempY}, allExistingGeomForToken, dynamicMinDistance)) {
                tokenPerX = tempX;
                tokenPerY = tempY;
                tkValid = true;
            }
            tkAttempts++;
        }

        const tokenGate = document.createElement('div');
        tokenGate.className = 'target-token';
        tokenGate.style.position = 'absolute';
        tokenGate.style.left = `${tokenPerX}%`;
        tokenGate.style.bottom = `${tokenPerY}%`;
        tokenGate.style.width = '50px';
        tokenGate.style.height = '50px';
        tokenGate.style.borderRadius = '50%';
        tokenGate.style.backgroundColor = 'rgba(255, 215, 0, 0.4)';
        tokenGate.style.border = '4px solid #ffd700'; 
        tokenGate.style.boxShadow = '0 0 15px #ffd700';
        tokenGate.style.transform = 'translate(-50%, 50%)';
        tokenGate.style.display = 'flex';
        tokenGate.style.justifyContent = 'center';
        tokenGate.style.alignItems = 'center';
        tokenGate.style.fontSize = '24px'; 
        tokenGate.innerHTML = '💰';

        conesContainer.appendChild(tokenGate);

        window.gameObstacles.push({
            percentX: tokenPerX,
            percentY: tokenPerY,
            cleared: false,
            isFinish: false,
            targetOffsetX: 0,
            targetOffsetY: 0,
            isStandaloneSpecial: false,
            isTokenGate: true,
            isSpecialGate: false
        });
    }

  window.nextTargetIndex = 0;
  setTimeout(updateObstacleVisuals, 50);

  if (level >= 10 && !hasSeenBatteryRule) {
      hasSeenBatteryRule = true;
      setTimeout(() => {
          window.showRulePopup("NEW FEATURE", "New at Level 10: Pass through the glowing BLUE gates to charge up your Special Moves! Once charged, tap the blue lightning bolt icon in the bottom left to unleash your move.", "#00d2ff");
          const batteryRuleUI = document.getElementById('rule-battery-text');
          if (batteryRuleUI) batteryRuleUI.style.display = 'list-item';
      }, 100); 
  }
}

  function updateObstacleVisuals() {
    const wrappers = document.querySelectorAll('.cone-wrapper');
    const fTarget = document.querySelector('.finish-target-zone');
    const flag = document.querySelector('.finish-flag');
    const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;

    wrappers.forEach((w, idx) => {
      w.classList.remove('cone-cleared');
      const t = w.querySelector('.target-zone');
      if (t) t.classList.remove('target-active');

      if (idx < window.nextTargetIndex) {
        w.classList.add('cone-cleared');
      } else if (idx === window.nextTargetIndex) {
        if (t) {
          if (currentLvl >= 90) {
             // Level 90+: No glow indicator at all
          } else if (currentLvl >= 80) {
             // Level 80-89: Show indicator for 0.5s, then remove
             t.classList.add('target-active');
             setTimeout(() => {
               if (idx === window.nextTargetIndex) {
                 t.classList.remove('target-active');
               }
             }, 500);
          } else {
             // Level 1-79: Normal persistent glow
             t.classList.add('target-active');
          }
        }
      }
    });

    if (fTarget && flag) {
      fTarget.classList.remove('target-active');
      flag.classList.remove('cone-cleared');

      const finishIndex = window.gameObstacles.findIndex(o => o.isFinish);
      if (window.nextTargetIndex === finishIndex) {
          if (currentLvl >= 90) {
             // Level 90+: No finish glow
          } else if (currentLvl >= 80) {
             // Level 80-89: Finish glow for 0.5s
             fTarget.classList.add('target-active');
             setTimeout(() => {
               if (window.nextTargetIndex === finishIndex) {
                 fTarget.classList.remove('target-active');
               }
             }, 500);
          } else {
             // Level 1-79: Persistent finish glow
             fTarget.classList.add('target-active');
          }
      } else if (window.nextTargetIndex > finishIndex) {
        fTarget.classList.remove('target-active');
        flag.classList.add('cone-cleared');
      }
    }
  }

  // --- TRACING & PHYSICS ENGINE ---
  const canvas = document.getElementById('trace-canvas');
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  // Call once after a slight delay to ensure layout computes
  setTimeout(resizeCanvas, 100);

  let isTracing = false;
  let tracePath = [];
  
  // Ball physics state (in pixels)
  let ballPx = 0, ballPy = 0;
  let prevBallPx = 0, prevBallPy = 0;
  let velX = 0, velY = 0;
  let pointerX = 0, pointerY = 0;
  
  const spring = 0.06;
  const friction = 0.88;
  
  // Game State variables
  let currentAttempt = 1;
  let successes = 0;
  let matchWon = false;
  let matchEnded = false;
  let isAttemptFailing = false;
  
  const matchAttemptsEl = document.getElementById('match-attempts');
  const matchSuccessesEl = document.getElementById('match-successes');
  const resultOverlay = document.getElementById('match-result-overlay');
  const resultText = document.getElementById('match-result-text');

  let hasDeductedStamina = false;

  function attemptStaminaDeduction() {
      if (hasDeductedStamina) return true;
      if (typeof window.spendStamina === 'function') {
          if (!window.spendStamina(10)) {
              const resultOverlay = document.getElementById('match-result-overlay');
              const resultText = document.getElementById('match-result-text');
              const playBtn = document.getElementById('play-again-btn');
              
              if (resultText) {
                  resultText.innerHTML = 'OUT OF STAMINA!<br><a onclick="window.location.href = &apos;../../features/locker-room/index.html?action=recovery&returnTo=slalom&apos;;" ontouchend="window.location.href = &apos;../../features/locker-room/index.html?action=recovery&returnTo=slalom&apos;; event.preventDefault();" style="cursor: pointer; font-size: 1.5rem; text-decoration: underline; color: #00d2ff; display: block; margin-top: 15px; pointer-events: auto;">Recharge in Recovery Hub</a>';
                  resultText.style.color = '#ff3c3c';
              }
              if (playBtn) playBtn.style.display = 'none';
              
              if (resultOverlay) {
                  resultOverlay.style.display = 'flex';
                  resultOverlay.style.visibility = 'visible';
                  resultOverlay.style.opacity = '1';
                  resultOverlay.style.zIndex = '999999';
              }
              
              matchEnded = true; 
              return false;
          }
      }
      hasDeductedStamina = true;
      return true;
  }

  function updateMatchUI() {
    matchAttemptsEl.textContent = `Attempt: ${currentAttempt}/3`;
    matchSuccessesEl.textContent = `Successes: ${successes}/2`;
  }

  function endMatch(won) {
    matchEnded = true;
    matchWon = won;
    tracePath = []; // Instantly erase active drawn line
    resultOverlay.style.display = 'block';
    resultText.textContent = won ? 'Match Won!' : 'Match Lost';
    
    if (won) {
        let avatarUrl = window.getCelebrateAvatarUrl ? window.getCelebrateAvatarUrl() : '../../assets/locker-room/images/avatars/celebrate.png';
        let avatarImg = document.getElementById('slalom-victory-avatar');
        if (!avatarImg) {
            avatarImg = document.createElement('img');
            avatarImg.id = 'slalom-victory-avatar';
            resultText.parentNode.insertBefore(avatarImg, resultText);
        }
        avatarImg.src = avatarUrl;
        avatarImg.style.cssText = 'max-height: 250px; width: auto; object-fit: contain; margin: 0 auto 15px auto; display: block; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.6)); position: relative; z-index: 10; pointer-events: none;';
        avatarImg.style.display = 'block';
        
        let flagImg = document.getElementById('slalom-victory-flag');
        if (!flagImg) {
            flagImg = document.createElement('img');
            flagImg.id = 'slalom-victory-flag';
            resultText.parentNode.insertBefore(flagImg, avatarImg);
        }
        let userCountry = '';
        try {
            const profileStr = localStorage.getItem('gk_user_profile');
            if (profileStr) {
                const profileObj = JSON.parse(profileStr);
                userCountry = profileObj.country || '';
            }
        } catch (e) {}
        const flagUrl = (typeof window.getCountryFlagUrl === 'function') ? window.getCountryFlagUrl(userCountry) : null;
        if (flagUrl) {
            flagImg.src = flagUrl;
            flagImg.style.cssText = 'position: absolute; left: 50%; top: 120px; transform: translate(-50%, -50%); width: 220px; height: 150px; object-fit: cover; opacity: 0.85; z-index: 1; pointer-events: none; border-radius: 12px; filter: blur(1px);';
            flagImg.style.display = 'block';
        } else {
            flagImg.style.display = 'none';
        }
    } else {
        let avatarImg = document.getElementById('slalom-victory-avatar');
        if (avatarImg) avatarImg.style.display = 'none';
        let flagImg = document.getElementById('slalom-victory-flag');
        if (flagImg) flagImg.style.display = 'none';
    }
    
    const xpRewardUI = document.getElementById('match-xp-reward');
    if (won) {
        // Increment win counter for Token Gate
        if (hasCollectedFirstTokenGate && tokenGateAttemptsLeft === 0) {
            winsSinceLastTokenGate++;
            if (winsSinceLastTokenGate >= 10) {
                tokenGateAttemptsLeft = 2; // Initial spawn + 1 extra attempt
            }
        }

        const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;

        // Unlock the next level if we beat the current highest level
        if (currentLvl === maxUnlockedLevel && maxUnlockedLevel < 100) {
            maxUnlockedLevel++;
        if (window.GK_State && window.GK_State.player) {
            window.GK_State.player.slalomLevel = maxUnlockedLevel;
            if (typeof window.saveGameState === 'function') window.saveGameState(true);
        } else {
            localStorage.setItem('dribbleSlalomMaxLevel', maxUnlockedLevel);
        }
            // Only update the slider's physical max if Dev mode isn't overriding it
            if (!devUnlockAllLevels) {
                document.getElementById('level-slider').max = maxUnlockedLevel;
            }
        }
        localStorage.setItem('dribbleSlalomCurrentLevel', currentLvl);

        // Calculate rewards (Level * 5 for both)
        const xpGained = currentLvl * 5;
        const tokensGained = currentLvl * 5;

        if (!window.GK_State) window.GK_State = {};
        if (!window.GK_State.economy) window.GK_State.economy = { xp: 0, tokens: 0 };

        window.GK_State.economy.xp += xpGained;
        window.GK_State.economy.tokens += tokensGained;

        if (!window.GK_State.player) window.GK_State.player = {};
        if (window.GK_State.player.tournamentDailyXP === undefined) window.GK_State.player.tournamentDailyXP = 0;
        window.GK_State.player.tournamentDailyXP += xpGained;

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

        if (xpRewardUI) {
            // Display both on the win screen cleanly
            xpRewardUI.innerHTML = `+${xpGained} XP<br><span style="color: #ffd700; font-size: 0.8em;">+${tokensGained} Tokens</span>`;
            xpRewardUI.style.display = 'block';
        }
    } else {
        if (xpRewardUI) {
            xpRewardUI.style.display = 'none';
        }
    }

    const playBtn = document.getElementById('play-again-btn');
    playBtn.textContent = won ? 'Next Level' : 'Try Again';
    playBtn.style.display = 'block';
    
    if (resultText) resultText.style.color = 'white';
    
    playBtn.style.pointerEvents = 'auto';
    playBtn.style.opacity = '1.0';

    isTracing = false;
    
    chaserPath = [];
    isChaserActive = false;
    const chaserDom = document.getElementById('chaser');
    if (chaserDom) chaserDom.style.display = 'none';
  }

  let failTimeoutId = null;

  function failAttempt(reason) {
      if (isAttemptFailing || matchEnded) return;

      // Aggressive Input Reset to prevent stuck touch freezing
      isTracing = false;
      velX = 0;
      velY = 0;
      // Force an artificial mouse-up event
      handleUp(); 

      isAttemptFailing = true;

      const failUI = document.getElementById('attempt-fail-message');
      const reasonText = document.getElementById('fail-reason-text');

      if (failUI && reasonText) {
          reasonText.textContent = reason;
          failUI.style.display = 'block';
      }

      // Wait 2 seconds, hide UI, and process the reset/match end
      failTimeoutId = setTimeout(() => {
          if (failUI) failUI.style.display = 'none';

          currentAttempt++;
          updateMatchUI();

          if (currentAttempt > 3) {
              endMatch(false);
          } else {
              const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
              renderCones(currentLvl);
              resetAttempt();
          }
      }, 2000);
  }

  function resetAttempt(fullReset = false) {
    if (failTimeoutId) {
        clearTimeout(failTimeoutId);
        failTimeoutId = null;
    }
    inMiniGame = false; 
    isAshDashAnimating = false;
    matchEnded = false;
    isAttemptFailing = false;
    if (!fullReset && currentAttempt <= 3) {
        matchWon = false; 
    }
    document.getElementById('constellation-overlay').style.display = 'none';
    document.getElementById('special-menu').style.display = 'none';

    clearInterval(moveIntervalTimer);
    
    if (fullReset) {
        currentAttempt = 1;
        successes = 0;
        matchWon = false;
        hasSeenConeRule = false;
        hasDeductedStamina = false;
        const resultOverlay = document.getElementById('match-result-overlay');
        resultOverlay.style.display = 'none';
        updateMatchUI();
    }

    if (window.gameObstacles) window.gameObstacles.forEach(o => o.cleared = false);
    window.nextTargetIndex = 0;
    updateObstacleVisuals();

    // Aggressively reset physics states
    velX = 0; velY = 0;
    tracePath = [];
    isTracing = false;

    ballPx = canvas.width * 0.5;
    ballPy = canvas.height * 0.92; 
    prevBallPx = ballPx; 
    prevBallPy = ballPy;
    pointerX = ballPx;
    pointerY = ballPy;

    isChaserActive = false;
    chaserTargetIndex = 0;
    chaserPath = [];
    chaserPx = canvas.width * 0.5;
    chaserPy = canvas.height * 0.92;
    chaserVelX = 0;
    chaserVelY = 0;

    const chaserDom = document.getElementById('chaser');
    if (chaserDom) chaserDom.style.display = 'none';

    const ballDom = document.getElementById('ball');
    ballDom.style.left = `${ballPx}px`;
    ballDom.style.bottom = `${canvas.height - ballPy}px`;
    ballDom.style.transform = `translate(-50%, 50%)`;

    const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
    
    // Toggle special button visibility based on level
    const specialBtn = document.getElementById('special-btn');
    if (specialBtn) {
        specialBtn.style.display = currentLvl >= 10 ? 'flex' : 'none';
    }

    startDynamicObstacles(currentLvl);
    // Roll random hazards for the new attempt
    applyHazardLogic();

    // Dynamic Timer Scaling Logic
    if (currentLvl <= 20) {
        // Levels 1-20: Scale from 45s down to 30s
        maxTimeMs = 45000 - ((currentLvl - 1) / 19) * 15000;
    } else if (currentLvl <= 90) {
        // Levels 21-90: Scale from 30s down to 15s
        maxTimeMs = 30000 - ((currentLvl - 20) / 70) * 15000;
    } else {
        // Levels 91+: Cap at 15s
        maxTimeMs = 15000;
    }

    currentTimeMs = maxTimeMs;

    const timerFill = document.getElementById('timer-bar-fill');
    if (timerFill) {
        timerFill.style.width = '100%';
        timerFill.style.backgroundColor = '#00ff00';
    }

    // Unhide Level 12 Hazard Tip in the Accordion
    if (currentLvl >= 12 && !hasSeenHazardTip) {
        hasSeenHazardTip = true;
        const hazardRuleLi = document.getElementById('rule-hazard-tip');
        if (hazardRuleLi) hazardRuleLi.style.display = 'list-item';
    }

    matchEnded = false;
    isAttemptFailing = false;
  }

  function startDynamicObstacles(level) {
    if (level < 20) return;

    const timeRatio = Math.max(0, Math.min(1, (level - 20) / (100 - 20)));
    const timeInterval = 6000 - (timeRatio * 3000);
    const movementRange = 10 + (timeRatio * 50);

    const coneCount = calculateCones(level);
    const dynamicMinDistance = Math.max(10, 31 - (coneCount * 2));

    moveIntervalTimer = setInterval(() => {
      if (!window.gameObstacles) return;

      const minX = 22, maxX = 78;
      const minY = 25, maxY = 70;

      const wrappers = document.querySelectorAll('.cone-wrapper');

      window.gameObstacles.forEach((obs, idx) => {
        if (obs.isFinish === true || obs.cleared === true) return;

        const offsetX = (Math.random() * 2 - 1) * movementRange;
        const offsetY = (Math.random() * 2 - 1) * movementRange;

        let newX = obs.percentX + offsetX;
        let newY = obs.percentY + offsetY;

        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        // Check distance against ALL other obstacles with a Forcefield for Goals
        let overlap = false;
        for (let j = 0; j < window.gameObstacles.length; j++) {
          if (j === idx) continue; // Skip self
          const otherObs = window.gameObstacles[j];
          const dx = newX - otherObs.percentX;
          const dy = newY - otherObs.percentY;

          // Apply a much larger safety forcefield to the Finish Line and Standalone gates
          // to account for their larger visual footprints and target orbits
          let requiredDist = dynamicMinDistance;
          if (otherObs.isFinish) requiredDist += 15;
          if (otherObs.isStandaloneSpecial) requiredDist += 10;

          if (Math.sqrt(dx * dx + dy * dy) < requiredDist) {
            overlap = true;
            break;
          }
        }

        if (overlap) return; // Abort movement for this tick

        obs.percentX = newX;
        obs.percentY = newY;

        if (wrappers[idx]) {
          wrappers[idx].style.left = `${newX}%`;
          wrappers[idx].style.bottom = `${newY}%`;
        }
      });
    }, timeInterval);
  }

  function recoilToCheckpoint() {
    // Stop physics tracking
    isTracing = false;
    velX = 0; velY = 0;

    // If no checkpoints cleared, goes to start line (index 0 implies nothing cleared)
    if (window.nextTargetIndex === 0) {
      tracePath = [];
      ballPx = canvas.width * 0.5;
      ballPy = canvas.height * 0.92;
      pointerX = ballPx; pointerY = ballPy;
    } else {
      // Find last cleared target
      const lastCleared = window.gameObstacles[window.nextTargetIndex - 1];
      
      // Explicitly truncate the trailing path geometry back cleanly to the checkpoint
      if (typeof lastCleared.pathIndex !== 'undefined' && lastCleared.pathIndex <= tracePath.length) {
         tracePath = tracePath.slice(0, lastCleared.pathIndex);
      }
      
      if (tracePath.length > 0) {
          // Anchor exactly to the surviving severed end of the path array
          const lastPoint = tracePath[tracePath.length - 1];
          ballPx = lastPoint.x;
          ballPy = lastPoint.y;
      } else {
          // Fallback to strict map center arithmetic if the array failed to log
          ballPx = (lastCleared.percentX / 100) * canvas.width + (lastCleared.targetOffsetX || 0);
          ballPy = canvas.height - (lastCleared.percentY / 100) * canvas.height + (lastCleared.targetOffsetY || 0);
          tracePath.push({x: ballPx, y: ballPy});
      }

      pointerX = ballPx; pointerY = ballPy;
    }
    
    prevBallPx = ballPx; prevBallPy = ballPy;

    // Force Dom Ball UI exactly to snapped position
    const ballDom = document.getElementById('ball');
    ballDom.style.left = `${ballPx}px`;
    ballDom.style.bottom = `${canvas.height - ballPy}px`;
    ballDom.style.transform = `translate(-50%, 50%)`;
    
    updateObstacleVisuals();
  }

  function distToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x2 - x1)**2 + (y2 - y1)**2;
    if (l2 === 0) return Math.sqrt((px - x1)**2 + (py - y1)**2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return Math.sqrt((px - projX)**2 + (py - projY)**2);
  }

  function checkCollisions() {
    if (!window.gameObstacles || matchWon) return;

    for (let i = 0; i < window.gameObstacles.length; i++) {
      const obs = window.gameObstacles[i];
      const ox = (obs.percentX / 100) * canvas.width;
      const oy = canvas.height - (obs.percentY / 100) * canvas.height;
      
      // Hit cone penalty
      if (!obs.isFinish && !obs.cleared) {
        const distToCone = distToSegment(ox, oy, prevBallPx, prevBallPy, ballPx, ballPy);
        if (distToCone < 7.5) {
           recoilToCheckpoint();

           // Trigger JIT Cone Rule
           if (!hasSeenConeRule) {
               hasSeenConeRule = true;
               window.showRulePopup("WATCH OUT!", "Pass through the circles but don't hit the cones, or you will get knocked back 1 space.", "#ff3c3c");
           }
           return;
        }
      }

      // 1. Independent check for Standalones (Specials and Tokens)
      if ((obs.isStandaloneSpecial || obs.isTokenGate) && !obs.cleared) {
          let targetX = ox + (obs.targetOffsetX || 0);
          let targetY = oy + (obs.targetOffsetY || 0);
          const distToTarget = distToSegment(targetX, targetY, prevBallPx, prevBallPy, ballPx, ballPy);

          if (distToTarget <= 24) {
              obs.cleared = true;

              if (obs.isTokenGate) {
                  window.GK_State.economy.tokens += 1000;
                  const tokenDisplay = document.getElementById('hub-token-display');
                  if (tokenDisplay) tokenDisplay.textContent = window.GK_State.economy.tokens;
                  if (typeof refreshLockerRoomUI === 'function') refreshLockerRoomUI();

                  hasCollectedFirstTokenGate = true;
                  winsSinceLastTokenGate = 0;
                  tokenGateAttemptsLeft = 0;

                  const tokenGates = document.querySelectorAll('.target-token');
                  tokenGates.forEach(w => w.style.opacity = '0.2');
              } else {
                  specialCharges++;
                  const badge = document.getElementById('special-badge');
                  if (badge) badge.textContent = specialCharges;
                  syncSpecialCharges();

                  const specialGates = document.querySelectorAll('.target-standalone');
                  specialGates.forEach(w => w.style.opacity = '0.2');
              }
              continue;
          }
      }

      // 2. Sequential Target validation (Only check the active index)
      if (i === window.nextTargetIndex && !obs.isStandaloneSpecial) {
         let targetX = ox;
         let targetY = oy;
         if (!obs.isFinish) {
           targetX += obs.targetOffsetX || 0;
           targetY += obs.targetOffsetY || 0; // Canvas Y and DOM Y add positively downward
         }

         const distToTarget = distToSegment(targetX, targetY, prevBallPx, prevBallPy, ballPx, ballPy);
         const threshold = obs.isFinish ? 20 : 24; // Tightened hitbox bounds
         
         if (distToTarget <= threshold) { // Compare against precise visual bounds
            obs.cleared = true;
            obs.pathIndex = tracePath.length; // Lock array splice length state
            
            if (obs.isSpecialGate) {
                specialCharges++;
                const badge = document.getElementById('special-badge');
                if (badge) badge.textContent = specialCharges;
                syncSpecialCharges();
                obs.isSpecialGate = false; // Prevent double trigger
            }

            window.nextTargetIndex++;
            updateObstacleVisuals(); // Instant Real-time Visual Sync mapping
            
            if (obs.isFinish) {
               // Goal executed successfully
               isTracing = false;
               tracePath = []; // Instantly clear drawn line
               
               successes++;
               updateMatchUI();
               
               // Match Resolution Enforcement
               if (successes === 2) {
                 endMatch(true);
               } else if (currentAttempt === 3) {
                 endMatch(false);
               } else {
                 currentAttempt++;
                 const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
                 renderCones(currentLvl);
                 resetAttempt();
               }
               return;
            }
         }
      }
    }
  }

  let isHubOpen = false;

  function drawLoop() {
    if (matchEnded || isRulePaused || isAttemptFailing || isHubOpen) {
        requestAnimationFrame(drawLoop);
        return;
    }
    if (inMiniGame && !isAshDashAnimating) {
        requestAnimationFrame(drawLoop);
        return; 
    }

    // Drain Timer (~60fps)
    if (!devDisableMainTimer) {
        // Drain Timer normally
        currentTimeMs -= 16.66;

        if (currentTimeMs <= 0) {
            currentTimeMs = 0;
            isTracing = false;
            velX = 0;
            velY = 0;
            failAttempt("Time's Up!");
            requestAnimationFrame(drawLoop);
            return;
        }
    }

    // Update Timer UI
    const timerFill = document.getElementById('timer-bar-fill');
    if (timerFill) {
        if (devDisableMainTimer) {
            timerFill.style.width = '100%';
            timerFill.style.backgroundColor = '#00d2ff'; // Blue to indicate Dev Mode Freeze
        } else {
            const pct = (currentTimeMs / maxTimeMs) * 100;
            timerFill.style.width = `${pct}%`;
            if (pct < 25) timerFill.style.backgroundColor = '#ff3c3c';
            else if (pct < 50) timerFill.style.backgroundColor = '#ffdd00';
            else timerFill.style.backgroundColor = '#00ff00';
        }
    }

    if (isAshDashAnimating) {
        ashDashAnimT += 0.015; // Animation speed ~1 second duration
        if (ashDashAnimT >= 1) {
            ashDashAnimT = 1;
            isAshDashAnimating = false;
            inMiniGame = false;
            
            ballPx = ashDashDestX;
            ballPy = ashDashDestY;
            pointerX = ballPx; 
            pointerY = ballPy;
            isTracing = false; // Force user to tap to resume control
            velX = 0;
            velY = 0;
            
            if (ashDashTargetIndex >= window.gameObstacles.findIndex(o => o.isFinish)) {
                // Auto-Win reached finish line
                successes++;
                updateMatchUI();
                if (successes === 2) {
                    endMatch(true);
                } else {
                    currentAttempt++;
                    const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
                    renderCones(currentLvl);
                    resetAttempt();
                }
            } else {
                // Soft skip cones up to the intended phase jump
                for (let i = window.nextTargetIndex; i < ashDashTargetIndex; i++) {
                    window.gameObstacles[i].cleared = true;
                    window.gameObstacles[i].pathIndex = tracePath.length; // log snapshot line fading
                }
                window.nextTargetIndex = ashDashTargetIndex;
                updateObstacleVisuals();
            }
        } else {
            // -- Magic Vortex Vector Math --
            // Travel linearly from starting point to destination
            const dx = ashDashDestX - ashDashStartX;
            const dy = ashDashDestY - ashDashStartY;
            const straightX = ashDashStartX + dx * ashDashAnimT;
            const straightY = ashDashStartY + dy * ashDashAnimT;
            
            // Add a perpendicular swelling sine wave rotational spin 
            const vortexRadius = 50 * Math.sin(ashDashAnimT * Math.PI); // Bell curve peaking at the middle
            const spinAngle = ashDashAnimT * Math.PI * 10; // 5 full tight barrel-roll rotations
            
            ballPx = straightX + Math.cos(spinAngle) * vortexRadius;
            ballPy = straightY + Math.sin(spinAngle) * vortexRadius;
            
            // Record animation coordinate frames into continuous path
            tracePath.push({x: ballPx, y: ballPy});
            
            // Visually teleport DOM object
            const ballDom = document.getElementById('ball');
            ballDom.style.left = `${ballPx}px`;
            ballDom.style.bottom = `${canvas.height - ballPy}px`;
            
        }
    }

    const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
    // Default all hazards to OFF
    let rainRatio = 0;
    let glareRatio = 0;
    let noiseRatio = 0;

    // Calculate a universal intensity scale based on the current level (0% at Lvl 1, 100% at Lvl 100)
    const intensityScale = Math.max(0, Math.min(1, currentLvl / 100));

    // Only apply the intensity to the explicitly selected hazard
    if (testRainActive) {
        rainRatio = intensityScale;
    } else if (testGlareActive) {
        glareRatio = intensityScale;
    } else if (testNoiseActive) {
        noiseRatio = intensityScale;
    }

    const purchasedShades = window.GK_State?.catalogues?.slalom?.gear?.shades?.owned || false;
    const purchasedMuffs = window.GK_State?.catalogues?.slalom?.gear?.muffs?.owned || false;
    const purchasedCleats = window.GK_State?.catalogues?.slalom?.gear?.cleats?.owned || false;

    if (purchasedShades) glareRatio *= 0.95; // Reduces visual contrast and flare size
    if (purchasedMuffs) noiseRatio *= 0.95; // Reduces screen shake amplitude
    if (purchasedCleats) rainRatio *= 0.95; // Reduces visual rain density

    // Apply ChrisCross Control Buff (95% reduction to all environmental hazards)
    if (Date.now() < weatherNerfUntil) {
        rainRatio *= 0.05;
        glareRatio *= 0.05;
        noiseRatio *= 0.05;
    }

    // Target background and layer instead of the whole container to protect UI elements
    const gameBg = document.getElementById('game-background');
    const gameLayer = document.getElementById('game-layer');
    if (noiseRatio > 0) {
        const intensity = 1 + (noiseRatio * 18);
        const randomX = (Math.random() * 2 - 1) * intensity;
        const randomY = (Math.random() * 2 - 1) * intensity;
        if (gameBg) gameBg.style.transform = `translate(${randomX}px, ${randomY}px)`;
        if (gameLayer) gameLayer.style.transform = `translate(${randomX}px, ${randomY}px)`;
    } else {
        if (gameBg) gameBg.style.transform = `translate(0px, 0px)`;
        if (gameLayer) gameLayer.style.transform = `translate(0px, 0px)`;
    }
    
    const flareDiv = document.getElementById('lens-flare');
    const conesContainer = document.getElementById('cones-container');
    if (glareRatio > 0) {
        const filterString = `contrast(${100 + (glareRatio * 234.4)}%) brightness(${100 + (glareRatio * 125)}%)`;
        canvas.style.filter = filterString;
        if (conesContainer) conesContainer.style.filter = filterString;
        if (gameBg) gameBg.style.filter = filterString; 
        if (gameLayer) gameLayer.style.filter = filterString;

        if (flareDiv) {
            flareDiv.style.display = 'block';
            flareX += flareVelX;
            flareY += flareVelY;
            if (flareX <= 0 || flareX >= 100) flareVelX *= -1;
            if (flareY <= 0 || flareY >= 100) flareVelY *= -1;
            flareDiv.style.left = `${flareX}%`;
            flareDiv.style.top = `${flareY}%`;
            flareDiv.style.opacity = `${Math.min(1, glareRatio * 1.56)}`;
            flareDiv.style.transform = `translate(-50%, -50%) scale(${0.5 + (glareRatio * 6.25)})`;
            flareDiv.style.zIndex = '7000';
        }
    } else {
        canvas.style.filter = 'none';
        if (conesContainer) conesContainer.style.filter = 'none';
        if (gameBg) gameBg.style.filter = 'none'; 
        if (gameLayer) gameLayer.style.filter = 'none';
        if (flareDiv) flareDiv.style.display = 'none';
    }

    if (currentLvl >= 15 && window.nextTargetIndex >= 1 && !isChaserActive) {
      isChaserActive = true;
      const chaserDom = document.getElementById('chaser');
      if (chaserDom) chaserDom.style.display = 'block';

      // Level 15 JIT Rule (The Chaser)
      if (!hasSeenChaserRule) {
          hasSeenChaserRule = true;
          window.showRulePopup("WARNING", "New at Level 15: The Red Ghost is hunting you! Move fast, or it will catch your ball and end the match.", "#ff3c3c");
          const chaserRuleUI = document.getElementById('rule-chaser-text');
          if (chaserRuleUI) chaserRuleUI.style.display = 'list-item';
      }
    }

    if (isChaserActive && window.gameObstacles && !isAshDashAnimating && !matchEnded) {
      if (Date.now() < chaserStunnedUntil) {
          // Stunned! Do not update chaserPx / chaserPy math. Ghost freezes in place.
      } else {
          const levelClamped = Math.max(15, Math.min(100, currentLvl));
          const ratio = (levelClamped - 15) / (100 - 15);
          
          // Drastically lowered spring and friction for a 'slow creep'
          const chaserSpring = (0.005 + ratio * (0.015 - 0.005)) * 0.8;
          const chaserFriction = 0.80 + ratio * (0.08); // Scales from 0.80 to 0.88

          let tX, tY;
          let gateX = ballPx, gateY = ballPy; // Default fallback

          // 1. Get the actual mathematical center of the target gate
          if (chaserTargetIndex < window.gameObstacles.length) {
            const targetObs = window.gameObstacles[chaserTargetIndex];
            gateX = (targetObs.percentX / 100) * canvas.width + (targetObs.targetOffsetX || 0);
            gateY = canvas.height - (targetObs.percentY / 100) * canvas.height + (targetObs.targetOffsetY || 0);
          }

          // 2. ANTI-CAMPING: If Chaser is 2+ cones ahead, or finished all cones -> Full Hunt Mode
          if (chaserTargetIndex >= window.nextTargetIndex + 2 || chaserTargetIndex >= window.gameObstacles.length) {
            tX = ballPx;
            tY = ballPy;
          } else {
            // 3. VAGUE HUNT MODE: Aim for gate, but drift slightly toward the player
            // The pull increases from 10% to 25% as levels scale
            const huntPull = 0.10 + (ratio * 0.15); 
            tX = gateX * (1 - huntPull) + ballPx * huntPull;
            tY = gateY * (1 - huntPull) + ballPy * huntPull;
          }

          // Apply forces using the blended tX and tY
          chaserVelX += (tX - chaserPx) * chaserSpring;
          chaserVelY += (tY - chaserPy) * chaserSpring;
          chaserVelX *= chaserFriction;
          chaserVelY *= chaserFriction;

          const maxSpeed = (1.5 + ratio * 3.0) * 0.8; // Max speed scales from 1.5px/frame to 4.5px/frame
          const currentSpeed = Math.sqrt(chaserVelX**2 + chaserVelY**2);

          if (currentSpeed > maxSpeed) {
            chaserVelX = (chaserVelX / currentSpeed) * maxSpeed;
            chaserVelY = (chaserVelY / currentSpeed) * maxSpeed;
          }

          chaserPx += chaserVelX;
          chaserPy += chaserVelY;
          chaserPath.push({x: chaserPx, y: chaserPy});
      }

      // 4. GATE CLEARING: Must check distance to the ACTUAL gate (gateX/gateY), not the blended tX/tY
      // Increased radius to 45 to ensure the 'vague drift' doesn't prevent it from touching the hitbox
      let gateX = ballPx, gateY = ballPy;
      if (chaserTargetIndex < window.gameObstacles.length) {
        const targetObs = window.gameObstacles[chaserTargetIndex];
        gateX = (targetObs.percentX / 100) * canvas.width + (targetObs.targetOffsetX || 0);
        gateY = canvas.height - (targetObs.percentY / 100) * canvas.height + (targetObs.targetOffsetY || 0);
      }
      const distToGate = Math.sqrt((gateX - chaserPx)**2 + (gateY - chaserPy)**2);
      if (distToGate < 45 && chaserTargetIndex < window.gameObstacles.length) {
        chaserTargetIndex++;
      }

      const chaserDom = document.getElementById('chaser');
      if (chaserDom) {
        chaserDom.style.left = `${chaserPx}px`;
        chaserDom.style.bottom = `${canvas.height - chaserPy}px`;
      }

      // Draw 2-Second ZarasZap Strobe Effect (using Canvas)
      if (Date.now() < chaserStrobeUntil) {
          const strobePulse = (Date.now() % 200) / 200; 
          ctx.beginPath();
          ctx.arc(chaserPx, canvas.height - chaserPy, 30 + (strobePulse * 20), 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(255, 255, 0, ${1 - strobePulse})`; 
          ctx.lineWidth = 4;
          ctx.stroke();
      }

      const distToPlayer = Math.sqrt((ballPx - chaserPx)**2 + (ballPy - chaserPy)**2);
      if (distToPlayer < 20) {
          failAttempt("Caught by the Red Ghost!");
      }
    }

    if (isTracing) {
    prevBallPx = ballPx;
    prevBallPy = ballPy;

    // Calculate dynamic physics based on Rain intensity
    let slipPenalty = rainRatio * 0.10;
    let springPenalty = rainRatio * 0.044;

    if (purchasedCleats && rainRatio > 0) {
        slipPenalty *= 0.95;
        springPenalty *= 0.95;
    }

    const playerFriction = 0.88 + slipPenalty;
    const playerSpring = 0.06 - springPenalty;

    velX += (pointerX - ballPx) * playerSpring;
    velY += (pointerY - ballPy) * playerSpring;
    velX *= playerFriction;
    velY *= playerFriction;

    ballPx += velX;
    ballPy += velY;
      
      tracePath.push({x: ballPx, y: ballPy});
      checkCollisions();
      
      // Visually lock DOM ball to trace head (using pixels overrides css %)
      const ballDom = document.getElementById('ball');
      ballDom.style.left = `${ballPx}px`;
      ballDom.style.bottom = `${canvas.height - ballPy}px`;
      ballDom.style.transform = `translate(-50%, 50%)`;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (rainRatio > 0) {
        const activeDrops = Math.floor(maxRaindrops * (0.2 + (rainRatio * 0.8)));
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        for (let i = 0; i < activeDrops; i++) {
            let drop = raindrops[i];

            ctx.beginPath();
            ctx.moveTo(drop.x, drop.y);
            ctx.lineTo(drop.x - (drop.length * 0.3), drop.y + drop.length); // Diagonal wind

            ctx.strokeStyle = `rgba(200, 220, 255, ${(drop.opacity * 0.6) + (rainRatio * 0.6)})`; 
            ctx.stroke();

            // Animate downwards and leftwards
            const currentSpeed = drop.speed * (1 + rainRatio) * 1.25;
            drop.x -= currentSpeed * 0.3;
            drop.y += currentSpeed;

            // Reset drop if it falls off screen
            if (drop.y > canvas.height || drop.x < 0) {
                drop.y = -20;
                drop.x = Math.random() * canvas.width + 200; // Offset for wind
            }
        }
    }
    
    if (isChaserActive && chaserPath.length > 1) {
      ctx.beginPath();
      ctx.moveTo(chaserPath[0].x, chaserPath[0].y);
      for (let i = 1; i < chaserPath.length; i++) {
        ctx.lineTo(chaserPath[i].x, chaserPath[i].y);
      }
      ctx.strokeStyle = 'rgba(255, 60, 60, 0.4)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    let fadeIndex = 0;
    if (window.nextTargetIndex >= 4) {
        // Find the index of the path when the cone 4 steps back was cleared
        const historicCone = window.gameObstacles[window.nextTargetIndex - 4];
        if (historicCone && historicCone.pathIndex !== undefined) {
            fadeIndex = historicCone.pathIndex;
        }
    }

    // Draw Faded/Grey History
    if (fadeIndex > 0 && tracePath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(tracePath[0].x, tracePath[0].y);
        for (let i = 1; i <= fadeIndex; i++) {
            ctx.lineTo(tracePath[i].x, tracePath[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Faded transparent grey
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    // Draw Active White Trace
    if (tracePath.length > 1) {
        ctx.beginPath();
        const startIdx = fadeIndex > 0 ? fadeIndex : 0;
        ctx.moveTo(tracePath[startIdx].x, tracePath[startIdx].y);
        for (let i = startIdx + 1; i < tracePath.length; i++) {
            ctx.lineTo(tracePath[i].x, tracePath[i].y);
        }
        ctx.strokeStyle = '#fff'; // Bright white
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    // --- RENDER VISUAL FX (After Canvas Clear) ---

    // Draw ChrisCross Flow State Aura
    if (Date.now() < weatherNerfUntil) {
        const pulse = (Math.sin(Date.now() / 150) + 1) / 2; // Smooth pulsing math
        ctx.beginPath();
        ctx.arc(ballPx, ballPy, 15 + (pulse * 10), 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 - (pulse * 0.2)})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ballPx, ballPy, 12, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 215, 0, 0.8)`; // Gold inner ring
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    if (isAshDashAnimating) {
        ctx.beginPath();
        ctx.arc(ballPx, ballPy, 25 + Math.random() * 20, 0, 2*Math.PI);
        ctx.fillStyle = `rgba(0, 200, 255, ${0.4 * (1 - ashDashAnimT)})`;
        ctx.fill();
    }

    if (Date.now() < chaserStrobeUntil) {
        // Strobe
        const strobePulse = (Date.now() % 200) / 200; 
        ctx.beginPath();
        ctx.arc(chaserPx, chaserPy, 30 + (strobePulse * 20), 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(255, 255, 0, ${1 - strobePulse})`; 
        ctx.lineWidth = 4;
        ctx.stroke();

        // 10-Second Timer Bar at the bottom of the canvas
        const timeLeft = chaserStrobeUntil - Date.now();
        const timeRatio = Math.max(0, timeLeft / 10000); // 0.0 to 1.0
        
        const barWidth = canvas.width * 0.8;
        const barHeight = 8;
        const startX = (canvas.width - barWidth) / 2;
        const startY = canvas.height - 20;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(startX, startY, barWidth, barHeight);
        
        // Foreground (Yellow)
        ctx.fillStyle = `rgba(255, 255, 0, ${0.5 + timeRatio * 0.5})`;
        ctx.fillRect(startX, startY, barWidth * timeRatio, barHeight);
    }

    if (Date.now() < weatherNerfUntil) {
        // 10-Second Timer Bar at the bottom of the canvas
        const timeLeft = weatherNerfUntil - Date.now();
        const timeRatio = Math.max(0, timeLeft / 10000); // 0.0 to 1.0
        
        const barWidth = canvas.width * 0.8;
        const barHeight = 8;
        const startX = (canvas.width - barWidth) / 2;
        const startY = canvas.height - 20; // Will overlap safely

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(startX, startY, barWidth, barHeight);
        
        // Foreground (Cyan for ChrisCross)
        ctx.fillStyle = `rgba(0, 200, 255, ${0.5 + timeRatio * 0.5})`;
        ctx.fillRect(startX, startY, barWidth * timeRatio, barHeight);
    }
    
    requestAnimationFrame(drawLoop);
  }
  requestAnimationFrame(drawLoop);

  // Input Listeners
  function handleDown(e) {
    if (matchEnded || isAshDashAnimating || isRulePaused) return;
    const rect = canvas.getBoundingClientRect();
    const ex = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const ey = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    // Check if clicked near the ball (Massively increased distance from 30px to 60px to prevent false drop freezes)
    const dist = Math.sqrt((ex - ballPx)**2 + (ey - ballPy)**2);
    if (dist < 60) {
      if (!attemptStaminaDeduction()) return;
      isTracing = true;
      pointerX = ex;
      pointerY = ey;
    }
  }
  
  function handleMove(e) {
    if (!isTracing) return;
    e.preventDefault(); // stop scrolling
    const rect = canvas.getBoundingClientRect();
    pointerX = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    pointerY = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
  }
  
  function handleUp() {
    isTracing = false;
  }

  canvas.addEventListener('mousedown', handleDown);
  canvas.addEventListener('mousemove', handleMove);
  canvas.addEventListener('mouseup', handleUp);
  canvas.addEventListener('mouseleave', handleUp);

  canvas.addEventListener('touchstart', handleDown, {passive: false});
  canvas.addEventListener('touchmove', handleMove, {passive: false});
  canvas.addEventListener('touchend', handleUp);

  // Initial render at Level 1
  renderCones(1);
  setTimeout(() => resetAttempt(true), 150);

  // Listen to slider changes
  // Create a dedicated horizontal wrapper for the slider and arrows
  const sliderWrapper = document.createElement('div');
  sliderWrapper.style.display = 'flex';
  sliderWrapper.style.alignItems = 'center';
  sliderWrapper.style.justifyContent = 'center';
  sliderWrapper.style.gap = '8px';
  sliderWrapper.style.width = '100%';
  sliderWrapper.style.marginTop = '5px';

  // Create smaller, sleeker arrows
  const leftArrow = document.createElement('button');
  leftArrow.textContent = '◀';
  leftArrow.style.cssText = 'background: rgba(0, 0, 0, 0.4); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;';

  const rightArrow = document.createElement('button');
  rightArrow.textContent = '▶';
  rightArrow.style.cssText = 'background: rgba(0, 0, 0, 0.4); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;';

  // Inject the wrapper and move the slider inside it
  if (levelSlider.parentNode) {
      levelSlider.parentNode.insertBefore(sliderWrapper, levelSlider);
      sliderWrapper.appendChild(leftArrow);
      sliderWrapper.appendChild(levelSlider);
      sliderWrapper.appendChild(rightArrow);
  }

  function adjustLevelExact(delta) {
      if (matchEnded || (typeof isRulePaused !== 'undefined' && isRulePaused)) return; 
      let currentLvl = parseInt(levelSlider.value, 10) || 1;

      // Determine the highest level allowed right now
      const allowedMax = devUnlockAllLevels ? 100 : maxUnlockedLevel;

      let newLvl = Math.max(1, Math.min(allowedMax, currentLvl + delta));
      levelSlider.value = newLvl;
      levelDisplay.textContent = newLvl;
      renderCones(newLvl);
      setTimeout(() => { resetAttempt(true); }, 50);
  }

  leftArrow.addEventListener('click', () => adjustLevelExact(-1));
  rightArrow.addEventListener('click', () => adjustLevelExact(1));

  levelSlider.addEventListener('input', (e) => {
      let level = parseInt(e.target.value, 10);
      const allowedMax = devUnlockAllLevels ? 100 : maxUnlockedLevel;

      if (level > allowedMax) {
          level = allowedMax;
          levelSlider.value = level;
      }

      levelDisplay.textContent = level;
      renderCones(level);
      resetAttempt(true);
  });

  document.getElementById('play-again-btn').addEventListener('click', () => {
    let currentLvl = parseInt(levelSlider.value, 10) || 1;

    if (matchWon) {
        currentLvl = Math.min(currentLvl + 1, 100);
    }

    levelSlider.value = currentLvl;
    levelDisplay.textContent = currentLvl;
    document.getElementById('match-result-overlay').style.display = 'none';

    renderCones(currentLvl);

    // Delay allows DOM to reflow before snapping ball coordinates
    setTimeout(() => {
        resetAttempt(true);
    }, 50);
  });

  // Hub UI Listeners
  const hubBtn = document.getElementById('hub-btn');
  const hubBackdrop = document.getElementById('hub-backdrop');
  const hubDrawer = document.getElementById('hub-drawer');
  const closeHubBtn = document.getElementById('close-hub-btn');
  const equipBtns = document.querySelectorAll('.equip-btn');
  
  let devHazardMode = 'random'; 

  function applyHazardLogic() {
      const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
      let activeHazard = 'none';

      // Determine the hazard based on Dev Mode
      if (devHazardMode === 'random') {
          if (currentLvl >= 11) {
              const hazards = ['rain', 'glare', 'noise'];
              activeHazard = hazards[Math.floor(Math.random() * hazards.length)];
          } else if (currentLvl >= 9) {
              activeHazard = 'noise';
          } else if (currentLvl >= 7) {
              activeHazard = 'rain';
          } else if (currentLvl >= 5) {
              activeHazard = 'glare';
          } else {
              activeHazard = 'none'; // Levels 1-4
          }
      } else {
          activeHazard = devHazardMode;
      }

      // Apply to the engine's global booleans
      testRainActive = (activeHazard === 'rain');
      testGlareActive = (activeHazard === 'glare');
      testNoiseActive = (activeHazard === 'noise');

      // Sync the visual display in the dev panel so the Dev knows what was rolled
      const syncDisplay = document.getElementById('dev-hazard-sync-display');
      if (syncDisplay) {
          syncDisplay.textContent = `CURRENTLY ACTIVE: ${activeHazard.toUpperCase()}`;
          syncDisplay.style.color = activeHazard === 'none' ? '#888' : '#00d2ff';
      }

      // JIT Hazard Tutorials
      if (!devDisablePrompts) {
          if (activeHazard === 'rain' && !hasSeenRainRule) {
              hasSeenRainRule = true;
              setTimeout(() => {
                  window.showRulePopup("HAZARD: RAIN", "The pitch is wet! Your ball is more likely to slip and slide. Adjust your control.", "#00d2ff");
              }, 150);
          } else if (activeHazard === 'glare' && !hasSeenGlareRule) {
              hasSeenGlareRule = true;
              setTimeout(() => {
                  window.showRulePopup("HAZARD: SUN GLARE", "The sun is blinding! It will be more difficult to see where you are going.", "#ffdd00");
              }, 150);
          } else if (activeHazard === 'noise' && !hasSeenNoiseRule) {
              hasSeenNoiseRule = true;
              setTimeout(() => {
                  window.showRulePopup("HAZARD: AUDIENCE NOISE", "The crowd is roaring! The screen will shake, making it difficult to keep a smooth path.", "#ff3c3c");
              }, 150);
          }
      }
  }

  const devHazardSelect = document.getElementById('dev-hazard-select');
  if (devHazardSelect) {
      devHazardSelect.addEventListener('change', (e) => {
          devHazardMode = e.target.value;
          applyHazardLogic(); // Apply immediately when the dev changes the dropdown
      });
  }

  const devUnlockCb = document.getElementById('dev-unlock-cb');
  if (devUnlockCb) {
      devUnlockCb.addEventListener('change', (e) => {
          devUnlockAllLevels = e.target.checked;
          document.getElementById('level-slider').max = devUnlockAllLevels ? 100 : maxUnlockedLevel;

          // If turning off dev mode and currently on a locked level, snap back
          let currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
          if (!devUnlockAllLevels && currentLvl > maxUnlockedLevel) {
              document.getElementById('level-slider').value = maxUnlockedLevel;
              document.getElementById('level-display').textContent = maxUnlockedLevel;
              renderCones(maxUnlockedLevel);
              setTimeout(() => { resetAttempt(true); }, 50);
          }
      });
  }

  const devPromptsCb = document.getElementById('dev-prompts-cb');
  if (devPromptsCb) {
      devPromptsCb.addEventListener('change', (e) => {
          devDisablePrompts = e.target.checked;
      });
  }

  const devLockerCb = document.getElementById('dev-locker-cb');
  if (devLockerCb) {
      devLockerCb.addEventListener('change', (e) => { devEnableLocker = e.target.checked; });
  }

  const devSpecialsCb = document.getElementById('dev-specials-cb');
  if (devSpecialsCb) {
      devSpecialsCb.addEventListener('change', (e) => { devEnableSpecials = e.target.checked; });
  }

  const devTimerMainCb = document.getElementById('dev-timer-main-cb');
  if (devTimerMainCb) {
      devTimerMainCb.addEventListener('change', (e) => { devDisableMainTimer = e.target.checked; });
  }

  const devTimerSpecialCb = document.getElementById('dev-timer-special-cb');
  if (devTimerSpecialCb) {
      devTimerSpecialCb.addEventListener('change', (e) => { devDisableSpecialTimer = e.target.checked; });
  }

  const devAddChargesBtn = document.getElementById('dev-add-charges-btn');
  if (devAddChargesBtn) {
      devAddChargesBtn.addEventListener('click', (e) => {
          e.preventDefault();
          specialCharges += 5;
          const badge = document.getElementById('special-badge');
          if (badge) badge.textContent = specialCharges;
          syncSpecialCharges();
      });
  }

  // Removed old trap door logic here

  function refreshLockerRoomUI() {
      const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
      const canAccessLocker = devEnableLocker || window.GK_State.economy.xp >= itemXpLock;

      const updateGearLockerUI = (btnId, moveKey) => {
          const btn = document.getElementById(btnId);
          if (!btn) return;
          const textEl = btn.querySelector('.equip-status-text');
          if (!textEl) return;
          
          const isPurchased = window.GK_State?.catalogues?.slalom?.gear?.[moveKey]?.owned || false;

          if (isPurchased) {
              btn.style.opacity = '1.0';
              btn.style.filter = 'none';
              btn.classList.remove('equipped');
              btn.style.cursor = 'default';
              textEl.textContent = "Purchased";
              textEl.style.color = "#aaa";
              textEl.style.background = "#555";
              textEl.style.cursor = "default";
              textEl.style.opacity = "0.7";
          } else {
              btn.style.opacity = '1.0';
              btn.style.filter = 'none';
              btn.classList.remove('equipped');
              btn.style.cursor = 'pointer';
              textEl.textContent = "Purchase: 200 Tokens";
              textEl.style.color = "#000";
              textEl.style.background = "#ffd700";
              textEl.style.cursor = "pointer";
              textEl.style.opacity = "1.0";
          }
      };

      updateGearLockerUI('btn-cleats', 'cleats');
      updateGearLockerUI('btn-shades', 'shades');
      updateGearLockerUI('btn-muffs', 'muffs');

      // --- NEW: Special Moves Locker UI ---
      const movePrice = 150;
      const moveXpReq = 300;
      const moveLvlReq = 10;
      
      const updateMoveLockerUI = (moveKey, isOwned) => {
          const btn = document.getElementById(`buy-${moveKey}`);
          const reqEl = document.getElementById(`req-${moveKey}`);
          if (!btn || !reqEl) return;

          if (isOwned) {
              btn.textContent = "Purchased";
              btn.style.background = "#555";
              btn.style.color = "#aaa";
              btn.style.cursor = "not-allowed";
              btn.style.opacity = "0.7";
              btn.style.pointerEvents = "none";
              reqEl.textContent = "Available in Game";
              reqEl.style.color = "#00ff00";
          } else {
              btn.textContent = `Purchase: ${movePrice} Tokens`;
              btn.style.background = "#ffd700";
              reqEl.textContent = `Requires: ${moveXpReq} XP`;
              reqEl.style.color = "#ff3c3c";
          }
      };

      updateMoveLockerUI('ashDash', isMoveOwned('ashDash'));
      updateMoveLockerUI('chrisCross', isMoveOwned('chrisCross'));
      updateMoveLockerUI('zarasZap', isMoveOwned('zarasZap'));
  }

  // Set up move purchase listeners
  const setupMovePurchase = (moveKey, checkOwned, setOwned) => {
      const btn = document.getElementById(`buy-${moveKey}`);
      if (!btn) return;
      btn.addEventListener('click', () => {
          if (isMoveOwned(moveKey)) {
              // Move is permanently owned, no equip logic needed
              return;
          }

          const totalTokens = window.GK_State.economy.tokens || 0;
          const totalXP = window.GK_State.economy.xp || 0;
          const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
          const movePrice = 150;
          const moveXpReq = 300;

          if (totalXP < moveXpReq) {
              window.showMessage(`NOT ENOUGH XP! You need ${moveXpReq} XP.`, '#ff4757');
              return;
          }
          if (totalTokens < movePrice) {
              window.showMessage(`NOT ENOUGH TOKENS! You need ${movePrice} Tokens.`, '#ff4757');
              return;
          }

          window.GK_State.economy.tokens -= movePrice;
          
          if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
          if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { moves: {} };
          if (!window.GK_State.catalogues.slalom.moves) window.GK_State.catalogues.slalom.moves = {};
          if (!window.GK_State.catalogues.slalom.moves[moveKey]) window.GK_State.catalogues.slalom.moves[moveKey] = {};
          window.GK_State.catalogues.slalom.moves[moveKey].owned = true;
          
          if (typeof window.saveGameState === 'function') {
              window.saveGameState(true); // Automatically syncs to Firebase and localStorage
          } else {
              localStorage.setItem('GK_GameState', JSON.stringify(window.GK_State));
          }
          
          const tokenDisplay = document.getElementById('hub-token-display');
          if (tokenDisplay) tokenDisplay.textContent = window.GK_State.economy.tokens;
          const globalTokens = document.getElementById('global-tokens');
          if (globalTokens) globalTokens.textContent = window.GK_State.economy.tokens;

          if (typeof window.updateHUD === 'function') window.updateHUD();

          refreshLockerRoomUI();
      });
  };

  setupMovePurchase('ashDash');
  setupMovePurchase('chrisCross');
  setupMovePurchase('zarasZap');

  hubBtn.addEventListener('click', () => {
    refreshLockerRoomUI();

    hubBackdrop.style.display = 'block';
    hubDrawer.style.right = '0px';
    hubDrawer.style.overflowY = 'auto'; // Fixes text cutting off
    hubDrawer.style.paddingBottom = '50px'; // Adds safe space at the bottom
    isHubOpen = true; // Pause game when drawer opens
  });

  function closeHub() {
    hubDrawer.style.right = '-100%';
    setTimeout(() => {
      hubBackdrop.style.display = 'none';
      isTracing = false; // FORCE TOUCH RESET TO PREVENT PHYSICS FREEZE
      isHubOpen = false; // Unpause game when drawer fully closes
    }, 300);
  }

  closeHubBtn.addEventListener('click', closeHub);
  hubBackdrop.addEventListener('click', closeHub);

  const btnCleats = document.getElementById('btn-cleats');
  const btnShades = document.getElementById('btn-shades');
  const btnMuffs = document.getElementById('btn-muffs');


  if (btnCleats) {
      btnCleats.addEventListener('click', (e) => {
          const isPurchased = window.GK_State?.catalogues?.slalom?.gear?.cleats?.owned || false;
          if (isPurchased) return;

          if (window.GK_State.economy.tokens >= 200) {
              window.GK_State.economy.tokens -= 200;
              
              if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
              if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { gear: {} };
              if (!window.GK_State.catalogues.slalom.gear) window.GK_State.catalogues.slalom.gear = {};
              if (!window.GK_State.catalogues.slalom.gear.cleats) window.GK_State.catalogues.slalom.gear.cleats = {};
              window.GK_State.catalogues.slalom.gear.cleats.owned = true;
              
              if (typeof window.saveGameState === 'function') window.saveGameState(true);
              if (typeof window.updateHUD === 'function') window.updateHUD();
              refreshLockerRoomUI();
          } else {
              window.showMessage('NOT ENOUGH TOKENS!', '#ff4757');
          }
      });
  }

  if (btnShades) {
      btnShades.addEventListener('click', (e) => {
          const isPurchased = window.GK_State?.catalogues?.slalom?.gear?.shades?.owned || false;
          if (isPurchased) return;

          if (window.GK_State.economy.tokens >= 200) {
              window.GK_State.economy.tokens -= 200;
              
              if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
              if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { gear: {} };
              if (!window.GK_State.catalogues.slalom.gear) window.GK_State.catalogues.slalom.gear = {};
              if (!window.GK_State.catalogues.slalom.gear.shades) window.GK_State.catalogues.slalom.gear.shades = {};
              window.GK_State.catalogues.slalom.gear.shades.owned = true;
              
              if (typeof window.saveGameState === 'function') window.saveGameState(true);
              if (typeof window.updateHUD === 'function') window.updateHUD();
              refreshLockerRoomUI();
          } else {
              window.showMessage('NOT ENOUGH TOKENS!', '#ff4757');
          }
      });
  }

  if (btnMuffs) {
      btnMuffs.addEventListener('click', (e) => {
          const isPurchased = window.GK_State?.catalogues?.slalom?.gear?.muffs?.owned || false;
          if (isPurchased) return;

          if (window.GK_State.economy.tokens >= 200) {
              window.GK_State.economy.tokens -= 200;
              
              if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
              if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { gear: {} };
              if (!window.GK_State.catalogues.slalom.gear) window.GK_State.catalogues.slalom.gear = {};
              if (!window.GK_State.catalogues.slalom.gear.muffs) window.GK_State.catalogues.slalom.gear.muffs = {};
              window.GK_State.catalogues.slalom.gear.muffs.owned = true;
              
              if (typeof window.saveGameState === 'function') window.saveGameState(true);
              if (typeof window.updateHUD === 'function') window.updateHUD();
              refreshLockerRoomUI();
          } else {
              window.showMessage('NOT ENOUGH TOKENS!', '#ff4757');
          }
      });
  }

  // --- SPECIAL MOVES & CONSTELATION LOGIC ---
  const specialBtn = document.getElementById('special-btn');
  const specialMenu = document.getElementById('special-menu');
  const ashDashBtn = document.getElementById('btn-ashDash');
  const cancelSpecialBtn = document.getElementById('btn-cancel-special');
  const constellationOverlay = document.getElementById('constellation-overlay');

  if (specialBtn) {
      specialBtn.addEventListener('click', () => {
          if (specialCharges > 0 && !inMiniGame) {
              inMiniGame = true;
              isTracing = false;
              specialCharges--;
              document.getElementById('special-badge').textContent = specialCharges;
              syncSpecialCharges();
              
              const currentLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
              const updateMoveUI = (btnId, purchased) => {
                  const btn = document.getElementById(btnId);
                  if (!btn) return;
                  const textEl = btn.querySelector('.special-status-text');
                  if (!textEl) return;

                  const totalXP = window.GK_State.economy.xp || 0;
                  const moveXpReq = 300;
                  const movePrice = 150;

                  if (purchased) {
                      btn.style.opacity = '1.0';
                      btn.style.filter = 'none';
                      textEl.textContent = "";
                  } else if (totalXP >= moveXpReq || devUnlockAllLevels || devEnableSpecials) {
                      btn.style.opacity = '1.0';
                      btn.style.filter = 'none';
                      textEl.textContent = `Purchase: ${movePrice} Tokens`;
                      textEl.style.color = "#ffd700";
                  } else {
                      btn.style.opacity = '0.5';
                      btn.style.filter = 'grayscale(100%)';
                      textEl.textContent = `Locked (Requires ${moveXpReq} XP)`;
                      textEl.style.color = "#ff3c3c";
                  }
              };

              updateMoveUI('btn-ashDash', isMoveOwned('ashDash'));
              updateMoveUI('btn-zarasZap', isMoveOwned('zarasZap'));
              updateMoveUI('btn-chrisCross', isMoveOwned('chrisCross'));

              specialMenu.style.display = 'flex';
          }
      });
  }

  if (cancelSpecialBtn) {
      cancelSpecialBtn.addEventListener('click', () => {
          specialMenu.style.display = 'none';
          inMiniGame = false;
          // Refund the charge if cancelled early
          specialCharges++;
          document.getElementById('special-badge').textContent = specialCharges;
          syncSpecialCharges();
      });
  }

  if (ashDashBtn) {
      ashDashBtn.addEventListener('click', () => {
          const totalXP = window.GK_State.economy.xp || 0;
          const moveXpReq = 300;
          const movePrice = 150;

          if (!isMoveOwned('ashDash')) {
              if (totalXP < moveXpReq && !devUnlockAllLevels && !devEnableSpecials) {
                  window.showMessage('NOT ENOUGH XP!', '#ff4757');
                  return;
              }
              const totalTokens = window.GK_State.economy.tokens || 0;
              if (totalTokens < movePrice) {
                  window.showMessage('NOT ENOUGH TOKENS!', '#ff4757');
                  return;
              }
              
              window.GK_State.economy.tokens -= movePrice;
              
              if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
              if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { moves: {} };
              if (!window.GK_State.catalogues.slalom.moves) window.GK_State.catalogues.slalom.moves = {};
              if (!window.GK_State.catalogues.slalom.moves['ashDash']) window.GK_State.catalogues.slalom.moves['ashDash'] = {};
              window.GK_State.catalogues.slalom.moves['ashDash'].owned = true;
              
              if (typeof window.saveGameState === 'function') window.saveGameState(true);
              if (typeof window.updateHUD === 'function') window.updateHUD();

              const textEl = ashDashBtn.querySelector('.special-status-text');
              if (textEl) textEl.textContent = "";
          }

          // Original AshDash Phase Logic
          currentSpecialType = 'ashDash';
          
          if (!hasSeenAshDashRule && !devDisablePrompts) {
              hasSeenAshDashRule = true;
              window.showRulePopup("ASH DASH", "Trace the spiral perfectly to magically teleport 2 target gates ahead!", "#00d2ff");

          }
          
          specialMenu.style.display = 'none';
          constellationOverlay.style.display = 'block';
          constellationOverlay.innerHTML = '';
          constellationNodes = [];

          // Add a cancel button to exit the constellation view as well
          const closeOverlayBtn = document.createElement('button');
          closeOverlayBtn.textContent = 'X';
          closeOverlayBtn.style.position = 'absolute';
          closeOverlayBtn.style.top = '20px';
          closeOverlayBtn.style.right = '20px';
          closeOverlayBtn.style.fontSize = '24px';
          closeOverlayBtn.style.padding = '10px';
          closeOverlayBtn.style.background = 'transparent';
          closeOverlayBtn.style.color = 'white';
          closeOverlayBtn.style.border = 'none';
          closeOverlayBtn.style.cursor = 'pointer';
          closeOverlayBtn.style.zIndex = '1000';
          closeOverlayBtn.addEventListener('click', () => {
              clearTimeout(miniGameTimer);
              constellationOverlay.style.display = 'none';
              inMiniGame = false;
              // Return charge if failed
              specialCharges++;
              document.getElementById('special-badge').textContent = specialCharges;
              syncSpecialCharges();
          });
          constellationOverlay.appendChild(closeOverlayBtn);

          const timerBar = document.createElement('div');
          timerBar.style.position = 'absolute';
          timerBar.style.top = '0';
          timerBar.style.left = '0';
          timerBar.style.height = '10px';
          timerBar.style.background = '#ff1493';
          timerBar.style.width = '100%';
          // 7 Second custom timer requested by user
          timerBar.style.transition = 'width 7s linear';
          constellationOverlay.appendChild(timerBar);

          // Trigger the CSS shrink animation
          setTimeout(() => { timerBar.style.width = '0%'; }, 50);
          
          // Use the game container's dimensions
          const centerX = constellationOverlay.clientWidth / 2;
          const centerY = constellationOverlay.clientHeight / 2;

          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.style.position = 'absolute';
          svg.style.top = '0';
          svg.style.left = '0';
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.pointerEvents = 'none';

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke', '#00d2ff');
          path.setAttribute('stroke-width', '4');
          path.setAttribute('stroke-dasharray', '10, 10'); // dashed look
          path.style.opacity = '0.7';

          const direction = Math.random() < 0.5 ? 1 : -1;
          const startAngle = Math.random() * 2 * Math.PI;
          const loops = 1 + Math.random() * 4; // Max 5 loops
          const maxRadius = Math.min(centerX, centerY) * 0.9;
          const startRadius = 20;

          // Asymmetry factors to warp the spiral geometry randomly per execution
          const radiusPower = 0.5 + Math.random() * 1.5; 
          const anglePower = 0.5 + Math.random() * 1.5; 

          // Generate spiral math
          let currentSpiralPoints = [];
          const steps = 100;
          let d = '';

          for (let s = 0; s <= steps; s++) {
             const t = s / steps;
             const angle = startAngle + Math.pow(t, anglePower) * (loops * 2 * Math.PI) * direction;
             const radius = startRadius + Math.pow(t, radiusPower) * (maxRadius - startRadius);
             const px = centerX + Math.cos(angle) * radius;
             const py = centerY + Math.sin(angle) * radius;
             currentSpiralPoints.push({x: px, y: py});

             if (s === 0) d += `M ${px} ${py} `;
             else d += `L ${px} ${py} `;
          }
          path.setAttribute('d', d);
          svg.appendChild(path);
          constellationOverlay.appendChild(svg);
          
          window.activeSpiralPoints = currentSpiralPoints; // Expose to hit detection
          
          window.activeSpiralTracePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          window.activeSpiralTracePath.setAttribute('fill', 'none');
          window.activeSpiralTracePath.setAttribute('stroke', '#00ff00'); // Neon green trace
          window.activeSpiralTracePath.setAttribute('stroke-width', '30'); // Massive neon trace per user request
          window.activeSpiralTracePath.setAttribute('stroke-linecap', 'round');
          window.activeSpiralTracePath.setAttribute('stroke-linejoin', 'round');
          window.activeSpiralTracePath.setAttribute('d', ''); // initialize empty
          svg.appendChild(window.activeSpiralTracePath);
          window.currentSpiralTraceString = '';

          // Place the 5 nodes along the generated spiral
          for (let i = 1; i <= 5; i++) {
              const t = (i - 1) / 4;
              const angle = startAngle + Math.pow(t, anglePower) * (loops * 2 * Math.PI) * direction;
              const radius = startRadius + Math.pow(t, radiusPower) * (maxRadius - startRadius);
              const nx = centerX + Math.cos(angle) * radius;
              const ny = centerY + Math.sin(angle) * radius;
              
              const node = document.createElement('div');
              node.style.position = 'absolute';
              node.style.left = `${nx}px`;
              node.style.top = `${ny}px`;
              node.style.width = '40px';
              node.style.height = '40px';
              node.style.borderRadius = '50%';
              node.style.background = 'rgba(255, 255, 255, 0.5)';
              node.style.border = '2px solid white';
              node.style.transform = 'translate(-50%, -50%)';
              node.style.display = 'flex';
              node.style.justifyContent = 'center';
              node.style.alignItems = 'center';
              node.style.color = 'white';
              node.style.fontWeight = 'bold';
              node.textContent = i;
              
              node.dataset.index = i;
              constellationOverlay.appendChild(node);
              constellationNodes.push({ element: node, x: nx, y: ny, index: i });
          }

          if (devDisableSpecialTimer) {
              timerBar.style.display = 'none'; // Hide the bar so they know it's infinite
          } else {
              const timeLimit = document.getElementById('rule-popup').style.display === 'flex' ? 15000 : 7000;
              timerBar.style.transitionDuration = `${timeLimit}ms`;
              miniGameTimer = setTimeout(() => { failAshDash(); }, timeLimit);
          }
      });
  }

  const zarasZapBtn = document.getElementById('btn-zarasZap');
  if (zarasZapBtn) {
      zarasZapBtn.addEventListener('click', () => {
          const totalXP = window.GK_State.economy.xp || 0;
          const moveXpReq = 300;
          const movePrice = 150;

          if (!isMoveOwned('zarasZap')) {
              if (totalXP < moveXpReq && !devUnlockAllLevels && !devEnableSpecials) {
                  window.showMessage('NOT ENOUGH XP!', '#ff4757');
                  return;
              }
              const totalTokens = window.GK_State.economy.tokens || 0;
              if (totalTokens < movePrice) {
                  window.showMessage('NOT ENOUGH TOKENS!', '#ff4757');
                  return;
              }
              
              window.GK_State.economy.tokens -= movePrice;
              
              if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
              if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { moves: {} };
              if (!window.GK_State.catalogues.slalom.moves) window.GK_State.catalogues.slalom.moves = {};
              if (!window.GK_State.catalogues.slalom.moves['zarasZap']) window.GK_State.catalogues.slalom.moves['zarasZap'] = {};
              window.GK_State.catalogues.slalom.moves['zarasZap'].owned = true;
              
              if (typeof window.saveGameState === 'function') window.saveGameState(true);
              if (typeof window.updateHUD === 'function') window.updateHUD();

              const textEl = zarasZapBtn.querySelector('.special-status-text');
              if (textEl) textEl.textContent = "";
          }

          const activeLvl = parseInt(document.getElementById('level-slider').value, 10) || 1;
          if (activeLvl < 15 && !devEnableSpecials) {
              alert("ZarasZap unlocks at Level 15 when the Chaser appears!");
              return;
          }
          if (specialCharges <= 0) return;

          currentSpecialType = 'zarasZap';
          specialMenu.style.display = 'none';
          constellationOverlay.style.display = 'block';
          constellationOverlay.innerHTML = '';
          constellationNodes = [];

          const closeOverlayBtn = document.createElement('button');
          closeOverlayBtn.textContent = 'X';
          closeOverlayBtn.style.position = 'absolute';
          closeOverlayBtn.style.top = '20px';
          closeOverlayBtn.style.right = '20px';
          closeOverlayBtn.style.fontSize = '24px';
          closeOverlayBtn.style.padding = '10px';
          closeOverlayBtn.style.background = 'transparent';
          closeOverlayBtn.style.color = 'white';
          closeOverlayBtn.style.border = 'none';
          closeOverlayBtn.style.cursor = 'pointer';
          closeOverlayBtn.style.zIndex = '1000';
          closeOverlayBtn.addEventListener('click', () => {
              clearTimeout(miniGameTimer);
              constellationOverlay.style.display = 'none';
              inMiniGame = false;
              specialCharges++;
              document.getElementById('special-badge').textContent = specialCharges;
          });
          constellationOverlay.appendChild(closeOverlayBtn);

          const timerBar = document.createElement('div');
          timerBar.style.position = 'absolute';
          timerBar.style.top = '0';
          timerBar.style.left = '0';
          timerBar.style.height = '10px';
          timerBar.style.background = '#ff1493';
          timerBar.style.width = '100%';
          timerBar.style.transition = 'width linear'; // Timer set dynamically below
          constellationOverlay.appendChild(timerBar);

          setTimeout(() => { timerBar.style.width = '0%'; }, 50);

          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.style.position = 'absolute';
          svg.style.top = '0';
          svg.style.left = '0';
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.pointerEvents = 'none';

          window.activeSpiralTracePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          window.activeSpiralTracePath.setAttribute('fill', 'none');
          window.activeSpiralTracePath.setAttribute('stroke', '#00ff00'); 
          window.activeSpiralTracePath.setAttribute('stroke-width', '30'); 
          window.activeSpiralTracePath.setAttribute('stroke-linecap', 'round');
          window.activeSpiralTracePath.setAttribute('stroke-linejoin', 'round');
          window.activeSpiralTracePath.setAttribute('d', ''); 
          svg.appendChild(window.activeSpiralTracePath);
          window.currentSpiralTraceString = '';
          constellationOverlay.appendChild(svg);

          // Generate 5 nodes mapping the custom jagged arc shape
          const w = constellationOverlay.clientWidth;
          const h = constellationOverlay.clientHeight;
          const points = [
              { x: w * 0.2, y: h * 0.2 }, 
              { x: w * 0.8, y: h * 0.25 }, 
              { x: w * 0.2, y: h * 0.5 }, 
              { x: w * 0.8, y: h * 0.75 }, 
              { x: w * 0.4, y: h * 0.9 }  
          ];

          const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          bgPath.setAttribute('fill', 'none');
          bgPath.setAttribute('stroke', '#00d2ff');
          bgPath.setAttribute('stroke-width', '4');
          bgPath.setAttribute('stroke-dasharray', '10, 10');
          bgPath.style.opacity = '0.7';
          let route = `M ${points[0].x} ${points[0].y} `;
          for (let i = 1; i < 5; i++) { route += `L ${points[i].x} ${points[i].y} `; }
          bgPath.setAttribute('d', route);
          svg.insertBefore(bgPath, window.activeSpiralTracePath);

          for (let i = 0; i < 5; i++) {
              const node = document.createElement('div');
              node.style.position = 'absolute';
              node.style.left = `${points[i].x}px`;
              node.style.top = `${points[i].y}px`;
              node.style.width = '40px';
              node.style.height = '40px';
              node.style.borderRadius = '50%';
              node.style.background = 'rgba(255, 255, 255, 0.5)';
              node.style.border = '2px solid white';
              node.style.transform = 'translate(-50%, -50%)';
              node.style.display = 'flex';
              node.style.justifyContent = 'center';
              node.style.alignItems = 'center';
              node.style.color = 'white';
              node.style.fontWeight = 'bold';
              node.textContent = i + 1;

              node.dataset.index = i + 1;
              constellationOverlay.appendChild(node);
              constellationNodes.push({ element: node, x: points[i].x, y: points[i].y, index: i + 1, activated: false });
          }

          // ZarasZap JIT Tutorial
          if (!hasSeenZarasZapRule) {
              hasSeenZarasZapRule = true;
              window.showRulePopup("ZARA'S ZAP", "Trace the arc pattern to paralyze the Chaser for 10 seconds!", "#00d2ff");

          }

          if (devDisableSpecialTimer) {
              timerBar.style.display = 'none'; // Hide the bar so they know it's infinite
          } else {
              const timeLimit = document.getElementById('rule-popup').style.display === 'flex' ? 15000 : 7000;
              timerBar.style.transitionDuration = `${timeLimit}ms`;
              miniGameTimer = setTimeout(() => { failAshDash(); }, timeLimit);
          }
      });
  }

  const chrisCrossBtn = document.getElementById('btn-chrisCross');
  if (chrisCrossBtn) {
      chrisCrossBtn.addEventListener('click', () => {
          const totalXP = window.GK_State.economy.xp || 0;
          const moveXpReq = 300;
          const movePrice = 150;

          if (!isMoveOwned('chrisCross')) {
              if (totalXP < moveXpReq && !devUnlockAllLevels && !devEnableSpecials) {
                  window.showMessage('NOT ENOUGH XP!', '#ff4757');
                  return;
              }
              const totalTokens = window.GK_State.economy.tokens || 0;
              if (totalTokens < movePrice) {
                  window.showMessage('NOT ENOUGH TOKENS!', '#ff4757');
                  return;
              }
              
              window.GK_State.economy.tokens -= movePrice;
              
              if (!window.GK_State.catalogues) window.GK_State.catalogues = {};
              if (!window.GK_State.catalogues.slalom) window.GK_State.catalogues.slalom = { moves: {} };
              if (!window.GK_State.catalogues.slalom.moves) window.GK_State.catalogues.slalom.moves = {};
              if (!window.GK_State.catalogues.slalom.moves['chrisCross']) window.GK_State.catalogues.slalom.moves['chrisCross'] = {};
              window.GK_State.catalogues.slalom.moves['chrisCross'].owned = true;
              
              if (typeof window.saveGameState === 'function') window.saveGameState(true);
              if (typeof window.updateHUD === 'function') window.updateHUD();

              const textEl = chrisCrossBtn.querySelector('.special-status-text');
              if (textEl) textEl.textContent = "";
          }

          // Check if any hazard is active before allowing the move
          if (!testRainActive && !testGlareActive && !testNoiseActive && !devEnableSpecials) {
              alert("ChrisCross Control can only be used when a Weather Hazard is active!");
              return;
          }
          if (specialCharges <= 0) return;

          currentSpecialType = 'chrisCross';
          specialMenu.style.display = 'none';
          constellationOverlay.style.display = 'block';
          constellationOverlay.innerHTML = '';
          constellationNodes = [];

          const closeOverlayBtn = document.createElement('button');
          closeOverlayBtn.textContent = 'X';
          closeOverlayBtn.style.position = 'absolute';
          closeOverlayBtn.style.top = '20px';
          closeOverlayBtn.style.right = '20px';
          closeOverlayBtn.style.fontSize = '24px';
          closeOverlayBtn.style.padding = '10px';
          closeOverlayBtn.style.background = 'transparent';
          closeOverlayBtn.style.color = 'white';
          closeOverlayBtn.style.border = 'none';
          closeOverlayBtn.style.cursor = 'pointer';
          closeOverlayBtn.style.zIndex = '1000';
          closeOverlayBtn.addEventListener('click', () => {
              clearTimeout(miniGameTimer);
              constellationOverlay.style.display = 'none';
              inMiniGame = false;
              specialCharges++;
              document.getElementById('special-badge').textContent = specialCharges;
          });
          constellationOverlay.appendChild(closeOverlayBtn);

          const timerBar = document.createElement('div');
          timerBar.style.position = 'absolute';
          timerBar.style.top = '0';
          timerBar.style.left = '0';
          timerBar.style.height = '10px';
          timerBar.style.background = '#00d2ff';
          timerBar.style.width = '100%';
          timerBar.style.transition = 'width linear'; // Timer set dynamically below
          constellationOverlay.appendChild(timerBar);

          setTimeout(() => { timerBar.style.width = '0%'; }, 50);

          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.style.position = 'absolute';
          svg.style.top = '0';
          svg.style.left = '0';
          svg.style.width = '100%';
          svg.style.height = '100%';
          svg.style.pointerEvents = 'none';

          window.activeSpiralTracePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          window.activeSpiralTracePath.setAttribute('fill', 'none');
          window.activeSpiralTracePath.setAttribute('stroke', '#00d2ff'); 
          window.activeSpiralTracePath.setAttribute('stroke-width', '30'); 
          window.activeSpiralTracePath.setAttribute('stroke-linecap', 'round');
          window.activeSpiralTracePath.setAttribute('stroke-linejoin', 'round');
          window.activeSpiralTracePath.setAttribute('d', ''); 
          svg.appendChild(window.activeSpiralTracePath);
          window.currentSpiralTraceString = '';
          constellationOverlay.appendChild(svg);

          // Generate 5 nodes mapping a 5-pointed star
          const w = constellationOverlay.clientWidth;
          const h = constellationOverlay.clientHeight;
          const points = [
              { x: w * 0.50, y: h * 0.15 }, // 1. Top Center
              { x: w * 0.85, y: h * 0.85 }, // 2. Bottom Right
              { x: w * 0.15, y: h * 0.40 }, // 3. Top Left
              { x: w * 0.85, y: h * 0.40 }, // 4. Top Right
              { x: w * 0.15, y: h * 0.85 }  // 5. Bottom Left
          ];

          const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          bgPath.setAttribute('fill', 'none');
          bgPath.setAttribute('stroke', '#00d2ff');
          bgPath.setAttribute('stroke-width', '4');
          bgPath.setAttribute('stroke-dasharray', '10, 10');
          bgPath.style.opacity = '0.7';
          let route = `M ${points[0].x} ${points[0].y} `;
          for (let i = 1; i < 5; i++) { route += `L ${points[i].x} ${points[i].y} `; }
          route += `Z`;
          bgPath.setAttribute('d', route);
          svg.insertBefore(bgPath, window.activeSpiralTracePath);

          for (let i = 0; i < 5; i++) {
              const node = document.createElement('div');
              node.style.position = 'absolute';
              node.style.left = `${points[i].x}px`;
              node.style.top = `${points[i].y}px`;
              node.style.width = '40px';
              node.style.height = '40px';
              node.style.borderRadius = '50%';
              node.style.background = 'rgba(255, 255, 255, 0.5)';
              node.style.border = '2px solid white';
              node.style.transform = 'translate(-50%, -50%)';
              node.style.display = 'flex';
              node.style.justifyContent = 'center';
              node.style.alignItems = 'center';
              node.style.color = 'white';
              node.style.fontWeight = 'bold';
              node.textContent = i + 1;

              node.dataset.index = i + 1;
              constellationOverlay.appendChild(node);
              constellationNodes.push({ element: node, x: points[i].x, y: points[i].y, index: i + 1, activated: false });
          }

          // ChrisCross JIT Tutorial
          if (!hasSeenChrisCrossRule) {
              hasSeenChrisCrossRule = true;
              window.showRulePopup("CHRIS CROSS CONTROL", "Trace the star to gain 10 seconds of perfect Flow State, reducing all hazards by 95%!", "#00d2ff");
          }

          if (devDisableSpecialTimer) {
              timerBar.style.display = 'none'; // Hide the bar so they know it's infinite
          } else {
              const timeLimit = document.getElementById('rule-popup').style.display === 'flex' ? 15000 : 7000;
              timerBar.style.transitionDuration = `${timeLimit}ms`;
              miniGameTimer = setTimeout(() => { failAshDash(); }, timeLimit);
          }
      });
  }

  function handleConstellationDown(e) {
      if (!inMiniGame || constellationOverlay.style.display === 'none') return;
      isAshDashDragging = true;
      if (window.activeSpiralTracePath) {
          window.currentSpiralTraceString = '';
          window.activeSpiralTracePath.setAttribute('d', '');
      }
      handleConstellationMove(e); // Trigger hit detection directly on tap
  }

  function handleConstellationUp(e) {
      if (!inMiniGame || constellationOverlay.style.display === 'none') return;
      isAshDashDragging = false;
      const activeCount = constellationNodes.filter(n => n.activated).length;
      if (activeCount < 5) failAshDash();
  }

  function handleConstellationMove(e) {
      if (!inMiniGame || constellationOverlay.style.display === 'none') return;
      e.preventDefault();
      
      // If they aren't holding down a drag, do not process
      if (!isAshDashDragging) return;
      
      const rawEx = e.touches ? e.touches[0].clientX : e.clientX;
      const rawEy = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = constellationOverlay.getBoundingClientRect();
      const ex = rawEx - rect.left;
      const ey = rawEy - rect.top;

      if (window.activeSpiralTracePath) {
          if (window.currentSpiralTraceString === '') {
              window.currentSpiralTraceString = `M ${ex} ${ey} `;
          } else {
              window.currentSpiralTraceString += `L ${ex} ${ey} `;
          }
          window.activeSpiralTracePath.setAttribute('d', window.currentSpiralTraceString);
      }
      
      let newlyActivated = false;
      for (const targetNode of constellationNodes) {
          if (!targetNode.activated) {
              const dist = Math.sqrt((ex - targetNode.x)**2 + (ey - targetNode.y)**2);
              if (dist < 60) {
                  targetNode.activated = true;
                  targetNode.element.style.background = 'rgba(0, 255, 0, 0.8)';
                  newlyActivated = true;
              }
          }
      }
      
      if (newlyActivated) {
          const totalActivated = constellationNodes.filter(n => n.activated).length;
          if (totalActivated >= 5) {
              isAshDashDragging = false;
              if (currentSpecialType === 'ashDash') {
                  executeAshDashPhase();
              } else if (currentSpecialType === 'zarasZap') {
                  executeZarasZapPhase();
              } else if (currentSpecialType === 'chrisCross') {
                  executeChrisCrossPhase();
              }
          }
      }
  }

  function failAshDash() {
      if (!inMiniGame) return;
      clearTimeout(miniGameTimer);
      isAshDashDragging = false;
      const overlay = document.getElementById('constellation-overlay');
      if (overlay) {
          overlay.style.background = 'rgba(200, 0, 0, 0.9)';
          setTimeout(() => {
              overlay.style.display = 'none';
              overlay.style.background = 'rgba(0, 20, 40, 0.9)';
              inMiniGame = false;
          }, 500);
      } else {
          inMiniGame = false;
      }
  }

  function executeAshDashPhase() {
      clearTimeout(miniGameTimer);
      constellationOverlay.style.display = 'none';

      const finishIndex = window.gameObstacles.findIndex(o => o.isFinish);
      let targetNextIndex = window.nextTargetIndex + 1; // Exactly 2 gates ahead

      // Ensure we don't jump past the finish line
      if (targetNextIndex >= finishIndex) {
          targetNextIndex = finishIndex;
      }

      const destObs = window.gameObstacles[targetNextIndex];

      ashDashDestX = (destObs.percentX / 100) * canvas.width + (destObs.targetOffsetX || 0);
      ashDashDestY = canvas.height - (destObs.percentY / 100) * canvas.height + (destObs.targetOffsetY || 0);

      ashDashStartX = ballPx;
      ashDashStartY = ballPy;
      ashDashAnimT = 0;
      ashDashTargetIndex = targetNextIndex;

      velX = 0; 
      velY = 0;
      isTracing = false; 
      isAshDashAnimating = true; 
  }

  function executeZarasZapPhase() {
      clearTimeout(miniGameTimer);
      constellationOverlay.style.display = 'none';
      inMiniGame = false; // Unpause engine immediately

      const now = Date.now();
      chaserStunnedUntil = now + 10000; // Stun for 10s
      chaserStrobeUntil = now + 2000;   // Strobe for 2s
  }

  function executeChrisCrossPhase() {
      clearTimeout(miniGameTimer);
      constellationOverlay.style.display = 'none';
      inMiniGame = false; // Unpause engine immediately

      // Apply 10-second Flow State weather immunity buff
      weatherNerfUntil = Date.now() + 10000; 
  }

  if (constellationOverlay) {
      constellationOverlay.addEventListener('mousedown', handleConstellationDown);
      constellationOverlay.addEventListener('mousemove', handleConstellationMove);
      constellationOverlay.addEventListener('mouseup', handleConstellationUp);
      constellationOverlay.addEventListener('mouseleave', handleConstellationUp);

      constellationOverlay.addEventListener('touchstart', handleConstellationDown, { passive: false });
      constellationOverlay.addEventListener('touchmove', handleConstellationMove, { passive: false });
      constellationOverlay.addEventListener('touchend', handleConstellationUp);
  }

  const closeRuleBtn = document.getElementById('close-rule-btn');
  if (closeRuleBtn) {
      closeRuleBtn.addEventListener('click', () => {
          document.getElementById('rule-popup').style.display = 'none';
          isRulePaused = false; // Unpauses the game loop instantly
      });
  }

  // Accordion Rules Logic
  const rulesHeader = document.getElementById('rules-header');
  const rulesList = document.getElementById('rules-list');
  const rulesIcon = document.getElementById('rules-toggle-icon');
  if (rulesHeader && rulesList) {
      rulesHeader.addEventListener('click', () => {
          const isHidden = rulesList.style.display === 'none';
          rulesList.style.display = isHidden ? 'block' : 'none';
          rulesIcon.textContent = isHidden ? '▲' : '▼';
      });
  }

  // Universal Popup Function
  window.showRulePopup = function(title, text, color = '#00d2ff') {
      if (devDisablePrompts) return; // Dev Override: Abort popup

      const rulePopup = document.getElementById('rule-popup');
      const ruleTitle = document.getElementById('rule-title');
      const ruleText = document.getElementById('rule-text');

      if (rulePopup && ruleText && ruleTitle) {
          ruleTitle.textContent = title;
          ruleTitle.style.color = color;
          ruleText.textContent = text;
          rulePopup.style.display = 'flex';
          isRulePaused = true;
      }
  };

  applyHazardLogic();
  
  // Start 3-2-1 Countdown
  isRulePaused = true;
  const overlay = document.getElementById('gameCountdownOverlay');
  const text = document.getElementById('gameCountdownText');
  const rulesBtn = document.getElementById('countdownRulesBtn');
  
  if (window.GK_State?.developer?.disableCountdowns) {
      if (overlay) overlay.style.display = 'none';
      isRulePaused = false;
  } else if (overlay) {
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
              isRulePaused = false;
          }
      }, 1000);

      rulesBtn.onclick = () => {
          clearInterval(timer);
          overlay.style.display = 'none';
          isRulePaused = false;
          
          const btn = document.getElementById('hub-btn');
          if (btn) btn.click();
          
          const rulesDetails = Array.from(document.querySelectorAll('details')).find(d => d.innerHTML.includes('Rules'));
          if(rulesDetails) rulesDetails.open = true;
      };

      const skipBtn = document.getElementById('skipCountdownBtn');
      if (skipBtn) {
          skipBtn.onclick = () => {
              clearInterval(timer);
              overlay.style.display = 'none';
              isRulePaused = false;
          };
      }
  }
});

// Intercept Android hardware back button
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
    window.Capacitor.Plugins.App.addListener('backButton', () => {
        window.location.href = '../../menu.html';
    });
}
