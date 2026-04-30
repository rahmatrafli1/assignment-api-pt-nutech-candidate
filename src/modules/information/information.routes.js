const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { getBanners, getServices } = require("./information.controller");

router.get("/banner", getBanners);
router.get("/services", auth, getServices);

module.exports = router;
