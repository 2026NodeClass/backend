const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../middlewares/auth.middleware");

const router = express.Router();

// 登入路由不需要 JWT，驗證成功後才會取得 token。
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

module.exports = router;
