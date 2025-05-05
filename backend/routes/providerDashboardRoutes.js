const express = require("express");
const {
  getProviderProfile,
  updateProviderProfile
} = require("../controllers/providerDashboardController");
const authenticate = require("../middleware/providerAuthMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// ✅ Get provider profile data
router.get("/profile", authenticate, getProviderProfile);

// ✅ Update provider profile with optional image upload
router.put("/profile", authenticate, upload.single("profile_pic"), updateProviderProfile);

module.exports = router;
