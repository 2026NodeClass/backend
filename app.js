// app.js 
require('dotenv').config({ quiet: true });

const express = require('express');
const adminRouter = require('./routers/admin.router')
const authRouter = require('./routers/auth.router');
const favoriteRouter = require('./routers/favorite.router');
const app = express();              // app = 一個請求處理器


app.use(express.json());

// 全域 middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next(); // 沒有結束回應，一定要 next() 才能往下走
});



//------------------------- 路由列表 --------------------------------------


app.use('/api/auth', authRouter); // 登入路由
app.use('/api/admin',adminRouter); // 後台路由
app.use('/api/favorites', favoriteRouter); // 登入使用者的收藏路由


//--------------------------------------------------------------------------

// 客製 404：永遠放在所有路由「最後」（app.listen 之前）
// ⚠️ 之後每節新增的路由，都要加在這行【上面】
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// 統一處理資料庫限制與非預期錯誤，避免把 SQL 細節暴露給前端。
app.use((err, req, res, next) => {
  console.error(err);

  if (err.code === '23505') {
    const message = err.constraint === 'users_email_unique_lower_idx'
      ? '此 Email 已註冊'
      : '資料已存在，請確認 ID 或座標是否重複';
    return res.status(409).json({ message });
  }
  if (err.code === '23503') {
    const message = req.method === 'DELETE'
      ? '此星系仍有行星，無法刪除'
      : '指定的星系不存在';
    return res.status(409).json({ message });
  }
  if (['23502', '23514', '22P02', '22001'].includes(err.code)) {
    return res.status(400).json({ message: '欄位格式或數值不符合規則' });
  }

  res.status(500).json({ message: '伺服器發生錯誤' });
});


app.listen(3010, () => {            // 等同 http.createServer(app).listen(3010)
  console.log('Server 啟動在 http://localhost:3010');
});
