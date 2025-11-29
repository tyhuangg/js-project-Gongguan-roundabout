// ======================================================
// Level 1 - Pixel Collision + 彩色主地圖 + 彩色小地圖
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


// ======================================================
// Preload
// ======================================================
function preload() {
  this.load.image("colorMap", "/image/map/circle_map.png");    
  this.load.image("mask", "/image/map/Circle_map_WB.PNG");    
  this.load.image("heart3", "/image/ui/Heart/3heart.png");
  this.load.image("heart2", "/image/ui/Heart/2heart.png");
  this.load.image("heart1", "/image/ui/Heart/1heart.png");
  this.load.image("heart0", "/image/ui/Heart/noheart.png");
  this.load.image("arrow", "/image/ui/Arrow.png"); //arrow
}


// ======================================================
// Create
// ======================================================
function create() {

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
  this.add.image(0, 0, "colorMap")
    .setOrigin(0, 0)
    .setScale(0.04)
    .setScrollFactor(0)
    .setDepth(999);

  // ----------------------------------------------------
  // 4. 世界邊界（依照實際地圖縮放後大小）
  // ----------------------------------------------------
  this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

  // ----------------------------------------------------
  // 5. 玩家出生位置
  // ----------------------------------------------------
  START_X = MAP_SIZE - 2000;
  START_Y = MAP_SIZE - 200;
  player = this.add.rectangle(
    START_X * MAP_SCALE,
    START_Y * MAP_SCALE,
    80,
    40,
    0x00ff00
  );
  this.physics.add.existing(player);
  player.rotation = Phaser.Math.DegToRad(90);

  // ----------------------------------------------------
  // 6. 控制鍵
  // ----------------------------------------------------
  keys = this.input.keyboard.addKeys({
    left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up:    Phaser.Input.Keyboard.KeyCodes.UP,
    down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
  });

  // ----------------------------------------------------
  // 7. Camera
  // ----------------------------------------------------
  this.cameras.main.startFollow(player);

  // ----------------------------------------------------
  // 8. 小綠點（小地圖玩家指示）
  // ----------------------------------------------------
  // miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
  miniPlayer = this.add.image(100, 100, "arrow")
    .setScrollFactor(0)
    .setDepth(1000)
    .setScale(0.08)        // 小地圖箭頭大小
    .setOrigin(0.5, 0.5);  // 讓旋轉以中心點


  // 生命值（最多 3 顆）
  this.hp = 3;

  // 右上角顯示愛心
  this.hpIcon = this.add.image(window.innerWidth - 50, 20, "heart3")
  .setOrigin(1, 0)
  .setScrollFactor(0)
  .setDepth(9999)
  .setScale(0.5);

  // 監聽視窗縮放（維持右上角位置）
  this.scale.on('resize', (gameSize)=>{
    this.hpIcon.setPosition(gameSize.width - 20, 20);
  });

  this.updateHeart = () => {
  if (this.hp >= 3) this.hpIcon.setTexture("heart3");
  else if (this.hp == 2) this.hpIcon.setTexture("heart2");
  else if (this.hp == 1) this.hpIcon.setTexture("heart1");
  else this.hpIcon.setTexture("heart0");
  };

}


// ======================================================
// Update
// ======================================================
function update() {

  // 方向
  if (keys.left.isDown)  player.rotation -= Phaser.Math.DegToRad(turnSpeed);
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
  //// miniPlayer.rotation = player.rotation;
  miniPlayer.rotation = player.rotation + Phaser.Math.DegToRad(90);
}


// ======================================================
// Pixel Collision
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
    player.rotation = Phaser.Math.DegToRad(90);
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


// ================================
// Level 1 – Pixel Collision +彩色小地圖 + 黑白主地圖
// ================================

// let config = {
//   type: Phaser.AUTO,
//   width: window.innerWidth,
//   height: window.innerHeight,
//   physics: {
//     default: "arcade",
//     arcade: { debug: false }
//   },
//   scene: { preload, create, update },
//   scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
// };

// let game = new Phaser.Game(config);

// // ---- Game Objects ----
// let player, keys;
// let minimap, miniPlayer;

// let speed = 0;
// let maxSpeed = 300;
// let acceleration = 0.05;
// let turnSpeed = 3;

// let positionHistory = [];
// let isInvincible = false;

// // ---- Pixel Mask ----
// let maskCanvas, maskCtx;


// // ===================
// // Preload
// // ===================
// function preload() {
//   // 彩色圖（小地圖）
//   this.load.image("circleMap", "/image/map/circle_map.png");

//   // 黑白主地圖（可走路＝白）
//   this.load.image("mask", "/image/地圖＿圓環路口/Circle_map_WB.PNG");
// }



// // ===================
// // Create
// // ===================
// function create() {
//   this.cameras.main.setBackgroundColor("#000000");

//   //----------------------------------
//   // 1. 載入黑白遮罩：用來顯示＋碰撞
//   //----------------------------------
//   const maskImg = this.textures.get("mask").getSourceImage();

//   maskCanvas = document.createElement("canvas");
//   maskCanvas.width = maskImg.width;   // 8000
//   maskCanvas.height = maskImg.height; // 8000
//   maskCtx = maskCanvas.getContext("2d");
//   maskCtx.drawImage(maskImg, 0, 0);

//   // 🔥 把黑白圖放為主背景
//   let mainMap = this.add.image(0, 0, "mask")
//     .setOrigin(0, 0)
//     .setDepth(-10)
//     .setScale(0.16); // 8000*0.16 = 1280


//   //----------------------------------
//   // 2. 左上角的小地圖（彩色，固定不動）
//   //----------------------------------
//   this.add.image(0, 0, "circleMap")
//     .setOrigin(0, 0)
//     .setScale(0.03)    // 小地圖尺寸
//     .setScrollFactor(0)
//     .setDepth(1000);


//   //----------------------------------
//   // 3. 世界邊界：8000x8000
//   //----------------------------------
//   this.cameras.main.setBounds(0, 0, 8000, 8000);
//   this.physics.world.setBounds(0, 0, 8000, 8000);


//   //----------------------------------
//   // 4. 玩家初始位置（放在道路附近）
//   //----------------------------------
//   player = this.add.rectangle(
//     4000,
//     3000,
//     80,
//     40,
//     0x00ff00
//   );
//   this.physics.add.existing(player);
//   player.rotation = Phaser.Math.DegToRad(90);


//   //----------------------------------
//   // 5. 控制鍵
//   //----------------------------------
//   keys = this.input.keyboard.addKeys({
//     left: Phaser.Input.Keyboard.KeyCodes.LEFT,
//     right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
//     up: Phaser.Input.Keyboard.KeyCodes.UP,
//     down: Phaser.Input.Keyboard.KeyCodes.DOWN
//   });


//   //----------------------------------
//   // 6. Camera 跟隨玩家
//   //----------------------------------
//   this.cameras.main.startFollow(player);


//   //----------------------------------
//   // 7. 小地圖玩家點
//   //----------------------------------
//   miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
// }



// // ===================
// // Update Loop
// // ===================
// function update() {
//   // ---- Rotation ----
//   if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
//   if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

//   // ---- Speed ----
//   let targetSpeed = keys.up.isDown
//     ? maxSpeed
//     : keys.down.isDown
//       ? 0
//       : speed * 0.95;

//   speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);


//   // ---- Predict Next Position ----
//   let nextX = player.x + Math.cos(player.rotation) * speed;
//   let nextY = player.y + Math.sin(player.rotation) * speed;

//   // --- Pixel Collision ---
//   if (!isRoad(nextX, nextY)) {
//     hitWallPixel(player);
//   } else {
//     player.body.setVelocity(
//       Math.cos(player.rotation) * speed,
//       Math.sin(player.rotation) * speed
//     );
//   }

//   // Save history
//   positionHistory.push({
//     x: player.x,
//     y: player.y,
//     rotation: player.rotation
//   });
//   if (positionHistory.length > 60) positionHistory.shift();

//   // Minimap update
//   miniPlayer.x = 100 + (player.x / 8000) * 600 * 0.1;
//   miniPlayer.y = 100 + (player.y / 8000) * 600 * 0.1;
// }



// // ===================
// // Pixel Mask Collision
// // ===================
// function isRoad(x, y) {
//   if (!maskCtx) return false;
//   let d = maskCtx.getImageData(x, y, 1, 1).data;
//   return d[0] > 200 && d[1] > 200 && d[2] > 200; // 白色 = 可走
// }



// // ===================
// // Crash → Backtrack
// // ===================
// function hitWallPixel(player) {
//   if (isInvincible) return;

//   speed = 0;
//   isInvincible = true;

//   if (positionHistory.length > 10) {
//     let past = positionHistory[0];
//     player.x = past.x;
//     player.y = past.y;
//     player.rotation = past.rotation;
//     player.body.reset(past.x, past.y);
//   }

//   // 閃爍效果
//   player.scene.tweens.add({
//     targets: player,
//     alpha: 0,
//     duration: 80,
//     yoyo: true
//   });

//   player.scene.time.delayedCall(300, () => {
//     isInvincible = false;
//   });
// }



// // ================================
// // Level 1 – 圓環 + Pixel-based Collision
// // ================================

// let config = {
//   type: Phaser.AUTO,
//   width: window.innerWidth,
//   height: window.innerHeight,
//   physics: {
//     default: "arcade",
//     arcade: { debug: false }
//   },
//   scene: { preload, create, update },
//   scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
// };

// let game = new Phaser.Game(config);

// // ---- Game Objects ----
// let player, keys;
// let goalSensor;
// let minimap, miniPlayer;

// let speed = 0;
// let maxSpeed = 300;
// let acceleration = 0.05;
// let turnSpeed = 3;

// let positionHistory = [];
// let isInvincible = false;

// // ---- Pixel Mask ----
// let maskCanvas, maskCtx;

// // ---- Level Data ----
// const LEVEL = {
//   ring: { cx: 1250, cy: 1250, outerR: 1000, innerR: 700 },

//   entrance: { x: 1180, y: 400, rotationDeg: 90 },

//   branches: [
//     {
//       id: "EAST",
//       points: [[1800, 1250], [2000, 1250], [2200, 1300]],
//       candidateExit: true
//     },
//     {
//       id: "WEST",
//       points: [[700, 1250], [600, 1250], [500, 1250]],
//       candidateExit: true
//     },
//     {
//       id: "NORTH",
//       points: [[1250, 400], [1250, 300], [1250, 200]],
//       candidateExit: true
//     },
//     {
//       id: "SOUTH",
//       points: [[1250, 1900], [1250, 2000], [1250, 2100]],
//       candidateExit: true
//     }
//   ]
// };

// let chosenExit = null;


// // ===================
// // Preload
// // ===================
// function preload() {
//   // 小地圖
//   this.load.image("circleMap", "/image/map/circle_map.png");

//   // 黑白遮罩
//   this.load.image("mask", "/image/地圖＿圓環路口/Circle_map_WB.PNG");
// }



// // ===================
// // Create
// // ===================
// // function create() {
// //   this.cameras.main.setBackgroundColor("#222222");

// //   // ---- 加載黑白遮罩 ----
// //   const maskImg = this.textures.get("mask").getSourceImage();

// //   maskCanvas = document.createElement("canvas");
// //   maskCanvas.width = maskImg.width;
// //   maskCanvas.height = maskImg.height;
// //   maskCtx = maskCanvas.getContext("2d");
// //   maskCtx.drawImage(maskImg, 0, 0);

// //   // ---- 主地圖背景 ----
// //   let bigMap = this.add.image(0, 0, "circleMap")
// //     .setOrigin(0, 0)
// //     .setDepth(-10); // 保證在車子底下

// //   bigMap.setScale(1); // 如果地圖原本是 2500x2500 就用 1

// //   // ---- 小地圖（左上角） ----
// //   this.add.image(0, 0, "circleMap")
// //     .setOrigin(0, 0)
// //     .setScale(0.03)
// //     .setScrollFactor(0)
// //     .setDepth(1000);

// //   // ---- 隨機選出口 ----
// //   chosenExit = pickRandomExit();

// //   // ---- 玩家 ----
// //   player = this.add.rectangle(
// //     LEVEL.entrance.x,
// //     LEVEL.entrance.y,
// //     80,
// //     40,
// //     0x00ff00
// //   );
// //   this.physics.add.existing(player);
// //   player.rotation = Phaser.Math.DegToRad(LEVEL.entrance.rotationDeg);

// //   // ---- 出口 ----
// //   createGoalSensor(this, chosenExit);

// //   // ---- 碰撞：出口 ----
// //   this.physics.add.overlap(player, goalSensor, reachExit, null, this);

// //   // ---- Camera ----
// //   this.cameras.main.startFollow(player);
// //   this.cameras.main.setBounds(0, 0, 2500, 2500);
// //   this.physics.world.setBounds(0, 0, 2500, 2500);

// //   // ---- 控制 ----
// //   keys = this.input.keyboard.addKeys({
// //     left: Phaser.Input.Keyboard.KeyCodes.LEFT,
// //     right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
// //     up: Phaser.Input.Keyboard.KeyCodes.UP,
// //     down: Phaser.Input.Keyboard.KeyCodes.DOWN
// //   });

// //   // ---- 小地圖 ----
// //   minimap = this.add.graphics().setScrollFactor(0);
// //   drawMinimap(minimap);

// //   miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
// // }



// // function create() {
// //   this.cameras.main.setBackgroundColor("#222222");

// //   // ---- 加載黑白遮罩 ----
// //   const maskImg = this.textures.get("mask").getSourceImage();
// //   maskCanvas = document.createElement("canvas");
// //   maskCanvas.width = maskImg.width;
// //   maskCanvas.height = maskImg.height;
// //   maskCtx = maskCanvas.getContext("2d");
// //   maskCtx.drawImage(maskImg, 0, 0);

// //   // ---- 主地圖 ----
// //   let bigMap = this.add.image(0, 0, "circleMap")
// //     .setOrigin(0, 0)
// //     .setDepth(-10);

// //   // ---- 世界邊界改成 8000 ----
// //   this.cameras.main.setBounds(0, 0, 8000, 8000);
// //   this.physics.world.setBounds(0, 0, 8000, 8000);

// //   // ---- 小地圖（左上角） ----
// //   this.add.image(0, 0, "circleMap")
// //     .setOrigin(0, 0)
// //     .setScale(0.03)     // 建議放大一點（0.03 太小了）
// //     .setScrollFactor(0)
// //     .setDepth(1000);

// //   // ---- 隨機出口 ----
// //   chosenExit = pickRandomExit();

// //   // ---- 玩家在地圖上的真實位置 ----
// //   player = this.add.rectangle(
// //     4000,
// //     3000,
// //     80,
// //     40,
// //     0x00ff00
// //   );
// //   this.physics.add.existing(player);
// //   player.rotation = Phaser.Math.DegToRad(90);

// //   // ---- 出口 ----
// //   createGoalSensor(this, chosenExit);
// //   this.physics.add.overlap(player, goalSensor, reachExit, null, this);

// //   // ---- Camera ----
// //   this.cameras.main.startFollow(player);

// //   // ---- 控制 ----
// //   keys = this.input.keyboard.addKeys({
// //     left: Phaser.Input.Keyboard.KeyCodes.LEFT,
// //     right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
// //     up: Phaser.Input.Keyboard.KeyCodes.UP,
// //     down: Phaser.Input.Keyboard.KeyCodes.DOWN
// //   });

// //   // ---- Minimap graphics ----
// //   minimap = this.add.graphics().setScrollFactor(0);
// //   drawMinimap(minimap);
// //   miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
// // }



// // ===================
// // Update Loop
// // ===================
// function update() {
//   // ---- Steering ----
//   if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
//   if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

//   // ---- Acceleration ----
//   let targetSpeed = keys.up.isDown
//     ? maxSpeed
//     : keys.down.isDown
//       ? 0
//       : speed * 0.95;

//   speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

//   // ---- 預測下一步位置 ----
//   let nextX = player.x + Math.cos(player.rotation) * speed;
//   let nextY = player.y + Math.sin(player.rotation) * speed;

//   // ---- Pixel-based Collision ----
//   if (!isRoad(nextX, nextY)) {
//     hitWallPixel(player);
//   } else {
//     player.body.setVelocity(
//       Math.cos(player.rotation) * speed,
//       Math.sin(player.rotation) * speed
//     );
//   }

//   // ---- Save history for rollback ----
//   positionHistory.push({
//     x: player.x,
//     y: player.y,
//     rotation: player.rotation
//   });
//   if (positionHistory.length > 60) positionHistory.shift();

//   // ---- Minimap update ----
//   updateMiniPlayer(player.x, player.y);
// }



// // ===================
// // Pixel Mask Collision
// // ===================
// function isRoad(x, y) {
//   if (!maskCtx) return true;
//   let d = maskCtx.getImageData(x, y, 1, 1).data;
//   return d[0] > 200 && d[1] > 200 && d[2] > 200;   // 白色 = 可走
// }



// // ===================
// // 撞牆
// // ===================
// function hitWallPixel(player) {
//   if (isInvincible) return;

//   speed = 0;
//   isInvincible = true;

//   if (positionHistory.length > 5) {
//     let past = positionHistory[0];
//     player.x = past.x;
//     player.y = past.y;
//     player.rotation = past.rotation;
//     player.body.reset(past.x, past.y);
//   }

//   // 閃爍
//   player.scene.tweens.add({
//     targets: player,
//     alpha: 0,
//     duration: 80,
//     yoyo: true
//   });

//   player.scene.time.delayedCall(500, () => {
//     isInvincible = false;
//   });
// }



// // ===================
// // 小地圖
// // ===================
// function drawMinimap(g) {
//   const { cx, cy, outerR, innerR } = LEVEL.ring;
//   const scale = 0.08;
//   const ox = 100, oy = 100;

//   g.clear();
//   g.lineStyle(2, 0xffffff);
//   g.strokeCircle(ox, oy, outerR * scale);
//   g.strokeCircle(ox, oy, innerR * scale);
// }

// function updateMiniPlayer(px, py) {
//   const scale = 0.08;
//   const ox = 100, oy = 100;
//   const { cx, cy } = LEVEL.ring;

//   miniPlayer.x = ox + (px - cx) * scale;
//   miniPlayer.y = oy + (py - cy) * scale;
// }



// // ===================
// // 出口
// // ===================
// function pickRandomExit() {
//   let list = LEVEL.branches.filter(b => b.candidateExit);
//   return Phaser.Math.RND.pick(list);
// }

// function createGoalSensor(scene, branch) {
//   let pts = branch.points;
//   let last = pts[pts.length - 1];

//   goalSensor = scene.add.rectangle(last[0], last[1], 150, 150, 0x00ffff, 0.2);
//   scene.physics.add.existing(goalSensor);

//   goalSensor.body.setAllowGravity(false);
//   goalSensor.body.setImmovable(true);
// }



// // ===================
// // 通關
// // ===================
// function reachExit() {
//   console.log("🎉 通關！出口是：" + chosenExit.id);
// }



// // // ================================
// // // Level 1 – 圓環 + 隨機出口 + 左上角地圖
// // // ================================

// // // ---- Phaser Config ----
// // let config = {
// //   type: Phaser.AUTO,
// //   width: window.innerWidth,
// //   height: window.innerHeight,
// //   physics: {
// //     default: "arcade",
// //     arcade: { debug: false }
// //   },
// //   scene: { preload, create, update },
// //   scale: {
// //     mode: Phaser.Scale.RESIZE,
// //     autoCenter: Phaser.Scale.CENTER_BOTH
// //   }
// // };

// // let game = new Phaser.Game(config);

// // // ---- Game Objects ----
// // let player;
// // let keys;
// // let wallsGroup;
// // let goalSensor;
// // let minimap;
// // let miniPlayer;
// // let speed = 0;
// // let maxSpeed = 300;
// // let acceleration = 0.05;
// // let turnSpeed = 3;

// // let positionHistory = [];
// // let isColliding = false;
// // let isInvincible = false;

// // // ---- Level Data (資料驅動) ----
// // const LEVEL = {
// //   ring: { cx: 1250, cy: 1250, outerR: 1000, innerR: 700 },

// //   entrance: {
// //     x: 1180, y: 400, rotationDeg: 90
// //   },

// //   branches: [
// //     {
// //       id: "EAST",
// //       points: [
// //         [1800, 1250],
// //         [2000, 1250],
// //         [2200, 1300]
// //       ],
// //       candidateExit: true
// //     },
// //     {
// //       id: "WEST",
// //       points: [
// //         [700, 1250],
// //         [600, 1250],
// //         [500, 1250]
// //       ],
// //       candidateExit: true
// //     },
// //     {
// //       id: "NORTH",
// //       points: [
// //         [1250, 400],
// //         [1250, 300],
// //         [1250, 200]
// //       ],
// //       candidateExit: true
// //     },
// //     {
// //       id: "SOUTH",
// //       points: [
// //         [1250, 1900],
// //         [1250, 2000],
// //         [1250, 2100]
// //       ],
// //       candidateExit: true
// //     }
// //   ]
// // };

// // let chosenExit = null;
// // let circleMapSprite; 


// // // ===================
// // // Preload
// // // ===================
// // function preload() {
// //   this.load.image("circleMap", "/image/map/circle_map.png");
// // }



// // // ===================
// // // Create
// // // ===================
// // function create() {
// //   this.cameras.main.setBackgroundColor("#222222");

// //   // ✅ 左上角顯示縮小版地圖
// //   circleMapSprite = this.add.image(0, 0, "circleMap")
// //     .setOrigin(0, 0)
// //     .setScale(0.03)
// //     .setScrollFactor(0);  // 固定在左上角，不跟鏡頭動

// // // ✅ 確認渲染排序：把它放在最上層 HUD
// //   circleMapSprite.setDepth(1000);

// //   // ✅ 決定本局出口
// //   chosenExit = pickRandomExit();

// //   // ✅ 建立圓環牆壁
// //   wallsGroup = this.physics.add.staticGroup();
// //   createRingWalls(this);

// //   // ✅ 建立分支牆（每一條 polyline）
// //   LEVEL.branches.forEach(branch => {
// //     createBranchWalls(this, branch);
// //   });

// //   // ✅ 建立出口感應器（只有一個）
// //   createGoalSensor(this, chosenExit);

// //   // ✅ 玩家
// //   player = this.add.rectangle(
// //     LEVEL.entrance.x,
// //     LEVEL.entrance.y,
// //     80, 40,
// //     0x00ff00
// //   );
// //   this.physics.add.existing(player);
// //   player.rotation = Phaser.Math.DegToRad(LEVEL.entrance.rotationDeg);

// //   // ✅ 碰撞：牆壁
// //   this.physics.add.collider(player, wallsGroup, hitWall, null, this);

// //   // ✅ 碰撞：出口
// //   this.physics.add.overlap(player, goalSensor, reachExit, null, this);

// //   // ✅ Camera
// //   this.cameras.main.startFollow(player);
// //   this.cameras.main.setBounds(0, 0, 2500, 2500);
// //   this.physics.world.setBounds(0, 0, 2500, 2500);

// //   // ✅ 控制鍵
// //   keys = this.input.keyboard.addKeys({
// //     left: Phaser.Input.Keyboard.KeyCodes.LEFT,
// //     right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
// //     up: Phaser.Input.Keyboard.KeyCodes.UP,
// //     down: Phaser.Input.Keyboard.KeyCodes.DOWN
// //   });

// //   // ✅ 小地圖
// //   minimap = this.add.graphics().setScrollFactor(0);
// //   drawMinimap(minimap);

// //   miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);
// // }



// // // ===================
// // // Update
// // // ===================
// // function update() {
// //   // ---- 方向 ----
// //   if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
// //   if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

// //   // ---- 加速 ----
// //   let targetSpeed = keys.up.isDown
// //     ? maxSpeed
// //     : keys.down.isDown
// //       ? 0
// //       : speed * 0.95;

// //   speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

// //   // ---- 移動 ----
// //   player.body.setVelocity(
// //     Math.cos(player.rotation) * speed,
// //     Math.sin(player.rotation) * speed
// //   );

// //   // ---- 記錄位置（倒退用） ----
// //   positionHistory.push({
// //     x: player.x, y: player.y, rotation: player.rotation
// //   });
// //   if (positionHistory.length > 60) positionHistory.shift();

// //   // ---- 撞牆後恢復 ----
// //   let touching = player.body.touching.none === false || player.body.blocked.none === false;
// //   if (!touching) isColliding = false;

// //   // ---- 更新小地圖玩家點 ----
// //   updateMiniPlayer(player.x, player.y);
// // }



// // // ===================
// // // 小地圖邏輯
// // // ===================
// // function drawMinimap(g) {
// //   const { cx, cy, outerR, innerR } = LEVEL.ring;

// //   const scale = 0.08;
// //   const ox = 100, oy = 100;

// //   g.clear();
// //   g.lineStyle(2, 0xffffff);
// //   g.strokeCircle(ox, oy, outerR * scale);
// //   g.strokeCircle(ox, oy, innerR * scale);
// // }

// // function updateMiniPlayer(px, py) {
// //   const scale = 0.08;
// //   const ox = 100, oy = 100;
// //   const { cx, cy } = LEVEL.ring;

// //   miniPlayer.x = ox + (px - cx) * scale;
// //   miniPlayer.y = oy + (py - cy) * scale;
// // }



// // // ===================
// // // 建立圓環牆
// // // ===================
// // function createRingWalls(scene) {
// //   const { cx, cy, outerR, innerR } = LEVEL.ring;

// //   for (let angle = 0; angle < 360; angle += 3) {
// //     let rad = Phaser.Math.DegToRad(angle);

// //     let ox = cx + Math.cos(rad) * outerR;
// //     let oy = cy + Math.sin(rad) * outerR;

// //     let ix = cx + Math.cos(rad) * innerR;
// //     let iy = cy + Math.sin(rad) * innerR;

// //     let w1 = scene.add.rectangle(ox, oy, 40, 40, 0x888888);
// //     let w2 = scene.add.rectangle(ix, iy, 40, 40, 0x888888);
// //     wallsGroup.add(w1);
// //     wallsGroup.add(w2);
// //   }
// // }



// // // ===================
// // // 建立分支牆（沿 polyline 擺小方塊）
// // // ===================
// // function createBranchWalls(scene, branch) {
// //   const pts = branch.points;

// //   for (let i = 0; i < pts.length - 1; i++) {
// //     let [x1, y1] = pts[i];
// //     let [x2, y2] = pts[i + 1];

// //     let steps = 20;
// //     for (let t = 0; t <= 1; t += 1 / steps) {
// //       let x = Phaser.Math.Linear(x1, x2, t);
// //       let y = Phaser.Math.Linear(y1, y2, t);

// //       let w = scene.add.rectangle(x, y, 35, 35, 0x666666);
// //       wallsGroup.add(w);
// //     }
// //   }
// // }



// // // ===================
// // // 抽選唯一出口
// // // ===================
// // function pickRandomExit() {
// //   let candidates = LEVEL.branches.filter(b => b.candidateExit);
// //   let pick = Phaser.Math.RND.pick(candidates);
// //   return pick;
// // }



// // // ===================
// // // 出口感應器（Goal）
// // // ===================
// // function createGoalSensor(scene, branch) {
// //   let pts = branch.points;
// //   let last = pts[pts.length - 1];

// //   goalSensor = scene.add.rectangle(
// //     last[0], last[1], 150, 150, 0x00ffff, 0.2
// //   );
// //   scene.physics.add.existing(goalSensor);
// //   goalSensor.body.setAllowGravity(false);
// //   goalSensor.body.setImmovable(true);
// //   goalSensor.body.setSize(150, 150);
// // }



// // // ===================
// // // 過關邏輯
// // // ===================
// // function reachExit() {
// //   console.log("🎉 通關！出口是：" + chosenExit.id);
// // }



// // // ===================
// // // 撞牆邏輯
// // // ===================
// // function hitWall(player, wall) {
// //   if (isInvincible) return;

// //   isColliding = true;
// //   speed = 0;
// //   isInvincible = true;

// //   // 往回退
// //   let past = positionHistory[0];
// //   player.x = past.x;
// //   player.y = past.y;
// //   player.rotation = past.rotation;
// //   player.body.reset(past.x, past.y);

// //   // 閃爍效果
// //   player.scene.tweens.add({
// //     targets: player,
// //     alpha: 0,
// //     duration: 100,
// //     yoyo: true
// //   });

// //   // 無敵恢復
// //   player.scene.time.delayedCall(500, () => {
// //     isInvincible = false;
// //   });
// // }
