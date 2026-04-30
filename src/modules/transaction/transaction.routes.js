const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const {
  createTransaction,
  getTransactionHistory,
} = require("./transaction.controller");

router.post("/transaction", auth, createTransaction);
router.get("/transaction/history", auth, getTransactionHistory);

module.exports = router;
