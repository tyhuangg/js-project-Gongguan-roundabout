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
let playerX = 0;
let playerY = 0;

// 兩道紅燈牆
let trafficLights = [];

//NPC
let box;
const CAR_ANGLE_OFFSET = Phaser.Math.DegToRad(90);   // 車頭原本朝左，要翻到朝右

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
  this.load.image("npcBus", "/image/npc_car_top/npc_bus_top.png");
  this.load.image("npcScooter", "/image/npc_car_top/npc_scooter_top.png");
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
  MAP_SIZE = maskImg.width;
  WORLD_SIZE = MAP_SIZE * MAP_SCALE;

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
  // 3. 左上小地圖
  // ----------------------------------------------------
  this.add.image(0, 0, "colorMap")
    .setOrigin(0, 0)
    .setScale(0.04)
    .setScrollFactor(0)
    .setDepth(999);

  // ----------------------------------------------------
  //  4. 世界邊界（依照實際地圖縮放後大小）
  // ----------------------------------------------------
  this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
  this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

  // ----------------------------------------------------
  //  NPC試放區
  // ----------------------------------------------------
  startX = MAP_SIZE - 2000;
  startY = MAP_SIZE - 200;



  let npcPos = mapToWorld(4823, 7735);  // NPC 初始位置

  box = this.add.image(npcPos.x, npcPos.y, "npcBus");
  box.setOrigin(0.5, 0.5);     // 車頭中心點
  box.setScale(0.05);           // 縮放 (依圖片大小調整)
  
  this.physics.add.existing(box);

  let npcSpeed = 60;
  box.npcSpeed = npcSpeed;

  box.waypoints = makeWaypointList([
    { x: 4600, y: 6714 },
    { x: 4699, y: 5249 },
    { x: 5222, y: 4270 },
    { x: 5243, y: 3640 },
    { x: 4960, y: 2994 },
    { x: 4497, y: 2644 },
    { x: 2421, y: 1743 },
    { x: 784, y: 0 },
  ]);
  box.currentPoint = 0;

  let firstTarget = box.waypoints[0];
  box.rotation = Phaser.Math.Angle.Between(box.x, box.y, firstTarget.x, firstTarget.y)+ CAR_ANGLE_OFFSET;

  moveNPCToNextPoint();

  box.stopForRedLight = false;

  
  // ----------------------------------------------------
  // 5. 玩家出生位置
  // ----------------------------------------------------
  player = this.add.rectangle(startX * MAP_SCALE, startY * MAP_SCALE, 80, 40, 0x00ff00);
  this.physics.add.existing(player);
  player.rotation = Phaser.Math.DegToRad(90);

  this.physics.add.collider(player, box, onPlayerHitNPC, null, this);

  // ----------------------------------------------------
  // 6. 控制鍵
  // ----------------------------------------------------
  keys = this.input.keyboard.addKeys({
    left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up:    Phaser.Input.Keyboard.KeyCodes.UP,
    down:  Phaser.Input.Keyboard.KeyCodes.DOWN
  });

  // ----------------------------------------------------
  // 7. Camera
  // ----------------------------------------------------
  this.cameras.main.startFollow(player);

  // ----------------------------------------------------
  // 8. 小綠點（小地圖玩家指示）
  // ----------------------------------------------------
  miniPlayer = this.add.circle(100, 100, 5, 0x00ff00).setScrollFactor(0);

  //  生命值（最多 3 顆）
  this.hp = 3;

  // 右上角顯示愛心
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
  // 11. 主地圖紅線圖層
  // ----------------------------------------------------
  this.graphics = this.add.graphics();

  // ----------------------------------------------------
  // 12. 建立兩道紅燈牆（可分別設定紅綠燈時間）
  // ----------------------------------------------------
  createTrafficLightApprox.call(this, 1370, 1559, 932, 1712, 15, 5000, 3000); // 第一道
  createTrafficLightApprox.call(this, 299, 1018, 532, 1445, 15, 7000, 2000);  // 第二道
}

// ======================================================
// Update
// ======================================================
function update() {
  const scene = player.scene;

  //方向
  if (keys.left.isDown) player.rotation -= Phaser.Math.DegToRad(turnSpeed);
  if (keys.right.isDown) player.rotation += Phaser.Math.DegToRad(turnSpeed);

 // 加速 / 慣性
  let targetSpeed = keys.up.isDown ? maxSpeed : keys.down.isDown ? 0 : speed * 0.95;
  speed = Phaser.Math.Linear(speed, targetSpeed, acceleration);

  let nextX = player.x + Math.cos(player.rotation) * speed;
  let nextY = player.y + Math.sin(player.rotation) * speed;

  let maskX = nextX / MAP_SCALE;
  let maskY = nextY / MAP_SCALE;

  if (!isRoad(maskX, maskY)) hitWallPixel(player);
  else player.body.setVelocity(Math.cos(player.rotation) * speed, Math.sin(player.rotation) * speed);

  // 保存位置（倒退用）
  positionHistory.push({ x: player.x, y: player.y, rotation: player.rotation });
  if (positionHistory.length > 60) positionHistory.shift();

  //  小地圖更新
  miniPlayer.x = 100 + (player.x / WORLD_SIZE) * 100;
  miniPlayer.y = 100 + (player.y / WORLD_SIZE) * 100;

  // ----------------------------------------------------
  // 紅燈牆 HUD 更新
  // ----------------------------------------------------
  updateTrafficHUD();

  // ----------------------------------------------------
  // NPC移動測試區
  // ----------------------------------------------------
  if (box && box.body) {
    // --------- 紅燈偵測 ---------
    let npcNearRed = false;

    trafficLights.forEach(light => {
        if (light.state === 'red') {
            light.rects.forEach(rect => {
                let dx = rect.x - box.x;
                let dy = rect.y - box.y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if (dist < 60) {   // NPC 靠近紅燈牆
                    npcNearRed = true;
                }
            });
        }
    });

    if (npcNearRed) {
        box.stopForRedLight = true;
        box.body.setVelocity(0, 0);
        return; // 不繼續走路，直接跳出
    } else if (box.stopForRedLight) {
        box.stopForRedLight = false;
        moveNPCToNextPoint(); // 綠燈後繼續走
    }

    let target = box.waypoints[box.currentPoint];

    let dx = target.x - box.x;
    let dy = target.y - box.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    let targetAngle = Phaser.Math.Angle.Between(box.x, box.y, target.x, target.y);
    let correctedAngle = targetAngle + CAR_ANGLE_OFFSET;
    box.rotation = Phaser.Math.Angle.RotateTo(box.rotation, correctedAngle, 0.01);

    box.body.setVelocity(
        Math.cos(targetAngle) * box.npcSpeed,
        Math.sin(targetAngle) * box.npcSpeed
    );

    if (dist < 10) {
        // 停止
        box.body.setVelocity(0, 0);
        box.body.reset(target.x, target.y);

        // 下一個點
        box.currentPoint++;

        // 檢查是否還有下一個點
        if (box.currentPoint < box.waypoints.length) {
            moveNPCToNextPoint();   // 再出發！
        }
    }
  }
}

// ======================================================
// NPC產生器
// ======================================================

class NPC {
    constructor(scene, x, y, texture, speed, waypoints) {
        this.scene = scene;

        this.sprite = scene.add.image(x, y, texture)
            .setOrigin(0.5, 0.5)
            .setScale(0.05);

        scene.physics.add.existing(this.sprite);

        this.speed = speed;
        this.waypoints = waypoints;
        this.currentPoint = 0;

        this.stopForRedLight = false;

        // 初始朝向
        let target = this.waypoints[0];
        let targetAngle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
        this.sprite.rotation = targetAngle + CAR_ANGLE_OFFSET;
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
                    let dist = Math.sqrt(dx*dx + dy*dy);

                    if (dist < 60) npcNearRed = true;
                });
            }
        });

        if (npcNearRed) {
            this.stopForRedLight = true;
            this.sprite.body.setVelocity(0, 0);
            return;
        } 
        else if (this.stopForRedLight) {
            this.stopForRedLight = false;
        }

        let target = this.waypoints[this.currentPoint];

        let dx = target.x - this.sprite.x;
        let dy = target.y - this.sprite.y;
        let dist = Math.sqrt(dx*dx + dy*dy);

        let targetAngle = Phaser.Math.Angle.Between(
            this.sprite.x, 
            this.sprite.y, 
            target.x, 
            target.y
        );
        let correctedAngle = targetAngle + CAR_ANGLE_OFFSET;

        this.sprite.rotation = Phaser.Math.Angle.RotateTo(
            this.sprite.rotation, correctedAngle, 0.01
        );

        this.sprite.body.setVelocity(
            Math.cos(targetAngle) * this.speed,
            Math.sin(targetAngle) * this.speed
        );

        // 抵達下一個點
        if (dist < 10) {
            this.sprite.body.setVelocity(0, 0);
            this.sprite.body.reset(target.x, target.y);
            this.currentPoint++;

            if (this.currentPoint >= this.waypoints.length) {
                this.currentPoint = 0; // 循環
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
  return brightness > 128;
}

// ======================================================
// 撞牆回朔（Pixel Collision）
// ======================================================
function hitWallPixel(player) {
  const scene = player.scene;
  if (isInvincible) return;

  speed = 0;
  isInvincible = true;

  scene.hp--;
  scene.updateHeart();

  if (scene.hp <= 0) {
    // 死亡回出生點
    player.x = startX * MAP_SCALE;
    player.y = startY * MAP_SCALE;
    player.rotation = Phaser.Math.DegToRad(90);
    player.body.reset(player.x, player.y);
    scene.hp = 3;
    scene.updateHeart();
  } else {
    if (positionHistory.length >= 60) {
      let past = positionHistory[0];
      player.x = past.x;
      player.y = past.y;
      player.rotation = past.rotation;
      player.body.reset(past.x, past.y);
    }
  }

  scene.tweens.add({ targets: player, alpha: 0, duration: 80, yoyo: true, repeat: 2 });
  scene.time.delayedCall(1000, () => { isInvincible = false; });
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
// NPC移動邏輯
// ======================================================
function moveNPCToNextPoint() {
  let target = box.waypoints[box.currentPoint];
  box.body.setVelocity(0, 0);
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
        player.x = startX * MAP_SCALE;
        player.y = startY * MAP_SCALE;
        player.rotation = Phaser.Math.DegToRad(90);
        player.body.reset(player.x, player.y);

        scene.hp = 3;
        scene.updateHeart();
    }
  }


