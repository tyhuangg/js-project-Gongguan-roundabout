// 遊戲核心邏輯
// =======================================================
// JS 專案遊戲核心邏輯 (game.js)
// 包含所有與 Canvas 繪圖、物件互動相關的程式碼
// =======================================================

/**
 * 遊戲物件類別 (基礎車輛)
 */
class Vehicle {
    constructor(type, speed, handling) {
        this.type = type;
        this.speed = speed;
        this.handling = handling;
        this.x = 0;
        this.y = 0;
        this.direction = 0; // 角度
        this.isMoving = false;
        // ...
    }

    draw(ctx) {
        // TODO: 繪製車輛的邏輯 (例如使用 Canvas)
    }

    update() {
        // TODO: 更新位置和方向的物理邏輯
    }
}

/**
 * 初始化關卡一或關卡二的遊戲畫布
 * @param {string} levelName 關卡名稱
 */
export function initLevel(levelName) {
    // 1. 建立 Canvas 元素
    // 2. 載入地圖資源 (assets/images/...)
    // 3. 實例化玩家選取的 Vehicle 類別
    // 4. 設定遊戲迴圈 (requestAnimationFrame)
    console.log(`初始化 ${levelName} 關卡`);
    // ...
}

/**
 * 處理鍵盤輸入
 * @param {KeyboardEvent} event 
 */
export function handleInput(event) {
    // 處理 ↑, ↓, ←, → 的按鍵狀態，並更新玩家 Vehicle 的狀態
    // ...
}


// 如果您需要將此檔案的函數導出給 main.js 使用，請使用 export
// export { initLevel, handleInput };