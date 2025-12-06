// ======================================================
// Level 1 - Pixel Collision + 彩色主地圖 + 彩色小地圖
// ======================================================
// import { select } from "./select.js";
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
let MAP_SIZE = 2048;
const MAP_SCALE = 0.25;
let WORLD_SIZE = MAP_SIZE * MAP_SCALE;

let player, keys, miniPlayer;
let speed = 0, maxSpeed = 120, acceleration = 0.05, turnSpeed = 3;

let positionHistory = [];
let isInvincible = false;

// Pixel Mask
let maskCanvas, maskCtx;

//玩家位置
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
  this.load.image("smallMap", "/image/map/circle_small_map.png");
  this.load.image("colorMap", "/image/map/circle_map.png");
  this.load.image("mask", "/image/map/Circle_map_WB.PNG");
  this.load.image("heart3", "/image/ui/Heart/3heart.png");
  this.load.image("heart2", "/image/ui/Heart/2heart.png");
  this.load.image("heart1", "/image/ui/Heart/1heart.png");
  this.load.image("heart0", "/image/ui/Heart/noheart.png");
  this.load.image("arrow", "/image/ui/Arrow.png"); //arrow
  this.load.image("npcBus", "/image/npc_car_top/npc_bus_top.png");
  this.load.image("npcCar", "/image/npc_car_top/npc_car_top.png");
  this.load.image("npcScooter", "/image/npc_car_top/npc_scooter_top.png");
  this.load.image("Bus", "/image/car_top/bus_top.png");
  this.load.image("Car", "/image/car_top/car_top.png");
  this.load.image("Scooter", "/image/car_top/scooter_top.png");
  this.load.image("redLightIcon", "/image/ui/redgreenlight/RedGreenLight_3Light_Red.png");
  this.load.image("greenLightIcon", "/image/ui/redgreenlight/RedGreenLight_3Light_Green.png");
}


// ======================================================
// Create
// ======================================================
function create() {
  const scene = this;

  this.cameras.main.setBackgroundColor("#000000");

  // ----------------------------------------------------
  // 1. 自動偵測黑白遮罩原始尺寸（最重要）
  // ----------------------------------------------------
  const maskImg = this.textures.get("mask").getSourceImage();
  MAP_SIZE = maskImg.width;         // = 2048
  WORLD_SIZE = MAP_SIZE * MAP_SCALE;  // = 2048 * 0.25 = 512

  // 把黑白遮罩畫到 Canvas（pixel collision）
  maskCanvas = document.createElement("canvas");
  maskCanvas.width = MAP_SIZE;
  maskCanvas.height = MAP_SIZE;
  maskCtx = maskCanvas.getContext("2d");
  maskCtx.drawImage(maskImg, 0, 0);

  // ----------------------------------------------------
  // 2. 主背景（彩色地圖，與遮罩比例完全一致）
  // ----------------------------------------------------
  this.add.image(0, 0, "colorMap")
    .setOrigin(0, 0)
    .setScale(MAP_SCALE)
    .setDepth(-10);

  // ----------------------------------------------------
  // 3. 左上角小地圖
  // ----------------------------------------------------
  this.add.image(0, 0, "smallMap")
    .setOrigin(0, 0)
    .setScale(0.5)
    .setScrollFactor(0)
    .setDepth(999);

  // ----------------------------------------------------
  // 4. 世界邊界（依照實際地圖縮放後大小）
  // ----------------------------------------------------
  this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

  // ----------------------------------------------------
  // 5. NPCs
  // ----------------------------------------------------
  let bus1 = spawnNPC(
    this,
    4823, 7735,
    "npcBus",
    60,
    [
      { x: 4600, y: 6714 },
      { x: 4699, y: 5249 },
      { x: 5222, y: 4270 },
      { x: 5243, y: 3640 },
      { x: 4960, y: 2994 },
      { x: 4497, y: 2644 },
      { x: 2421, y: 1743 },
      { x: 784, y: 0 }
    ]
  );

  let car1 = spawnNPC(
    this,
    5066, 7796,
    "npcCar",
    60,
    [
      { x: 4793, y: 6572 },
      { x: 4869, y: 5946 },
      { x: 5010, y: 5306 },
      { x: 5267, y: 4965 },
      { x: 5855, y: 4495 },
      { x: 6320, y: 4324 },
      { x: 8000, y: 4019 },
    ]
  );

  let scooter1 = spawnNPC(
    this,
    5535, 7724,
    "npcScooter",
    60,
    [
      { x: 5224, y: 6457 },
      { x: 5147, y: 5915 },
      { x: 5443, y: 4498 },
      { x: 5489, y: 4212 },
      { x: 4889, y: 2508 },
      { x: 4038, y: 2169 },
      { x: 2195, y: 1225 },
      { x: 1073, y: 0 }
    ]
  );

  let scooter2 = spawnNPC(
    this,
    8000, 2925,
    "npcScooter",
    65,
    [
      { x: 5633, y: 3330 },
      { x: 4810, y: 2831 },
      { x: 3603, y: 2510 },
      { x: 2658, y: 2963 },
      { x: 2298, y: 3587 },
      { x: 1849, y: 4125 },
      { x: 2341, y: 5254 },
      { x: 3704, y: 6408 },
      { x: 4209, y: 8000 }
    ]
  );

  // ----------------------------------------------------
  // 6. 玩家出生位置
  // ----------------------------------------------------
  START_X = MAP_SIZE - 2200;
  START_Y = MAP_SIZE - 200;
  const params = new URLSearchParams(window.location.search);

  if (params.get('selectedIndex') == 0) {
    player = this.add.image(START_X * MAP_SCALE, START_Y * MAP_SCALE, "Bus").setOrigin(0.5, 0.5).setScale(0.22);

  } else if (params.get('selectedIndex') == 1) {
    player = this.add.image(START_X * MAP_SCALE, START_Y * MAP_SCALE, "Car").setOrigin(0.5, 0.5).setScale(0.05);

  } else if (params.get('selectedIndex') == 2) {
    player = this.add.image(START_X * MAP_SCALE, START_Y * MAP_SCALE, "Scooter").setOrigin(0.5, 0.5).setScale(0.05);

  }

  //原綠色player
  //  player = this.add.rectangle(
  //   START_X * MAP_SCALE,
  //   START_Y * MAP_SCALE,
  //   80,
  //   40,
  //   0x00ff00
  // );
  //單圖片player(Debug)
  // player = this.add.image(START_X * MAP_SCALE, START_Y * MAP_SCALE, "Bus").setOrigin(0.5, 0.5).setScale(0.22);


  this.physics.add.existing(player);
  // player.rotation = Phaser.Math.DegToRad(90);


  for (let npc of npcs) {
    this.physics.add.collider(player, npc.sprite, onPlayerHitNPC, null, this);
  }

  // ----------------------------------------------------
  // 7. 控制鍵
  // ----------------------------------------------------
  keys = this.input.keyboard.addKeys({
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    //WASD
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
  });

  // ----------------------------------------------------
  // 8. Camera
  // ----------------------------------------------------
  this.cameras.main.startFollow(player);

  // ----------------------------------------------------
  // 9. 小地圖玩家指示箭頭
  // ----------------------------------------------------
  // miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
  miniPlayer = this.add.image(100, 100, "arrow")
    .setScrollFactor(0)
    .setDepth(1000)
    .setScale(0.08)        // 小地圖箭頭大小
    .setOrigin(0.5, 0.5);  // 讓旋轉以中心點


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
  createTrafficLightApprox.call(this, 1370, 1559, 1084, 1651, 15, 5000, 3000); // 第一道
  createTrafficLightApprox.call(this, 414, 1318, 488, 1461, 15, 7000, 2000);  // 第二道
}


// ======================================================
// Update
// ======================================================
function update() {
  const scene = player.scene;

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
  let nextX = player.x + Math.cos(player.rotation-CAR_ANGLE_OFFSET) * speed;
  let nextY = player.y + Math.sin(player.rotation-CAR_ANGLE_OFFSET) * speed;

  // Pixel collision（轉回原圖座標）
  let maskX = nextX / MAP_SCALE;
  let maskY = nextY / MAP_SCALE;

  if (!isRoad(maskX, maskY)) {
    hitWallPixel(player);
  } else {
    player.body.setVelocity(
      Math.cos(player.rotation-CAR_ANGLE_OFFSET) * speed,
      Math.sin(player.rotation-CAR_ANGLE_OFFSET) * speed
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
// Player
// ======================================================


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
// 判斷是否可通行（Pixel Collision）
// ======================================================
function isRoad(x, y) {
  if (!maskCtx) return true;
  let p = maskCtx.getImageData(x, y, 1, 1).data;
  let brightness = (p[0] + p[1] + p[2]) / 3;
  return brightness > 128;  // 0~255 的中間值
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
// ======================================================
// 斜紅燈牆，多小矩形拼接（矩形隱形）+ 圖片 HUD
// ======================================================
function createTrafficLightApprox(x1, y1, x2, y2, segments = 10, redTime = 5000, greenTime = 3000) {
  const scene = this;
  const dx = (x2 - x1) / segments;
  const dy = (y2 - y1) / segments;

  // 計算線段角度（A：圖片完全跟線一樣的角度）
  let angle = Phaser.Math.RadToDeg(Math.atan2(y2 - y1, x2 - x1));

  let rects = [], colliders = [];
  let obj = {
    rects: [],
    hud: null,
    lineGraphics: null,
    state: 'red',
    colliders: []
  };

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

  // ----------------------------------------------------
  // 建立撞擊小矩形
  // ----------------------------------------------------
  for (let i = 0; i <= segments; i++) {
    const segX = x1 + dx * i;
    const segY = y1 + dy * i;

    let rect = scene.add.rectangle(segX, segY, 20, 20, 0xff0000, 0);
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
  // HUD：紅綠燈圖片（已加入旋轉角度）
  // ----------------------------------------------------
  let midX = x1 + dx * Math.floor(segments / 2);
  let midY = y1 + dy * Math.floor(segments / 2);

  obj.hud = scene.add.image(midX + 30, midY - 30, "redLightIcon")
    .setScale(0.15)
    .setDepth(9999)
    .setAngle(angle);  // 🔥 完全跟線同角度（方案 A）

  // ----------------------------------------------------
  // 切換紅綠燈
  // ----------------------------------------------------
  function setState(state) {
    obj.state = state;

    obj.hud.setTexture(
      state === "red" ? "redLightIcon" : "greenLightIcon"
    );

    obj.hud.setAngle(angle);   // 🔥 切換時保持同角度

    obj.colliders.forEach(c => c.active = (state === 'red'));
  }

  // 初始紅燈
  setState('red');

  // 計時切換
  scene.time.addEvent({
    delay: redTime,
    loop: true,
    callback: () => setState('green')
  });

  scene.time.addEvent({
    delay: redTime + greenTime,
    loop: true,
    callback: () => setState('red')
  });

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