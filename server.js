const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const db = require("./backend/config/db");

dotenv.config();

// console.log("JWT_SECRET:", process.env.JWT_SECRET);

// console.log("Database connection established:", db);
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/auth/customer", require("./backend/routes/customerAuthRoutes"));
app.use("/api/auth/provider", require("./backend/routes/providerAuthRoutes"));
app.use("/api/customer/dashboard", require("./backend/routes/customerDashboardRoutes"));
app.use("/api/provider/dashboard", require("./backend/routes/providerDashboardRoutes"));

const providerRoutes = require('./backend/routes/providersProfile');
app.use('/api/providers', providerRoutes);

app.use('/api/admin', require('./backend/routes/adminRoutes'));

const providerDashboardController = require("./backend/controllers/providerDashboardController");

app.get("/api/provider/:providerId/availability", providerDashboardController.getProviderAvailability);

// ✅ Ensure availability update route is registered
app.put("/api/provider/availability", providerDashboardController.updateProviderAvailability);

// app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API test route
app.get("/api/data", (req, res) => {
    res.json({ message: "Hello from the backend!" });
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT} 🚀`));