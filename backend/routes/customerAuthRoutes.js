const express = require("express");
const { signupCustomer, loginCustomer } = require("../controllers/customerAuthController");

const router = express.Router();

// Customer Signup
router.post("/signup", signupCustomer);

// Customer Login
router.post("/login", loginCustomer);

module.exports = router;
