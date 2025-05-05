const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

// ✅ Provider Signup
const signupProvider = async (req, res) => {
    const { name, email, password, phone, address, service_type, experience, availability } = req.body;

    try {
        // Check if provider already exists
        const [existingProvider] = await db.query("SELECT * FROM providers WHERE email = ?", [email]);
        if (existingProvider.length > 0) return res.status(400).json({ msg: "Provider already exists" });

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new provider
        await db.query(
            "INSERT INTO providers (name, email, password, phone, address, service_type, experience) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name, email, hashedPassword, phone, address, service_type, experience]
        );

        res.status(201).json({ msg: "Provider registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server error" });
    }
};

// ✅ Provider Login
const loginProvider = async (req, res) => {
    const { email, password } = req.body;

    try {
        // console.log("📩 Incoming Login Request:", { email, password });

        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Fetch provider from DB using async/await
        const [rows] = await db.query("SELECT * FROM providers WHERE email = ?", [email]);

        if (rows.length === 0) {
            console.log("❌ Provider not found in database");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const provider = rows[0]; // ✅ Define "provider" properly
        console.log("✅ Provider found:", provider);

        // Compare the hashed password stored in the database
        const isMatch = await bcrypt.compare(password, provider.password);
        console.log("🔑 Password Match:", isMatch);

        if (!isMatch) {
            console.log("❌ Incorrect password");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { provider_id: provider.provider_id },  // ✅ Use provider from rows[0]
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        
        // Send token in response
        res.json({ 
            msg: "Login Successful!", 
            token, 
            provider: { name: provider.name, email: provider.email, service_type: provider.service_type }
        });
        
    } 
    catch (error) {
        console.error("❌ Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = { signupProvider, loginProvider };

