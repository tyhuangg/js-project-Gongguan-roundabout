// level1.js
// ===================================
// 回轉道關卡的邏輯（獨立於 game.js）
// ===================================

//import { Vehicle } from "/src/js/game.js";  // 如需載入車輛邏輯

const canvas = document.getElementById("mapCanvas");
const ctx = canvas.getContext("2d");

// 載入地圖
const mapImg = new Image();
mapImg.src = "/src/image/map/circle_map.png";
mapImg.src = "/image/map/circle_map.png";


/** ------------------------
 *  1. 定義入口 + 多個出口
 * ------------------------ */
const paths = {
    entry: {
        id: "ENTRY",
        points: [
            { x: 120, y: 780 },
            { x: 170, y: 600 },
            { x: 260, y: 450 }
        ]
    },

    exits: [
        {
            id: "NORTH",
            points: [
                { x: 350, y: 80 },
                { x: 330, y: 230 },
                { x: 300, y: 370 }
            ]
        },
        {
            id: "EAST",
            points: [
                { x: 620, y: 330 },
                { x: 540, y: 380 },
                { x: 430, y: 430 }
            ]
        },
        {
            id: "WEST",
            points: [
                { x: 80, y: 300 },
                { x: 160, y: 350 },
                { x: 260, y: 400 }
            ]
        }
    ]
};

let currentExit = null;


/** --------------------------------
 * 2. 抽一個出口
 * -------------------------------- */
function pickRandomExit() {
    const i = Math.floor(Math.random() * paths.exits.length);
    currentExit = paths.exits[i];
}


/** --------------------------------
 * 3. 畫 polyline
 * -------------------------------- */
function drawPolyline(points, color, width = 8) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
}


/** --------------------------------
 * 4. 繪製整個場景
 * -------------------------------- */
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);

    // 固定入口（藍色）
    drawPolyline(paths.entry.points, "#00AFFF", 8);

    // 本關的出口（紅色）
    if (currentExit) {
        drawPolyline(currentExit.points, "#FF3B6B", 8);
    }
}


/** --------------------------------
 * 5. 初始化這關
 * -------------------------------- */
function startLevel() {
    pickRandomExit();

    // 地圖載入後才開始畫
    mapImg.onload = () => {
        draw();
    };
}


// 啟動關卡
startLevel();
