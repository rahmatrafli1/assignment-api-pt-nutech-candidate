const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { getBalance, topUp } = require("./balance.controller");

router.get("/balance", auth, getBalance);
router.post("/topup", auth, topUp);

module.exports = router;
