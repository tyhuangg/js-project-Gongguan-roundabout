// ======================================================
// Level 2 － 正交路口模式（Orthogonal Intersection）
// ======================================================

let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: { default: "arcade", arcade: { debug: false } },
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

let positionHistory = [];
let isInvincible = false;

// Pixel collision
let maskCanvas, maskCtx;

// ----- 紅綠燈 -----
let lightTimer = 0;
let isRedLight = true;   // 初始先設紅燈
const RED_DURATION = 6000;  // 紅燈 6 秒
const GREEN_DURATION = 3000; // 綠燈 3 秒

// 玩家出生點
let START_X = 0;
let START_Y = 0;

// 兩道紅燈牆
let trafficLights = [];

//NPC
const CAR_ANGLE_OFFSET = Phaser.Math.DegToRad(90);

// ======================================================
// Preload
// ======================================================
function preload() {
  this.load.image("colorMap2", "/image/map/Orthogonal_map.png");
  this.load.image("mask2", "/image/map/Orthogonal_map_WB.png");

  this.load.image("heart3", "/image/ui/Heart/3heart.png");
  this.load.image("heart2", "/image/ui/Heart/2heart.png");
  this.load.image("heart1", "/image/ui/Heart/1heart.png");
  this.load.image("heart0", "/image/ui/Heart/noheart.png");
  this.load.image("npcBus", "/image/npc_car_top/npc_bus_top.png");
  this.load.image("npcCar", "/image/npc_car_top/npc_car_top.png");
  this.load.image("npcScooter", "/image/npc_car_top/npc_scooter_top.png");
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

  // NPCs
  let bus1 = spawnNPC(
    this,
    1940, 45,
    "npcBus",
    20,
    [
      {x:2232,y:650},{x:2524,y:1256},{x:2899,y:2114},{x:3368,y:3347}, {x:3670,y:4313},{x:3836,y:5517},{x:4115,y:7031},{x:4283,y:7953}
    ]
  );

  let bus2 = spawnNPC(
    this,
    4456, 7953,
    "npcBus",
    20,
    [
      {x:4305,y:6923}, {x:4319,y:5870}, {x:4089,y:5574}, {x:3980,y:5041}, {x:3800,y:4298}, {x:3591,y:3426}, {x:3368,y:2662},{x:3180,y:2085}, {x:2841,y:1343}, {x:2535,y:694},{x:2249,y:45}]
  );

  let bus3 = spawnNPC(
    this,
    5047, 7975,
    "npcBus",
    20,
    [
      {x:4954,y:7261}, {x:4809,y:6468}, {x:4716,y:5812}, {x:4615,y:5171}, {x:4564,y:4688}, {x:4514,y:4140}, {x:4615,y:3837}, {x:4809,y:3527}, {x:5127,y:3260},{x:5797,y:2691}, {x:7059,y:1472}, {x:7946,y:686}]
  );

  let car1 = spawnNPC(
    this,
    4758, 7940,
    "npcCar",
    80,
    [{x:4625,y:7038}, {x:4454,y:5885}, {x:4262,y:4665}, {x:4114,y:3999}, {x:3826,y:3060}, {x:3582,y:2240}, {x:3309,y:1560}, {x:2991,y:946}, {x:2673,y:310}, {x:2540,y:59},]
  );

  let car2 = spawnNPC(
    this,
    7560, 82,
    "npcCar",
    60,
    [{x:6613,y:910}, {x:5497,y:1923}, {x:4477,y:2825}, {x:4211,y:3084}, {x:4040,y:3291}, {x:3870,y:3609}, {x:3811,y:3867}, {x:3760,y:4281}, {x:3700,y:4792},{x:3700,y:5169}, {x:3700,y:5494}, {x:3760,y:5849}, {x:3811,y:6130}, {x:3967,y:7009}, {x:4132,y:7910}]
  );

  let car3 = spawnNPC(
    this,
    85, 5069,
    "npcCar",
    40,
    [{x:950,y:4899}, {x:1726,y:4744}, {x:2407,y:4618}, {x:2702,y:4537}, {x:2954,y:4396}, {x:3131,y:4241}, {x:3316,y:3990}, {x:3427,y:3709},{x:3501,y:3391}, {x:3501,y:2947}, {x:3368,y:2104},{x:3005,y:1291}, {x:2747,y:774},{x:2407,y:93}]
  );

  let car4 = spawnNPC(
    this,
    7323, 24,
    "npcCar",
    50,
    [{x:6347,y:926}, {x:5268,y:1916}, {x:4639,y:2478}, {x:3848,y:3099}, {x:3323,y:3425}, {x:2725,y:3676}, {x:1867,y:3913}, {x:1061,y:4164}, {x:93,y:4489}]
  );

  let scooter1 = spawnNPC(
    this,
    196, 5764,
    "npcScooter",
    60,
    [{x:876,y:5542}, {x:1401,y:5424}, {x:1985,y:5276}, {x:2584,y:5143}, {x:2961,y:5069}, {x:3212,y:5217}, {x:3338,y:5461}, {x:3405,y:5668}, {x:3523,y:6200}, {x:3708,y:7250},{x:3841,y:7938}]
  );

  let scooter2 = spawnNPC(
    this,
    1306, 95,
    "npcScooter",
    50,
    [{x:1493,y:535}, {x:1712,y:1003}, {x:2007,y:1661}, {x:2281,y:2215}, {x:2397,y:2511}, {x:2554,y:2903}, {x:2554,y:3199}, {x:2436,y:3413},{x:2185,y:3576}, {x:1667,y:3797}, {x:1150,y:3953}, {x:440,y:4189},{x:41,y:4330}]
  );

  let scooter3 = spawnNPC(
    this,
    1472, 74,
    "npcScooter",
    45,
    [{x:1839,y:874}, {x:2266,y:1853}, {x:2547,y:2496}, {x:2695,y:3132}, {x:2695,y:3642}, {x:2628,y:4160}, {x:2547,y:4707}, {x:2517,y:4900}, {x:2547,y:4960}, {x:2589,y:4960}, {x:2667,y:4946}, {x:2756,y:4926}, {x:3126,y:4844}, {x:3583,y:4756}, {x:4016,y:4595}, {x:4302,y:4443}, {x:4584,y:4160}, {x:4981,y:3806}, {x:5438,y:3409}, {x:5890,y:2994}, {x:6550,y:2361}, {x:7076,y:1853}, {x:7980,y:1065},]
  );


  // 玩家
  START_X = MAP_SIZE-3000;
  START_Y = MAP_SIZE;
  const params = new URLSearchParams(window.location.search);

  player = this.add.rectangle(
    START_X * MAP_SCALE,
    START_Y * MAP_SCALE,
    80, 40,
    0x00bfff
  );
  this.physics.add.existing(player);
  //player.rotation = Phaser.Math.DegToRad(90); // 朝下

  for (let npc of npcs) {
    this.physics.add.collider(player, npc.sprite, onPlayerHitNPC, null, this);
  }

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

  // ----------------------------------------------------
  // 10. 生命值
  // ----------------------------------------------------
  this.hp = 3;
  this.hpIcon = this.add.image(window.innerWidth - 50, 20, "heart3")
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setDepth(9999)
    .setScale(0.5);

  // 監聽視窗縮放
  this.scale.on('resize', (gameSize) => {
    this.hpIcon.setPosition(gameSize.width - 20, 20);
  });

  this.updateHeart = () => {
    if (this.hp >= 3) this.hpIcon.setTexture("heart3");
    else if (this.hp == 2) this.hpIcon.setTexture("heart2");
    else if (this.hp == 1) this.hpIcon.setTexture("heart1");
    else this.hpIcon.setTexture("heart0");
  };

  // ----------------------------------------------------
  // 12. 紅燈牆
  // ----------------------------------------------------
  this.graphics = this.add.graphics();
  //建立兩道紅燈牆（可分別設定紅綠燈時間）
  createTrafficLightApprox.call(this, 1181, 1357, 1000, 1390, 15, 5000, 3000); // 第一道
  createTrafficLightApprox.call(this, 443, 913, 470, 1026, 15, 7000, 2000);  // 第二道

  // 目標線
  createGoalLine.call(this, 1203, 4099, 1455, 4685, 20);
}



// ======================================================
// Update
// ======================================================
function update(time, delta) {
  const scene = player.scene;

  // ---------------------------------------
  //        全域紅綠燈計算
  // ---------------------------------------
  lightTimer += delta;

  // 方向
  if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

  // 加速 / 慣性
  let targetSpeed =
    keys.up.isDown ? maxSpeed :
      keys.down.isDown ? 0 :
        speed * 0.95;

  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  // 預測下一個位置（縮放後座標）
  let nextX = player.x + Math.cos(player.rotation) * speed;
let nextY = player.y + Math.sin(player.rotation) * speed;

  // Pixel collision（轉回原圖座標）
  let maskX = nextX / MAP_SCALE;
  let maskY = nextY / MAP_SCALE;

  if (!isRoad(maskX, maskY)) {
    hitWallPixel(player);
  } else {
    player.body.setVelocity(
      Math.cos(player.rotation) * speed,
      Math.sin(player.rotation) * speed
    );
  }

  // 保存位置（倒退用）
  positionHistory.push({
    x: player.x,
    y: player.y,
    rotation: player.rotation
  });
  if (positionHistory.length > 60) positionHistory.shift();

  // 小地圖更新
  miniPlayer.x = 100 + (player.x / WORLD_SIZE) * 100;
  miniPlayer.y = 100 + (player.y / WORLD_SIZE) * 100;
  miniPlayer.rotation = player.rotation;
  // miniPlayer.rotation = player.rotation + Phaser.Math.DegToRad(90);

  // 紅燈牆 HUD 更新
  updateTrafficHUD();

  // NPC 更新
  for (let npc of npcs) {
    npc.update();
  }
}

// ======================================================
// NPC產生器
// ======================================================
class NPC {
  constructor(scene, worldX, worldY, texture, speed, waypoints) {
    this.scene = scene;
    this.startX = worldX;
    this.startY = worldY;

    this.sprite = scene.add.image(worldX, worldY, texture)
      .setOrigin(0.5, 0.5)
      .setScale(0.05);

    scene.physics.add.existing(this.sprite);
    this.sprite.body.setCircle(10);       // ← 用圓形碰撞更適合車類
    this.sprite.body.setOffset(
      this.sprite.width / 2 - 10,
      this.sprite.height / 2 - 10
    );

    this.speed = speed;
    this.waypoints = waypoints;
    this.currentPoint = 0;

    // 初始朝向
    let target = this.waypoints[0];
    let targetAngle = Phaser.Math.Angle.Between(worldX, worldY, target.x, target.y);
    this.sprite.rotation = targetAngle + CAR_ANGLE_OFFSET;

    this.stopForRedLight = false;
  }

  update() {
    if (!this.sprite.body) return;

    // 紅燈檢查
    let npcNearRed = false;
    trafficLights.forEach(light => {
      if (light.state === 'red') {
        light.rects.forEach(rect => {
          let dx = rect.x - this.sprite.x;
          let dy = rect.y - this.sprite.y;
          let dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) npcNearRed = true;
        });
      }
    });

    if (npcNearRed) {
      this.stopForRedLight = true;
      this.sprite.body.setVelocity(0, 0);
    }
    else {
      this.stopForRedLight = false;

      let target = this.waypoints[this.currentPoint];
      let dx = target.x - this.sprite.x;
      let dy = target.y - this.sprite.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      let baseAngle = Phaser.Math.Angle.Between(this.sprite.x, this.sprite.y, target.x, target.y);
      this.sprite.rotation = Phaser.Math.Angle.RotateTo(
        this.sprite.rotation,
        baseAngle + CAR_ANGLE_OFFSET,
        0.02
      );

      this.sprite.body.setVelocity(
        Math.cos(baseAngle) * this.speed,
        Math.sin(baseAngle) * this.speed
      )
      // 抵達下一個點
      if (dist < 10) {
        this.sprite.body.setVelocity(0, 0);
        this.sprite.body.reset(target.x, target.y);
        this.currentPoint++;

        if (this.currentPoint >= this.waypoints.length) {
          // 瞬間跳回起始位置
          this.sprite.body.setVelocity(0, 0);
          this.sprite.body.reset(this.startX, this.startY);

          // 重跑路線
          this.currentPoint = 0;

          // 重新朝向第一個目標
          let first = this.waypoints[0];
          let angle = Phaser.Math.Angle.Between(this.startX, this.startY, first.x, first.y);
          this.sprite.rotation = angle + CAR_ANGLE_OFFSET;

          return; // 這幀結束
        }
      }
    }
  }
}


// ======================================================
// Pixel Collision Checker
// ======================================================
function isRoad(x, y) {
  if (!maskCtx) return true;
  let p = maskCtx.getImageData(x, y, 1, 1).data;
  let brightness = (p[0] + p[1] + p[2]) / 3;
  return brightness > 128;
}

// ======================================================
// 撞牆：回到上一個安全位置
// ======================================================
function hitWallPixel(player) {
  const scene = player.scene;

  if (isInvincible) return;

  speed = 0;
  isInvincible = true;

  // 扣一滴血
  scene.hp--;
  scene.updateHeart();

  // 檢查是否死亡
  if (scene.hp <= 0) {

    // 回到初始位置
    player.x = START_X * MAP_SCALE;
    player.y = START_Y * MAP_SCALE;
    // player.rotation = Phaser.Math.DegToRad(90);
    player.body.reset(player.x, player.y);

    // 重置 HP
    scene.hp = 3;
    scene.updateHeart();

  } else {

    // 正常撞牆 → 回溯到上一個安全位置
    if (positionHistory.length > 10) {
      let past = positionHistory[0];
      player.x = past.x;
      player.y = past.y;
      player.rotation = past.rotation;
      player.body.reset(past.x, past.y);
    }
  }

  // 閃爍
  scene.tweens.add({
    targets: player,
    alpha: 0,
    duration: 80,
    yoyo: true,
    repeat: 2
  });

  scene.time.delayedCall(1000, () => {
    isInvincible = false;
  });
}

// ======================================================
// 斜紅燈牆，多小矩形拼接（矩形隱形）
// ======================================================
function createTrafficLightApprox(x1, y1, x2, y2, segments = 10, redTime = 5000, greenTime = 3000) {
  const scene = this;
  const dx = (x2 - x1) / segments;
  const dy = (y2 - y1) / segments;

  let rects = [], colliders = [];
  let obj = { rects: [], hud: null, lineGraphics: null, state: 'red', colliders: [] };

  // ----------------------------------------------------
  // 紅線（純視覺）
  // ----------------------------------------------------
  let lineGraphics = scene.add.graphics();
  lineGraphics.lineStyle(4, 0xff0000);
  lineGraphics.beginPath();
  lineGraphics.moveTo(x1, y1);
  lineGraphics.lineTo(x2, y2);
  lineGraphics.strokePath();
  obj.lineGraphics = lineGraphics;

  for (let i = 0; i <= segments; i++) {
    const segX = x1 + dx * i;
    const segY = y1 + dy * i;
    let rect = scene.add.rectangle(segX, segY, 20, 20, 0xff0000, 0); // 隱形矩形
    scene.physics.add.existing(rect, true);
    rects.push(rect);

    let col = scene.physics.add.collider(player, rect, () => {
      if (obj.state === 'red') hitWallPixel(player);
    });
    colliders.push(col);
  }

  obj.rects = rects;
  obj.colliders = colliders;

  // ----------------------------------------------------
  // HUD
  // ----------------------------------------------------
  let midX = x1 + dx * Math.floor(segments / 2);
  let midY = y1 + dy * Math.floor(segments / 2);
  obj.hud = scene.add.circle(midX + 30, midY - 30, 15, 0xff0000).setDepth(999);

  function setState(state) {
    obj.state = state;
    obj.colliders.forEach(c => c.active = (state === 'red'));
  }

  setState('red');
  scene.time.addEvent({ delay: redTime, loop: true, callback: () => setState('green') });
  scene.time.addEvent({ delay: redTime + greenTime, loop: true, callback: () => setState('red') });

  trafficLights.push(obj);
}

// ======================================================
// 更新紅燈牆 HUD
// ======================================================
function updateTrafficHUD() {
  trafficLights.forEach(obj => {
    let midRect = obj.rects[Math.floor(obj.rects.length / 2)];
    obj.hud.x = midRect.x + 30;
    obj.hud.y = midRect.y - 30;
    obj.hud.fillColor = obj.state === 'red' ? 0xff0000 : 0x00ff00;
  });
}

// ======================================================
// 座標轉換
// ======================================================

function makeWaypointList(list) {
  return list.map(p => mapToWorld(p.x, p.y));
}

function mapToWorld(px, py) {
  return {
    x: px * MAP_SCALE,
    y: py * MAP_SCALE
  };
}

function onPlayerHitNPC(player, npc) {
  const scene = player.scene;

  if (isInvincible) return;

  // 扣血
  scene.hp--;
  scene.updateHeart();

  // 撞 NPC 跟撞牆一樣：給無敵時間
  isInvincible = true;

  // 撞到時閃爍
  scene.tweens.add({
    targets: player,
    alpha: 0,
    duration: 80,
    yoyo: true,
    repeat: 3
  });

  // 無敵1秒
  scene.time.delayedCall(1000, () => {
    isInvincible = false;
  });

  // 如果血歸0 → 回出生點
  if (scene.hp <= 0) {
    player.x = START_X * MAP_SCALE;
    player.y = START_Y * MAP_SCALE;
    player.rotation = Phaser.Math.DegToRad(90);
    player.body.reset(player.x, player.y);

    scene.hp = 3;
    scene.updateHeart();
  }
}

let npcs = [];
function spawnNPC(scene, mapX, mapY, texture, speed, waypointList) {
  let pos = mapToWorld(mapX, mapY);
  let worldWaypoints = makeWaypointList(waypointList);

  let npc = new NPC(
    scene,
    pos.x,
    pos.y,
    texture,
    speed,
    makeWaypointList(waypointList)
  );

  for (let other of npcs) {
    scene.physics.add.collider(npc.sprite, other.sprite);
  }

  npcs.push(npc);
  return npc;
}

// ======================================================
// 終點：斜線目標區（玩家通過 → 進下一關）
// ======================================================
function createGoalLine(x1, y1, x2, y2, segments = 20) {

  const scene = this;

  const dx = (x2 - x1) / segments;
  const dy = (y2 - y1) / segments;

  for (let i = 0; i <= segments; i++) {

    // 原圖座標
    let px = x1 + dx * i;
    let py = y1 + dy * i;

    // 轉成 world 座標
    let wx = px * MAP_SCALE;
    let wy = py * MAP_SCALE;

    // 建立一個透明矩形當作終點碰撞偵測
    let rect = scene.add.rectangle(wx, wy, 25, 25, 0x00ff00, 0);
    scene.physics.add.existing(rect, true);

    // 玩家碰到 → 過關
    scene.physics.add.overlap(player, rect, () => {

      // 停下來
      player.body.setVelocity(0, 0);

      // 跳下一關
      window.location.href = "level2.html";
    });
  }
}