document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

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

  function loop() {
    // Hintergrund wird abhängig von Tiefe heller
    let waterBrightness = Math.min(255, Math.max(30, 255 - Math.floor(currentDepth / 6)));
    ctx.fillStyle = `rgb(0, ${waterBrightness}, ${waterBrightness + 30})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gamePhase === 'charging') {
      drawChargeBar();
      chargeValue += 4 * chargeDirection; // SCHNELLER, schwierigeres Timing
      if (chargeValue >= 100 || chargeValue <= 0) {
        chargeDirection *= -1;
        chargeValue = Math.max(0, Math.min(100, chargeValue));
      }
    }

    else if (gamePhase === 'descending') {
      currentDepth += 8; // Schneller abwärts
      if (currentDepth >= maxDepth) {
        currentDepth = maxDepth;
        gamePhase = 'returning';
      }
      drawFishes();
      drawHook();
    }

    else if (gamePhase === 'returning') {
      if (leftPressed) lineX -= 4;
      if (rightPressed) lineX += 4;
      lineX = Math.max(0, Math.min(WIDTH, lineX));

      currentDepth -= 4;
      if (currentDepth <= 0) {
        overlay.innerText = `Zug beendet! Punkte: ${score} (SPACE für neuen Wurf)`;
        gamePhase = 'charging';
        resetGame();
      } else {
        drawFishes();
        drawHook();
        checkCollisions();
      }
    }

    requestAnimationFrame(loop);
  }

  function drawChargeBar() {
    ctx.fillStyle = 'white';
    ctx.fillRect(WIDTH / 2 - 150, HEIGHT / 2 - 20, 300, 40);
    ctx.fillStyle = 'green';
    ctx.fillRect(WIDTH / 2 - 150, HEIGHT / 2 - 20, 3 * chargeValue, 40);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(WIDTH / 2 - 150, HEIGHT / 2 - 20, 300, 40);
    overlay.innerText = 'SPACE zum Werfen im richtigen Moment!';
  }

  function drawFishes() {
    for (let f of fish) {
      if (!f.caught) {
        const screenY = (f.depth - currentDepth) + HEIGHT * 0.75; // Tiefer Spielbereich
        if (screenY > -40 && screenY < HEIGHT + 40) {
          ctx.drawImage(fishImage, f.x - 20, screenY - 15, 40, 30);
        }
      }
    }
  }

  function drawHook() {
    const hookY = HEIGHT * 0.75; // Tiefer Spielbereich
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(lineX, hookY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(lineX, hookY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  function generateFish() {
    fish = [];
    const count = Math.floor(maxDepth / 80) + 15;
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
        if (Math.hypot(f.x - lineX, screenY - hookY) < 16) {
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
      maxDepth = 2000 + 30 * chargeValue; // Viel größere Tiefe für längere Runden
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
