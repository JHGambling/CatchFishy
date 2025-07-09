import { loadAssets } from './assets.js';
import { Background } from './background.js';
import { BubbleSystem } from './bubbles.js';
import { ObjectManager } from './objects.js';
import { Player } from './player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Spielzustand
let phase = 'aim';
let aimValue = 0;
let aimDirection = 1;
let maxDepth = 1;
let cameraY = 0;
let returnSpeed = 0;

const background = new Background(ctx, canvas);
const bubbles = new BubbleSystem();
const objects = new ObjectManager(canvas);
const player = new Player(canvas);

async function init() {
  await loadAssets();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (phase === 'aim') {
    // Zielbalken bewegen
    aimValue += 0.01 * aimDirection;
    if (aimValue > 1 || aimValue < 0) aimDirection *= -1;

    background.draw(ctx, 0);

    // Zielbalken zeichnen
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 10, 200, 20);
    ctx.fillStyle = 'green';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 10, 200 * aimValue, 20);
    ctx.fillStyle = 'black';
    ctx.fillText('Press SPACE to cast', canvas.width / 2 - 50, canvas.height / 2 + 40);
  }

  else if (phase === 'descend') {
    cameraY += 3; // Geschwindigkeit des Sinkens

    if (cameraY >= maxDepth * 1000) {
      phase = 'ascend';
    }

    background.draw(ctx, cameraY);

    // Objekte bei "fixer Welt" beim Abtauchen nicht bewegen
    objects.spawn(cameraY / 1000);
    objects.draw(ctx);

    // Angel bewegt sich tiefer im Weltkoordinatensystem
    player.hookY = cameraY + canvas.height / 2;
    player.update();
    player.draw(ctx);
  }

  else if (phase === 'ascend') {
    cameraY -= returnSpeed;
    if (cameraY <= 0) {
      cameraY = 0;
      phase = 'aim';
    }

    background.draw(ctx, cameraY);

    // Objekte scrollen nach oben
    objects.update(-returnSpeed);
    objects.draw(ctx);

    player.hookY = cameraY + canvas.height / 2;
    player.update();
    player.draw(ctx);

    // Blasen beim Aufstieg
    bubbles.addBubble(player.hookX, player.hookY);
    bubbles.update();
    bubbles.draw(ctx);
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
  if (phase === 'aim' && e.code === 'Space') {
    maxDepth = aimValue;
    returnSpeed = 5 + maxDepth * 10;
    cameraY = 0;
    phase = 'descend';
  }
  if (e.code === 'ArrowLeft') player.startMove(-1);
  if (e.code === 'ArrowRight') player.startMove(1);
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.stopMove();
});

init();
