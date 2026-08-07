const { Client, Pool } = require('pg');
const { connectionConfig } = require('./config');

// API 會同時處理多個請求，因此使用連線池重複利用資料庫連線。
const pool = new Pool(connectionConfig);

function createClient() {
  return new Client(connectionConfig);
}

module.exports = { createClient, pool };
