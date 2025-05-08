 express = require("express");
const router = express.Router();
const { getCustomerProfile, updateCustomerProfile, getProviderDetails } = require("../controllers/customerDashboardController");
const authenticate = require("../middleware/customerAuthMiddleware");
const { createBookingRequest } = require("../controllers/customerDashboardController");


router.get("/profile", authenticate, getCustomerProfile);

router.put("/profile", authenticate, updateCustomerProfile);

router.post("/book", authenticate, createBookingRequest);


module.exports = router;
