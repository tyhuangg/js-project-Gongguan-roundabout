let tutoBg;
let btnImg;

let drawW, drawH;
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
}

function draw() {
  drawBackground();
  drawButton();
}

function drawBackground() {
  let imgRatio = tutoBg.width / tutoBg.height;
  let canvasRatio = width / height;

  if (canvasRatio > imgRatio) {
    drawW = width;
    drawH = width / imgRatio;
  } else {
    drawH = height;
    drawW = height * imgRatio;
  }

  image(tutoBg, 0, 0, drawW, drawH);
}

function drawButton() {
  // 按鈕位置（用背景比例決定 → 不會跑位）
  btnX = drawW * 0.35;  
  btnY = drawH * 0.75;

  let hovered =
    mouseX > btnX &&
    mouseX < btnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;

  push();
  if (hovered) {
    scale(1.05);
    image(btnImg, btnX / 1.05, btnY / 1.05, btnW, btnH);
  } else {
    image(btnImg, btnX, btnY, btnW, btnH);
  }
  pop();
}

function mousePressed() {
  let hovered =
    mouseX > btnX &&
    mouseX < btnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;

  if (hovered) {
    window.location.href = "/teach";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
