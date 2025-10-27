let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: { preload, create, update }
};

let game = new Phaser.Game(config);

// 玩家設定
let player;
let speed = 0;
let maxSpeed = 300;
let acceleration = 0.05;
let turnSpeed = 3;
let keys;

// 小地圖
let minimap;
let miniPlayer;
let miniMapData;

function preload() {}

function create() {
  const cx = 1250, cy = 1250; // 圓心
  const outerR = 1000;
  const innerR = 700;
  const radius = (outerR + innerR)/2; // 初始位置半徑

  this.cameras.main.setBackgroundColor('#222222');

  // 玩家初始位置在圓環
  const initialAngle = Phaser.Math.FloatBetween(0, Math.PI*2);
  player = this.add.rectangle(cx + Math.cos(initialAngle)*radius, cy + Math.sin(initialAngle)*radius, 80, 40, 0x00ff00);
  this.physics.add.existing(player);
  player.body.setSize(80, 40);
  player.rotation = initialAngle + Math.PI/2;

  // 圓環牆壁
  let wallsGroup = this.physics.add.staticGroup();
  for (let a = 0; a < 360; a += 3) {
    let rad = Phaser.Math.DegToRad(a);
    let x1 = cx + Math.cos(rad) * outerR;
    let y1 = cy + Math.sin(rad) * outerR;
    let x2 = cx + Math.cos(rad) * innerR;
    let y2 = cy + Math.sin(rad) * innerR;
    wallsGroup.add(this.add.rectangle(x1, y1, 40, 40, 0x888888));
    wallsGroup.add(this.add.rectangle(x2, y2, 40, 40, 0x888888));
  }

  this.physics.add.collider(player, wallsGroup, hitWall, null, this);

  // 攝影機
  this.cameras.main.startFollow(player);
  this.physics.world.setBounds(0,0,2500,2500);
  this.cameras.main.setBounds(0,0,2500,2500);

  // 鍵盤控制（改上下左右）
  keys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT
  });

  // 小地圖（放大）
  minimap = this.add.graphics().setScrollFactor(0);
  miniPlayer = this.add.circle(0,0,8,0x00ff00).setScrollFactor(0);
  miniMapData = drawMinimap(minimap, cx, cy, outerR, innerR);

  // resize 事件
  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
    miniMapData = drawMinimap(minimap, cx, cy, outerR, innerR);
  });

  // 30 秒後顯示結束體驗按鈕
  setTimeout(() => {
    const btn = document.getElementById('endBtn');
    btn.style.display = 'block';
    btn.addEventListener('click', () => {
      alert("體驗結束"); // 或者 window.close() 視瀏覽器環境
    });
  }, 30000);
}

function hitWall() {
  speed = 0; // 撞牆速度歸零
}

function update() {
  // 轉向
  if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

  // 加速/煞車
  let targetSpeed = 0;
  if (keys.up.isDown) targetSpeed = maxSpeed;
  else if (keys.down.isDown) targetSpeed = 0;
  else targetSpeed = speed * 0.95;

  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  // 設置玩家速度
  player.body.setVelocity(
    Math.cos(player.rotation) * speed,
    Math.sin(player.rotation) * speed
  );

  // 更新小地圖
  updateMiniPlayer(player.x, player.y, miniMapData);
}

function drawMinimap(graphics, cx, cy, outerR, innerR) {
  graphics.clear();
  const scale = 0.1;
  const offsetX = window.innerWidth * 0.05 + outerR * scale;
  const offsetY = window.innerHeight * 0.05 + outerR * scale;

  graphics.lineStyle(2, 0xffffff);
  graphics.strokeCircle(offsetX, offsetY, outerR * scale);
  graphics.strokeCircle(offsetX, offsetY, innerR * scale);
  graphics.strokeRect(offsetX - outerR*scale -5, offsetY - outerR*scale -5, outerR*scale*2+10, outerR*scale*2 +10);

  return { offsetX, offsetY, scale };
}

function updateMiniPlayer(px, py, data) {
  if (!data) return;
  miniPlayer.x = data.offsetX + (px - 1250)*data.scale;
  miniPlayer.y = data.offsetY + (py - 1250)*data.scale;
}

