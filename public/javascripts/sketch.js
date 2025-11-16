let targetW = 1920;
let targetH = 1200;

let carImgs = [];
let carButtons = [];
let selectedIndex = -1;

// 三台車名字（顯示用，可改成你要的）
const carNames = ["公車", "汽車", "機車"];

function preload() {
  // 從 Express 靜態根目錄載圖：/image/....
  carImgs[0] = loadImage("/images/car/car1.png");
  carImgs[1] = loadImage("/images/car/car2.png");
  carImgs[2] = loadImage("/images/car/car3.png");
}

function setup() {
  // 你原本的比例寫法
  createCanvas(
    windowWidth - 400,
    ((windowWidth - 400) / targetW) * targetH
  );

  // 按鈕大小
  const btnW = 220;
  const btnH = 220;
  const spacing = 60; // 車與車之間的距離

  // 三台車排橫向，整排置中
  const totalWidth = 3 * btnW + 2 * spacing;
  const startX = (width - totalWidth) / 2;
  const y = height / 2 - btnH / 2;

  for (let i = 0; i < 3; i++) {
    const x = startX + i * (btnW + spacing);
    const img = carImgs[i];

    const index = i; // 關閉範圍用
    //建立按鈕(建構函式)
    const btn = new ImageButton(
      x,
      y,
      btnW,
      btnH,
      img,
      null,
      () => {
        selectedIndex = index;
        console.log("選擇車子：", carNames[index]);
      }
    );

    carButtons.push(btn);
  }

  textAlign(CENTER, CENTER);
}

function draw() {
  background(230); // 如果你要透明就改成 clear();

  // 標題
  fill(0);
  textSize(32);
  noStroke();
  text("選擇你的車子", width / 2, 80);

  // 畫三台車按鈕
  for (let i = 0; i < carButtons.length; i++) {
    const btn = carButtons[i];

    // 先畫按鈕（圖片）
    btn.draw();

    // 在下面寫車名
    fill(0);
    noStroke();
    textSize(20);
    text(
      carNames[i],
      btn.x + btn.w / 2,
      btn.y + btn.h + 24
    );

    // 如果這台是被選中的，畫綠框
    if (i === selectedIndex) {
      noFill();
      stroke(0, 255, 0);
      strokeWeight(4);
      rect(btn.x - 4, btn.y - 4, btn.w + 8, btn.h + 8, 16);
    }
  }

  // 畫底部說明
  fill(0);
  textSize(20);
  noStroke();
  let msg = "目前尚未選擇車子";
  if (selectedIndex !== -1) {
    msg = "你選擇的是：" + carNames[selectedIndex];
  }
  text(msg, width / 2, height - 180);
}

function mousePressed() {
  for (let btn of carButtons) {
    btn.handleClick();
  }
}
