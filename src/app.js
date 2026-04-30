const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/", require("./modules/auth/auth.routes"));
app.use("/", require("./modules/profile/profile.routes"));
app.use("/", require("./modules/information/information.routes"));
app.use("/", require("./modules/balance/balance.routes"));
app.use("/", require("./modules/transaction/transaction.routes"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res
    .status(404)
    .json({ status: 404, message: "Endpoint tidak ditemukan", data: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
