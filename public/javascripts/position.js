let positionImg;

let btnImgA, btnImgB;
let btnA_W = 350, btnA_H;
let btnB_W = 350, btnB_H;
let btnA_X, btnA_Y;
let btnB_X, btnB_Y;

function preload() {
  positionImg = loadImage("/image/bg/positionBG.jpg");
  btnImgA = loadImage("/image/ui/select_road/roundabout.png");
  btnImgB = loadImage("/image/ui/select_road/newroad.png");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("position-container");

  btnA_H = (btnImgA.height / btnImgA.width) * btnA_W;
  btnB_H = (btnImgB.height / btnImgB.width) * btnB_W;

  updateButtonPosition();
}

function draw() {
  background(0);

  // ======================
  // 背景 cover
  // ======================
  let imgRatio = positionImg.width / positionImg.height;
  let canvasRatio = width / height;
  let drawW, drawH;

  if (canvasRatio > imgRatio) {
    drawW = width;
    drawH = width / imgRatio;
  } else {
    drawH = height;
    drawW = height * imgRatio;
  }

  image(positionImg, 0, 0, drawW, drawH);

  drawButtons();
}

// ---------------------------
// 按鈕位置
// ---------------------------
function updateButtonPosition() {
  btnA_X = width * 0.732 - 500; // 左按鈕
  btnA_Y = height * 0.54;

  btnB_X = width * 0.732-90; // 右按鈕
  btnB_Y = height * 0.54;
}

// ---------------------------
// 畫兩個按鈕
// ---------------------------
function drawButtons() {
  drawSingleButton(btnImgA, btnA_X, btnA_Y, btnA_W, btnA_H);
  drawSingleButton(btnImgB, btnB_X, btnB_Y, btnB_W, btnB_H);
}

// 畫一個按鈕（包含 hover 放大）
function drawSingleButton(img, x, y, w, h) {
  push();
  translate(x, y);
  imageMode(CENTER);

  if (isHovering(x, y, w, h)) {
    scale(1.05);
  }

  image(img, 0, 0, w, h);
  pop();
}

// ---------------------------
// hover 判定（單顆按鈕）
// ---------------------------
function isHovering(x, y, w, h) {
  return (
    mouseX > x - w / 2 &&
    mouseX < x + w / 2 &&
    mouseY > y - h / 2 &&
    mouseY < y + h / 2
  );
}

// ---------------------------
// click 判定
// ---------------------------
function mousePressed() {
  if (isHovering(btnA_X, btnA_Y, btnA_W, btnA_H)) {
    console.log("Clicked A");
    window.location.href = "/conclusion.html";
  }

  if (isHovering(btnB_X, btnB_Y, btnB_W, btnB_H)) {
    console.log("Clicked B");
    window.location.href = "/conclusion.html";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateButtonPosition();
}
