let tutoBg;
let btnImg;

let drawW, drawH;
let drawX, drawY;

let btnW, btnH;
let btnX, btnY;

function preload() {
  // 教學頁背景
  tutoBg = loadImage("/image/bg/tutorial.jpg");

  // 教學頁按鈕
  btnImg = loadImage("/image/ui/start_teach.png");
}

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("tutorial");
  canvas.position(0, 0);
  canvas.style("position", "absolute");

  // 按鈕大小
  btnW = 350;
  btnH = (btnImg.height / btnImg.width) * btnW;

  updateBackgroundSize();
  updateButtonPosition();
}

function draw() {
  drawBackground();
  drawButton();
}

//===========================
// 背景 cover（置中）
//===========================
function updateBackgroundSize() {
  let imgRatio = tutoBg.width / tutoBg.height;
  let canvasRatio = width / height;

  if (canvasRatio > imgRatio) {
    drawW = width;
    drawH = width / imgRatio;
  } else {
    drawH = height;
    drawW = height * imgRatio;
  }

  // 中心對齊
  drawX = (width - drawW) / 2;
  drawY = (height - drawH) / 2;
}

function drawBackground() {
  image(tutoBg, drawX, drawY, drawW, drawH);
}

//===========================
// 按鈕
//===========================
function updateButtonPosition() {
  btnX = width * 0.5;
  btnY = height * 0.8;
}

function drawButton() {
  let hovered = isHoveringButton();

  push();
  translate(btnX, btnY);

  if (hovered) scale(1.05);

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
    window.location.href = "/teach";
  }
}

//===========================
// RWD
//===========================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateBackgroundSize();
  updateButtonPosition();
}
