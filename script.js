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

  let fish = [];
  let score = 0;
  let leftPressed = false;
  let rightPressed = false;
  let lineX = WIDTH / 2;

  // Casino-System
  let credits = 100;
  const costPerCast = 5;

  // 🎣 Fischbilder laden
  const fishImages = [];
  for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `images/fish/fish${i}.png`;
    fishImages.push(img);
  }

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
    let waterBrightness = Math.min(255, Math.max(30, 255 - Math.floor(currentDepth / 6)));
    ctx.fillStyle = `rgb(0, ${waterBrightness}, ${waterBrightness + 30})`;
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
        drawFishes();
        drawHook();
        checkCollisions();
      }
    }

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
          ctx.drawImage(f.image, f.x - WIDTH * 0.025, screenY - HEIGHT * 0.02, WIDTH * 0.05, HEIGHT * 0.04);
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
  }

  function generateFish() {
    fish = [];
    const count = Math.floor(maxDepth / 100) + 20;
    for (let i = 0; i < count; i++) {
      const randomImg = fishImages[Math.floor(Math.random() * fishImages.length)];
      fish.push({
        x: Math.random() * WIDTH,
        depth: Math.random() * maxDepth,
        caught: false,
        image: randomImg
      });
    }
  }

  function checkCollisions() {
    const hookY = HEIGHT * 0.75;
    for (let f of fish) {
      if (!f.caught) {
        const screenY = (f.depth - currentDepth) + hookY;
        if (Math.hypot(f.x - lineX, screenY - hookY) < WIDTH * 0.02) {
          f.caught = true;
          score++;
          const winAmount = Math.floor(10 + Math.random() * 40);
          credits += winAmount;
          overlay.innerText = `Gefangen! +${winAmount} Credits. Gesamt: ${credits}`;
        }
      }
    }
  }

  function resetGame() {
    chargeValue = 0;
    chargeDirection = 1;
    currentDepth = 0;
    lineX = WIDTH / 2;
    score = 0;
  }

  document.addEventListener('keydown', (e) => {
    if (gamePhase === 'charging' && e.code === 'Space') {
      if (credits < costPerCast) {
        overlay.innerText = 'Nicht genug Credits! Spiel vorbei.';
        return;
      }

      credits -= costPerCast;
      maxDepth = HEIGHT * 4 + 30 * chargeValue;
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
