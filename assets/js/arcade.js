/* =========================================================
   আরকেড — স্পেস শুটার, বাইক রেসিং, ফিশিং গেম
   সবগুলো Canvas 2D দিয়ে বানানো, কীবোর্ড + টাচ/মাউস দুটোই সাপোর্ট করে
   ========================================================= */

const ARCADE_COLORS = {
  ink: "#16223d",
  paper: "#f3ecda",
  paper2: "#ece2c8",
  brass: "#a9803f",
  brass2: "#c9a15c",
  red: "#b23a2e",
  slate: "#5c6b7a",
  line: "#cdbf9c",
  white: "#fffdf7"
};

/* ---------- ১) স্পেস শুটার ---------- */
function initSpaceShooter(){
  const canvas = document.getElementById("spaceCanvas");
  const startBtn = document.getElementById("spaceStart");
  const status = document.getElementById("spaceStatus");
  if (!canvas || !startBtn || !status) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  let running = false, rafId = null;
  let ship, bullets, enemies, stars, score, lives, spawnTimer, tick;

  function reset(){
    ship = { x: W / 2, y: H - 40, w: 30, h: 26 };
    bullets = [];
    enemies = [];
    stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.4,
      s: Math.random() * 1.2 + 0.4
    }));
    score = 0;
    lives = 3;
    spawnTimer = 0;
    tick = 0;
  }

  function pointerToShip(clientX){
    const rect = canvas.getBoundingClientRect();
    const scale = W / rect.width;
    ship.x = Math.max(ship.w / 2, Math.min(W - ship.w / 2, (clientX - rect.left) * scale));
  }
  canvas.addEventListener("mousemove", (e) => { if (running) pointerToShip(e.clientX); });
  canvas.addEventListener("touchmove", (e) => {
    if (running && e.touches[0]) { pointerToShip(e.touches[0].clientX); e.preventDefault(); }
  }, { passive: false });

  function fire(){
    if (!running) return;
    if (bullets.length && tick - bullets[bullets.length - 1].born < 10) return;
    bullets.push({ x: ship.x, y: ship.y - ship.h, born: tick });
  }
  canvas.addEventListener("click", fire);
  canvas.addEventListener("touchstart", (e) => { fire(); e.preventDefault(); }, { passive: false });
  document.addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.code === "ArrowLeft") ship.x = Math.max(ship.w / 2, ship.x - 18);
    if (e.code === "ArrowRight") ship.x = Math.min(W - ship.w / 2, ship.x + 18);
    if (e.code === "Space"){ fire(); e.preventDefault(); }
  });

  function spawnEnemy(){
    const x = 24 + Math.random() * (W - 48);
    const speed = 1.1 + Math.min(2.2, score * 0.03);
    enemies.push({ x, y: -20, w: 26, h: 20, speed });
  }

  function endGame(){
    running = false;
    cancelAnimationFrame(rafId);
    status.innerHTML = `গেম ওভার! স্কোর: <b>${score}</b> — আবার খেলতে বাটনে চাপ দাও`;
    startBtn.textContent = "আবার খেলো";
  }

  function drawShip(){
    ctx.fillStyle = ARCADE_COLORS.brass2;
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y - ship.h / 2);
    ctx.lineTo(ship.x - ship.w / 2, ship.y + ship.h / 2);
    ctx.lineTo(ship.x + ship.w / 2, ship.y + ship.h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ARCADE_COLORS.paper;
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop(){
    tick++;
    ctx.fillStyle = ARCADE_COLORS.ink;
    ctx.fillRect(0, 0, W, H);

    stars.forEach(s => {
      s.y += s.s;
      if (s.y > H) s.y = 0;
      ctx.fillStyle = "rgba(243,236,218,.7)";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    spawnTimer++;
    if (spawnTimer > Math.max(28, 60 - score)) { spawnEnemy(); spawnTimer = 0; }

    bullets = bullets.filter(b => b.y > -10);
    bullets.forEach(b => {
      b.y -= 6;
      ctx.fillStyle = ARCADE_COLORS.red;
      ctx.fillRect(b.x - 2, b.y - 6, 4, 10);
    });

    enemies.forEach(en => { en.y += en.speed; });

    for (let i = enemies.length - 1; i >= 0; i--){
      const en = enemies[i];
      if (en.y > H + 20){ enemies.splice(i, 1); continue; }
      for (let j = bullets.length - 1; j >= 0; j--){
        const b = bullets[j];
        if (Math.abs(b.x - en.x) < en.w / 2 && Math.abs(b.y - en.y) < en.h / 2){
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          score++;
          break;
        }
      }
    }
    for (let i = enemies.length - 1; i >= 0; i--){
      const en = enemies[i];
      if (!en) continue;
      if (Math.abs(en.x - ship.x) < (en.w + ship.w) / 2.4 && Math.abs(en.y - ship.y) < (en.h + ship.h) / 2.4){
        enemies.splice(i, 1);
        lives--;
        if (lives <= 0){ endGame(); return; }
      }
    }

    enemies.forEach(en => {
      ctx.fillStyle = ARCADE_COLORS.red;
      ctx.beginPath();
      ctx.arc(en.x, en.y, en.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = ARCADE_COLORS.ink;
      ctx.beginPath();
      ctx.arc(en.x, en.y, en.w / 4, 0, Math.PI * 2);
      ctx.fill();
    });

    drawShip();

    status.innerHTML = `স্কোর: <b>${score}</b> · লাইফ: <b>${lives}</b>`;
    if (running) rafId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener("click", () => {
    reset();
    running = true;
    startBtn.textContent = "শুরু হয়েছে";
    cancelAnimationFrame(rafId);
    loop();
  });

  reset();
  ctx.fillStyle = ARCADE_COLORS.ink;
  ctx.fillRect(0, 0, W, H);
}

/* ---------- ২) বাইক রেসিং ---------- */
function initBikeRacing(){
  const canvas = document.getElementById("bikeCanvas");
  const startBtn = document.getElementById("bikeStart");
  const status = document.getElementById("bikeStatus");
  if (!canvas || !startBtn || !status) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const LANES = [W * 0.28, W * 0.5, W * 0.72];

  let running = false, rafId = null;
  let lane, bikeY, obstacles, score, speed, spawnTimer, roadOffset, tick;

  function reset(){
    lane = 1;
    bikeY = H - 60;
    obstacles = [];
    score = 0;
    speed = 3;
    spawnTimer = 0;
    roadOffset = 0;
    tick = 0;
  }

  function moveLane(dir){
    if (!running) return;
    lane = Math.max(0, Math.min(2, lane + dir));
  }
  document.addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.code === "ArrowLeft") moveLane(-1);
    if (e.code === "ArrowRight") moveLane(1);
  });
  function handlePointer(clientX){
    const rect = canvas.getBoundingClientRect();
    const relX = clientX - rect.left;
    moveLane(relX < rect.width / 2 ? -1 : 1);
  }
  canvas.addEventListener("click", (e) => handlePointer(e.clientX));
  canvas.addEventListener("touchstart", (e) => {
    if (e.touches[0]) handlePointer(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });

  function spawnObstacle(){
    const laneIdx = Math.floor(Math.random() * 3);
    obstacles.push({ lane: laneIdx, y: -30, w: 30, h: 44 });
  }

  function endGame(){
    running = false;
    cancelAnimationFrame(rafId);
    status.innerHTML = `ক্র্যাশ! স্কোর: <b>${score}</b> — আবার খেলতে বাটনে চাপ দাও`;
    startBtn.textContent = "আবার খেলো";
  }

  function drawRoad(){
    ctx.fillStyle = "#2b2f36";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = ARCADE_COLORS.paper2;
    ctx.fillRect(W * 0.14, 0, W * 0.72, H);
    ctx.fillStyle = "#2b2f36";
    ctx.fillRect(W * 0.14 - 6, 0, 6, H);
    ctx.fillRect(W * 0.86, 0, 6, H);

    ctx.strokeStyle = ARCADE_COLORS.white;
    ctx.lineWidth = 3;
    [1, 2].forEach(i => {
      const x = W * 0.14 + (W * 0.72 / 3) * i;
      ctx.setLineDash([16, 18]);
      ctx.lineDashOffset = -roadOffset;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  function drawBike(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x - 12, y - 20, 24, 40);
    ctx.fillStyle = ARCADE_COLORS.ink;
    ctx.beginPath();
    ctx.arc(x - 9, y + 20, 6, 0, Math.PI * 2);
    ctx.arc(x + 9, y + 20, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  function loop(){
    tick++;
    roadOffset = (roadOffset + speed) % 34;
    drawRoad();

    speed = Math.min(9, 3 + score * 0.04);
    spawnTimer++;
    if (spawnTimer > Math.max(28, 55 - score)) { spawnObstacle(); spawnTimer = 0; }

    for (let i = obstacles.length - 1; i >= 0; i--){
      const ob = obstacles[i];
      ob.y += speed;
      if (ob.y > H + 40){ obstacles.splice(i, 1); score++; continue; }
      const obX = LANES[ob.lane];
      if (ob.lane === lane && Math.abs(ob.y - bikeY) < 34){
        endGame();
        return;
      }
      drawBike(obX, ob.y, ARCADE_COLORS.red);
    }

    drawBike(LANES[lane], bikeY, ARCADE_COLORS.brass2);

    status.innerHTML = `স্কোর: <b>${score}</b> · স্পিড: <b>${speed.toFixed(1)}x</b>`;
    if (running) rafId = requestAnimationFrame(loop);
  }

  startBtn.addEventListener("click", () => {
    reset();
    running = true;
    startBtn.textContent = "শুরু হয়েছে";
    cancelAnimationFrame(rafId);
    loop();
  });

  reset();
  drawRoad();
}

/* ---------- ৩) ফিশিং গেম ---------- */
function initFishingGame(){
  const canvas = document.getElementById("fishCanvas");
  const startBtn = document.getElementById("fishStart");
  const status = document.getElementById("fishStatus");
  if (!canvas || !startBtn || !status) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const barY = 70, barX = 30, barW = W - 60, barH = 18;

  let running = false, rafId = null;
  let markerX, dir, zoneStart, zoneW, score, misses, speed, fishBob, tick;

  function newZone(){
    zoneW = Math.max(34, barW * 0.28 - score * 4);
    zoneStart = barX + Math.random() * (barW - zoneW);
  }

  function reset(){
    markerX = barX;
    dir = 1;
    score = 0;
    misses = 0;
    speed = 3;
    fishBob = 0;
    tick = 0;
    newZone();
  }

  function attemptCatch(){
    if (!running) return;
    const inZone = markerX >= zoneStart && markerX <= zoneStart + zoneW;
    if (inZone){
      score++;
      speed = Math.min(9, 3 + score * 0.35);
      newZone();
      status.innerHTML = `🐟 ধরা পড়েছে! স্কোর: <b>${score}</b> · মিস: <b>${misses}</b>`;
    } else {
      misses++;
      status.innerHTML = `❌ মিস! স্কোর: <b>${score}</b> · মিস: <b>${misses}</b>`;
      if (misses >= 3){ endGame(); }
    }
  }

  startBtn.addEventListener("click", () => {
    if (!running){
      reset();
      running = true;
      startBtn.textContent = "ধরো (স্পেস)";
      cancelAnimationFrame(rafId);
      loop();
    } else {
      attemptCatch();
    }
  });
  canvas.addEventListener("click", attemptCatch);
  canvas.addEventListener("touchstart", (e) => { attemptCatch(); e.preventDefault(); }, { passive: false });
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && running){ attemptCatch(); e.preventDefault(); }
  });

  function endGame(){
    running = false;
    cancelAnimationFrame(rafId);
    status.innerHTML = `শেষ! মোট ধরা পড়েছে: <b>${score}</b> টা মাছ — আবার খেলতে বাটনে চাপ দাও`;
    startBtn.textContent = "আবার খেলো";
  }

  function loop(){
    tick++;
    ctx.fillStyle = "#1c3a52";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    for (let i = 0; i < 4; i++){
      ctx.fillRect(0, 140 + i * 60, W, 2);
    }

    // timing bar
    ctx.fillStyle = ARCADE_COLORS.paper2;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "#4caf6a";
    ctx.fillRect(zoneStart, barY, zoneW, barH);
    ctx.strokeStyle = ARCADE_COLORS.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barW, barH);

    markerX += dir * speed;
    if (markerX > barX + barW){ markerX = barX + barW; dir = -1; }
    if (markerX < barX){ markerX = barX; dir = 1; }
    ctx.fillStyle = ARCADE_COLORS.red;
    ctx.fillRect(markerX - 2, barY - 6, 4, barH + 12);

    // fishing line + hook
    fishBob += 0.06;
    const hookX = W / 2, hookY = 150 + Math.sin(fishBob) * 8;
    ctx.strokeStyle = ARCADE_COLORS.white;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(hookX, barY + barH);
    ctx.lineTo(hookX, hookY);
    ctx.stroke();
    ctx.fillStyle = ARCADE_COLORS.brass2;
    ctx.beginPath();
    ctx.arc(hookX, hookY, 5, 0, Math.PI * 2);
    ctx.fill();

    // decorative fish swimming below
    for (let i = 0; i < 3; i++){
      const fx = ((tick * 1.2 + i * 130) % (W + 60)) - 30;
      const fy = 260 + i * 45 + Math.sin(fishBob + i) * 6;
      ctx.fillStyle = "rgba(243,236,218,.55)";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(fx - 14, fy);
      ctx.lineTo(fx - 22, fy - 6);
      ctx.lineTo(fx - 22, fy + 6);
      ctx.closePath();
      ctx.fill();
    }

    if (running) rafId = requestAnimationFrame(loop);
  }

  reset();
  ctx.fillStyle = "#1c3a52";
  ctx.fillRect(0, 0, W, H);
}

document.addEventListener("DOMContentLoaded", () => {
  initSpaceShooter();
  initBikeRacing();
  initFishingGame();
});
