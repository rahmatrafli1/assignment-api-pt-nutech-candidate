const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const upload = require("../../middleware/upload");
const {
  getProfile,
  updateProfile,
  updateProfileImage,
} = require("./profile.controller");

router.get("/profile", auth, getProfile);
router.put("/profile/update", auth, updateProfile);
router.put("/profile/image", auth, upload.single("file"), updateProfileImage);

module.exports = router;
