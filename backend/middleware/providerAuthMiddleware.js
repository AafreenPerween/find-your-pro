const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
 
console.log("🔍 Incoming Authentication Request:");
console.log("➡ Method:", req.method);
console.log("➡ URL:", req.originalUrl);
console.log("🔍 Received Headers:", JSON.stringify(req.headers, null, 2));
console.log("➡ Auth Header:", req.header("Authorization")); // ✅ Logs full auth header

const authHeader = req.header("Authorization");
const token = authHeader ? authHeader.split(" ")[1] : null;
console.log("🛠 Extracted Token:", token); // ✅ Logs extracted token

try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token Data:", JSON.stringify(verified, null, 2)); // ✅ Debug full token payload

    if (!verified.provider_id) {
        console.error("❌ Provider ID missing in token!");
        return res.status(401).json({ success: false, message: "Invalid token format: Provider ID missing." });
    }

    req.provider = { provider_id: verified.provider_id }; // ✅ Attach provider_id properly
    console.log("🔹 Provider authenticated successfully:", req.provider.provider_id);
    next();
} catch (err) {
    console.error("❌ JWT Verification Error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid or Expired Token!" });
}
};