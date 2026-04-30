const pool = require("../../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require("dotenv").config();

// Register
const register = async (req, res) => {
  const { email, first_name, last_name, password } = req.body;

  // Validasi manual
  if (!email || email === null) {
    return res
      .status(400)
      .json({ status: 102, message: "Email wajib diisi", data: null });
  }

  if (!first_name || first_name === null) {
    return res
      .status(400)
      .json({ status: 102, message: "Nama Depan wajib diisi", data: null });
  }

  if (!last_name || last_name === null) {
    return res
      .status(400)
      .json({ status: 102, message: "Nama Belakang wajib diisi", data: null });
  }

  if (!password || password === null) {
    return res
      .status(400)
      .json({ status: 102, message: "Password wajib diisi", data: null });
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: 102,
      message: "Paramter email tidak sesuai format",
      data: null,
    });
  }

  // Validasi panjang password
  if (password.length < 8) {
    return res.status(400).json({
      status: 102,
      message: "Password minimal 8 karakter",
      data: null,
    });
  }

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
  const { email, password } = req.body;

  // Validasi manual
  if (!email || email === null) {
    return res
      .status(400)
      .json({ status: 102, message: "Email wajib diisi", data: null });
  }

  if (!password || password === null) {
    return res
      .status(400)
      .json({ status: 102, message: "Password wajib diisi", data: null });
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({
        status: 102,
        message: "Parameter Email tidak sesuai format",
        data: null,
      });
  }

  // Validasi panjang password
  if (password.length < 8) {
    return res
      .status(400)
      .json({
        status: 102,
        message: "Password minimal 8 karakter",
        data: null,
      });
  }

  try {
    // Cek email sudah terdaftar
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkUser.rows.length === 0) {
      return res.status(401).json({
        status: 103,
        message: "Username atau password salah",
        data: null,
      });
    }

    const user = checkUser.rows[0];
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
