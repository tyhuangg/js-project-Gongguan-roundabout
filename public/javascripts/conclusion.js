let bgImg;

function preload() {
  // 載入背景圖
  bgImg = loadImage("/image/bg/Conclusion.png");
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("conclusion");
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

// 讓畫面能隨視窗變化
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener("DOMContentLoaded", () => {
  const conclusionSection = document.getElementById("conclusion");

  // 點擊整個結論畫面就前往 home.html
  conclusionSection.addEventListener("click", () => {
    window.location.href = "/ending.html";
  });
});
