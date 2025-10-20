// 程式進入點/遊戲關卡控制
// =======================================================
// JS 專案流程控制 (main.js)
// =======================================================

// 載入遊戲邏輯模組 (假設 game.js 負責處理遊戲畫布和物件)
// import * as Game from './game.js'; // 如果您使用 ES Module

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM 結構已完全載入。開始遊戲初始化...");

    const welcomeScreen = document.getElementById('welcome-screen');
    const startBtn = document.getElementById('start-experience-btn');
    const gameContainer = document.getElementById('game-container');

    // 遊戲狀態變數，用於追蹤目前在哪個階段
    let currentPhase = 'welcome';

    // ----------------------------------------------------
    // 步驟一：處理「開始體驗」按鈕
    // ----------------------------------------------------
    startBtn.addEventListener('click', () => {
        console.log("開始體驗按鈕被點擊。");
        
        // 隱藏歡迎畫面
        welcomeScreen.classList.remove('active');
        
        // 進入下一個階段 (操作解釋與練習關)
        currentPhase = 'tutorial';
        loadTutorialScreen();
    });

    // ----------------------------------------------------
    // 步驟二：載入操作解釋與練習畫面
    // ----------------------------------------------------
    function loadTutorialScreen() {
        console.log("載入操作教學畫面...");
        
        // TODO: 建立並顯示教學畫面的 HTML 結構
        const tutorialHTML = `
            <section id="tutorial-screen" class="screen active">
                <h2>操作解釋與練習</h2>
                <p>按鍵說明：</p>
                <ul>
                    <li>↑ (上箭頭)：前進</li>
                    <li>↓ (下箭頭)：煞車</li>
                    <li>← / → (左右箭頭)：轉向</li>
                </ul>
                <div id="practice-area" style="width: 400px; height: 200px; border: 1px dashed gray; margin: 20px auto;">
                    <p>您現在可以在這裡自由練習...</p>
                </div>
                <button id="finish-tutorial-btn">進入正式遊戲</button>
            </section>
        `;
        gameContainer.insertAdjacentHTML('beforeend', tutorialHTML);

        document.getElementById('finish-tutorial-btn').addEventListener('click', () => {
            document.getElementById('tutorial-screen').classList.remove('active');
            currentPhase = 'character_select';
            loadCharacterSelectScreen();
        });

        // TODO: 在 game.js 中實作練習場景的簡易操控
        // Game.initPractice();
    }
    
    // ----------------------------------------------------
    // 步驟三：載入角色選擇畫面 (未完成，組員可以接手從這裡開始開發)
    // ----------------------------------------------------
    function loadCharacterSelectScreen() {
        console.log("載入角色選擇畫面...");
        // 這是組員可以開始開發的地方
        // ...
    }
});

// 在這裡放置其他通用的輔助函數
// function changeScreen(oldId, newId) { ... }