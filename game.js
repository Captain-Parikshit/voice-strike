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

  facing: 1, // 1 = right, -1 = left,

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
  attackCooldownTimer: 0,

  // Special: Go Away
goAwayActive: false,
goAwayTimer: 0,
goAwayDuration: 8,
goAwayCooldown: 120,
goAwayCooldownTimer: 0

};

const enemy = {
  x: 600,
  y: 420,
  width: 40,
  height: 60,
  vx: 0,
  vy: 0,
  health: 100,
  hitFlashTimer: 0
};
const projectiles = [];


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

  if (e.button === 0) {
    // Left click
    startAttack("punch");
  }

  if (e.button === 2) {
    // Right click
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

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "e") {
    if (
      !player.goAwayActive &&
      player.goAwayCooldownTimer === 0 &&
      !player.isAttacking &&
      !player.isDashing
    ) {
      activateGoAway();
    }
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "q") {
    castCrossFire();
  }
});


function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function getAttackHitbox() {
  const range = player.attackType === "kick" ? 50 : 35;

  return {
    x:
      player.facing === 1
        ? player.x + player.width
        : player.x - range,
    y: player.y + 10,
    width: range,
    height: player.height - 20
  };
}

function activateGoAway() {
  player.goAwayActive = true;
  player.goAwayTimer = player.goAwayDuration;
  player.goAwayCooldownTimer = player.goAwayCooldown;

  // Stop movement during blast
  player.vx = 0;
}

function castCrossFire() {
  const speed = 6;

  projectiles.push({
    x: player.facing === 1 ? player.x + player.width : player.x - 20,
    y: player.y + player.height / 2 - 10,
    width: 20,
    height: 20,
    vx: player.facing * speed,
    life: 300 // ~5 seconds at 60fps
  });
}


// Update
function update() {

// Go Away cooldown
if (player.goAwayCooldownTimer > 0) {
  player.goAwayCooldownTimer--;
}

// Go Away active
if (player.goAwayActive) {
  player.goAwayTimer--;

  const dx = enemy.x + enemy.width / 2 - (player.x + player.width / 2);
  const dy = enemy.y + enemy.height / 2 - (player.y + player.height / 2);
  const distance = Math.hypot(dx, dy);

  const blastRadius = 80;

  if (distance < blastRadius && enemy.health > 0) {
    // Damage
    enemy.health -= 20;
    enemy.hitFlashTimer = 8;

    // Knockback
    const nx = dx / distance;
    const ny = dy / distance;

    enemy.vx = nx * 6;
    enemy.vy = ny * 6;


    // Prevent multi-hit
    player.goAwayActive = false;
  }

  if (player.goAwayTimer <= 0) {
    player.goAwayActive = false;
  }
}


  if (player.isAttacking && enemy.health > 0) {
    const hitbox = getAttackHitbox();

    if (isColliding(hitbox, enemy)) {
      enemy.health -= player.attackType === "kick" ? 15 : 10;
      enemy.hitFlashTimer = 5;

      // Prevent multi-hit per attack
      player.isAttacking = false;
    }
  }

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
  if (
    keys["shift"] &&
    !player.isDashing &&
    !player.isAttacking &&
    player.dashCooldownTimer === 0
  ) {
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
    if (keys["a"]) {
      player.vx = -player.speed;
      player.facing = -1;
    } else if (keys["d"]) {
      player.vx = player.speed;
      player.facing = 1;
    } else {
      player.vx = 0;
    }

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
  if (enemy.hitFlashTimer > 0) {
    enemy.hitFlashTimer--;
  }

  // Enemy gravity
enemy.vy += gravity;

// Apply enemy movement
enemy.x += enemy.vx;
enemy.y += enemy.vy;

// Enemy ground collision
if (enemy.y + enemy.height >= canvas.height) {
  enemy.y = canvas.height - enemy.height;
  enemy.vy = 0;
}

// Slow down knockback over time (friction)
enemy.vx *= 0.9;

for (let i = projectiles.length - 1; i >= 0; i--) {
  const p = projectiles[i];

  p.x += p.vx;
  p.life--;

  // Hit enemy
  if (enemy.health > 0 && isColliding(p, enemy)) {
    enemy.health -= 25;
    enemy.hitFlashTimer = 8;
    projectiles.splice(i, 1);
    continue;
  }

  // Remove if expired
  if (p.life <= 0) {
    projectiles.splice(i, 1);
  }
}


}

// Draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Phoenix body
  if (player.isAttacking) {
    ctx.fillStyle = player.attackType === "punch" ? "red" : "darkred";
  } else if (player.isDashing) {
    ctx.fillStyle = "yellow";
  } else {
    ctx.fillStyle = "orange";
  }
  ctx.fillRect(player.x, player.y, player.width, player.height);

if (player.goAwayActive) {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(
    player.x + player.width / 2,
    player.y + player.height / 2,
    80,
    0,
    Math.PI * 2
  );
  ctx.stroke();
}


  // Enemy
  if (enemy.health > 0) {
    ctx.fillStyle = enemy.hitFlashTimer > 0 ? "white" : "blue";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  ctx.fillStyle = "crimson";
for (const p of projectiles) {
  ctx.fillRect(p.x, p.y, p.width, p.height);
}

}


// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
