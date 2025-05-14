const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ✅ Get Provider Profile
const getProviderProfile = async (req, res) => {
  const providerId = req.provider?.provider_id;
   console.log("Provider Profile fetched:", providerId);

  if (!providerId) {
    console.error("Error: Provider ID is missing from request.");
    return res.status(400).json({ success: false, message: "Provider ID is required" });
  }

  try {
    const [provider] = await db.query(
      "SELECT provider_id, name, email, phone, address, service_type, experience, profile_pic FROM providers WHERE provider_id = ?",
      [providerId]
    );
   
    if (!provider.length) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.json({ success: true, provider: provider[0] });
  } catch (error) {
    console.error("Error fetching provider profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update Provider Profile
const updateProviderProfile = async (req, res) => {
  const providerId = req.provider?.provider_id;
  const { name, phone, address, experience } = req.body;

  if (!providerId) {
    return res.status(401).json({ success: false, message: "Unauthorized: Provider ID missing" });
  }

  try {
    const [existingData] = await db.query(
      "SELECT profile_pic FROM providers WHERE provider_id = ?",
      [providerId]
    );

    const oldPic = existingData[0]?.profile_pic;
    const newPic = req.file ? req.file.filename : oldPic || "default-profile.jpg";

    if (req.file && oldPic && oldPic !== "default-profile.jpg" && oldPic !== newPic) {
      const oldPicPath = path.join(__dirname, "..", "uploads/providers", oldPic);
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath);
      }
    }

    await db.query(
      "UPDATE providers SET name = ?, phone = ?, address = ?, experience = ?, profile_pic = ? WHERE provider_id = ?",
      [name, phone, address, experience, newPic, providerId]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating provider profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Fetch Provider Availability (Correct Date Format)
const getProviderAvailability = async (req, res) => {
    const providerId = req.params.providerId || req.provider?.provider_id; // ✅ Try fetching from both params and authentication
    console.log(`Fetching availability for provider ID: ${providerId}`);

    if (!providerId) {
        console.error("Error: Provider ID is missing from request.");
        return res.status(400).json({ success: false, message: "Provider ID is required" });
    }

    try {
        const [availability] = await db.query(
            `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, time_slot, is_available 
             FROM provider_availability 
             WHERE provider_id = ? 
             ORDER BY date ASC, FIELD(time_slot, 'morning', 'afternoon', 'evening')`,
            [providerId]
        );

        // ✅ Ensure format matches frontend checkboxes
        const formattedAvailability = availability.map(({ date, time_slot, is_available }) => ({
            checkbox_id: `${date}-${time_slot}`, // ✅ Match frontend format
            date,
            time_slot,
            is_available,
        }));

        console.log("Availability fetched:", JSON.stringify(formattedAvailability, null, 2));
        res.json({ success: true, availability: formattedAvailability });
    } catch (error) {
        console.error("Error fetching provider availability:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
// ✅ Update Provider Availability (Correct Date Handling)
const updateProviderAvailability = async (req, res) => {
    const providerId = req.provider?.provider_id || req.body.providerId;
    console.log("🔍 Backend is using Provider ID:", providerId);
    const availabilityUpdates = req.body.availability;

    if (!providerId) {
        console.error("Error: Provider authentication failed or provider ID missing.");
        return res.status(401).json({ success: false, message: "Unauthorized: Provider ID is missing" });
    }

    if (!Array.isArray(availabilityUpdates)) {
        return res.status(400).json({ success: false, message: "Invalid availability format" });
    }

    try {
        console.log(`Updating availability for provider: ${providerId}`);

        // ✅ Verify each update happens properly
        const updateResults = await Promise.all(availabilityUpdates.map(({ date, time_slot, is_available }) => {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(date)) {
                console.error("Invalid date format received:", date);
                return Promise.reject("Invalid date format");
            }

            return db.query(
                `INSERT INTO provider_availability (provider_id, date, time_slot, is_available)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE is_available = VALUES(is_available)`,
                [providerId, date, time_slot, is_available]
            );
        }));

        console.log("Availability update results:", JSON.stringify(updateResults, null, 2));
        res.json({ success: true, message: "Availability updated successfully" });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getProviderBookingRequests = async (req, res) => {
  const providerId = req.provider.provider_id;

  try {
    const [requests] = await db.query(
      `SELECT r.request_id, r.customer_id, c.name AS customer_name, c.address AS customer_address,
              r.preferred_date, r.preferred_time, r.problem_statement, r.status, r.created_at
       FROM requests r
       JOIN customers c ON r.customer_id = c.customer_id
       WHERE r.provider_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [providerId]
    );

    res.json({ success: true, requests });
  } catch (error) {
    console.error("Error fetching provider booking requests:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const handleBookingRequest = async (req, res) => {
  const providerId = req.provider.provider_id;
  const { requestId } = req.params;
  const { action } = req.body; // expected: 'accepted' or 'rejected'

  if (!['accepted', 'rejected'].includes(action)) {
    return res.status(400).json({ success: false, message: "Invalid action." });
  }

  try {
    const [result] = await db.query(
      `UPDATE requests 
       SET status = ? 
       WHERE request_id = ? AND provider_id = ? AND status = 'pending'`,
      [action, requestId, providerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Request not found or already handled." });
    }

    res.json({ success: true, message: `Request ${action} successfully.` });
  } catch (error) {
    console.error("Error handling booking request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getProviderBookingHistory = async (req, res) => {
  const providerId = req.provider.provider_id;

  try {
    const [history] = await db.query(
      `SELECT r.request_id, r.customer_id, c.name AS customer_name, c.address,
              r.problem_statement, r.preferred_date,
              r.preferred_time, r.status, r.created_at
       FROM requests r
       JOIN customers c ON r.customer_id = c.customer_id
       WHERE r.provider_id = ? AND r.status IN ('accepted', 'rejected', 'completed')
       ORDER BY r.created_at DESC`,
      [providerId]
    );

    res.json({ success: true, history });
  } catch (error) {
    console.error("Error fetching provider booking history:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = {
  getProviderProfile,
  updateProviderProfile,
  getProviderAvailability,
  updateProviderAvailability,
  getProviderBookingRequests,
  handleBookingRequest,
  getProviderBookingHistory
};