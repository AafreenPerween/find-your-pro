const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ msg: "Access Denied! No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fix: use customerId from the token
    if (!decoded.customerId) {
      return res
        .status(401)
        .json({ msg: "Invalid token: customerId missing." });
    }

    // ✅ Map customerId to customer_id expected by controller
    req.customer = {
      customer_id: decoded.customerId,
    };

    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    res.status(401).json({ msg: "Invalid or Expired Token!" });
  }
};
