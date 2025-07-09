document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');

  // Dynamische Größe
  let WIDTH = window.innerWidth;
  let HEIGHT = window.innerHeight;
  resizeCanvas();

  // Spielzustände
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

  const fishImage = new Image();
  fishImage.src = 'images/fish1.png';

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
    drawBackground();

    if (gamePhase === 'charging') {
      drawChargeBar();
      updateCharge();
    }
    else if (gamePhase === 'descending') {
      updateDescending();
      drawFishes();
      drawHook();
    }
    else if (gamePhase === 'returning') {
      handleInput();
      updateReturning();
      drawFishes();
      drawHook();
      checkCollisions();
    }

    requestAnimationFrame(loop);
  }

  // Hintergrund abhängig von Tiefe
  function drawBackground() {
    const brightness = Math.min(255, Math.max(30, 255 - Math.floor(currentDepth / 6)));
    ctx.fillStyle = `rgb(0, ${brightness}, ${brightness + 30})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function updateCharge() {
    chargeValue += 4 * chargeDirection;
    if (chargeValue >= 100 || chargeValue <= 0) {
      chargeDirection *= -1;
      chargeValue = Math.max(0, Math.min(100, chargeValue));
    }
  }

  function updateDescending() {
    currentDepth += HEIGHT * 0.01;
    if (currentDepth >= maxDepth) {
      currentDepth = maxDepth;
      gamePhase = 'returning';
    }
  }

  function updateReturning() {
    currentDepth -= HEIGHT * 0.005;
    if (currentDepth <= 0) {
      currentDepth = 0;
      overlay.innerText = `Zug beendet! Punkte: ${score} (SPACE für neuen Wurf)`;
      gamePhase = 'charging';
      resetGame();
    }
  }

  function handleInput() {
    if (leftPressed) lineX -= WIDTH * 0.01;
    if (rightPressed) lineX += WIDTH * 0.01;
    lineX = Math.max(0, Math.min(WIDTH, lineX));
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

    overlay.innerText = 'SPACE zum Werfen im richtigen Moment!';
  }

  function drawFishes() {
    for (let f of fish) {
      if (!f.caught) {
        const screenY = (f.depth - currentDepth) + HEIGHT * 0.75;
        if (screenY > -40 && screenY < HEIGHT + 40) {
          ctx.drawImage(fishImage, f.x - WIDTH * 0.025, screenY - HEIGHT * 0.02, WIDTH * 0.05, HEIGHT * 0.04);
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
      fish.push({
        x: Math.random() * WIDTH,
        depth: Math.random() * maxDepth,
        caught: false
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
