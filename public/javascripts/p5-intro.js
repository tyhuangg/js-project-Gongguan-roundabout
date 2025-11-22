let introBg;
let drawW, drawH;  // 背景實際繪製大小
let drawX, drawY;  // 背景置中 offset

// ===== 文字內容 =====
let titleText = "公館圓環，曾是台北人記憶裡的節點。";
let contentTexts = [
  "早晨的車潮、擁挤的公車、趕著下課的腳步——",
  "可以通往中永和、公館及新店，每個人都在這裡，繞過某段人生的軌跡。",
  " ",
  "可是，在車流與喇叭聲交錯的日常裡，",
  "它也連續七年，成為台北市事故最多的路口。",
  "七年間，發生了 1,717 起車禍，而70%來自變換車道時的擦撞。",
  "交通安全問題的確不容忽視。",
  " ",
  "於是，有人決定：該讓圓環消失了。",
  "可你是否也想過——",
  "少了圓環，改為正交路口，問題就會改善嗎？",
  "還是，我們，只是換了一種等待的方式？"
];

let btnImg;
let btnW = 350;
let btnH;
let btnX, btnY; // 中心座標

let startFrame;
let lines = [];

function preload() {
  introBg = loadImage("/image/bg/intro.jpg");
  btnImg = loadImage("/image/ui/start_tutorial.png");
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("intro");
  canvas.position(0, 0);
  canvas.style("position", "absolute");

  textFont("Noto Sans TC");
  textAlign(LEFT, TOP);

  setupLines();

  btnH = (btnImg.height / btnImg.width) * btnW;

  startFrame = frameCount;
  updateButtonPosition();
  updateBackgroundSize();
}

function draw() {
  drawBackground();
  drawTitle();
  drawLines();
  drawButton();
}

//===========================
// 段落淡入設定
//===========================
function setupLines() {
  let delay = 30;
  lines = [];

  contentTexts.forEach((t, i) => {
    lines.push({
      text: t,
      delayFrame: i * delay,
      alpha: 0,
      yOffset: 20
    });
  });
}

//===========================
// 背景 cover（置中）
//===========================
function updateBackgroundSize() {
  let imgRatio = introBg.width / introBg.height;
  let canvasRatio = width / height;

  if (canvasRatio > imgRatio) {
    drawW = width;
    drawH = width / imgRatio;
  } else {
    drawH = height;
    drawW = height * imgRatio;
  }

  // 中央對齊
  drawX = (width - drawW) / 2;
  drawY = (height - drawH) / 2;
}

function drawBackground() {
  image(introBg, drawX, drawY, drawW, drawH);
}

//===========================
// 標題
//===========================
function drawTitle() {
  fill(255);
  textSize(50);
  text(titleText, 0.05 * width, 0.10 * height);
}

//===========================
// 多行文案淡入
//===========================
function applyFadeIn(line) {
  let duration = 40;
  let start = startFrame + line.delayFrame;
  let end = start + duration;

  if (frameCount > start) {
    let t = constrain((frameCount - start) / duration, 0, 1);
    let eased = easeOutCubic(t);
    line.alpha = eased * 255;
    line.yOffset = (1 - eased) * 20;
  }
}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

function drawLines() {
  textSize(20);
  let baseX = 0.05 * width;
  let baseY = 0.22 * height;
  let gap = 40;

  lines.forEach((line, i) => {
    applyFadeIn(line);
    fill(255, line.alpha);
    text(line.text, baseX, baseY + i * gap + line.yOffset);
  });
}

//===========================
// 按鈕
//===========================
function updateButtonPosition() {
  btnX = width * 0.732;
  btnY = height * 0.54;
}

function drawButton() {
  let hovered = isHoveringButton();

  push();
  translate(btnX, btnY);

  if (hovered) {
    scale(1.05);
  }

  imageMode(CENTER);
  image(btnImg, 0, 0, btnW, btnH);

  pop();
}

function isHoveringButton() {
  return (
    mouseX > btnX - btnW / 2 &&
    mouseX < btnX + btnW / 2 &&
    mouseY > btnY - btnH / 2 &&
    mouseY < btnY + btnH / 2
  );
}

function mousePressed() {
  if (isHoveringButton()) {
    window.location.href = "/tutorial";
  }
}

//===========================
// RWD
//===========================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateBackgroundSize();
  updateButtonPosition();
  startFrame = frameCount; // 文字淡入重新開始（避免跳動）
}
