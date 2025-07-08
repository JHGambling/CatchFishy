export class Player {
  constructor(canvas) {
    this.canvas = canvas;
    this.hookX = canvas.width / 2;
    this.hookY = canvas.height / 2;
    this.isMoving = false;
    this.direction = 0;
  }

  startMove(dir) {
    this.isMoving = true;
    this.direction = dir;
  }

  stopMove() {
    this.isMoving = false;
  }

  update() {
    if (this.isMoving) {
      this.hookX += this.direction * 5;
      this.hookX = Math.max(0, Math.min(this.canvas.width, this.hookX));
    }
  }

  draw(ctx) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 2, 0);
    ctx.lineTo(this.hookX, this.hookY);
    ctx.stroke();

    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.hookX, this.hookY, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}
