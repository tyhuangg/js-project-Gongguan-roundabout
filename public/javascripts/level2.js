// ======================================================
// Level 2 － 正交路口模式（Orthogonal Intersection）
// ======================================================

let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade", arcade: { debug: false }},
  scene: { preload, create, update },
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
};

let game = new Phaser.Game(config);

// ----- Map 設定 -----
let MAP_SIZE = 4096;       // 正交路口比較大
const MAP_SCALE = 0.25;
let WORLD_SIZE = MAP_SIZE * MAP_SCALE;

let player, keys, miniPlayer;
let speed = 0, maxSpeed = 150, acceleration = 0.05, turnSpeed = 3;

// Pixel collision
let maskCanvas, maskCtx;

// ----- 紅綠燈 -----
let lightTimer = 0;
let isRedLight = true;   // 初始先設紅燈
const RED_DURATION = 6000;  // 紅燈 6 秒
const GREEN_DURATION = 3000; // 綠燈 3 秒

// 玩家出生點
let START_X = 2000;
let START_Y = 3600;

// ======================================================
// Preload
// ======================================================
function preload() {
  this.load.image("colorMap2", "/image/map/Orthogonal_map.png");
  this.load.image("mask2", "/image/map/Orthogonal_map_WB.png");

  this.load.image("arrow", "/image/ui/Arrow.png");
}


// ======================================================
// Create
// ======================================================
function create() {

  this.cameras.main.setBackgroundColor("#000000");

  // 取得黑白遮罩
  const maskImg = this.textures.get("mask2").getSourceImage();
  MAP_SIZE = maskImg.width;
  WORLD_SIZE = MAP_SIZE * MAP_SCALE;

  maskCanvas = document.createElement("canvas");
  maskCanvas.width = MAP_SIZE;
  maskCanvas.height = MAP_SIZE;
  maskCtx = maskCanvas.getContext("2d");
  maskCtx.drawImage(maskImg, 0, 0);

  // 主地圖（彩色）
  this.add.image(0, 0, "colorMap2")
    .setOrigin(0, 0)
    .setScale(MAP_SCALE)
    .setDepth(-10);

  // 小地圖
  this.add.image(0, 0, "colorMap2")
    .setOrigin(0, 0)
    .setScale(0.04)
    .setScrollFactor(0)
    .setDepth(999);

  // 世界邊界
  this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

  // 玩家
  player = this.add.rectangle(
    START_X * MAP_SCALE,
    START_Y * MAP_SCALE,
    80, 40,
    0x00bfff
  );
  this.physics.add.existing(player);
  player.rotation = Phaser.Math.DegToRad(90); // 朝下

  keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
  });

  this.cameras.main.startFollow(player);

  // 玩家箭頭（小地圖）
  miniPlayer = this.add.image(100, 100, "arrow")
    .setScrollFactor(0)
    .setDepth(2000)
    .setScale(0.08)
    .setOrigin(0.5, 0.5);
}


// ======================================================
// Update
// ======================================================
function update(time, delta) {

  // ---------------------------------------
  //        全域紅綠燈計算
  // ---------------------------------------
  lightTimer += delta;

  if (isRedLight && lightTimer > RED_DURATION) {
    isRedLight = false;
    lightTimer = 0;
  }
  if (!isRedLight && lightTimer > GREEN_DURATION) {
    isRedLight = true;
    lightTimer = 0;
  }

  // ---------------------------------------
  // 車輛方向
  // ---------------------------------------
  if (keys.left.isDown)  player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

  // ---------------------------------------
  // 加速/減速（紅燈停車）
  // ---------------------------------------
  let targetSpeed =
    keys.up.isDown
      ? (isRedLight ? 0 : maxSpeed)   // 紅燈禁止加速
      : keys.down.isDown
        ? 0
        : speed * 0.95;

  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  // 預測下一位置
  let nextX = player.x + Math.cos(player.rotation) * speed;
  let nextY = player.y + Math.sin(player.rotation) * speed;

  // Pixel collision
  let maskX = nextX / MAP_SCALE;
  let maskY = nextY / MAP_SCALE;

  if (!isRoad2(maskX, maskY)) {
    speed = 0;
  } else {
    player.body.setVelocity(
      Math.cos(player.rotation) * speed,
      Math.sin(player.rotation) * speed
    );
  }

  // ---------------------------------------
  // 小地圖同步
  // ---------------------------------------
  miniPlayer.x = 100 + (player.x / WORLD_SIZE) * 100;
  miniPlayer.y = 100 + (player.y / WORLD_SIZE) * 100;
  miniPlayer.rotation = player.rotation + Phaser.Math.DegToRad(90);
}


// ======================================================
// Pixel Collision Checker
// ======================================================
function isRoad2(x, y) {
  if (!maskCtx) return true;
  let p = maskCtx.getImageData(x, y, 1, 1).data;
  let brightness = (p[0] + p[1] + p[2]) / 3;
  return brightness > 150;
}
