let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: { preload, create, update },
  scale: {
    mode: Phaser.Scale.RESIZE,    // 自動縮放填滿視窗
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

let game = new Phaser.Game(config);

let player;
let keys;
let speed = 0;
let maxSpeed = 300;
let acceleration = 0.05;
let turnSpeed = 3;
let wallsGroup;
let minimap;
let miniPlayer;

// 狀態變數
let positionHistory = [];
let isColliding = false;
let isInvincible = false;
let collisionCount = 0; // 紀錄用，但不顯示

function preload() {}

function create() {
  this.cameras.main.setBackgroundColor('#222222');

  // 玩家車子
  player = this.add.rectangle(1250, 400, 80, 40, 0x00ff00);
  this.physics.add.existing(player);
  player.body.setSize(80, 40);
  player.rotation = Phaser.Math.DegToRad(0);

  // 圓環牆壁
  wallsGroup = this.physics.add.staticGroup();
  let cx = 1250, cy = 1250;
  let outerR = 1000;
  let innerR = 700;
  for (let angle = 0; angle < 360; angle += 3) {
    let rad = Phaser.Math.DegToRad(angle);
    let x1 = cx + Math.cos(rad) * outerR;
    let y1 = cy + Math.sin(rad) * outerR;
    let x2 = cx + Math.cos(rad) * innerR;
    let y2 = cy + Math.sin(rad) * innerR;

    let outerWall = this.add.rectangle(x1, y1, 40, 40, 0x888888);
    let innerWall = this.add.rectangle(x2, y2, 40, 40, 0x888888);
    wallsGroup.add(outerWall);
    wallsGroup.add(innerWall);
  }

  this.physics.add.collider(player, wallsGroup, hitWall, null, this);

  // 攝影機與世界邊界
  this.cameras.main.startFollow(player);
  this.cameras.main.setBounds(0, 0, 2500, 2500);
  this.physics.world.setBounds(0, 0, 2500, 2500);

  // 鍵盤控制
  keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN
  });

  // 小地圖（左上角）
  minimap = this.add.graphics().setScrollFactor(0);
  drawMinimap(minimap, cx, cy, outerR, innerR);
  miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0); // 左上角
}

function hitWall(player, wall) {
  if (isInvincible) return;

  if (!isColliding) {
    collisionCount++;
    speed = 0;
    isColliding = true;
    isInvincible = true;

    if (positionHistory.length >= 60) {
      let past = positionHistory[0];
      player.x = past.x;
      player.y = past.y;
      player.rotation = past.rotation;
      player.body.reset(past.x, past.y);
    }

    player.scene.tweens.add({
      targets: player,
      alpha: 0,
      duration: 100,
      yoyo: true,
      ease: 'Linear'
    });

    player.scene.time.delayedCall(500, () => {
      isInvincible = false;
    });
  }
}

function update() {
  // 左右轉向
  if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

  // 前後加速
  let targetSpeed = 0;
  if (keys.up.isDown) targetSpeed = maxSpeed;
  else if (keys.down.isDown) targetSpeed = 0;
  else targetSpeed = speed * 0.95;

  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  // 移動
  player.body.setVelocity(
    Math.cos(player.rotation) * speed,
    Math.sin(player.rotation) * speed
  );

  // 記錄位置
  positionHistory.push({
    x: player.x,
    y: player.y,
    rotation: player.rotation
  });
  if (positionHistory.length > 60) positionHistory.shift();

  // 檢查是否離開牆面
  let touching = player.body.touching.none === false || player.body.blocked.none === false;
  if (!touching) isColliding = false;

  // 更新小地圖玩家位置
  updateMiniPlayer(player.x, player.y);
}

function drawMinimap(graphics, cx, cy, outerR, innerR) {
  const scale = 0.08;
  const offsetX = 100; // 左上角
  const offsetY = 100;

  graphics.clear();
  graphics.lineStyle(2, 0xffffff);
  graphics.strokeCircle(offsetX, offsetY, outerR * scale);
  graphics.strokeCircle(offsetX, offsetY, innerR * scale);
  graphics.strokeRect(offsetX - outerR * scale - 10, offsetY - outerR * scale - 10, outerR * scale * 2 + 20, outerR * scale * 2 + 20);
}

function updateMiniPlayer(px, py) {
  const scale = 0.08;
  const offsetX = 100;
  const offsetY = 100;
  const cx = 1250, cy = 1250;
  miniPlayer.x = offsetX + (px - cx) * scale;
  miniPlayer.y = offsetY + (py - cy) * scale;
}
