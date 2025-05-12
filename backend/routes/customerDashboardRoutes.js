 express = require("express");
const router = express.Router();
const { getCustomerProfile, updateCustomerProfile, getProviderDetails } = require("../controllers/customerDashboardController");
const authenticate = require("../middleware/customerAuthMiddleware");
const { createBookingRequest, getCustomerBookings} = require("../controllers/customerDashboardController");


router.get("/profile", authenticate, getCustomerProfile);

router.put("/profile", authenticate, updateCustomerProfile);

router.post("/bookings", authenticate, createBookingRequest);

router.get("/bookings", authenticate, getCustomerBookings);


module.exports = router;
