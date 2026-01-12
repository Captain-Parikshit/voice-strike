const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Player (Phoenix)
const player = {
  x: 200,
  y: 400,
  width: 40,
  height: 60,
  speed: 4,
  vx: 0,
  vy: 0,
  onGround: false
};

const gravity = 0.5;
const keys = {};

// Input handling
window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Update
function update() {
  // Horizontal movement
  if (keys["a"]) player.vx = -player.speed;
  else if (keys["d"]) player.vx = player.speed;
  else player.vx = 0;

  // Jump
  if (keys["w"] && player.onGround) {
    player.vy = -10;
    player.onGround = false;
  }

  // Gravity
  player.vy += gravity;

  player.x += player.vx;
  player.y += player.vy;

  // Ground collision
  if (player.y + player.height >= canvas.height) {
    player.y = canvas.height - player.height;
    player.vy = 0;
    player.onGround = true;
  }
}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Phoenix body (temporary rectangle)
  ctx.fillStyle = "orange";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

console.log("2+2");