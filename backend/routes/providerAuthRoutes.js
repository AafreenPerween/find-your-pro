const express = require("express");
const { signupProvider, loginProvider } = require("../controllers/providerAuthController");

const router = express.Router();

// Provider Signup
router.post("/signup", signupProvider);

// Provider Login
router.post("/login", loginProvider);

module.exports = router;

