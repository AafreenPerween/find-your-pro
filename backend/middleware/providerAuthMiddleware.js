const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");
  // console.log("Auth Header:", authHeader); // Log full header

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Access Denied! No token provided." });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  // console.log("Extracted Token:", token);

  if (!token) {
    return res.status(401).json({ msg: "Token missing!" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verified Provider:", verified);
    req.provider = verified; // Attach provider data
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    res.status(401).json({ msg: "Invalid or Expired Token!" });
  }
};
