// ==========================
// Phaser 遊戲設定
// ==========================
let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.FIT,         // 自動縮放適配視窗
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: { default: 'arcade', arcade: { debug: false } },
  scene: { preload, create, update }
};

let game = new Phaser.Game(config);

// ==========================
// 玩家設定
// ==========================
let player;
let speed = 0;
let maxSpeed = 300;
let acceleration = 0.05;
let turnSpeed = 3;
let keys;

// ==========================
// 碰撞牆設定
// ==========================
let wallsGroup;

// ==========================
// 回朔系統設定
// ==========================
let positionHistory = [];
let isInvincible = false;

// ==========================
// 背景縮放
// ==========================
const bgScale = 0.5;

// ==========================
// 預載資源
// ==========================
function preload() {
  this.load.image('background', '/image/map/partice_map.png');
  this.load.image('playerCar', '/image/car_top/car_top.png');
  this.load.image('confirmBtn', '/image/ui/finsh.png'); // 按鈕圖片
}

// ==========================
// 建立遊戲場景
// ==========================
function create() {
  const scene = this;

  // ---- 背景 ----
  const bg = this.add.image(0, 0, 'background')
    .setOrigin(0.5, 0.5)
    .setScale(bgScale);

  const bgWidth = bg.width * bgScale;
  const bgHeight = bg.height * bgScale;
  bg.x = bgWidth / 2;
  bg.y = bgHeight / 2;

  // ---- 世界邊界 ----
  this.physics.world.setBounds(0, 0, bgWidth, bgHeight);
  this.cameras.main.setBounds(0, 0, bgWidth, bgHeight);

  // ---- 玩家生成位置 ----
  const cx = 3997 * bgScale;
  const cy = 3997 * bgScale;
  const innerR = 2358 * bgScale;
  const outerR = 3699 * bgScale;
  const spawnRadius = (innerR + outerR) / 2;
  const initialAngle = Phaser.Math.FloatBetween(0, Math.PI * 2);

  const px = cx + Math.cos(initialAngle) * spawnRadius;
  const py = cy + Math.sin(initialAngle) * spawnRadius;

  player = this.add.image(px, py, 'playerCar')
    .setOrigin(0.5, 0.5)
    .setDisplaySize(120, 180);
  this.physics.add.existing(player);
  player.body.setSize(120, 180);

  // 初始旋轉：窄邊（車頭）朝上
  player.rotation = -Math.PI / 2;

  // 相機跟隨玩家
  this.cameras.main.startFollow(player);

  // ---- 鍵盤控制 ----
  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT
  });

  // ---- 圓形碰撞牆 ----
  wallsGroup = this.physics.add.staticGroup();
  const step = 1;

  for (let angle = 0; angle < 360; angle += step) {
    const rad = Phaser.Math.DegToRad(angle);

    // 內圓
    const x1 = cx + Math.cos(rad) * innerR;
    const y1 = cy + Math.sin(rad) * innerR;
    const rect1 = scene.add.rectangle(x1, y1, 40, 40, 0xff0000, 0);
    scene.physics.add.existing(rect1, true);
    wallsGroup.add(rect1);

    // 外圓
    const x2 = cx + Math.cos(rad) * outerR;
    const y2 = cy + Math.sin(rad) * outerR;
    const rect2 = scene.add.rectangle(x2, y2, 40, 40, 0xff0000, 0);
    scene.physics.add.existing(rect2, true);
    wallsGroup.add(rect2);
  }

  // ---- 玩家碰撞牆回朔 ----
  this.physics.add.collider(player, wallsGroup, () => { hitWall(player); });

  // ---- 中央按鈕（固定畫面座標） ----
  const confirmBtn = this.add.image(this.cameras.main.width/2, this.cameras.main.height/2, 'confirmBtn')
    .setOrigin(0.5, 0.5)
    .setVisible(false)
    .setScrollFactor(0); // 固定畫面座標

  // 設為可點擊
  confirmBtn.setInteractive();

  // 點擊跳轉
  confirmBtn.on('pointerdown', () => {
    window.location.href = '/select.html'; // 換成你要跳轉的頁面
  });

  // 30 秒後顯示
  this.time.delayedCall(30000, () => {
    confirmBtn.setVisible(true);
  });
}

// ==========================
// 回朔系統
// ==========================
function hitWall(player) {
  if (isInvincible) return;
  speed = 0;

  if (positionHistory.length >= 1) {
    const past = positionHistory[0];
    player.x = past.x;
    player.y = past.y;
    player.rotation = past.rotation;
    player.body.reset(past.x, past.y);
  }

  isInvincible = true;
  setTimeout(() => { isInvincible = false; }, 1000);
}

// ==========================
// 每幀更新
// ==========================
function update() {
  positionHistory.push({
    x: player.x,
    y: player.y,
    rotation: player.rotation
  });
  if (positionHistory.length > 60) positionHistory.shift();

  // 玩家轉向
  if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

  // 加速/煞車
  let targetSpeed = 0;
  if (keys.up.isDown) targetSpeed = maxSpeed;
  else if (keys.down.isDown) targetSpeed = 0;
  else targetSpeed = speed * 0.95;

  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  // 玩家前進方向朝車頭（窄邊）
  player.body.setVelocity(
    Math.cos(player.rotation - Math.PI / 2) * speed,
    Math.sin(player.rotation - Math.PI / 2) * speed
  );
}
