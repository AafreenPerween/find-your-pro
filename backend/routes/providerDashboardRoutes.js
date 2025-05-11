const express = require("express");
const router = express.Router(); // ✅ Correctly initialize router

const {
  getProviderProfile,
  updateProviderProfile,
  getProviderAvailability, // ✅ Ensure this function exists in the controller
  updateProviderAvailability
} = require("../controllers/providerDashboardController");

const authenticate = require("../middleware/providerAuthMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ✅ Ensure all imported functions exist in the controller before using them
if (typeof getProviderAvailability !== "function") {
  console.error("Error: getProviderAvailability is undefined in providerDashboardController.js");
}

if (typeof updateProviderAvailability !== "function") {
  console.error("Error: updateProviderAvailability is undefined in providerDashboardController.js");
}

// ✅ Get provider profile data
router.get("/profile", authenticate, getProviderProfile);

// ✅ Update provider profile with optional image upload
router.put("/profile", authenticate, upload.single("profile_pic"), updateProviderProfile);

// ✅ Get Provider Availability
// router.get("/:providerId/availability", getProviderAvailability);

// ✅ Update Provider Availability
router.put("/availability", authenticate, updateProviderAvailability);

module.exports = router; // ✅ Ensure correct export