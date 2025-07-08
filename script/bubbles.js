import { images } from './assets.js';

export class BubbleSystem {
  constructor() {
    this.bubbles = [];
  }

  addBubble(x, y) {
    this.bubbles.push({ x, y, size: Math.random() * 10 + 5, opacity: 1 });
  }

  update() {
    this.bubbles.forEach(b => {
      b.y -= 1;
      b.opacity -= 0.01;
    });
    this.bubbles = this.bubbles.filter(b => b.opacity > 0);
  }

  draw(ctx) {
    this.bubbles.forEach(b => {
      if (images.bubbles[0]) {
        ctx.globalAlpha = b.opacity;
        ctx.drawImage(images.bubbles[0], b.x - b.size / 2, b.y - b.size / 2, b.size, b.size);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = `rgba(255,255,255,${b.opacity})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}
