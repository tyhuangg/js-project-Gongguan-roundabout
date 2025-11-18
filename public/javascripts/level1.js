// ================================
// Level 1 – 圓環 + 隨機出口 + 左上角地圖
// ================================

// ---- Phaser Config ----
let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: { preload, create, update },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let game = new Phaser.Game(config);

// ---- Game Objects ----
let player;
let keys;
let wallsGroup;
let goalSensor;
let minimap;
let miniPlayer;
let speed = 0;
let maxSpeed = 300;
let acceleration = 0.05;
let turnSpeed = 3;

let positionHistory = [];
let isColliding = false;
let isInvincible = false;

// ---- Level Data (資料驅動) ----
const LEVEL = {
  ring: { cx: 1250, cy: 1250, outerR: 1000, innerR: 700 },

  entrance: {
    x: 1180, y: 400, rotationDeg: 90
  },

  branches: [
    {
      id: "EAST",
      points: [
        [1800, 1250],
        [2000, 1250],
        [2200, 1300]
      ],
      candidateExit: true
    },
    {
      id: "WEST",
      points: [
        [700, 1250],
        [600, 1250],
        [500, 1250]
      ],
      candidateExit: true
    },
    {
      id: "NORTH",
      points: [
        [1250, 400],
        [1250, 300],
        [1250, 200]
      ],
      candidateExit: true
    },
    {
      id: "SOUTH",
      points: [
        [1250, 1900],
        [1250, 2000],
        [1250, 2100]
      ],
      candidateExit: true
    }
  ]
};

let chosenExit = null;
let circleMapSprite; 


// ===================
// Preload
// ===================
function preload() {
  this.load.image("circleMap", "/image/map/circle_map.png");
}



// ===================
// Create
// ===================
function create() {
  this.cameras.main.setBackgroundColor("#222222");

  // ✅ 左上角顯示縮小版地圖
  circleMapSprite = this.add.image(0, 0, "circleMap")
    .setOrigin(0, 0)
    .setScale(0.03)
    .setScrollFactor(0);  // 固定在左上角，不跟鏡頭動

// ✅ 確認渲染排序：把它放在最上層 HUD
  circleMapSprite.setDepth(1000);

  // ✅ 決定本局出口
  chosenExit = pickRandomExit();

  // ✅ 建立圓環牆壁
  wallsGroup = this.physics.add.staticGroup();
  createRingWalls(this);

  // ✅ 建立分支牆（每一條 polyline）
  LEVEL.branches.forEach(branch => {
    createBranchWalls(this, branch);
  });

  // ✅ 建立出口感應器（只有一個）
  createGoalSensor(this, chosenExit);

  // ✅ 玩家
  player = this.add.rectangle(
    LEVEL.entrance.x,
    LEVEL.entrance.y,
    80, 40,
    0x00ff00
  );
  this.physics.add.existing(player);
  player.rotation = Phaser.Math.DegToRad(LEVEL.entrance.rotationDeg);

  // ✅ 碰撞：牆壁
  this.physics.add.collider(player, wallsGroup, hitWall, null, this);

  // ✅ 碰撞：出口
  this.physics.add.overlap(player, goalSensor, reachExit, null, this);

  // ✅ Camera
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, 2500, 2500);
  this.physics.world.setBounds(0, 0, 2500, 2500);

  // ✅ 控制鍵
  keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN
  });

  // ✅ 小地圖
  minimap = this.add.graphics().setScrollFactor(0);
  drawMinimap(minimap);

  miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
}



// ===================
// Update
// ===================
function update() {
  // ---- 方向 ----
  if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

  // ---- 加速 ----
  let targetSpeed = keys.up.isDown
    ? maxSpeed
    : keys.down.isDown
      ? 0
      : speed * 0.95;

  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  // ---- 移動 ----
  player.body.setVelocity(
    Math.cos(player.rotation) * speed,
    Math.sin(player.rotation) * speed
  );

  // ---- 記錄位置（倒退用） ----
  positionHistory.push({
    x: player.x, y: player.y, rotation: player.rotation
  });
  if (positionHistory.length > 60) positionHistory.shift();

  // ---- 撞牆後恢復 ----
  let touching = player.body.touching.none === false || player.body.blocked.none === false;
  if (!touching) isColliding = false;

  // ---- 更新小地圖玩家點 ----
  updateMiniPlayer(player.x, player.y);
}



// ===================
// 小地圖邏輯
// ===================
function drawMinimap(g) {
  const { cx, cy, outerR, innerR } = LEVEL.ring;

  const scale = 0.08;
  const ox = 100, oy = 100;

  g.clear();
  g.lineStyle(2, 0xffffff);
  g.strokeCircle(ox, oy, outerR * scale);
  g.strokeCircle(ox, oy, innerR * scale);
}

function updateMiniPlayer(px, py) {
  const scale = 0.08;
  const ox = 100, oy = 100;
  const { cx, cy } = LEVEL.ring;

  miniPlayer.x = ox + (px - cx) * scale;
  miniPlayer.y = oy + (py - cy) * scale;
}



// ===================
// 建立圓環牆
// ===================
function createRingWalls(scene) {
  const { cx, cy, outerR, innerR } = LEVEL.ring;

  for (let angle = 0; angle < 360; angle += 3) {
    let rad = Phaser.Math.DegToRad(angle);

    let ox = cx + Math.cos(rad) * outerR;
    let oy = cy + Math.sin(rad) * outerR;

    let ix = cx + Math.cos(rad) * innerR;
    let iy = cy + Math.sin(rad) * innerR;

    let w1 = scene.add.rectangle(ox, oy, 40, 40, 0x888888);
    let w2 = scene.add.rectangle(ix, iy, 40, 40, 0x888888);
    wallsGroup.add(w1);
    wallsGroup.add(w2);
  }
}



// ===================
// 建立分支牆（沿 polyline 擺小方塊）
// ===================
function createBranchWalls(scene, branch) {
  const pts = branch.points;

  for (let i = 0; i < pts.length - 1; i++) {
    let [x1, y1] = pts[i];
    let [x2, y2] = pts[i + 1];

    let steps = 20;
    for (let t = 0; t <= 1; t += 1 / steps) {
      let x = Phaser.Math.Linear(x1, x2, t);
      let y = Phaser.Math.Linear(y1, y2, t);

      let w = scene.add.rectangle(x, y, 35, 35, 0x666666);
      wallsGroup.add(w);
    }
  }
}



// ===================
// 抽選唯一出口
// ===================
function pickRandomExit() {
  let candidates = LEVEL.branches.filter(b => b.candidateExit);
  let pick = Phaser.Math.RND.pick(candidates);
  return pick;
}



// ===================
// 出口感應器（Goal）
// ===================
function createGoalSensor(scene, branch) {
  let pts = branch.points;
  let last = pts[pts.length - 1];

  goalSensor = scene.add.rectangle(
    last[0], last[1], 150, 150, 0x00ffff, 0.2
  );
  scene.physics.add.existing(goalSensor);
  goalSensor.body.setAllowGravity(false);
  goalSensor.body.setImmovable(true);
  goalSensor.body.setSize(150, 150);
}



// ===================
// 過關邏輯
// ===================
function reachExit() {
  console.log("🎉 通關！出口是：" + chosenExit.id);
}



// ===================
// 撞牆邏輯
// ===================
function hitWall(player, wall) {
  if (isInvincible) return;

  isColliding = true;
  speed = 0;
  isInvincible = true;

  // 往回退
  let past = positionHistory[0];
  player.x = past.x;
  player.y = past.y;
  player.rotation = past.rotation;
  player.body.reset(past.x, past.y);

  // 閃爍效果
  player.scene.tweens.add({
    targets: player,
    alpha: 0,
    duration: 100,
    yoyo: true
  });

  // 無敵恢復
  player.scene.time.delayedCall(500, () => {
    isInvincible = false;
  });
}
