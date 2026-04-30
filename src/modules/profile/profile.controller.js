const pool = require("../../config/database");
const path = require("path");
const fs = require("fs");

// Get Profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT email, first_name, last_name, profile_image FROM users WHERE id = $1",
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "User tidak ditemukan",
        data: null,
      });
    }

    return res.status(200).json({
      status: 0,
      message: "Sukses",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { first_name, last_name } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({
      status: 102,
      message: "first_name dan last_name wajib diisi",
      data: null,
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING email, first_name, last_name, profile_image`,
      [first_name, last_name, req.user.id],
    );

    return res.status(200).json({
      status: 0,
      message: "Update Profile berhasil",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", data: null });
  }
};

// Update Profile Image
const updateProfileImage = async (req, res) => {
  // Kondisi 1: file tidak diupload sama sekali
  if (!req.file && !req.fileValidationError) {
    return res.status(400).json({
      status: 102,
      message: "Format Image tidak diupload",
      data: null,
    });
  }

  // Kondisi 2: file diupload tapi format salah
  if (req.fileValidationError) {
    return res.status(400).json({
      status: 102,
      message: req.fileValidationError,
      data: null,
    });
  }

  try {
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const result = await pool.query(
      `UPDATE users SET profile_image = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING email, first_name, last_name, profile_image`,
      [imageUrl, req.user.id],
    );

    return res.status(200).json({
      status: 0,
      message: "Update Profile Image berhasil",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 500, message: "Internal server error", data: null });
  }
};

module.exports = { getProfile, updateProfile, updateProfileImage };
