const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
require("dotenv").config();

// ✅ Customer Signup
const signupCustomer = async (req, res) => {
    const { name, email, phone, address, password } = req.body;

    try {
        // Check if email already exists
        const [existingUser] = await db.query("SELECT * FROM customers WHERE email = ?", [email]);
        if (existingUser.length > 0) return res.status(400).json({ msg: "Email already registered!" });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into database
        await db.query(
            "INSERT INTO customers (name, email, phone, address, password) VALUES (?, ?, ?, ?, ?)",
            [name, email, phone, address, hashedPassword]
        );

        res.status(201).json({ msg: "Customer registered successfully!" });
        } 
        catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
};

// ✅ Customer Login
const loginCustomer = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("📩 Incoming Customer Login Request:", { email, password });

        if (!email || !password) {
            console.log("❌ Missing email or password");
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        // Fetch customer from DB
        const [rows] = await db.query("SELECT * FROM customers WHERE email = ?", [email]);

        if (rows.length === 0) {
            console.log("❌ Customer not found in database");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        console.log("✅ Customer found:", rows[0]);

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, rows[0].password);
        console.log("🔑 Password Match:", isMatch);

        if (!isMatch) {
            console.log("❌ Incorrect password");
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign({ customerId: rows[0].customer_id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("✅ Customer Login Successful!");
        res.json({ success: true, message: "Login successful!", token });
    } catch (error) {
        console.error("❌ Customer Login error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = { signupCustomer, loginCustomer };
