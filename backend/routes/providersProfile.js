const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get providers by service type
router.get('/', async (req, res) => {
    const { service } = req.query; // Get service type from query string
    try {
        let query = "SELECT * FROM providers"; // Base query to fetch all providers
        let params = []; // Initialize params array to prevent SQL injection

        if (service && service !== "all") { // Check if service type is specified
            query += " WHERE service_type = ?"; // Add condition for service type
            params.push(service); // Add service type to params array
        }

        const [rows] = await db.execute(query, params); // Execute the query with params
        res.json(rows); // Send the result back as JSON
    } catch (err) {
        console.error("Error fetching providers:", err); // Log error if any
        res.status(500).json({ error: "Server error while fetching providers" }); // Send server error response
    }
});

const { getProviderById } = require("../controllers/publicProviderController");

router.get("/:id", getProviderById); // 👈 public route for customer use


module.exports = router;
