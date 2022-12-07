console.log("Javascript point and shoot game");

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const CANVAS_WIDTH = (canvas.width = window.innerWidth);
const CANVAS_HEIGHT = (canvas.height = window.innerHeight);
const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext("2d", {
  willReadFrequently: true,
});
const collisionCanvas_WIDTH = (collisionCanvas.width = window.innerWidth);
const collisionCanvas_HEIGHT = (collisionCanvas.height = window.innerHeight);
let gameSpeed = 15;
let score = 0;
let missed = 0;
let gameOver = false;
ctx.font = "50px impact";

let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = [];
class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = Math.random() * 12 + 3;
    this.directionY = Math.random() * 6 - 3;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src = "../raven.png";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 50 + 40;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
    this.hasTrail = Math.random() > 0.5;
  }
  update(deltaTime) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) {
      this.markedForDeletion = true;
      missed++;
    }
    this.timeSinceFlap += deltaTime;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
      if (this.hasTrail) {
        for (let i = 0; i < 10; i++) {
          particles.push(new Particle(this.x, this.y, this.width, this.color));
        }
      }
    }
    if (missed === 50) gameOver = true;
  }
  draw() {
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, 50, 0, 2 * Math.PI);
    // ctx.stroke();
    collisionCtx.fillStyle = this.color;
    collisionCtx.fillRect(this.x - 10, this.y - 10, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.spriteWidth * this.frame,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let explosions = [];
class Explosion {
  constructor(x, y, width, height) {
    this.image = new Image();
    this.image.src = "../boom.png";
    this.spriteWidth = 200;
    this.spriteHeight = 179;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src = "./boom.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 150;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

let particles = [];
class Particle {
  constructor(x, y, size, color) {
    this.size = size;
    this.x = x + this.size / 2 + Math.random() * 50 - 25;
    this.y = y + this.size / 3 + Math.random() * 50 - 25;
    this.radius = (Math.random() * this.size) / 10;
    this.maxRadius = Math.random() * 20 + 20;
    this.markedForDeletion = false;
    this.speedX = Math.random() * 1 + 0.5;
    this.color = color;
  }
  update() {
    this.x += this.speedX;
    this.radius += 0.5;
    if (this.radius > this.maxRadius - 10) this.markedForDeletion = true;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = 1 - this.radius / this.maxRadius;
    ctx.beginPath();
    ctx.fillStyle = "darkgrey";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Score: " + score, 55, 80);
  ctx.fillStyle = "white";
  ctx.fillText("Score: " + score, 50, 75);
}

function drawMissedScore() {
  ctx.fillStyle = "black";
  ctx.fillText("Missed: " + missed, 55, 155);
  ctx.fillStyle = "white";
  ctx.fillText("Missed: " + missed, 50, 150);
}

function drawGameOver() {
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.fillText(
    "GAME OVER, your score is: " + score,
    canvas.width / 2 + 2,
    canvas.height / 2 + 1
  );
  ctx.fillStyle = "black";
  ctx.fillText(
    "GAME OVER, your score is: " + score,
    canvas.width / 2,
    canvas.height / 2
  );
}

window.addEventListener("click", (e) => {
  const detectcPixelColor = collisionCtx.getImageData(
    e.offsetX,
    e.offsetY,
    1,
    1
  );
  let pixelColors = detectcPixelColor.data;
  // let missedHit = [];
  ravens.forEach((raven) => {
    if (
      raven.randomColors[0] === pixelColors[0] &&
      raven.randomColors[1] === pixelColors[1] &&
      raven.randomColors[2] === pixelColors[2]
    ) {
      raven.markedForDeletion = true;
      score++;
      explosions.push(
        new Explosion(raven.x, raven.y, raven.width, raven.height)
      );
      // missedHit.push(false)
    } else {
      // missedHit.push(true);
    }
  });
  // if(!missedHit.includes(false)) missed++;
  // missedHit = [];
});

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
  let deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  timeToNextRaven += deltaTime;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => a.width - b.width);
  }
  [...particles, ...ravens, ...explosions].forEach((object) =>
    object.update(deltaTime)
  );
  [...particles, ...ravens, ...explosions].forEach((object) => object.draw());
  ravens = ravens.filter((raven) => !raven.markedForDeletion);
  explosions = explosions.filter((explosion) => !explosion.markedForDeletion);
  particles = particles.filter((particle) => !particle.markedForDeletion);
  drawScore();
  drawMissedScore();
  if (!gameOver) {
    requestAnimationFrame(animate);
  } else {
    drawGameOver();
  }
}

animate(0);
