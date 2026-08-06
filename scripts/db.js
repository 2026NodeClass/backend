require('dotenv').config();
const { Client, Pool } = require('pg');

const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || 'student',
  password: process.env.DB_PASSWORD || 'student666',
  database: process.env.DB_DATABASE || 'collect',
};

// API 會同時處理多個請求，因此使用連線池重複利用資料庫連線。
const pool = new Pool(connectionConfig);

function createClient() {
  return new Client(connectionConfig);
}

module.exports = { createClient, pool };
