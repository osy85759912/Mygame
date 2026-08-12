(() => {
  "use strict";

  // ---------- Config ----------
  const STORAGE_KEY = "buildingBreakerSave_v1";
  const BASE_LIVES = 3;
  const MAX_LIFE_LEVEL = 7;

  const WEAPONS = [
    { name: "장난감 총", baseDamage: 5, cost: 0, tierColor: "#cfd6e0", scale: 1, barrels: 1, tip: "cap" },
    { name: "리볼버", baseDamage: 12, cost: 150, tierColor: "#8bd17c", scale: 1.08, barrels: 1, tip: "cap" },
    { name: "더블배럴 샷건", baseDamage: 26, cost: 500, tierColor: "#5cc8e0", scale: 1.17, barrels: 2, tip: "cap" },
    { name: "기관단총", baseDamage: 55, cost: 1500, tierColor: "#7c8bff", scale: 1.25, barrels: 1, tip: "cap" },
    { name: "개틀링건", baseDamage: 85, cost: 4000, tierColor: "#d17cff", scale: 1.33, barrels: 3, tip: "cap" },
    { name: "로켓런처", baseDamage: 130, cost: 10000, tierColor: "#ff9d4d", scale: 1.41, barrels: 1, tip: "cone" },
    { name: "발칸포", baseDamage: 260, cost: 25000, tierColor: "#ff6b6b", scale: 1.5, barrels: 4, tip: "cone" },
    { name: "레이저건", baseDamage: 520, cost: 60000, tierColor: "#ffd93d", scale: 1.58, barrels: 1, tip: "crystal" },
    { name: "플라즈마 캐논", baseDamage: 926, cost: 141000, tierColor: "#da8a62", scale: 1.66, barrels: 1, tip: "cone" },
    { name: "레일건", baseDamage: 1648, cost: 331350, tierColor: "#62daad", scale: 1.74, barrels: 2, tip: "crystal" },
    { name: "미니건 어레이", baseDamage: 2933, cost: 778673, tierColor: "#d062da", scale: 1.83, barrels: 3, tip: "cone" },
    { name: "유탄발사기", baseDamage: 5221, cost: 1829882, tierColor: "#c1da62", scale: 1.91, barrels: 4, tip: "cone" },
    { name: "곡사포", baseDamage: 9293, cost: 4300223, tierColor: "#629eda", scale: 1.99, barrels: 1, tip: "crystal" },
    { name: "대전차포", baseDamage: 16542, cost: 10105524, tierColor: "#da627b", scale: 2.08, barrels: 2, tip: "cone" },
    { name: "이온빔 캐논", baseDamage: 29445, cost: 23747981, tierColor: "#62da6c", scale: 2.16, barrels: 3, tip: "cone" },
    { name: "양자포", baseDamage: 52412, cost: 55807755, tierColor: "#8f62da", scale: 2.24, barrels: 4, tip: "crystal" },
    { name: "융합포", baseDamage: 93293, cost: 131148224, tierColor: "#dab262", scale: 2.32, barrels: 1, tip: "crystal" },
    { name: "텅스텐 관통포", baseDamage: 166062, cost: 308198326, tierColor: "#62dad5", scale: 2.41, barrels: 2, tip: "crystal" },
    { name: "음파 파쇄포", baseDamage: 295590, cost: 724266066, tierColor: "#da62bc", scale: 2.49, barrels: 3, tip: "crystal" },
    { name: "중력포", baseDamage: 526150, cost: 1702025255, tierColor: "#99da62", scale: 2.57, barrels: 4, tip: "crystal" },
    { name: "감마선포", baseDamage: 936547, cost: 3999759349, tierColor: "#6276da", scale: 2.66, barrels: 1, tip: "crystal" },
    { name: "반물질포", baseDamage: 1667054, cost: 9399434470, tierColor: "#da7162", scale: 2.74, barrels: 2, tip: "crystal" },
    { name: "블랙홀 발사기", baseDamage: 2967356, cost: 22088671005, tierColor: "#62da94", scale: 2.82, barrels: 3, tip: "crystal" },
    { name: "초신성포", baseDamage: 5281894, cost: 51908376862, tierColor: "#b762da", scale: 2.9, barrels: 4, tip: "crystal" },
    { name: "오비탈 레이저", baseDamage: 9401771, cost: 121984685626, tierColor: "#dada62", scale: 2.99, barrels: 1, tip: "crystal" },
    { name: "차원균열포", baseDamage: 16735152, cost: 286664011221, tierColor: "#62b7da", scale: 3.07, barrels: 2, tip: "crystal" },
    { name: "항성포", baseDamage: 29788571, cost: 673660426369, tierColor: "#eaa4c1", scale: 3.15, barrels: 3, tip: "crystal" },
    { name: "은하 파괴포", baseDamage: 53023656, cost: 1583102001967, tierColor: "#adeaa4", scale: 3.23, barrels: 4, tip: "crystal" },
    { name: "특이점 발사기", baseDamage: 94382108, cost: 3720289704622, tierColor: "#b0a4ea", scale: 3.32, barrels: 1, tip: "crystal" },
    { name: "종말의 포", baseDamage: 168000152, cost: 8742680805862, tierColor: "#eac4a4", scale: 3.4, barrels: 2, tip: "crystal" },
  ];

  const BUILDING_TIERS = [
    { name: "표준", base: "#9aa7b8", light: "#c7d1de", dark: "#69768a", trim: "#e9e4d4", window: "#fff2ba" },
    { name: "벽돌", base: "#b98a63", light: "#d8ab80", dark: "#84603f", trim: "#5c4633", window: "#ffe6a0" },
    { name: "철근콘크리트", base: "#82898d", light: "#a7aeb2", dark: "#54595c", trim: "#f7b500", window: "#bfe9ff" },
    { name: "중장갑", base: "#5b6a5d", light: "#7d8f7f", dark: "#343f36", trim: "#c1503a", window: "#d6ffae" },
    { name: "요새", base: "#362b2f", light: "#584750", dark: "#1c1518", trim: "#ff4433", window: "#ffb347" },
  ];

  function buildingTier(wave) {
    return Math.min(BUILDING_TIERS.length - 1, Math.floor((wave - 1) / 4));
  }

  function josaEulReul(word) {
    const code = word.charCodeAt(word.length - 1);
    if (code >= 0xac00 && code <= 0xd7a3) {
      return (code - 0xac00) % 28 !== 0 ? "을" : "를";
    }
    return "를";
  }

  function buildingMaxHP(wave) {
    return Math.round((80 + wave * 20) * Math.pow(1.1, wave - 1));
  }
  function fallDuration(wave) {
    return Math.max(1800, 5200 - wave * 160);
  }
  function rewardForWave(wave) {
    return Math.round(buildingMaxHP(wave) * 0.35);
  }
  function dmgUpgradeCost(level) {
    return Math.round(80 * Math.pow(1.35, level));
  }
  function lifeUpgradeCost(level) {
    return Math.round(300 * Math.pow(1.8, level));
  }
  function goldMultUpgradeCost(level) {
    return Math.round(250 * Math.pow(1.5, level));
  }
  function turretUpgradeCost(level) {
    return Math.round(600 * Math.pow(1.45, level));
  }
  function turretDamageFraction(level) {
    return 0.25 + (level - 1) * 0.08;
  }
  function turretInterval(level) {
    return Math.max(300, 1000 - (level - 1) * 100);
  }
  const MAX_TURRET_COUNT = 4;
  const TURRET_OFFSETS = [-95, 95, -150, 150];
  function turretCountUpgradeCost(count) {
    return Math.round(2500 * Math.pow(1.9, count));
  }

  // ---------- Save data ----------
  function defaultSave() {
    return {
      gold: 0,
      weaponTier: 0,
      dmgLevel: 0,
      lifeLevel: 0,
      goldMultLevel: 0,
      turretLevel: 0,
      turretCount: 0,
      bestWave: 1,
    };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      const merged = Object.assign(defaultSave(), JSON.parse(raw));
      if (merged.turretLevel > 0 && merged.turretCount < 1) merged.turretCount = 1;
      return merged;
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
  const guardBtn = document.getElementById("guardBtn");
  const guardLabelEl = guardBtn.querySelector(".guard-label");
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
  function sfxGuard() {
    if (muted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(620, now + 0.18);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }
  function sfxTurret() {
    if (muted || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
  });

  // ---------- Particles & floating text ----------
  let particles = [];
  let floatingTexts = [];
  let bullets = [];
  let shockwaves = [];

  function spawnShockwave(x, y, color) {
    shockwaves.push({ x, y, life: 0, maxLife: 26, color });
  }

  function updateShockwaves() {
    shockwaves = shockwaves.filter((s) => s.life < s.maxLife);
    shockwaves.forEach((s) => s.life++);
  }

  function drawShockwaves() {
    shockwaves.forEach((s) => {
      const t = s.life / s.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - t) * 0.6;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 5 * (1 - t) + 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 10 + t * 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }
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

  function spawnMuzzleSmoke(x, y) {
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.5 - Math.random() * 0.6,
        life: 0, maxLife: 26 + Math.random() * 14,
        size: 5 + Math.random() * 5,
        color: "rgba(210,210,215,0.5)",
        gravity: -0.01,
        grow: 0.06,
      });
    }
  }

  function spawnGuardParticles(x, y) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0, maxLife: 22 + Math.random() * 12,
        size: 3 + Math.random() * 3,
        color: "#bdf0ff",
        gravity: 0.1,
      });
    }
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
      if (p.grow) p.size += p.grow;
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
    const tier = buildingTier(wave);
    const height = 160 + Math.floor(Math.random() * 70);
    const width = 120 + Math.floor(Math.random() * 44);

    const crackSeeds = [];
    for (let i = 0; i < 9; i++) {
      let cx = Math.random();
      let cy = Math.random() * 0.35;
      const points = [{ x: cx, y: cy }];
      const segs = 3 + Math.floor(Math.random() * 2);
      for (let s = 0; s < segs; s++) {
        cx = Math.min(1, Math.max(0, cx + (Math.random() - 0.5) * 0.32));
        cy = Math.min(1, Math.max(0, cy + 0.55 / segs + (Math.random() - 0.4) * 0.12));
        points.push({ x: cx, y: cy });
      }
      crackSeeds.push({ threshold: 0.15 + Math.random() * 0.8, points });
    }

    const cellSize = 28;
    const cols = Math.max(2, Math.floor(width / cellSize));
    const rows = Math.max(2, Math.floor(height / cellSize));
    const windows = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        windows.push({
          row: r,
          col: c,
          lit: Math.random() > 0.3,
          breakThreshold: 0.3 + Math.random() * 0.6,
        });
      }
    }

    const streaks = Array.from({ length: 4 + Math.floor(Math.random() * 3) }, () => ({
      x: Math.random(),
      y0: Math.random() * 0.3,
      len: 0.2 + Math.random() * 0.4,
      w: 3 + Math.random() * 5,
    }));

    const rubble = Array.from({ length: 10 }, () => ({
      dx: (Math.random() - 0.5) * 0.9,
      size: 4 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      reveal: Math.random(),
    }));

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
      tier,
      cols, rows, windows,
      crackSeeds,
      streaks,
      rubble,
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
    fireStart = performance.now();

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
    spawnMuzzleSmoke(muzzle.x, muzzle.y);
    sfxShoot();
  }

  const GUARD_COOLDOWN = 3000;
  const GUARD_PUSHBACK = 1600;
  let guardCooldownRemaining = 0;

  function useGuard() {
    ensureAudio();
    if (session.phase !== "falling" || !session.building) return;
    if (guardCooldownRemaining > 0) return;
    guardCooldownRemaining = GUARD_COOLDOWN;
    fireStart = performance.now();

    const b = session.building;
    const hit = getHitPoint(b);
    const muzzle = getMuzzlePoint();
    const dx = hit.x - muzzle.x;
    const dy = hit.y - muzzle.y;
    const dist = Math.max(1, Math.hypot(dx, dy));
    const speed = 1400;
    bullets.push({
      x: muzzle.x,
      y: muzzle.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      damage: 0,
      isGuard: true,
      building: b,
      color: "#5cc8e0",
      size: 9,
    });
    sfxGuard();
  }

  let turretCooldownRemaining = 0;
  let turretFireStart = -Infinity;

  function fireTurret() {
    if (session.phase !== "falling" || !session.building) return;
    turretFireStart = performance.now();

    const b = session.building;
    const damage = Math.max(1, Math.round(currentDamage() * turretDamageFraction(save.turretLevel)));
    const speed = 1500;
    for (let i = 0; i < save.turretCount; i++) {
      const hit = getHitPoint(b);
      const muzzle = getTurretMuzzlePoint(i);
      const dx = hit.x - muzzle.x;
      const dy = hit.y - muzzle.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      bullets.push({
        x: muzzle.x,
        y: muzzle.y,
        vx: (dx / dist) * speed,
        vy: (dy / dist) * speed,
        damage,
        isTurret: true,
        building: b,
        color: "#ffb347",
        size: 6,
      });
    }
    sfxTurret();
  }

  function destroyBuilding() {
    const b = session.building;
    session.streak += 1;
    const streakBonus = 1 + Math.min(session.streak * 0.03, 0.5);
    const reward = Math.round(rewardForWave(session.wave) * goldMultiplier() * streakBonus);
    save.gold += reward;
    spawnDebrisParticles(b, false);
    spawnShockwave(b.x + b.width / 2, b.y + b.height / 2, "#ffe9a0");
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
    spawnShockwave(b.x + b.width / 2, b.y + b.height / 2, "#ff6b6b");
    showFloatingText("건물 붕괴! 💔", b.x + b.width / 2, b.y + b.height / 2, "#ff6b6b");
    sfxCrash();
    session.building = null;

    if (session.lives <= 0) {
      session.phase = "gameover";
      showGameOver();
      resetProgressOnDeath();
    } else {
      session.phase = "idle";
      nextBtn.textContent = "재도전";
      nextBtn.classList.remove("hidden");
    }
    updateUI();
  }

  function showGameOver() {
    gameOverStats.innerHTML = `이번 판 웨이브 <b>${session.wave}</b> 까지 도달했어요.<br>모은 골드와 무기 강화는 모두 초기화됩니다.<br>최고 기록: 웨이브 ${save.bestWave}`;
    gameOverOverlay.classList.remove("hidden");
  }

  function resetProgressOnDeath() {
    const bestWave = save.bestWave;
    save = defaultSave();
    save.bestWave = bestWave;
    persist();
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
          <div class="icon" style="color:${nw.tierColor}"><svg class="icon-svg"><use href="#icon-crosshair"></use></svg></div>
          <div class="info">
            <div class="title">무기 업그레이드: ${nw.name}</div>
            <div class="desc">공격력 ${currentWeapon().baseDamage} → ${nw.baseDamage}</div>
          </div>
          <button class="btn small buy-btn" data-action="buyWeapon" ${save.gold < cost ? "disabled" : ""}>${cost.toLocaleString("ko-KR")}💰</button>
        </div>
      `);
    } else {
      items.push(`
        <div class="shop-item">
          <div class="icon"><svg class="icon-svg"><use href="#icon-star"></use></svg></div>
          <div class="info">
            <div class="title">최고 등급 무기 보유중</div>
            <div class="desc">${WEAPONS[WEAPONS.length - 1].name}${josaEulReul(WEAPONS[WEAPONS.length - 1].name)} 이미 장착했습니다.</div>
          </div>
        </div>
      `);
    }

    // Damage upgrade
    const dmgCost = dmgUpgradeCost(save.dmgLevel);
    items.push(`
      <div class="shop-item">
        <div class="icon"><svg class="icon-svg"><use href="#icon-burst"></use></svg></div>
        <div class="info">
          <div class="title">공격력 강화 (Lv.${save.dmgLevel})</div>
          <div class="desc">현재 공격력 ${currentDamage().toFixed(1)} → ${(currentWeapon().baseDamage * (1 + (save.dmgLevel + 1) * 0.08)).toFixed(1)} (+8%)</div>
        </div>
        <button class="btn small buy-btn" data-action="buyDamage" ${save.gold < dmgCost ? "disabled" : ""}>${dmgCost.toLocaleString("ko-KR")}💰</button>
      </div>
    `);

    // Life upgrade
    if (save.lifeLevel < MAX_LIFE_LEVEL) {
      const lifeCost = lifeUpgradeCost(save.lifeLevel);
      items.push(`
        <div class="shop-item">
          <div class="icon"><svg class="icon-svg"><use href="#icon-heart"></use></svg></div>
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
          <div class="icon"><svg class="icon-svg"><use href="#icon-heart"></use></svg></div>
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
        <div class="icon"><svg class="icon-svg"><use href="#icon-trend"></use></svg></div>
        <div class="info">
          <div class="title">골드 획득량 증가 (Lv.${save.goldMultLevel})</div>
          <div class="desc">획득 배율 x${goldMultiplier().toFixed(2)} → x${(1 + (save.goldMultLevel + 1) * 0.15).toFixed(2)}</div>
        </div>
        <button class="btn small buy-btn" data-action="buyGoldMult" ${save.gold < gmCost ? "disabled" : ""}>${gmCost.toLocaleString("ko-KR")}💰</button>
      </div>
    `);

    // Auto turret helper
    const turretCost = turretUpgradeCost(save.turretLevel);
    const turretNextLevel = save.turretLevel + 1;
    const turretNextFrac = turretDamageFraction(turretNextLevel);
    const turretNextInterval = turretInterval(turretNextLevel);
    const turretOwnedDesc = save.turretLevel > 0
      ? `${save.turretCount}기 보유 · ${(turretInterval(save.turretLevel) / 1000).toFixed(1)}초마다 자동 발사 · 공격력 ${(turretDamageFraction(save.turretLevel) * 100).toFixed(0)}%`
      : "일정 주기로 자동으로 미사일을 발사하는 헬퍼 터렛을 설치합니다.";
    items.push(`
      <div class="shop-item">
        <div class="icon"><svg class="icon-svg"><use href="#icon-turret"></use></svg></div>
        <div class="info">
          <div class="title">${save.turretLevel > 0 ? `자동 터렛 강화 (Lv.${save.turretLevel})` : "자동 터렛 설치"}</div>
          <div class="desc">${turretOwnedDesc} → ${(turretNextInterval / 1000).toFixed(1)}초마다 · 공격력 ${(turretNextFrac * 100).toFixed(0)}%</div>
        </div>
        <button class="btn small buy-btn" data-action="buyTurret" ${save.gold < turretCost ? "disabled" : ""}>${turretCost.toLocaleString("ko-KR")}💰</button>
      </div>
    `);

    // Turret count (only once the first turret is installed)
    if (save.turretLevel > 0) {
      if (save.turretCount < MAX_TURRET_COUNT) {
        const countCost = turretCountUpgradeCost(save.turretCount);
        items.push(`
          <div class="shop-item">
            <div class="icon"><svg class="icon-svg"><use href="#icon-turret"></use></svg></div>
            <div class="info">
              <div class="title">터렛 개수 증가 (현재 ${save.turretCount}기)</div>
              <div class="desc">터렛을 한 대 더 배치해 동시에 발사합니다. ${save.turretCount}기 → ${save.turretCount + 1}기</div>
            </div>
            <button class="btn small buy-btn" data-action="buyTurretCount" ${save.gold < countCost ? "disabled" : ""}>${countCost.toLocaleString("ko-KR")}💰</button>
          </div>
        `);
      } else {
        items.push(`
          <div class="shop-item">
            <div class="icon"><svg class="icon-svg"><use href="#icon-turret"></use></svg></div>
            <div class="info">
              <div class="title">터렛 개수: ${save.turretCount}기 (최대치)</div>
              <div class="desc">더 이상 늘릴 수 없습니다.</div>
            </div>
          </div>
        `);
      }
    }

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
    } else if (action === "buyTurret") {
      const cost = turretUpgradeCost(save.turretLevel);
      if (save.gold >= cost) {
        save.gold -= cost;
        save.turretLevel += 1;
        if (save.turretCount < 1) save.turretCount = 1;
        if (turretCooldownRemaining <= 0) turretCooldownRemaining = turretInterval(save.turretLevel);
        sfxBuy();
      }
    } else if (action === "buyTurretCount") {
      const cost = turretCountUpgradeCost(save.turretCount);
      if (save.gold >= cost && save.turretCount < MAX_TURRET_COUNT) {
        save.gold -= cost;
        save.turretCount += 1;
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
    for (let i = 0; i < ml; i++) {
      hearts += `<svg class="icon-svg heart ${i < session.lives ? "filled" : "empty"}"><use href="#icon-heart"></use></svg>`;
    }
    livesDisplayEl.innerHTML = hearts;

    weaponEmojiEl.style.color = currentWeapon().tierColor;
    weaponNameEl.textContent = currentWeapon().name;
    weaponDamageEl.textContent = Math.round(currentDamage());
  }

  // ---------- Rendering ----------
  const RECOIL_DURATION = 140;
  let fireStart = -Infinity;
  let lastFrameTime = null;

  const SKYLINE = [
    { x: -10, w: 60, h: 130, a: 0.22 },
    { x: 50, w: 44, h: 90, a: 0.18 },
    { x: 100, w: 66, h: 165, a: 0.24 },
    { x: 175, w: 40, h: 75, a: 0.16 },
    { x: 225, w: 58, h: 145, a: 0.22 },
    { x: 295, w: 46, h: 100, a: 0.18 },
    { x: 350, w: 70, h: 175, a: 0.25 },
    { x: 430, w: 50, h: 110, a: 0.19 },
  ];

  const GROUND_CRACKS = Array.from({ length: 16 }, () => {
    const x1 = Math.random() * W;
    const y1 = Math.random() * 46;
    return {
      x1, y1,
      x2: x1 + (Math.random() - 0.5) * 70,
      y2: y1 + 8 + Math.random() * 24,
    };
  });

  const GROUND_DEBRIS = Array.from({ length: 22 }, () => ({
    x: Math.random() * W,
    y: 10 + Math.random() * 44,
    r: 1.5 + Math.random() * 3,
    a: 0.15 + Math.random() * 0.25,
  }));

  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#4f96c9");
    grad.addColorStop(0.38, "#7bbfe0");
    grad.addColorStop(0.72, "#bfe3ef");
    grad.addColorStop(1, "#dff1ee");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // sun glow
    ctx.save();
    const sunX = W * 0.76, sunY = 95;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 135);
    sunGlow.addColorStop(0, "rgba(255,251,222,0.6)");
    sunGlow.addColorStop(1, "rgba(255,251,222,0)");
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 135, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,253,235,0.85)";
    ctx.beginPath();
    ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // distant skyline (parallax silhouette)
    ctx.save();
    ctx.fillStyle = "#4d7699";
    SKYLINE.forEach((s) => {
      ctx.globalAlpha = s.a;
      ctx.fillRect(s.x, GROUND_Y - s.h, s.w, s.h + 90);
    });
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.8)";
    drawCloud(70, 80, 1);
    drawCloud(340, 130, 0.8);
    drawCloud(220, 50, 0.6);
    drawCloud(420, 205, 0.55);
  }

  function drawCloud(cx, cy, scale) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 28 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 22 * scale, cy + 4 * scale, 20 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.ellipse(cx - 22 * scale, cy + 6 * scale, 18 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGround() {
    const top = GROUND_Y + 40;
    const grad = ctx.createLinearGradient(0, top, 0, H);
    grad.addColorStop(0, "#7a9a5e");
    grad.addColorStop(0.4, "#5c7a44");
    grad.addColorStop(1, "#38491f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, top, W, H - top);

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, top, W, 4);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(0, top + 4, W, 2);

    ctx.strokeStyle = "rgba(0,0,0,0.14)";
    ctx.lineWidth = 1.4;
    GROUND_CRACKS.forEach((c) => {
      ctx.beginPath();
      ctx.moveTo(c.x1, top + c.y1);
      ctx.lineTo(c.x2, top + c.y2);
      ctx.stroke();
    });

    GROUND_DEBRIS.forEach((d) => {
      ctx.fillStyle = `rgba(0,0,0,${d.a})`;
      ctx.beginPath();
      ctx.arc(d.x, top + d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawRoof(b, palette) {
    const rx = b.x, ry = b.y, rw = b.width, t = b.tier;
    ctx.fillStyle = shade(palette.dark, -8);
    ctx.fillRect(rx - 4, ry - 7, rw + 8, 7);
    ctx.fillStyle = palette.trim;
    ctx.fillRect(rx - 4, ry - 7, rw + 8, 2);

    if (t === 2) {
      ctx.fillStyle = shade(palette.dark, -18);
      [0.22, 0.52, 0.78].forEach((f) => ctx.fillRect(rx + rw * f - 4, ry - 15, 8, 9));
    } else if (t >= 3) {
      ctx.strokeStyle = "#1c1d1f";
      ctx.lineWidth = 2.4;
      [0.18, 0.5, 0.82].forEach((f) => {
        const sx = rx + rw * f;
        ctx.beginPath();
        ctx.moveTo(sx, ry - 7);
        ctx.lineTo(sx, ry - (t >= 4 ? 22 : 15));
        ctx.stroke();
        if (t >= 4) {
          ctx.fillStyle = "rgba(255,90,60,0.9)";
          ctx.beginPath();
          ctx.arc(sx, ry - 23, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }
  }

  function drawBuilding(b) {
    const frac = b.hp / b.maxHp;
    const damage = 1 - frac;
    const palette = BUILDING_TIERS[b.tier];
    const flashAlpha = b.hitFlash > 0 ? b.hitFlash / 6 : 0;

    ctx.save();
    if (b.hitFlash > 0) {
      const jitter = b.hitFlash;
      ctx.translate((Math.random() - 0.5) * jitter, (Math.random() - 0.5) * jitter);
      b.hitFlash--;
    }

    // ground contact shadow
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(b.x + b.width / 2, GROUND_Y + 5, b.width * 0.52, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // facade: vertical gradient darkens as it takes damage
    const darken = -damage * 22;
    const bodyGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
    bodyGrad.addColorStop(0, shade(palette.light, darken));
    bodyGrad.addColorStop(1, shade(palette.dark, darken));
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(b.x, b.y, b.width, b.height);

    // pseudo-3D side shading
    ctx.fillStyle = "rgba(0,0,0,0.16)";
    ctx.fillRect(b.x + b.width * 0.82, b.y, b.width * 0.18, b.height);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(b.x, b.y, b.width * 0.08, b.height);

    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x, b.y, b.width, b.height);

    // reinforcement bands (tier 2+)
    if (b.tier >= 2) {
      const bandCount = b.tier;
      ctx.fillStyle = shade(palette.dark, -18);
      for (let i = 1; i <= bandCount; i++) {
        const by = b.y + (b.height / (bandCount + 1)) * i;
        ctx.fillRect(b.x, by - 2, b.width, 4);
      }
    }

    // windows
    const cellSize = b.width / b.cols;
    const winSize = Math.min(18, cellSize * 0.6);
    const padX = (b.width - b.cols * winSize) / (b.cols + 1);
    const padY = (b.height - b.rows * winSize) / (b.rows + 1);
    b.windows.forEach((w) => {
      const wx = b.x + padX + w.col * (winSize + padX);
      const wy = b.y + padY + w.row * (winSize + padY);
      const broken = damage >= w.breakThreshold;
      if (broken) {
        ctx.fillStyle = "rgba(15,14,18,0.6)";
        ctx.fillRect(wx, wy, winSize, winSize);
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + winSize, wy + winSize);
        ctx.moveTo(wx + winSize, wy);
        ctx.lineTo(wx, wy + winSize);
        ctx.stroke();
      } else {
        ctx.fillStyle = w.lit ? palette.window : "rgba(35,35,48,0.55)";
        ctx.fillRect(wx, wy, winSize, winSize);
        ctx.strokeStyle = "rgba(0,0,0,0.28)";
        ctx.lineWidth = 1;
        ctx.strokeRect(wx, wy, winSize, winSize);
      }
    });

    // weathering streaks
    ctx.save();
    b.streaks.forEach((st) => {
      const sx = b.x + st.x * b.width;
      const sy0 = b.y + st.y0 * b.height;
      const sy1 = b.y + Math.min(1, st.y0 + st.len) * b.height;
      const streakGrad = ctx.createLinearGradient(sx, sy0, sx, sy1);
      streakGrad.addColorStop(0, "rgba(10,10,12,0.16)");
      streakGrad.addColorStop(1, "rgba(10,10,12,0)");
      ctx.fillStyle = streakGrad;
      ctx.fillRect(sx - st.w / 2, sy0, st.w, sy1 - sy0);
    });
    ctx.restore();

    // diagonal cross-brace truss (tier 3+)
    if (b.tier >= 3) {
      ctx.strokeStyle = "rgba(15,15,17,0.45)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + b.width, b.y + b.height);
      ctx.moveTo(b.x + b.width, b.y);
      ctx.lineTo(b.x, b.y + b.height);
      ctx.stroke();
    }

    // hazard trim at the base (tier 4)
    if (b.tier >= 4) {
      const stripeH = 9;
      const stripeY = b.y + b.height - stripeH;
      for (let sx = 0; sx < b.width; sx += 14) {
        ctx.fillStyle = Math.floor(sx / 14) % 2 === 0 ? palette.trim : "#141517";
        ctx.fillRect(b.x + sx, stripeY, Math.min(14, b.width - sx), stripeH);
      }
    }

    // roof
    drawRoof(b, palette);

    // jagged cracks
    ctx.strokeStyle = "rgba(12,12,14,0.6)";
    ctx.lineWidth = 2;
    b.crackSeeds.forEach((c) => {
      if (damage >= c.threshold) {
        ctx.beginPath();
        c.points.forEach((p, i) => {
          const px = b.x + p.x * b.width;
          const py = b.y + p.y * b.height;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }
    });

    // crumbling debris clinging to the damaged base edge
    const baseY = b.y + b.height;
    const centerX = b.x + b.width / 2;
    b.rubble.forEach((r) => {
      if (damage < r.reveal) return;
      const rx = centerX + r.dx * b.width;
      const ry = baseY - r.size * 0.4;
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(r.rot);
      ctx.fillStyle = shade(palette.dark, -15);
      ctx.fillRect(-r.size / 2, -r.size / 2, r.size, r.size);
      ctx.restore();
    });

    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.55})`;
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }

    ctx.restore();

    // health bar
    const barW = b.width;
    const barX = b.x;
    const barY = b.y - 18;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(barX, barY, barW, 8);
    ctx.fillStyle = frac > 0.5 ? "#8bd17c" : frac > 0.25 ? "#ffd93d" : "#ff6b6b";
    ctx.fillRect(barX, barY, barW * Math.max(0, frac), 8);
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, 8);

    // fall timer bar (top of screen)
    const elapsed = performance.now() - b.startTime;
    const timeFrac = Math.min(1, Math.max(0, 1 - elapsed / b.duration));
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(20, 14, W - 40, 6);
    ctx.fillStyle = "#ff9f45";
    ctx.fillRect(20, 14, (W - 40) * timeFrac, 6);
  }

  function roundRectPath(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.arcTo(x + w, y, x + w, y + r, r);
    c.lineTo(x + w, y + h - r);
    c.arcTo(x + w, y + h, x + w - r, y + h, r);
    c.lineTo(x + r, y + h);
    c.arcTo(x, y + h, x, y + h - r, r);
    c.lineTo(x, y + r);
    c.arcTo(x, y, x + r, y, r);
    c.closePath();
  }

  function shade(hex, percent) {
    const num = parseInt(hex.slice(1), 16);
    let r = (num >> 16) + Math.round(2.55 * percent);
    let g = ((num >> 8) & 0xff) + Math.round(2.55 * percent);
    let b = (num & 0xff) + Math.round(2.55 * percent);
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Fixed emplacement: the cannon always points straight up at the building.
  function getGunState(now) {
    const elapsed = now - fireStart;
    const active = elapsed >= 0 && elapsed < RECOIL_DURATION;
    const recoil = active ? Math.sin(Math.min(elapsed / RECOIL_DURATION, 1) * Math.PI) : 0;
    const idleBob = active ? 0 : Math.sin(now / 600) * 2;
    const weapon = currentWeapon();
    const size = 58 * weapon.scale;
    const gx = W / 2;
    const gy = GROUND_Y + 20 - idleBob;
    const barrelH = size * 0.92;
    const kick = recoil * size * 0.16;
    return { elapsed, active, recoil, weapon, size, gx, gy, barrelH, kick };
  }

  function getMuzzlePoint() {
    const s = getGunState(performance.now());
    return { x: s.gx, y: s.gy + s.kick - s.barrelH };
  }

  function drawGun() {
    const s = getGunState(performance.now());
    const { gx, gy, size, weapon, kick, barrelH } = s;

    // ground shadow beneath the mount
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(gx, GROUND_Y + 34, size * 0.5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(gx, gy);

    // tier glow
    ctx.save();
    ctx.globalAlpha = 0.4;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.15);
    glow.addColorStop(0, weapon.tierColor);
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // mount / base
    const mountW = size * 0.66;
    const mountH = size * 0.3;
    const mountGrad = ctx.createLinearGradient(-mountW / 2, 0, mountW / 2, 0);
    mountGrad.addColorStop(0, "#3a3b3f");
    mountGrad.addColorStop(0.5, "#525459");
    mountGrad.addColorStop(1, "#232427");
    ctx.fillStyle = mountGrad;
    ctx.beginPath();
    ctx.moveTo(-mountW / 2, mountH * 0.1);
    ctx.lineTo(mountW / 2, mountH * 0.1);
    ctx.lineTo(mountW * 0.36, mountH);
    ctx.lineTo(-mountW * 0.36, mountH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#141517";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#57595d";
    [-mountW * 0.26, mountW * 0.26].forEach((rx) => {
      ctx.beginPath();
      ctx.arc(rx, mountH * 0.55, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
    });

    // barrels
    const n = weapon.barrels;
    const totalW = size * (0.26 + n * 0.17);
    const gap = totalW / n;
    const bw = gap * 0.7;
    const startX = -totalW / 2 + gap / 2;

    for (let i = 0; i < n; i++) {
      const bx = startX + i * gap;
      const by = kick;
      roundRectPath(ctx, bx - bw / 2, by - barrelH, bw, barrelH, bw * 0.3);
      const grad = ctx.createLinearGradient(bx - bw / 2, 0, bx + bw / 2, 0);
      grad.addColorStop(0, shade(weapon.tierColor, -30));
      grad.addColorStop(0.5, weapon.tierColor);
      grad.addColorStop(1, shade(weapon.tierColor, -30));
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "#141517";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.fillRect(bx - bw * 0.12, by - barrelH + 3, bw * 0.16, barrelH - 8);

      const tipY = by - barrelH;
      if (weapon.tip === "cone") {
        ctx.fillStyle = "#141517";
        ctx.beginPath();
        ctx.moveTo(bx - bw * 0.65, tipY + bw * 0.5);
        ctx.lineTo(bx + bw * 0.65, tipY + bw * 0.5);
        ctx.lineTo(bx, tipY - bw * 0.55);
        ctx.closePath();
        ctx.fill();
      } else if (weapon.tip === "crystal") {
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = "#fff6c9";
        ctx.beginPath();
        ctx.moveTo(bx, tipY - bw * 0.85);
        ctx.lineTo(bx + bw * 0.5, tipY);
        ctx.lineTo(bx, tipY + bw * 0.35);
        ctx.lineTo(bx - bw * 0.5, tipY);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.fillStyle = "#141517";
        ctx.beginPath();
        ctx.ellipse(bx, tipY, bw / 2, bw * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();

    // muzzle flash
    if (s.elapsed >= 0 && s.elapsed < 90) {
      const flashAlpha = 1 - s.elapsed / 90;
      const mp = getMuzzlePoint();
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      const flash = ctx.createRadialGradient(mp.x, mp.y, 0, mp.x, mp.y, 20 + n * 4);
      flash.addColorStop(0, "#fff6d0");
      flash.addColorStop(1, "rgba(255,246,208,0)");
      ctx.fillStyle = flash;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, 20 + n * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Small helper turrets mounted beside the main cannon; fire together on a shared timer.
  function getTurretState(now, index) {
    const elapsed = now - turretFireStart;
    const active = elapsed >= 0 && elapsed < 120;
    const recoil = active ? Math.sin(Math.min(elapsed / 120, 1) * Math.PI) : 0;
    const idleBob = active ? 0 : Math.sin(now / 500 + index * 1.3) * 1.5;
    const size = 30;
    const gx = W / 2 + TURRET_OFFSETS[index];
    const gy = GROUND_Y + 26 - idleBob;
    const barrelH = size * 0.75;
    const kick = recoil * size * 0.18;
    return { elapsed, active, recoil, size, gx, gy, barrelH, kick };
  }

  function getTurretMuzzlePoint(index) {
    const s = getTurretState(performance.now(), index);
    return { x: s.gx, y: s.gy + s.kick - s.barrelH };
  }

  function drawTurret() {
    if (!save.turretCount || save.turretCount <= 0) return;
    for (let i = 0; i < save.turretCount; i++) drawSingleTurret(i);
  }

  function drawSingleTurret(index) {
    const s = getTurretState(performance.now(), index);
    const { gx, gy, size, kick, barrelH } = s;

    ctx.save();
    ctx.globalAlpha = 0.24;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(gx, GROUND_Y + 30, size * 0.55, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(gx, gy);

    const mountW = size * 0.9;
    const mountH = size * 0.4;
    ctx.fillStyle = "#3f4145";
    roundRectPath(ctx, -mountW / 2, 0, mountW, mountH, 4);
    ctx.fill();
    ctx.strokeStyle = "#141517";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const bw = size * 0.28;
    roundRectPath(ctx, -bw / 2, kick - barrelH, bw, barrelH, bw * 0.3);
    const grad = ctx.createLinearGradient(-bw / 2, 0, bw / 2, 0);
    grad.addColorStop(0, "#8a5a2b");
    grad.addColorStop(0.5, "#ffb347");
    grad.addColorStop(1, "#8a5a2b");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#141517";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    if (s.elapsed >= 0 && s.elapsed < 70) {
      const flashAlpha = 1 - s.elapsed / 70;
      const mp = getTurretMuzzlePoint(index);
      ctx.save();
      ctx.globalAlpha = flashAlpha;
      const flash = ctx.createRadialGradient(mp.x, mp.y, 0, mp.x, mp.y, 12);
      flash.addColorStop(0, "#fff0d0");
      flash.addColorStop(1, "rgba(255,240,208,0)");
      ctx.fillStyle = flash;
      ctx.beginPath();
      ctx.arc(mp.x, mp.y, 12, 0, Math.PI * 2);
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
        if (bl.isGuard) {
          b.startTime += GUARD_PUSHBACK;
          b.hitFlash = 6;
          spawnGuardParticles(bl.x, bl.y);
          showFloatingText("방어!", bl.x, bl.y, "#5cc8e0", true);
          sfxHit();
          shakeTime = Math.max(shakeTime, 10);
          shakeMag = Math.max(shakeMag, 7);
        } else {
          b.hp = Math.max(0, b.hp - bl.damage);
          b.hitFlash = 6;
          spawnHitParticles(bl.x, bl.y);
          showFloatingText(`-${bl.damage}`, bl.x, bl.y, "#ffffff", true);
          sfxHit();
          if (b.hp <= 0) destroyBuilding();
        }
        return false;
      }
      return true;
    });
  }

  function drawBullets() {
    bullets.forEach((bl) => {
      if (bl.isTurret) {
        const angle = Math.atan2(bl.vy, bl.vx);
        ctx.save();
        ctx.translate(bl.x, bl.y);
        ctx.rotate(angle);
        ctx.fillStyle = "rgba(255,178,71,0.5)";
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.lineTo(-11, -2.8);
        ctx.lineTo(-11, 2.8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffb347";
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-5, -3.5);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-5, 3.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#8a5a2b";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (bl.isGuard) {
        ctx.save();
        ctx.translate(bl.x, bl.y);
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, bl.size * 2.4);
        glow.addColorStop(0, "#eafbff");
        glow.addColorStop(0.55, bl.color);
        glow.addColorStop(1, "rgba(92,200,224,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, bl.size * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#eafbff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, bl.size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return;
      }
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
    drawTurret();
    drawBullets();
    drawShockwaves();
    drawParticles();
    drawFloatingTexts();
    ctx.restore();

    // vignette
    const vgn = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.75);
    vgn.addColorStop(0, "rgba(0,0,0,0)");
    vgn.addColorStop(1, "rgba(0,0,0,0.22)");
    ctx.fillStyle = vgn;
    ctx.fillRect(0, 0, W, H);
  }

  function loop() {
    const now = performance.now();
    const dt = lastFrameTime ? Math.min(now - lastFrameTime, 48) : 16;
    lastFrameTime = now;

    const active = session.phase === "falling" && session.building && !shopOpenTime;
    if (session.phase === "falling" && session.building) {
      const b = session.building;
      const t = Math.min(1, Math.max(0, (now - b.startTime) / b.duration));
      const eased = t * t; // gravity-like acceleration: slow start, fast finish
      b.y = b.startY + (b.targetY - b.startY) * eased;
      if (t >= 1) {
        crashBuilding();
      }
    }
    if (active && guardCooldownRemaining > 0) {
      guardCooldownRemaining = Math.max(0, guardCooldownRemaining - dt);
    }
    if (active && save.turretLevel > 0) {
      turretCooldownRemaining -= dt;
      if (turretCooldownRemaining <= 0) {
        fireTurret();
        turretCooldownRemaining = turretInterval(save.turretLevel);
      }
    }
    updateBullets(dt);
    updateParticles();
    updateShockwaves();
    updateGuardButton();
    render();
    requestAnimationFrame(loop);
  }

  function updateGuardButton() {
    const usable = session.phase === "falling" && !!session.building && guardCooldownRemaining <= 0;
    if (guardCooldownRemaining > 0) {
      guardBtn.disabled = true;
      guardLabelEl.textContent = `방어 (${Math.ceil(guardCooldownRemaining / 1000)})`;
    } else {
      guardBtn.disabled = !usable;
      guardLabelEl.textContent = "방어";
    }
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
    } else if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      e.preventDefault();
      useGuard();
    }
  });

  guardBtn.addEventListener("click", useGuard);

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
