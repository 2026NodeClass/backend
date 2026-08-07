const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db/pg");

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, LOWER($2), $3)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash]
    );

    res.status(201).json({
        message: "註冊成功",
        data: result.rows[0],
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query(
        `SELECT id, name, email, password_hash, role
         FROM users
         WHERE LOWER(email) = LOWER($1)
         LIMIT 1`,
        [email]
    );
    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({
            message: "帳號或密碼錯誤",
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "帳號或密碼錯誤",
        });
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    res.status(200).json({
        message: "登入成功",
        data: {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        },
    });
};

module.exports = { register, login };
