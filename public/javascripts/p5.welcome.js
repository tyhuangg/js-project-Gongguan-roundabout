let bgImg;

function preload() {
  bgImg = loadImage("/image/bg/hero.jpg"); // 你的首頁背景
}

function setup() {
  // 將 p5 放到 #welcome 裡
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("welcome");
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener("DOMContentLoaded", () => {
  const welcomeSection = document.getElementById("welcome");

  // 點擊整個首頁畫面就前往 intro.html
  welcomeSection.addEventListener("click", () => {
    window.location.href = "/intro";
  });
});