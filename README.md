# 星球收藏後端 API

這是一個使用 Node.js、Express 與 PostgreSQL 開發的後端專案，提供會員註冊、登入、星系管理及星球收藏等功能。

## 使用技術

- Node.js / Express
- PostgreSQL
- TypeORM
- JWT 身分驗證
- Docker Compose

## 快速開始

```bash
npm install
cp .env.example .env
npm start
```

伺服器啟動後，可透過 `http://localhost:3010` 存取 API。

## 常用指令

```bash
npm start   # 啟動資料庫與伺服器
npm stop    # 停止資料庫
npm run sql # 匯入種子資料
```
