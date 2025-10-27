var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// 中介軟體設定
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 公開靜態資料夾
// app.use(express.static(path.join(__dirname, 'public')));
// 公開靜態資料夾
app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html']
}));


// --- 靜態頁面路由 ---
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// app.get('/tutorial', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'tutorial.html'));
// });

// app.get('/roles', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'roles.html'));
// });

// app.get('/teach', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'teach.html'));
// });


// --- 錯誤處理 (optional) ---
app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>');
});

module.exports = app;
