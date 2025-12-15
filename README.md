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
js-project-Gongguan-roundabout/
├─ bin/
│  └─ www
├─ public/
│  ├─ image/
│  │  ├─ bg/
│  │  │  ├─ BackGround_Frame1.png
│  │  │  ├─ Background_Frame3_11_12_13_14.png
│  │  │  ├─ Conclusion.png
│  │  │  ├─ hero.jpg
│  │  │  ├─ intro.jpg
│  │  │  └─ tutorial.jpg
│  │  ├─ car_side/
│  │  │  ├─ bus_side.png
│  │  │  ├─ car_side.png
│  │  │  └─ scooter_side.png
│  │  ├─ car_top/
│  │  │  ├─ bus_top.png
│  │  │  ├─ car_top.png
│  │  │  └─ scooter_top.png
│  │  ├─ map/
│  │  │  ├─ Circle_map_B.PNG
│  │  │  ├─ Circle_map_W.PNG
│  │  │  ├─ Circle_map_WB.PNG
│  │  │  ├─ circle_map.png
│  │  │  ├─ circle_small_map.png
│  │  │  ├─ MiniMapMask.png
│  │  │  ├─ Orthogonal_map_WB.png
│  │  │  ├─ Orthogonal_map.png
│  │  │  ├─ Orthogonal_small_map.png
│  │  │  ├─ partice_map_WB.png
│  │  │  └─ partice_map.png
│  │  ├─ npc_car_top/
│  │  │  ├─ npc_bus_top.png
│  │  │  ├─ npc_car_top.png
│  │  │  └─ npc_scooter_top.png
│  │  └─ ui/
│  │     ├─ Heart/
│  │     │  ├─ 1heart.png
│  │     │  ├─ 2heart.png
│  │     │  ├─ 3heart.png
│  │     │  └─ noheart.png
│  │     ├─ keyboard/
│  │     │  ├─ Keyboard-down-dark.png
│  │     │  ├─ Keyboard-down-light.png
│  │     │  ├─ Keyboard-left-dark.png
│  │     │  ├─ Keyboard-left-light.png
│  │     │  ├─ Keyboard-right-dark.png
│  │     │  ├─ Keyboard-right-light.png
│  │     │  ├─ Keyboard-up-dark.png
│  │     │  └─ Keyboard-up-light.png
│  │     ├─ redgreenlight/
│  │     │  ├─ RedGreenLight_3Light_Green.png
│  │     │  ├─ RedGreenLight_3Light_Red.png
│  │     │  └─ RedGreenLight_3Light_Yellow.png
│  │     ├─ select_road/
│  │     │  ├─ Choose_01.png
│  │     │  └─ Choose_02.png
│  │     ├─ Arrow.png
│  │     ├─ BackMainCanva.png
│  │     ├─ ChatBox.png
│  │     ├─ Choose_01.png
│  │     ├─ Choose_02.png
│  │     ├─ Choose_03.png
│  │     ├─ finsh.png
│  │     ├─ Keyboard.png
│  │     ├─ List of Members.png
│  │     ├─ next.png
│  │     ├─ start_teach.png
│  │     ├─ start_tutorial.png
│  │     └─ TopMask.png
│  ├─ javascripts/
│  │  ├─ carbasic.js
│  │  ├─ conclusion.js
│  │  ├─ ImageButton.js
│  │  ├─ index.js
│  │  ├─ level1.js
│  │  ├─ level2.js
│  │  ├─ p5-intro.js
│  │  ├─ p5-tutorial.js
│  │  ├─ p5.welcome.js
│  │  ├─ roles.js
│  │  ├─ select.js
│  │  ├─ teach.js
│  │  ├─ tlightlevel1.js
│  │  └─ tutorial.js
│  ├─ stylesheets/
│  │  └─ style.css
│  ├─ carbasic.html
│  ├─ conclusion.html
│  ├─ index.html
│  ├─ intro.html
│  ├─ level1.html
│  ├─ level2.html
│  ├─ position_selection.html
│  ├─ select.html
│  ├─ teach.html
│  └─ tutorial.html
├─ routes/
│  ├─ index.js
│  └─ users.js
├─ .gitignore
├─ .Rhistory
├─ app.js
├─ package-lock.json
├─ package.json
└─ README.md

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

本專案為課程專案，由修課學生共同完成。

Core Development / Main Programmer

黃婷筠（主要負責核心遊戲邏輯、系統整合與程式實作）

Team Members

陳采霓

鄭勻禎

謝誼泓

廖語岑

胡乃云

蕭向喆
