 express = require("express");
const router = express.Router();

const { getCustomerProfile, updateCustomerProfile, getProviderDetails } = require("../controllers/customerDashboardController");

const { createBookingRequest, getCustomerBookings, updateCustomerBookingStatus, cancelBooking,
  completeBooking,} = require("../controllers/customerDashboardController");

const authenticate = require("../middleware/customerAuthMiddleware");


router.patch("/bookings/:id/cancel", authenticate, cancelBooking);

router.patch("/bookings/:id/complete", authenticate, completeBooking);

router.patch("/bookings/:id/status", authenticate, updateCustomerBookingStatus);

router.get("/profile", authenticate, getCustomerProfile);

router.put("/profile", authenticate, updateCustomerProfile);

router.post("/bookings", authenticate, createBookingRequest);

router.get("/bookings", authenticate, getCustomerBookings);


module.exports = router;
