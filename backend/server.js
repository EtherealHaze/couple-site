const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

app.use(express.json({ limit: '100mb' }));
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      settings: {},
      gallery: ['','','','','',''],
      messages: [
        { author: '他', title: '', content: '遇见你是我这辈子最幸运的事情 ❤️', date: '2025.01.01' },
        { author: '她', title: '', content: '和你在一起的日子，每一天都像甜甜的梦 🥰', date: '2025.01.01' }
      ],
      bucket: [
        { emoji: '🌍', text: '一起去日本看樱花', done: false },
        { emoji: '🍜', text: '吃遍全城的火锅店', done: false },
        { emoji: '🎬', text: '一起看一百部电影', done: false },
        { emoji: '🏠', text: '布置我们的小家', done: false },
        { emoji: '🌍', text: '去海边看一次日出', done: false },
        { emoji: '🎉', text: '一起跨年倒数', done: false }
      ],
      storyEvents: [
        { period: '2023.09.10', title: '初次相遇 ✨', desc: '那天的阳光刚好，我们在某个地方遇见了彼此。' },
        { period: '2023.12.24', title: '第一次约会 🎄', desc: '平安夜，一起走在灯火通明的街上。' },
        { period: '2024.02.14', title: '在一起啦 💕', desc: '情人节这天，我们正式牵起了彼此的手。' },
        { period: '2024.07.15', title: '第一次旅行 🌊', desc: '一起去看海，拍了好多照片。' },
        { period: '今天', title: '故事还在继续... 🌟', desc: '每一天都是新的篇章。' }
      ],
      storyData: [{},{},{},{},{}],
      favs: {
        songs: [
          { name: '想见你想见你想见你 — 八三夭', tag: '💗 她最爱' },
          { name: '关键词 — 林俊杰', tag: '💙 他最爱' },
          { name: '小幸运 — 田馥甄', tag: '🎵 我们的歌' }
        ],
        movies: [
          { name: '你的名字。', tag: '⭐ 第一次一起看' },
          { name: '铃芽之旅', tag: '🎬 电影院' },
          { name: '爱乐之城', tag: '🎵 原声超棒' }
        ],
        food: [
          { name: '火锅', tag: '🔥 每周必吃' },
          { name: '寿司', tag: '🍣 第一次约会' },
          { name: '奶茶', tag: '🧋 她最爱' }
        ],
        places: [
          { name: '日本·京都', tag: '🌸 看樱花' },
          { name: '冰岛', tag: '🌌 看极光' },
          { name: '云南·大理', tag: '☀️ 去有风的地方' }
        ]
      }
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

let appData = initData();

function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(appData, null, 2));
}

app.get('/api/load', (req, res) => {
  res.json(appData);
});

app.post('/api/save', (req, res) => {
  for (var key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      appData[key] = req.body[key];
    }
  }
  saveData();
  res.json({ ok: true });
});

// File upload endpoint
var multer = require('multer');
var upload = multer({ dest: path.join(__dirname, '..', 'data', 'uploads/') });
app.use('/uploads', express.static(path.join(__dirname, '..', 'data', 'uploads/')));

app.post('/api/upload', upload.single('photo'), function(req, res) {
  if (!req.file) return res.status(400).json({ error: 'no file' });
  var ext = path.extname(req.file.originalname) || '.jpg';
  var newPath = req.file.path + ext;
  fs.renameSync(req.file.path, newPath);
  res.json({ url: '/uploads/' + req.file.filename + ext });
});

app.delete('/api/upload/:filename', function(req, res) {
  var filePath = path.join(__dirname, '..', 'data', 'uploads', req.params.filename);
  try { fs.unlinkSync(filePath); } catch(e) {}
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server started on port ' + PORT);
  console.log('Local:   http://localhost:' + PORT);
  console.log('Network: http://10.60.77.155:' + PORT);
});
