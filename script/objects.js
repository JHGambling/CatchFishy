import { images } from './assets.js';

export class GameObject {
  constructor(type, image, x, y) {
    this.type = type;
    this.image = image;
    this.x = x;
    this.y = y;
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x - 20, this.y - 20, 40, 40);
  }
}

export class ObjectManager {
  constructor(canvas) {
    this.objects = [];
    this.canvas = canvas;
  }

  spawn(depth) {
    // Spawn more at greater depth
    if (Math.random() < 0.02 + 0.1 * depth) {
      const img = images.fish[Math.floor(Math.random() * images.fish.length)];
      this.objects.push(new GameObject('fish', img, Math.random() * this.canvas.width, Math.random() * this.canvas.height));
    }

    if (Math.random() < 0.005) {
      const img = images.gems[Math.floor(Math.random() * images.gems.length)];
      this.objects.push(new GameObject('gem', img, Math.random() * this.canvas.width, Math.random() * this.canvas.height));
    }

    if (depth > 0.8 && Math.random() < 0.01) {
      const img = images.plants[Math.floor(Math.random() * images.plants.length)];
      this.objects.push(new GameObject('plant', img, Math.random() * this.canvas.width, this.canvas.height - 80));
    }
  }

  update(dy) {
    this.objects.forEach(o => o.y += dy);
    this.objects = this.objects.filter(o => o.y > -50 && o.y < this.canvas.height + 50);
  }

  draw(ctx) {
    this.objects.forEach(o => o.draw(ctx));
  }
}
