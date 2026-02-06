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

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, "#79c7ff");
  gradient.addColorStop(1, "#d8f0ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "#b8e3a5";
  ctx.fillRect(0, GAME_HEIGHT - 56, GAME_WIDTH, 56);
}

function drawBird() {
  ctx.fillStyle = "#ffdf4d";
  ctx.beginPath();
  ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f6a400";
  ctx.beginPath();
  ctx.moveTo(bird.x + 7, bird.y);
  ctx.lineTo(bird.x + 26, bird.y - 4);
  ctx.lineTo(bird.x + 7, bird.y + 7);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(bird.x + 5, bird.y - 5, 3.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  ctx.fillStyle = "#2da457";
  for (const pipe of pipes) {
    ctx.fillRect(pipe.x, 0, pipeConfig.width, pipe.topHeight);
    ctx.fillRect(
      pipe.x,
      pipe.topHeight + pipeConfig.gap,
      pipeConfig.width,
      GAME_HEIGHT - (pipe.topHeight + pipeConfig.gap)
    );

    ctx.fillStyle = "#228047";
    ctx.fillRect(pipe.x - 4, pipe.topHeight - 14, pipeConfig.width + 8, 14);
    ctx.fillRect(pipe.x - 4, pipe.topHeight + pipeConfig.gap, pipeConfig.width + 8, 14);
    ctx.fillStyle = "#2da457";
  }
}

function drawText() {
  ctx.fillStyle = "#0c3754";
  ctx.font = "700 28px Inter, sans-serif";
  ctx.fillText(`Score: ${score}`, 18, 40);

  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillText(`High score: ${highScore}`, 18, 68);

  if (!gameStarted) {
    ctx.fillStyle = "#0c3754";
    ctx.font = "700 26px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Klik of druk op spatie", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
    ctx.font = "600 20px Inter, sans-serif";
    ctx.fillText("om te starten", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 12);
    ctx.textAlign = "start";
  } else if (!running) {
    ctx.fillStyle = "#0c3754";
    ctx.font = "800 38px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 8);
    ctx.font = "600 22px Inter, sans-serif";
    ctx.fillText("Druk op opnieuw spelen", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 28);
    ctx.textAlign = "start";
  }
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
