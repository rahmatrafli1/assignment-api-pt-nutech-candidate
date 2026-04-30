const pool = require("../../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require("dotenv").config();

// Register
const register = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    password: Joi.string().min(8).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 102,
      message: error.details[0].message,
      data: null,
    });
  }

  const { email, first_name, last_name, password } = req.body;

  try {
    // Cek email sudah terdaftar
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (checkUser.rows.length > 0) {
      return res.status(400).json({
        status: 102,
        message: "Email sudah terdaftar",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, first_name, last_name, password)
       VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name`,
      [email, first_name, last_name, hashedPassword],
    );

    // Buat balance awal 0
    await pool.query("INSERT INTO balance (user_id, balance) VALUES ($1, $2)", [
      result.rows[0].id,
      0,
    ]);

    return res.status(200).json({
      status: 0,
      message: "Registrasi berhasil silahkan login",
      data: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

// Login
const login = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 102,
      message: error.details[0].message,
      data: null,
    });
  }

  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null,
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return res.status(200).json({
      status: 0,
      message: "Login Sukses",
      data: { token },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { register, login };
