# 🚗 Gongguan Roundabout Driving Game

一個以 **台北公館圓環** 為靈感的 JavaScript 互動駕駛專案，結合地圖碰撞、交通號誌、NPC 車輛與小地圖系統，模擬真實城市圓環的駕駛體驗。本專案著重於 **遊戲邏輯設計、即時互動與系統整合能力**，適合作為前端互動、遊戲開發或創意程式設計的作品展示。

---

## ✨ 專案特色

* 🗺 **大型可探索地圖**：支援自由移動的圓環地圖，並搭配世界縮放比例設計
* 🚦 **交通號誌邏輯**：紅燈牆機制，模擬真實交通限制
* 🚘 **NPC 車輛系統**：自動行駛的非玩家車輛，提升環境真實感
* 🧭 **即時小地圖（Mini-map）**：顯示玩家位置與行駛軌跡
* 🧱 **Pixel-level 碰撞偵測**：避免玩家車輛駛出可行駛道路
* 🎮 **平滑駕駛手感**：加速、減速、轉向皆有物理參數控制

---

## 🛠 使用技術

* **JavaScript (ES6)**
* **Phaser 3**（2D Game Framework）
* **HTML / CSS**
* **Canvas Rendering**

---

## 📁 專案結構

```
project-root/
├── index.html              # 遊戲入口
├── javascripts/
│   ├── level1.js           # 主遊戲邏輯（地圖、玩家、NPC、號誌）
│   └── select.js           # 車種選擇與狀態儲存
├── image/
│   ├── map/                # 主地圖與像素遮罩
│   ├── cars/               # 玩家與 NPC 車輛素材
│   └── ui/                 # 小地圖、介面元素
├── stylesheets/
│   └── style.css
└── README.md
```

---

## ▶️ 執行方式

> 建議使用本地伺服器執行（避免瀏覽器載入本地資源限制）

```bash
# 若你有 Node.js
npx serve
```

或使用 VS Code 的 **Live Server** 開啟 `index.html`。

---

## 🎯 操作方式

* **↑ / W**：加速
* **↓ / S**：減速 / 後退
* **← / A**：左轉
* **→ / D**：右轉

---

## 🧠 設計重點與學習收穫

* 將真實交通場景轉化為可互動的 2D 遊戲系統
* 處理 **世界座標 vs 畫面座標** 的轉換問題
* 模組化管理玩家、NPC、交通邏輯，避免單一檔案過於複雜
* 解決 Phaser 中 **Resize / Scale / Collision** 的實務問題

---

## 🔮 未來擴充方向

* 🚥 動態紅綠燈時序（非固定牆）
* 🧑‍🤝‍🧑 行人與突發事件系統
* 🏁 任務模式（限時繞行、遵守交通規則評分）
* 📱 行動裝置操作優化

---

## 👤 Author

**黃婷筠**
National Chengchi University, Department of Management Information Systems

如果你對這個專案或相關技術細節有興趣，歡迎交流！
