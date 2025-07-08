import { loadAssets } from './assets.js';
import { Background } from './background.js';
import { BubbleSystem } from './bubbles.js';
import { ObjectManager } from './objects.js';
import { Player } from './player.js';


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let depth = 0;
let phase = 'aim';
let aimValue = 0;
let aimDirection = 1;
let maxDepth = 1;
let returnSpeed = 0;
let roundActive = false;

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
    aimValue += 0.01 * aimDirection;
    if (aimValue > 1 || aimValue < 0) aimDirection *= -1;

    background.setDepth(0);
    background.draw();

    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 10, 200, 20);
    ctx.fillStyle = 'green';
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 10, 200 * aimValue, 20);
    ctx.fillStyle = 'black';
    ctx.fillText('Press SPACE to cast', canvas.width / 2 - 50, canvas.height / 2 + 40);
  }

  else if (phase === 'descend') {
    depth += 0.005;
    if (depth >= maxDepth) phase = 'ascend';

    background.setDepth(depth);
    background.draw();

    objects.spawn(depth);
    objects.update(1);
    objects.draw(ctx);

    player.hookY = canvas.height / 2 + depth * 200;
    player.update();
    player.draw(ctx);
  }

  else if (phase === 'ascend') {
    depth -= returnSpeed;
    if (depth <= 0) {
      depth = 0;
      phase = 'aim';
    }

    background.setDepth(depth);
    background.draw();

    objects.update(-2);
    objects.draw(ctx);

    player.hookY = canvas.height / 2 + depth * 200;
    player.update();
    player.draw(ctx);

    bubbles.addBubble(player.hookX, player.hookY);
    bubbles.update();
    bubbles.draw(ctx);
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
  if (phase === 'aim' && e.code === 'Space') {
    maxDepth = aimValue;
    returnSpeed = 0.01 + maxDepth * 0.02;
    depth = 0;
    phase = 'descend';
  }
  if (e.code === 'ArrowLeft') player.startMove(-1);
  if (e.code === 'ArrowRight') player.startMove(1);
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') player.stopMove();
});

init();
