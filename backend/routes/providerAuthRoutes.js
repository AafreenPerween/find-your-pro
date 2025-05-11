const express = require("express");
const router = express.Router(); //
const { signupProvider, loginProvider } = require("../controllers/providerAuthController");
const authenticate = require("../middleware/providerAuthMiddleware");
const { updateProviderAvailability } = require("../controllers/providerDashboardController"); // ✅ Ensure correct import


router.put("/availability", authenticate, updateProviderAvailability); // ✅ Ensure authentication is enforced



// Provider Signup
router.post("/signup", signupProvider);

// Provider Login
router.post("/login", loginProvider);

module.exports = router;

