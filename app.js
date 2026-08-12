// app.js 
require('dotenv').config({ quiet: true });

const express = require('express');
const adminRouter = require('./routers/admin.router')
const authRouter = require('./routers/auth.router');
const favoriteRouter = require('./routers/favorite.router');
const { pool } = require('./db/pg');
const { AppDataSource } = require('./db/typeorm/data-source');
const { galaxyRouter, planetRouter } = require('./routers/catalog.router');
const healthRouter = require('./routers/health.router');
const app = express();              // app = 一個請求處理器
const cors = require('cors')

const corsOptions = {
  origin: 'http://localhost:5173',
};

app.use(cors(corsOptions));
app.use(express.json());

// 全域 middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next(); // 沒有結束回應，一定要 next() 才能往下走
});



//------------------------- 路由列表 --------------------------------------

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: '伺服器運作中' });
});

app.use('/api/auth', authRouter); // 登入路由
app.use('/api/admin',adminRouter); // 後台路由
app.use('/api/favorites', favoriteRouter); // 登入使用者的收藏路由


//--------------------------------------------------------------------------

// 客製 404：永遠放在所有路由「最後」（app.listen 之前）
// ⚠️ 之後每節新增的路由，都要加在這行【上面】
app.use('/api/health', healthRouter);
app.use('/api/galaxies', galaxyRouter);
app.use('/api/planets', planetRouter);

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


let server;

async function startServer() {
  await AppDataSource.initialize();
  server = app.listen(3010, () => { // 等同 http.createServer(app).listen(3010)
    console.log('Server 啟動在 http://localhost:3010');
  });
}

async function closeDatabases() {
  const closingTasks = [pool.end()];
  if (AppDataSource.isInitialized) {
    closingTasks.push(AppDataSource.destroy());
  }
  await Promise.allSettled(closingTasks);
}

async function shutdown(signal) {
  console.log(`收到 ${signal}，正在關閉伺服器`);

  if (!server) {
    await closeDatabases();
    process.exit(0);
  }

  server.close(async (error) => {
    await closeDatabases();
    process.exit(error ? 1 : 0);
  });
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch(async (error) => {
  console.error('伺服器啟動失敗：', error);
  await closeDatabases();
  process.exit(1);
});
