const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcrypt');
const { login } = require('../controllers/auth.controller');
const { pool } = require('../db/pg');

const originalSecret = process.env.JWT_SECRET;

const makeRes = () => {
  const res = {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
  return res;
};

test('login returns a controlled 500 response when JWT secret is missing', async () => {
  delete process.env.JWT_SECRET;
  const originalQuery = pool.query;
  pool.query = async () => ({
    rows: [
      {
        id: 1,
        name: '測試使用者',
        email: 'user@example.com',
        password_hash: await bcrypt.hash('secret123', 10),
        role: 'user',
      },
    ],
  });

  const req = { body: { email: 'user@example.com', password: 'secret123' } };
  const res = makeRes();

  await login(req, res);

  assert.equal(res.statusCode, 500);
  assert.match(res.payload.message, /伺服器.*錯誤|認證設定/);

  pool.query = originalQuery;
  process.env.JWT_SECRET = originalSecret;
});
