const jwt = require('jsonwebtoken');

// 驗證登入欄位
const validateLogin = (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({
      message: '請輸入帳號與密碼',
    });
  }

  next();
};

// 驗證註冊欄位；角色固定由後端使用資料庫預設值 user，避免前端自行指定 admin。
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: '請輸入名稱、帳號與密碼' });
  }
  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: '密碼至少需要 8 個字元' });
  }

  next();
};

//驗證登入狀態
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // 慣例：Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '請先登入' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);   // 驗過 → 把 user 塞進 req 給下游用
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token 無效或已過期' });
  }
};

// 後台 CRUD 僅允許管理員操作。
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '需要管理員權限' });
  }

  next();
};

module.exports = {
  validateLogin,
  validateRegister,
  verifyToken,
  requireAdmin,
};
