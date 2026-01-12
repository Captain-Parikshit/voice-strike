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
  onGround: false,

  // Dash
  isDashing: false,
  dashSpeed: 12,
  dashDuration: 10,
  dashTimer: 0,
  dashCooldown: 30,
  dashCooldownTimer: 0,

  // Attacks
  isAttacking: false,
  attackType: null, // "punch" or "kick"
  attackTimer: 0,
  attackDuration: 10,
  attackCooldown: 15,
  attackCooldownTimer: 0

};


const gravity = 0.5;
const keys = {};

// Input handling

function getDashDirection() {
  let dx = 0;
  let dy = 0;

  if (keys["a"]) dx -= 1;
  if (keys["d"]) dx += 1;
  if (keys["w"]) dy -= 1;
  if (keys["s"]) dy += 1;

  if (dx === 0 && dy === 0) return null;

  const length = Math.hypot(dx, dy);
  return { x: dx / length, y: dy / length };
}


window.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

window.addEventListener("mousedown", (e) => {
  if (player.isAttacking || player.attackCooldownTimer > 0) return;

  if (e.button === 0) { // Left click
    startAttack("punch");
  }

  if (e.button === 2) { // Right click
    startAttack("kick");
  }
});

// Prevent right-click menu
window.addEventListener("contextmenu", (e) => e.preventDefault());

function startAttack(type) {
  player.isAttacking = true;
  player.attackType = type;
  player.attackTimer = player.attackDuration;
  player.attackCooldownTimer = player.attackCooldown;

  // Stop movement during attack
  player.vx = 0;
}

// Update
function update() {

  // Attack cooldown
if (player.attackCooldownTimer > 0) {
  player.attackCooldownTimer--;
}

// During attack
if (player.isAttacking) {
  player.attackTimer--;
  if (player.attackTimer <= 0) {
    player.isAttacking = false;
    player.attackType = null;
  }
}


  // Dash cooldown
  if (player.dashCooldownTimer > 0) {
    player.dashCooldownTimer--;
  }

  // Start dash
if (keys["shift"] && !player.isDashing && !player.isAttacking && player.dashCooldownTimer === 0) {

    const dir = getDashDirection();
    if (dir) {
      player.isDashing = true;
      player.dashTimer = player.dashDuration;
      player.vx = dir.x * player.dashSpeed;
      player.vy = dir.y * player.dashSpeed;
      player.dashCooldownTimer = player.dashCooldown;
    }
  }

  // During dash
  if (player.isDashing) {
    player.dashTimer--;
    if (player.dashTimer <= 0) {
      player.isDashing = false;
    }
  } else {
    // Normal movement
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
  }

  // Apply movement
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

  // Phoenix body
if (player.isAttacking) {
  ctx.fillStyle = player.attackType === "punch" ? "red" : "darkred";
} else if (player.isDashing) {
  ctx.fillStyle = "yellow";
} else {
  ctx.fillStyle = "orange";
}

ctx.fillRect(player.x, player.y, player.width, player.height);

}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

