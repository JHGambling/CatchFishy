document.addEventListener('DOMContentLoaded', () => {

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  let gamePhase = 'charging'; // 'charging' -> 'descending' -> 'returning'
  let chargeValue = 0;
  let chargeDirection = 1;
  let maxDepth = 0;

  let lineY = 0;
  let lineX = WIDTH / 2;

  let fish = [];
  let score = 0;

  let leftPressed = false;
  let rightPressed = false;

  // Haupt-Spielschleife
  function loop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    if (gamePhase === 'charging') {
      drawChargeBar();
      chargeValue += 2 * chargeDirection;
      if (chargeValue >= 100 || chargeValue <= 0) {
        chargeDirection *= -1;
        chargeValue = Math.max(0, Math.min(100, chargeValue));
      }
    }

    else if (gamePhase === 'descending') {
      lineY += 5;
      drawLine();
      drawFishes();

      if (lineY >= maxDepth) {
        gamePhase = 'returning';
      }
    }

    else if (gamePhase === 'returning') {
      if (leftPressed) lineX -= 4;
      if (rightPressed) lineX += 4;
      lineX = Math.max(0, Math.min(WIDTH, lineX));
      lineY -= 4;
      drawLine();
      drawFishes();
      checkCollisions();

      if (lineY <= 0) {
        overlay.innerText = `Zug beendet! Punkte: ${score} (SPACE für neuen Wurf)`;
        gamePhase = 'charging';
        resetFish();
      }
    }

    requestAnimationFrame(loop);
  }

  function drawChargeBar() {
    ctx.fillStyle = 'white';
    ctx.fillRect(50, HEIGHT / 2 - 20, 300, 40);
    ctx.fillStyle = 'green';
    ctx.fillRect(50, HEIGHT / 2 - 20, 3 * chargeValue, 40);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(50, HEIGHT / 2 - 20, 300, 40);
  }

  function drawLine() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(lineX, lineY);
    ctx.stroke();

    // Haken
    ctx.beginPath();
    ctx.arc(lineX, lineY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
  }

  function generateFish() {
    fish = [];
    for (let i = 0; i < 10; i++) {
      fish.push({
        x: Math.random() * WIDTH,
        y: Math.random() * maxDepth,
        caught: false
      });
    }
  }

// Bild vorbereiten
const fishImage = new Image();
fishImage.src = 'images/fish1.png';

function drawFishes() {
  for (let f of fish) {
    if (!f.caught) {
      ctx.drawImage(fishImage, f.x - 15, f.y - 10, 30, 20); // Position & Größe
    }
  }
}


  function checkCollisions() {
    for (let f of fish) {
      if (!f.caught && Math.hypot(f.x - lineX, f.y - lineY) < 12) {
        f.caught = true;
        score++;
      }
    }
  }

  function resetFish() {
    lineY = 0;
    lineX = WIDTH / 2;
    chargeValue = 0;
    chargeDirection = 1;
  }

  document.addEventListener('keydown', (e) => {
    if (gamePhase === 'charging' && e.code === 'Space') {
      maxDepth = 100 + 4 * chargeValue;
      overlay.innerText = '';
      generateFish();
      lineY = 0;
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
