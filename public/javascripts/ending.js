let bgImg;

let btnImg;
let btnW, btnH;
let btnX, btnY; 

function preload() {
  bgImg = loadImage("/image/bg/ending.png");
  btnImg = loadImage("/image/ui/backtofront.png");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("ending");

  btnW = 350;
  btnH = (btnImg.height / btnImg.width) * btnW;

  updateButtonPosition();
}

function draw() {
  // 讓圖片自動 cover，效果像 background-size: cover
  let imgRatio = bgImg.width / bgImg.height;
  let canvasRatio = width / height;

  let drawW, drawH;

  if (canvasRatio > imgRatio) {
    // 畫布比較寬 → 以寬為基準放大圖片
    drawW = width;
    drawH = width / imgRatio;
  } else {
    // 畫布比較高 → 以高為基準放大圖片
    drawH = height;
    drawW = height * imgRatio;
  }

  image(bgImg, 0, 0, drawW, drawH);

  drawButton();
}

function updateButtonPosition() {
  btnX = width * 0.5;
  btnY = height * 0.84;
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
    window.location.href = "/index.html";
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}