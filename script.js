document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');

  let WIDTH = window.innerWidth;
  let HEIGHT = window.innerHeight;
  resizeCanvas();

  let gamePhase = 'charging';
  let chargeValue = 0;
  let chargeDirection = 1;
  let maxDepth = 0;
  let currentDepth = 0;

  const absoluteMaxDepth = 10000;

  let fish = [];
  let caughtFishes = [];
  let score = 0;
  let leftPressed = false;
  let rightPressed = false;
  let lineX = WIDTH / 2;

  let credits = 100;
  const costPerCast = 5;

  const fishImages = [];
  for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `images/fish/fish${i}.png`;
    fishImages.push(img);
  }

  // Shark
  const sharkImage = new Image();
  sharkImage.src = 'images/fish/shark.png';

  let shark = {
    active: false,
    x: 0,
    y: 0,
    speed: 0,
    targetX: 0,
    targetY: 0
  };

  window.addEventListener('resize', () => {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    resizeCanvas();
  });

  function resizeCanvas() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
  }

  function loop() {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    const topColor = `rgb(0, ${waterBrightness}, ${waterBrightness + 30})`;
    const bottomColor = `rgb(0, ${Math.max(10, waterBrightness - 40)}, ${Math.max(20, waterBrightness - 20)})`;
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);


    if (gamePhase === 'charging') {
      drawChargeBar();
      chargeValue += 4 * chargeDirection;
      if (chargeValue >= 100 || chargeValue <= 0) {
        chargeDirection *= -1;
        chargeValue = Math.max(0, Math.min(100, chargeValue));
      }
    }

    else if (gamePhase === 'descending') {
      currentDepth += HEIGHT * 0.01;
      if (currentDepth >= maxDepth) {
        currentDepth = maxDepth;
        gamePhase = 'returning';
      }
      updateFish();
      drawFishes();
      drawHook();
    }

    else if (gamePhase === 'returning') {
      if (leftPressed) lineX -= WIDTH * 0.01;
      if (rightPressed) lineX += WIDTH * 0.01;
      lineX = Math.max(0, Math.min(WIDTH, lineX));

      currentDepth -= HEIGHT * 0.005;
      if (currentDepth <= 0) {
        if (credits < costPerCast) {
          overlay.innerText = `Zug beendet! Keine Credits mehr. Spiel vorbei.`;
          gamePhase = 'gameover';
        } else {
          overlay.innerText = `Zug beendet! Punkte: ${score} | Credits: ${credits} (SPACE für neuen Wurf)`;
          gamePhase = 'charging';
          resetGame();
        }
      } else {
        updateFish();
        updateShark();
        drawFishes();
        drawHook();
        drawShark();
        checkCollisions();
        checkSharkSteal();
        maybeSpawnShark();
      }
    }

    drawDepthMeter();

    requestAnimationFrame(loop);
  }

  function drawChargeBar() {
    const barWidth = WIDTH * 0.4;
    const barHeight = HEIGHT * 0.05;
    const barX = (WIDTH - barWidth) / 2;
    const barY = (HEIGHT - barHeight) / 2;

    ctx.fillStyle = 'white';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = 'green';
    ctx.fillRect(barX, barY, barWidth * (chargeValue / 100), barHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    overlay.innerText = `SPACE zum Werfen! Credits: ${credits}`;
  }

  function drawFishes() {
    for (let f of fish) {
      if (!f.caught) {
        const screenY = (f.depth - currentDepth) + HEIGHT * 0.75;
        if (screenY > -40 && screenY < HEIGHT + 40) {
          const sizeW = WIDTH * f.scale;
          const sizeH = HEIGHT * f.scale * 0.8;
          ctx.drawImage(f.image, f.x - sizeW / 2, screenY - sizeH / 2, sizeW, sizeH);
        }
      }
    }
  }

  function drawHook() {
    const hookY = HEIGHT * 0.75;

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(lineX, hookY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lineX, hookY, WIDTH * 0.01, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();

    for (let i = 0; i < caughtFishes.length; i++) {
      const f = caughtFishes[i];
      const offset = i * HEIGHT * 0.05;
      const y = hookY + offset;

      const sizeW = WIDTH * f.scale;
      const sizeH = HEIGHT * f.scale * 0.8;
      ctx.drawImage(f.image, lineX - sizeW / 2, y - sizeH / 2, sizeW, sizeH);
    }
  }

  function drawDepthMeter() {
    const meterWidth = WIDTH * 0.03;
    const meterHeight = HEIGHT * 0.5;
    const meterX = WIDTH * 0.02;
    const meterY = HEIGHT * 0.25;

    const gradient = ctx.createLinearGradient(0, meterY, 0, meterY + meterHeight);
    gradient.addColorStop(0, '#66ccff');
    gradient.addColorStop(1, '#001f33');
    ctx.fillStyle = gradient;
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);

    const relativePos = currentDepth / absoluteMaxDepth;
    const markerHeight = meterHeight * 0.02;
    const markerY = meterY + relativePos * meterHeight - markerHeight / 2;

    ctx.fillStyle = 'yellow';
    ctx.fillRect(meterX, markerY, meterWidth, markerHeight);
  }

  function generateFish() {
    fish = [];
    const count = Math.floor(absoluteMaxDepth / 100) + 20;
    for (let i = 0; i < count; i++) {
      const rarityRoll = Math.random();
      let rarity, valueRange, scaleRange;
      if (rarityRoll < 0.05) {
        rarity = 'legendary';
        valueRange = [100, 150];
        scaleRange = [0.08, 0.1];
      } else if (rarityRoll < 0.15) {
        rarity = 'epic';
        valueRange = [50, 80];
        scaleRange = [0.06, 0.08];
      } else if (rarityRoll < 0.4) {
        rarity = 'rare';
        valueRange = [20, 40];
        scaleRange = [0.045, 0.06];
      } else {
        rarity = 'common';
        valueRange = [5, 15];
        scaleRange = [0.03, 0.045];
      }

      const randomImg = fishImages[Math.floor(Math.random() * fishImages.length)];
      const value = Math.floor(valueRange[0] + Math.random() * (valueRange[1] - valueRange[0]));
      const scale = scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);

      fish.push({
        x: Math.random() * WIDTH,
        depth: Math.random() * absoluteMaxDepth,
        caught: false,
        image: randomImg,
        value: value,
        rarity: rarity,
        scale: scale,
        driftOffset: Math.random() * 2 * Math.PI
      });
    }
  }

  function updateFish() {
    const hookY = HEIGHT * 0.75;

    for (let f of fish) {
      if (f.caught) continue;

      f.driftOffset += 0.02;
      f.x += Math.sin(f.driftOffset) * 0.5;

      const screenY = (f.depth - currentDepth) + hookY;
      const dist = Math.hypot(f.x - lineX, screenY - hookY);

      if (dist < WIDTH * 0.2) {
        const avoidStrength = f.value / 50;
        const angle = Math.atan2(screenY - hookY, f.x - lineX);
        f.x += Math.cos(angle) * avoidStrength * 4;
      }

      if (f.x < 0) f.x = 0;
      if (f.x > WIDTH) f.x = WIDTH;
    }
  }

  function checkCollisions() {
    const hookY = HEIGHT * 0.75;
    for (let f of fish) {
      if (!f.caught) {
        const screenY = (f.depth - currentDepth) + hookY;
        if (Math.hypot(f.x - lineX, screenY - hookY) < WIDTH * 0.02) {
          f.caught = true;
          caughtFishes.push(f);
          score++;
          credits += f.value;
          overlay.innerText = `Gefangen! ${f.rarity.toUpperCase()} (+${f.value} Credits). Gesamt: ${credits}`;
        }
      }
    }
  }

  function maybeSpawnShark() {
    if (!shark.active && Math.random() < 0.003) {
      shark.active = true;
      shark.x = Math.random() < 0.5 ? -WIDTH * 0.1 : WIDTH * 1.1;
      shark.y = HEIGHT * (0.75 + Math.random() * 0.1);
      shark.targetX = lineX;
      shark.targetY = HEIGHT * 0.75;
      shark.speed = WIDTH * 0.003;
    }
  }

  function updateShark() {
    if (!shark.active) return;
    const dx = shark.targetX - shark.x;
    const dy = shark.targetY - shark.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      shark.x += (dx / dist) * shark.speed;
      shark.y += (dy / dist) * shark.speed;
    }
  }

  function drawShark() {
    if (!shark.active) return;
    const sizeW = WIDTH * 0.15;
    const sizeH = HEIGHT * 0.1;
    ctx.drawImage(sharkImage, shark.x - sizeW / 2, shark.y - sizeH / 2, sizeW, sizeH);
  }

  function checkSharkSteal() {
    if (!shark.active) return;
    const hookY = HEIGHT * 0.75;
    if (Math.hypot(shark.x - lineX, shark.y - hookY) < WIDTH * 0.05) {
      if (caughtFishes.length > 0) {
        const stolen = caughtFishes.splice(0, 1)[0];
        credits -= Math.min(credits, stolen.value);
        overlay.innerText = `⚠️ Hai hat einen ${stolen.rarity.toUpperCase()} Fisch gestohlen (-${stolen.value} Credits)!`;
      } else {
        overlay.innerText = `⚠️ Hai ist leer ausgegangen.`;
      }
      shark.active = false;
    }
  }

  function resetGame() {
    chargeValue = 0;
    chargeDirection = 1;
    currentDepth = 0;
    lineX = WIDTH / 2;
    score = 0;
    caughtFishes = [];
    shark.active = false;
  }

  document.addEventListener('keydown', (e) => {
    if (gamePhase === 'charging' && e.code === 'Space') {
      if (credits < costPerCast) {
        overlay.innerText = 'Nicht genug Credits! Spiel vorbei.';
        return;
      }

      credits -= costPerCast;
      maxDepth = (chargeValue / 100) * absoluteMaxDepth;
      overlay.innerText = '';
      generateFish();
      currentDepth = 0;
      lineX = WIDTH / 2;
      gamePhase = 'descending';
    }

    if (gamePhase === 'returning') {
      if (e.code === 'ArrowLeft') leftPressed = true;
      if (e.code === 'ArrowRight') rightPressed = true;
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') leftPressed = false;
    if (e.code === 'ArrowRight') rightPressed = false;
  });

  loop();
});
