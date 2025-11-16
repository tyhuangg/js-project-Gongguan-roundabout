class ImageButton {
  constructor(x, y, w, h, img, hoverImg, onClick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.img = img || null;
    this.hoverImg = hoverImg || null; // 可選
    this.onClick = onClick;

    // 預設顏色（圖片載不到時會用）
    this.bgColor = color(255, 255, 255, 30);
    this.hoverOverlay = 80; // hover 時蓋一層透明白
  }

  draw() {
    let isHover = this.isHover();

    // 先畫「背景框」，避免沒圖時完全沒東西
    noStroke();
    fill(this.bgColor);
    rect(this.x, this.y, this.w, this.h, 10);

    // 有圖片就畫圖片（覆蓋在上面）
    if (this.img) {
      // 圖片可能還沒載完，try-catch 避免報錯
      try {
        image(this.img, this.x, this.y, this.w, this.h);
      } catch (e) {
        // ignore，保留背景色塊
      }
    }

    // hover 狀態：蓋一層淡淡白色
    if (isHover) {
      fill(255, this.hoverOverlay);
      rect(this.x, this.y, this.w, this.h, 10);
    }
  }

  isHover() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    );
  }

  handleClick() {
    if (this.isHover() && this.onClick) {
      this.onClick();
    }
  }
}