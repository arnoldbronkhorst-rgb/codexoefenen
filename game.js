const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const SCALE = 4;

ctx.imageSmoothingEnabled = false;

const palette = {
  skyTop: "#84d8ff",
  skyBottom: "#6bc7ff",
  cloud: "#f6fcff",
  hillBack: "#7fcf67",
  hillFront: "#5bbd54",
  grassTop: "#6ce45f",
  ground: "#c78746",
  groundShade: "#a36936",
  dirtDot: "#7f4f22",
  pipeBody: "#2fc162",
  pipeShade: "#1e934a",
  pipeCap: "#4add77",
  textDark: "#172455",
  textLight: "#ffffff"
};

const bird = {
  x: 96,
  y: GAME_HEIGHT / 2,
  radius: 16,
  velocity: 0,
  gravity: 0.42,
  jumpStrength: -7.2
};

const pipeConfig = {
  width: 70,
  gap: 170,
  speed: 2.8,
  spawnEvery: 110
};

let pipes = [];
let frame = 0;
let score = 0;
let highScore = 0;
let running = true;
let gameStarted = false;

function resetGame() {
  bird.y = GAME_HEIGHT / 2;
  bird.velocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  running = true;
  gameStarted = false;
}

function flap() {
  if (!running) return;
  gameStarted = true;
  bird.velocity = bird.jumpStrength;
}

function createPipe() {
  const margin = 90;
  const minTop = margin;
  const maxTop = GAME_HEIGHT - margin - pipeConfig.gap;
  const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);

  pipes.push({
    x: GAME_WIDTH,
    topHeight,
    passed: false
  });
}

function update() {
  if (!running || !gameStarted) return;

  frame += 1;

  if (frame % pipeConfig.spawnEvery === 0) {
    createPipe();
  }

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  for (const pipe of pipes) {
    pipe.x -= pipeConfig.speed;

    const inPipeX = bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeConfig.width;
    const hitTopPipe = bird.y - bird.radius < pipe.topHeight;
    const hitBottomPipe = bird.y + bird.radius > pipe.topHeight + pipeConfig.gap;

    if (inPipeX && (hitTopPipe || hitBottomPipe)) {
      running = false;
    }

    if (!pipe.passed && pipe.x + pipeConfig.width < bird.x - bird.radius) {
      pipe.passed = true;
      score += 1;
      highScore = Math.max(highScore, score);
    }
  }

  pipes = pipes.filter((pipe) => pipe.x + pipeConfig.width > -10);

  if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= GAME_HEIGHT) {
    running = false;
  }
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, palette.skyTop);
  gradient.addColorStop(1, palette.skyBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  const scrollBack = (frame * 0.22) % (GAME_WIDTH + 130);
  for (let i = -1; i < 4; i += 1) {
    const x = i * 170 - scrollBack;
    drawRect(x + 36, GAME_HEIGHT - 230, 84, 76, palette.hillBack);
    drawRect(x + 24, GAME_HEIGHT - 206, 108, 52, palette.hillBack);
    drawRect(x + 14, GAME_HEIGHT - 154, 128, 24, palette.hillBack);
  }

  const scrollFront = (frame * 0.4) % (GAME_WIDTH + 160);
  for (let i = -1; i < 4; i += 1) {
    const x = i * 188 - scrollFront;
    drawRect(x + 30, GAME_HEIGHT - 180, 100, 70, palette.hillFront);
    drawRect(x + 15, GAME_HEIGHT - 150, 130, 40, palette.hillFront);
  }

  const cloudOffset = (frame * 0.28) % (GAME_WIDTH + 120);
  for (let i = -1; i < 4; i += 1) {
    const x = i * 150 - cloudOffset;
    drawRect(x + 15, 72, 32, 16, palette.cloud);
    drawRect(x, 84, 64, 16, palette.cloud);
    drawRect(x + 22, 96, 24, 8, palette.cloud);
  }

  drawRect(0, GAME_HEIGHT - 66, GAME_WIDTH, 10, palette.grassTop);
  drawRect(0, GAME_HEIGHT - 56, GAME_WIDTH, 56, palette.ground);

  for (let x = 8; x < GAME_WIDTH; x += 28) {
    drawRect(x, GAME_HEIGHT - 45, 8, 8, palette.groundShade);
    drawRect(x + 12, GAME_HEIGHT - 22, 6, 6, palette.dirtDot);
  }
}

function drawBird() {
  const x = Math.round(bird.x);
  const y = Math.round(bird.y);
  const flapTilt = Math.max(-8, Math.min(8, bird.velocity * 2.5));

  drawRect(x - 16, y - 14, 30, 24, "#ffe066");
  drawRect(x - 18, y - 4, 10, 12, "#ffe066");
  drawRect(x - 8, y + 4, 18, 8, "#f6c941");

  drawRect(x - 2, y - 2 + flapTilt * 0.25, 18, 8, "#f1b93a");

  drawRect(x + 11, y - 8, 10, 8, "#f3a334");
  drawRect(x + 17, y - 6, 8, 4, "#fff2ab");

  drawRect(x + 3, y - 9, 4, 4, "#1c1c1c");
  drawRect(x + 4, y - 8, 2, 2, palette.textLight);
}

function drawPipe(x, topHeight) {
  const w = pipeConfig.width;
  const gapY = topHeight + pipeConfig.gap;

  drawRect(x, 0, w, topHeight, palette.pipeBody);
  drawRect(x + w - 12, 0, 12, topHeight, palette.pipeShade);

  drawRect(x - 6, topHeight - 16, w + 12, 16, palette.pipeCap);
  drawRect(x + w - 10, topHeight - 16, 10, 16, palette.pipeShade);

  drawRect(x, gapY, w, GAME_HEIGHT - gapY, palette.pipeBody);
  drawRect(x + w - 12, gapY, 12, GAME_HEIGHT - gapY, palette.pipeShade);

  drawRect(x - 6, gapY, w + 12, 16, palette.pipeCap);
  drawRect(x + w - 10, gapY, 10, 16, palette.pipeShade);
}

function drawPipes() {
  for (const pipe of pipes) {
    drawPipe(pipe.x, pipe.topHeight);
  }
}

function drawOutlinedText(text, x, y, size = 20, align = "left") {
  ctx.font = `800 ${size}px Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.lineWidth = Math.ceil(size / 7);
  ctx.strokeStyle = palette.textLight;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = palette.textDark;
  ctx.fillText(text, x, y);
}

function drawText() {
  drawOutlinedText(`Score ${score}`, 16, 38, 28);
  drawOutlinedText(`Best ${highScore}`, 16, 66, 20);

  if (!gameStarted) {
    drawOutlinedText("PRESS SPACE", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, 30, "center");
    drawOutlinedText("OR TAP TO START", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 16, 18, "center");
  } else if (!running) {
    drawOutlinedText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8, 42, "center");
    drawOutlinedText("KLIK OP OPNIEUW SPELEN", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 28, 16, "center");
  }

  ctx.textAlign = "start";
}

function render() {
  drawBackground();
  drawPipes();
  drawBird();
  drawText();
}

function loop() {
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

canvas.addEventListener("pointerdown", flap);
restartBtn.addEventListener("click", resetGame);

resetGame();
loop();
