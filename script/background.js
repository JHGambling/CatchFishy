import { images } from './assets.js';

export class Background {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.depth = 0;
  }

  setDepth(depth) {
    this.depth = depth;
  }

  draw() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    const topColor = `hsl(200, 100%, ${Math.min(85, 30 + this.depth * 55)}%)`;
    const bottomColor = `hsl(210, 100%, ${Math.max(10, 30 - this.depth * 20)}%)`;
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw seabed at max depth
    if (this.depth > 0.9 && images.seabed[0]) {
      this.ctx.drawImage(images.seabed[0], 0, this.canvas.height - 100, this.canvas.width, 100);
    }
  }
}
