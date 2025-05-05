 express = require("express");
const router = express.Router();
const { getCustomerProfile, updateCustomerProfile } = require("../controllers/customerDashboardController");
const authenticate = require("../middleware/customerAuthMiddleware");

router.get("/profile", authenticate, getCustomerProfile);

router.put("/profile", authenticate, updateCustomerProfile);


module.exports = router;
