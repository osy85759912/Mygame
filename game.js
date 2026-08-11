(() => {
  "use strict";

  // ---------- Config ----------
  const STORAGE_KEY = "buildingBreakerSave_v1";
  const BASE_LIVES = 3;
  const MAX_LIFE_LEVEL = 7;

  const WEAPONS = [
    { name: "장난감 총", emoji: "🔫", baseDamage: 5, baseCooldown: 420, cost: 0, tierColor: "#cfd6e0", scale: 1.0 },
    { name: "리볼버", emoji: "🔫", baseDamage: 12, baseCooldown: 380, cost: 150, tierColor: "#8bd17c", scale: 1.12 },
    { name: "더블배럴 샷건", emoji: "🔫", baseDamage: 26, baseCooldown: 420, cost: 500, tierColor: "#5cc8e0", scale: 1.24 },
    { name: "기관단총", emoji: "🔫", baseDamage: 55, baseCooldown: 500, cost: 1500, tierColor: "#7c8bff", scale: 1.36 },
    { name: "개틀링건", emoji: "🔫", baseDamage: 20, baseCooldown: 140, cost: 4000, tierColor: "#d17cff", scale: 1.48 },
    { name: "로켓런처", emoji: "🚀", baseDamage: 130, baseCooldown: 700, cost: 10000, tierColor: "#ff9d4d", scale: 1.6 },
    { name: "발칸포", emoji: "🔫", baseDamage: 260, baseCooldown: 850, cost: 25000, tierColor: "#ff6b6b", scale: 1.75 },
    { name: "레이저건", emoji: "🔫", baseDamage: 520, baseCooldown: 1000, cost: 60000, tierColor: "#ffd93d", scale: 1.9 },
  ];

  function buildingMaxHP(wave) {
    return Math.round((30 + wave * 8) * Math.pow(1.09, wave - 1));
  }
  function fallDuration(wave) {
    return Math.max(2800, 8000 - wave * 120);
  }
  function rewardForWave(wave) {
    return Math.round(buildingMaxHP(wave) * 0.9);
  }
  function dmgUpgradeCost(level) {
    return Math.round(80 * Math.pow(1.35, level));
  }
  function speedUpgradeCost(level) {
    return Math.round(100 * Math.pow(1.4, level));
  }
  function lifeUpgradeCost(level) {
    return Math.round(300 * Math.pow(1.8, level));
  }
  function goldMultUpgradeCost(level) {
    return Math.round(250 * Math.pow(1.5, level));
  }

  // ---------- Save data ----------
  function defaultSave() {
    return {
      gold: 0,
      weaponTier: 0,
      dmgLevel: 0,
      speedLevel: 0,
      lifeLevel: 0,
      goldMultLevel: 0,
      bestWave: 1,
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      return Object.assign(defaultSave(), JSON.parse(raw));
    } catch (e) {
      return defaultSave();
    }
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch (e) {}
  }

  let save = loadSave();

  function currentWeapon() {
    return WEAPONS[save.weaponTier];
  }
  function nextWeapon() {
    return WEAPONS[save.weaponTier + 1] || null;
  }
  function currentDamage() {
    return currentWeapon().baseDamage * (1 + save.dmgLevel * 0.08);
  }
  function currentCooldown() {
    return Math.max(60, currentWeapon().baseCooldown * Math.pow(0.96, save.speedLevel));
  }
  function goldMultiplier() {
    return 1 + save.goldMultLevel * 0.15;
  }
  function maxLives() {
    return BASE_LIVES + save.lifeLevel;
  }

  // ---------- Session state ----------
  const session = {
    wave: 1,
    lives: maxLives(),
    streak: 0,
    phase: "idle", // idle | falling | gameover
    building: null,
    lastAttackTime: 0,
    hasStarted: false,
  };

  // ---------- DOM ----------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const GROUND_Y = H - 90;

  const goldValueEl = document.getElementById("goldValue");
  const waveValueEl = document.getElementById("waveValue");
  const livesDisplayEl = document.getElementById("livesDisplay");
  const bestWaveValueEl = document.getElementById("bestWaveValue");
  const weaponEmojiEl = document.getElementById("weaponEmoji");
  const weaponNameEl = document.getElementById("weaponName");
  const weaponDamageEl = document.getElementById("weaponDamage");
  const nextBtn = document.getElementById("nextBtn");
  const shopBtn = document.getElementById("shopBtn");
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startBtn");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const gameOverStats = document.getElementById("gameOverStats");
  const restartBtn = document.getElementById("restartBtn");
  const shopModal = document.getElementById("shopModal");
  const shopList = document.getElementById("shopList");
  const shopGoldEl = document.getElementById("shopGold");
  const closeShopBtn = document.getElementById("closeShopBtn");
  const muteBtn = document.getElementById("muteBtn");

  // ---------- Audio (synthesized, no assets) ----------
  let audioCtx = null;
  let muted = false;
  function ensureAudio() {
    if (!audioCtx) {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {}
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  }
  function playTone(freq, duration, type, gainVal) {
    if (muted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = gainVal || 0.08;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }
  function sfxHit() { playTone(220 + Math.random() * 60, 0.08, "square", 0.05); }
  function sfxShoot() {
    if (muted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }
  function sfxDestroy() {
    [660, 880, 1100].forEach((f, i) => setTimeout(() => playTone(f, 0.15, "triangle", 0.07), i * 60));
  }
  function sfxCrash() { playTone(90, 0.4, "sawtooth", 0.1); }
  function sfxBuy() { playTone(520, 0.12, "sine", 0.06); }

  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
  });

  // ---------- Particles & floating text ----------
  let particles = [];
  let floatingTexts = [];
  let bullets = [];
  let shakeTime = 0;
  let shakeMag = 0;

  function getHitPoint(b) {
    return {
      x: b.x + b.width / 2 + (Math.random() - 0.5) * b.width * 0.6,
      y: b.y + b.height * (0.25 + Math.random() * 0.4),
    };
  }

  function spawnHitParticles(x, y) {
    for (let i = 0; i < 9; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 4.5,
        vy: -Math.random() * 4.5 - 1.5,
        life: 0, maxLife: 16 + Math.random() * 10,
        size: 3 + Math.random() * 3.5,
        color: "#fff3c4",
        gravity: 0.2,
      });
    }
    shakeTime = 7; shakeMag = 6;
  }

  function spawnDebrisParticles(b, isCrash) {
    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const count = isCrash ? 18 : 26;
    const palette = isCrash ? ["#8d6e63", "#5d4037", "#a1887f"] : ["#ffd93d", "#4ecdc4", "#ff6b6b", "#a1e887"];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * (isCrash ? 3 : 5);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isCrash ? 1 : 3),
        life: 0, maxLife: 35 + Math.random() * 20,
        size: 4 + Math.random() * 5,
        color: palette[i % palette.length],
        gravity: isCrash ? 0.25 : 0.18,
      });
    }
    shakeTime = isCrash ? 14 : 8;
    shakeMag = isCrash ? 9 : 4;
  }

  function showFloatingText(text, x, y, color, small) {
    floatingTexts.push({ text, x, y, color, life: 0, maxLife: small ? 30 : 55, small: !!small });
  }

  function updateParticles() {
    particles = particles.filter((p) => p.life < p.maxLife);
    particles.forEach((p) => {
      p.life++;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
    });
    floatingTexts = floatingTexts.filter((t) => t.life < t.maxLife);
    floatingTexts.forEach((t) => {
      t.life++;
      t.y -= 0.6;
    });
    if (shakeTime > 0) shakeTime--;
  }

  // ---------- Building ----------
  function spawnBuilding() {
    const wave = session.wave;
    const maxHp = buildingMaxHP(wave);
    const height = 150 + Math.floor(Math.random() * 60);
    const width = 120 + Math.floor(Math.random() * 40);
    const crackSeeds = [];
    for (let i = 0; i < 10; i++) {
      crackSeeds.push({
        threshold: Math.random(),
        x1: Math.random(),
        y1: Math.random() * 0.5,
        x2: Math.random(),
        y2: 0.5 + Math.random() * 0.5,
      });
    }
    session.building = {
      x: W / 2 - width / 2,
      width, height,
      hp: maxHp, maxHp,
      startTime: performance.now(),
      duration: fallDuration(wave),
      startY: -height,
      targetY: GROUND_Y - height,
      y: -height,
      hitFlash: 0,
      crackSeeds,
      windowSeed: Math.random(),
    };
    session.phase = "falling";
    session.hasStarted = true;
    startOverlay.classList.add("hidden");
    nextBtn.classList.add("hidden");
    updateUI();
  }

  function attack() {
    ensureAudio();
    if (session.phase !== "falling" || !session.building) return;
    const now = performance.now();
    if (now - session.lastAttackTime < currentCooldown()) return;
    session.lastAttackTime = now;
    fireStart = now;

    const b = session.building;
    const hit = getHitPoint(b);
    const muzzle = getMuzzlePoint();
    const dx = hit.x - muzzle.x;
    const dy = hit.y - muzzle.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const speed = 1900;
    bullets.push({
      x: muzzle.x,
      y: muzzle.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage: Math.round(currentDamage()),
      building: b,
      color: currentWeapon().tierColor,
      size: 3.5 + save.weaponTier * 0.6,
    });
    sfxShoot();
  }

  function destroyBuilding() {
    const b = session.building;
    session.streak += 1;
    const streakBonus = 1 + Math.min(session.streak * 0.03, 0.5);
    const reward = Math.round(rewardForWave(session.wave) * goldMultiplier() * streakBonus);
    save.gold += reward;
    spawnDebrisParticles(b, false);
    showFloatingText(`+${reward.toLocaleString("ko-KR")}💰`, b.x + b.width / 2, b.y + b.height / 2, "#ffd93d");
    sfxDestroy();

    save.bestWave = Math.max(save.bestWave, session.wave);
    session.wave += 1;
    session.building = null;
    session.phase = "idle";
    persist();
    updateUI();
    nextBtn.textContent = "다음 건물";
    nextBtn.classList.remove("hidden");
  }

  function crashBuilding() {
    const b = session.building;
    session.streak = 0;
    session.lives -= 1;
    spawnDebrisParticles(b, true);
    showFloatingText("건물 붕괴! 💔", b.x + b.width / 2, b.y + b.height / 2, "#ff6b6b");
    sfxCrash();
    session.building = null;

    if (session.lives <= 0) {
      session.phase = "gameover";
      showGameOver();
    } else {
      session.phase = "idle";
      nextBtn.textContent = "재도전";
      nextBtn.classList.remove("hidden");
    }
    updateUI();
  }

  function showGameOver() {
    gameOverStats.innerHTML = `이번 판 웨이브 <b>${session.wave}</b> 까지 도달했어요.<br>보유 골드는 그대로 유지됩니다 (총 ${save.gold.toLocaleString("ko-KR")}💰).`;
    gameOverOverlay.classList.remove("hidden");
  }

  function restartRun() {
    session.wave = 1;
    session.lives = maxLives();
    session.streak = 0;
    session.building = null;
    session.phase = "idle";
    gameOverOverlay.classList.add("hidden");
    nextBtn.textContent = "다음 건물";
    nextBtn.classList.remove("hidden");
    updateUI();
  }

  // ---------- Shop ----------
  let shopOpenTime = null;

  function openShop() {
    shopOpenTime = performance.now();
    shopModal.classList.remove("hidden");
    renderShop();
  }
  function closeShop() {
    if (shopOpenTime && session.building) {
      const paused = performance.now() - shopOpenTime;
      session.building.startTime += paused;
    }
    shopOpenTime = null;
    shopModal.classList.add("hidden");
  }

  function renderShop() {
    shopGoldEl.textContent = save.gold.toLocaleString("ko-KR");
    const items = [];

    // Weapon upgrade
    const nw = nextWeapon();
    if (nw) {
      const cost = nw.cost;
      items.push(`
        <div class="shop-item">
          <div class="icon">${nw.emoji}</div>
          <div class="info">
            <div class="title">무기 업그레이드: ${nw.name}</div>
            <div class="desc">공격력 ${currentWeapon().baseDamage} → ${nw.baseDamage} / 쿨타임 ${currentWeapon().baseCooldown}ms → ${nw.baseCooldown}ms</div>
          </div>
          <button class="btn small buy-btn" data-action="buyWeapon" ${save.gold < cost ? "disabled" : ""}>${cost.toLocaleString("ko-KR")}💰</button>
        </div>
      `);
    } else {
      items.push(`
        <div class="shop-item">
          <div class="icon">🏆</div>
          <div class="info">
            <div class="title">최고 등급 무기 보유중</div>
            <div class="desc">${WEAPONS[WEAPONS.length - 1].name}을 이미 장착했습니다.</div>
          </div>
        </div>
      `);
    }

    // Damage upgrade
    const dmgCost = dmgUpgradeCost(save.dmgLevel);
    items.push(`
      <div class="shop-item">
        <div class="icon">💪</div>
        <div class="info">
          <div class="title">공격력 강화 (Lv.${save.dmgLevel})</div>
          <div class="desc">현재 공격력 ${currentDamage().toFixed(1)} → ${(currentWeapon().baseDamage * (1 + (save.dmgLevel + 1) * 0.08)).toFixed(1)} (+8%)</div>
        </div>
        <button class="btn small buy-btn" data-action="buyDamage" ${save.gold < dmgCost ? "disabled" : ""}>${dmgCost.toLocaleString("ko-KR")}💰</button>
      </div>
    `);

    // Speed upgrade
    const spdCost = speedUpgradeCost(save.speedLevel);
    const nextCooldown = Math.max(60, currentWeapon().baseCooldown * Math.pow(0.96, save.speedLevel + 1));
    items.push(`
      <div class="shop-item">
        <div class="icon">⚡</div>
        <div class="info">
          <div class="title">공격속도 강화 (Lv.${save.speedLevel})</div>
          <div class="desc">쿨타임 ${Math.round(currentCooldown())}ms → ${Math.round(nextCooldown)}ms</div>
        </div>
        <button class="btn small buy-btn" data-action="buySpeed" ${save.gold < spdCost ? "disabled" : ""}>${spdCost.toLocaleString("ko-KR")}💰</button>
      </div>
    `);

    // Life upgrade
    if (save.lifeLevel < MAX_LIFE_LEVEL) {
      const lifeCost = lifeUpgradeCost(save.lifeLevel);
      items.push(`
        <div class="shop-item">
          <div class="icon">❤️</div>
          <div class="info">
            <div class="title">최대 생명 증가</div>
            <div class="desc">최대 생명 ${maxLives()} → ${maxLives() + 1}</div>
          </div>
          <button class="btn small buy-btn" data-action="buyLife" ${save.gold < lifeCost ? "disabled" : ""}>${lifeCost.toLocaleString("ko-KR")}💰</button>
        </div>
      `);
    } else {
      items.push(`
        <div class="shop-item">
          <div class="icon">❤️</div>
          <div class="info">
            <div class="title">최대 생명: ${maxLives()} (최대치)</div>
            <div class="desc">더 이상 강화할 수 없습니다.</div>
          </div>
        </div>
      `);
    }

    // Gold multiplier
    const gmCost = goldMultUpgradeCost(save.goldMultLevel);
    items.push(`
      <div class="shop-item">
        <div class="icon">📈</div>
        <div class="info">
          <div class="title">골드 획득량 증가 (Lv.${save.goldMultLevel})</div>
          <div class="desc">획득 배율 x${goldMultiplier().toFixed(2)} → x${(1 + (save.goldMultLevel + 1) * 0.15).toFixed(2)}</div>
        </div>
        <button class="btn small buy-btn" data-action="buyGoldMult" ${save.gold < gmCost ? "disabled" : ""}>${gmCost.toLocaleString("ko-KR")}💰</button>
      </div>
    `);

    shopList.innerHTML = items.join("");
  }

  shopList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === "buyWeapon") {
      const nw = nextWeapon();
      if (nw && save.gold >= nw.cost) {
        save.gold -= nw.cost;
        save.weaponTier += 1;
        sfxBuy();
      }
    } else if (action === "buyDamage") {
      const cost = dmgUpgradeCost(save.dmgLevel);
      if (save.gold >= cost) {
        save.gold -= cost;
        save.dmgLevel += 1;
        sfxBuy();
      }
    } else if (action === "buySpeed") {
      const cost = speedUpgradeCost(save.speedLevel);
      if (save.gold >= cost) {
        save.gold -= cost;
        save.speedLevel += 1;
        sfxBuy();
      }
    } else if (action === "buyLife") {
      const cost = lifeUpgradeCost(save.lifeLevel);
      if (save.gold >= cost && save.lifeLevel < MAX_LIFE_LEVEL) {
        save.gold -= cost;
        save.lifeLevel += 1;
        session.lives += 1;
        sfxBuy();
      }
    } else if (action === "buyGoldMult") {
      const cost = goldMultUpgradeCost(save.goldMultLevel);
      if (save.gold >= cost) {
        save.gold -= cost;
        save.goldMultLevel += 1;
        sfxBuy();
      }
    }
    persist();
    renderShop();
    updateUI();
  });

  // ---------- UI ----------
  function updateUI() {
    goldValueEl.textContent = save.gold.toLocaleString("ko-KR");
    waveValueEl.textContent = session.wave;
    bestWaveValueEl.textContent = save.bestWave;

    const ml = maxLives();
    let hearts = "";
    for (let i = 0; i < ml; i++) hearts += i < session.lives ? "❤️" : "🤍";
    livesDisplayEl.textContent = hearts;

    weaponEmojiEl.textContent = currentWeapon().emoji;
    weaponNameEl.textContent = currentWeapon().name;
    weaponDamageEl.textContent = Math.round(currentDamage());
  }

  // ---------- Rendering ----------
  const RECOIL_DURATION = 140;
  let fireStart = -Infinity;
  let lastFrameTime = null;

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#87ceeb");
    grad.addColorStop(1, "#c9ecf5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    drawCloud(70, 80, 1);
    drawCloud(340, 130, 0.8);
    drawCloud(220, 50, 0.6);
  }

  function drawCloud(cx, cy, scale) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 28 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 22 * scale, cy + 4 * scale, 20 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 22 * scale, cy + 6 * scale, 18 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGround() {
    ctx.fillStyle = "#5c7a4a";
    ctx.fillRect(0, GROUND_Y + 40, W, H - GROUND_Y - 40);
    ctx.fillStyle = "#4a6339";
    ctx.fillRect(0, GROUND_Y + 40, W, 6);
  }

  function drawBuilding(b) {
    const frac = b.hp / b.maxHp;
    let color;
    if (frac > 0.6) color = "#8d99ae";
    else if (frac > 0.3) color = "#c9a876";
    else color = "#c97b6b";

    const flashAlpha = b.hitFlash > 0 ? b.hitFlash / 6 : 0;

    ctx.save();
    if (b.hitFlash > 0) {
      const jitter = b.hitFlash;
      ctx.translate((Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter);
      b.hitFlash--;
    }

    // building body
    ctx.fillStyle = color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.width, b.height);

    // windows
    const cols = Math.max(2, Math.floor(b.width / 34));
    const rows = Math.max(2, Math.floor(b.height / 34));
    const padX = (b.width - cols * 22) / (cols + 1);
    const padY = (b.height - rows * 22) / (rows + 1);
    ctx.fillStyle = "rgba(255, 244, 190, 0.85)";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wx = b.x + padX + c * (22 + padX);
        const wy = b.y + padY + r * (22 + padY);
        const lit = ((c + r + Math.floor(b.windowSeed * 10)) % 3) !== 0;
        ctx.fillStyle = lit ? "rgba(255, 244, 190, 0.85)" : "rgba(60, 60, 80, 0.5)";
        ctx.fillRect(wx, wy, 16, 16);
      }
    }

    // cracks
    const damage = 1 - frac;
    ctx.strokeStyle = "rgba(20,20,20,0.55)";
    ctx.lineWidth = 2;
    b.crackSeeds.forEach((c) => {
      if (damage >= c.threshold) {
        ctx.beginPath();
        ctx.moveTo(b.x + c.x1 * b.width, b.y + c.y1 * b.height);
        ctx.lineTo(b.x + c.x2 * b.width, b.y + c.y2 * b.height);
        ctx.stroke();
      }
    });

    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.55})`;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    ctx.restore();

    // health bar
    const barW = b.width;
    const barX = b.x;
    const barY = b.y - 16;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(barX, barY, barW, 8);
    ctx.fillStyle = frac > 0.5 ? "#8bd17c" : frac > 0.25 ? "#ffd93d" : "#ff6b6b";
    ctx.fillRect(barX, barY, barW * Math.max(0, frac), 8);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, 8);

    // fall timer bar (top of screen)
    const elapsed = performance.now() - b.startTime;
    const timeFrac = Math.max(0, 1 - elapsed / b.duration);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(20, 14, W - 40, 6);
    ctx.fillStyle = "#ff9f45";
    ctx.fillRect(20, 14, (W - 40) * timeFrac, 6);
  }

  function getGunState(now) {
    const elapsed = now - fireStart;
    const active = elapsed >= 0 && elapsed < RECOIL_DURATION;
    const recoil = active ? Math.sin(Math.min(elapsed / RECOIL_DURATION, 1) * Math.PI) : 0;
    const idleBob = active ? 0 : Math.sin(now / 600) * 2;
    const weapon = currentWeapon();
    const size = 58 * weapon.scale;
    const gx = W / 2;
    const gy = GROUND_Y + 20 + recoil * 8 - idleBob;
    const rotation = -Math.PI / 2 + recoil * 0.2;
    return { elapsed, active, recoil, weapon, size, gx, gy, rotation };
  }

  function getMuzzlePoint() {
    const s = getGunState(performance.now());
    const dirX = Math.cos(s.rotation);
    const dirY = Math.sin(s.rotation);
    return { x: s.gx + dirX * s.size * 0.52, y: s.gy + dirY * s.size * 0.52 };
  }

  function drawGun() {
    const s = getGunState(performance.now());

    // tier glow
    ctx.save();
    ctx.globalAlpha = 0.5;
    const glow = ctx.createRadialGradient(s.gx, s.gy, 0, s.gx, s.gy, s.size * 0.9);
    glow.addColorStop(0, s.weapon.tierColor);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(s.gx, s.gy, s.size * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(s.gx, s.gy);
    ctx.rotate(s.rotation);
    ctx.font = `${s.size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.weapon.emoji, 0, 0);
    ctx.restore();

    // muzzle flash
    if (s.elapsed >= 0 && s.elapsed < 90) {
      const flashAlpha = 1 - s.elapsed / 90;
      const mp = getMuzzlePoint();
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      const flash = ctx.createRadialGradient(mp.x, mp.y, 0, mp.x, mp.y, 24);
      flash.addColorStop(0, "#fff6d0");
      flash.addColorStop(1, "rgba(255,246,208,0)");
      ctx.fillStyle = flash;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function updateBullets(dtMs) {
    const dt = dtMs / 1000;
    bullets = bullets.filter((bl) => {
      bl.x += bl.vx * dt;
      bl.y += bl.vy * dt;

      if (bl.y < -30 || bl.y > H + 30 || bl.x < -30 || bl.x > W + 30) return false;

      const b = session.building;
      if (
        b &&
        bl.building === b &&
        session.phase === "falling" &&
        bl.x >= b.x && bl.x <= b.x + b.width &&
        bl.y >= b.y && bl.y <= b.y + b.height
      ) {
        b.hp = Math.max(0, b.hp - bl.damage);
        b.hitFlash = 6;
        spawnHitParticles(bl.x, bl.y);
        showFloatingText(`-${bl.damage}`, bl.x, bl.y, "#ffffff", true);
        sfxHit();
        if (b.hp <= 0) destroyBuilding();
        return false;
      }
      return true;
    });
  }

  function drawBullets() {
    bullets.forEach((bl) => {
      const angle = Math.atan2(bl.vy, bl.vx);
      const len = 16;
      ctx.save();
      ctx.translate(bl.x, bl.y);
      ctx.rotate(angle);
      const trail = ctx.createLinearGradient(-len, 0, 0, 0);
      trail.addColorStop(0, "rgba(255,255,255,0)");
      trail.addColorStop(1, bl.color);
      ctx.strokeStyle = trail;
      ctx.lineWidth = bl.size * 0.7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-len, 0);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.fillStyle = "#fff8e0";
      ctx.beginPath();
      ctx.arc(0, 0, bl.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach((p) => {
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function drawFloatingTexts() {
    floatingTexts.forEach((t) => {
      const alpha = 1 - t.life / t.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = t.color;
      ctx.font = t.small ? "bold 15px sans-serif" : "bold 20px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    });
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (shakeTime > 0) {
      ctx.translate((Math.random() - 0.5) * shakeMag, (Math.random() - 0.5) * shakeMag);
    }
    drawBackground();
    drawGround();
    if (session.building) drawBuilding(session.building);
    drawGun();
    drawBullets();
    drawParticles();
    drawFloatingTexts();
    ctx.restore();
  }

  function loop() {
    const now = performance.now();
    const dt = lastFrameTime ? Math.min(now - lastFrameTime, 48) : 16;
    lastFrameTime = now;

    if (session.phase === "falling" && session.building) {
      const b = session.building;
      const t = Math.min(1, (now - b.startTime) / b.duration);
      b.y = b.startY + (b.targetY - b.startY) * t;
      if (t >= 1) {
        crashBuilding();
      }
    }
    updateBullets(dt);
    updateParticles();
    render();
    requestAnimationFrame(loop);
  }

  // ---------- Input ----------
  canvas.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    ensureAudio();
    attack();
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      ensureAudio();
      if (session.phase === "falling") {
        attack();
      } else if (session.phase === "idle" && session.hasStarted) {
        spawnBuilding();
      } else if (session.phase === "idle" && !session.hasStarted) {
        spawnBuilding();
      }
    }
  });

  startBtn.addEventListener("click", () => {
    ensureAudio();
    spawnBuilding();
  });

  nextBtn.addEventListener("click", () => {
    ensureAudio();
    spawnBuilding();
  });

  restartBtn.addEventListener("click", () => {
    ensureAudio();
    restartRun();
  });

  shopBtn.addEventListener("click", openShop);
  closeShopBtn.addEventListener("click", closeShop);
  shopModal.addEventListener("click", (e) => {
    if (e.target === shopModal) closeShop();
  });

  // ---------- Init ----------
  updateUI();
  requestAnimationFrame(loop);
})();
