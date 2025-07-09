export class Background {
  constructor(ctx) {
    this.ctx = ctx;
  }

  draw(ctx, cameraY) {
    const height = ctx.canvas.height;
    const width = ctx.canvas.width;

    // Farbe abhängig von Tiefe
    const depth = Math.min(1, cameraY / 1000);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const topColor = `hsl(200, 100%, ${Math.min(85, 30 + depth * 55)}%)`;
    const bottomColor = `hsl(210, 100%, ${Math.max(10, 30 - depth * 20)}%)`;
    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Boden bei großer Tiefe
    if (depth > 0.9 && window.images?.seabed?.[0]) {
      ctx.drawImage(window.images.seabed[0], 0, height - 100, width, 100);
    }
  }
}
