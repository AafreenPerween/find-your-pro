const express = require("express");
const router = express.Router(); // ✅ Correctly initialize router

const {
  getProviderProfile,
  updateProviderProfile,
  getProviderAvailability, // ✅ Ensure this function exists in the controller
  updateProviderAvailability,
  getProviderBookingRequests,
  handleBookingRequest,
  getProviderBookingHistory
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


// ✅ Update Provider Availability
router.put("/availability", authenticate, updateProviderAvailability);


router.get('/booking-requests', authenticate, getProviderBookingRequests);
router.patch('/handle-request/:requestId', authenticate, handleBookingRequest);

router.get("/booking-history", authenticate, getProviderBookingHistory);



module.exports = router; // ✅ Ensure correct export