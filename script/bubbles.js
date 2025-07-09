import { images } from './assets.js';

export class BubbleSystem {
  constructor() { this.bubbles = []; }
  reset()     { this.bubbles = []; }
  addBubble(x,y) { this.bubbles.push({x,y,size:5+Math.random()*10,opacity:1}); }
  update() {
    this.bubbles.forEach(b => { b.y -= 1; b.opacity -= 0.003; });
    this.bubbles = this.bubbles.filter(b=>b.opacity>0);
  }
  draw(ctx) {
    this.bubbles.forEach(b => {
      ctx.globalAlpha = b.opacity;
      if (images.bubbles[0]) ctx.drawImage(images.bubbles[0],b.x-b.size/2,b.y-b.size/2,b.size,b.size);
      else {
        ctx.fillStyle = `rgba(255,255,255,${b.opacity})`;
        ctx.beginPath(); ctx.arc(b.x,b.y,b.size/2,0,2*Math.PI); ctx.fill();
      }
      ctx.globalAlpha = 1;
    });
  }
}
