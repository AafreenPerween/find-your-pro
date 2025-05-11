const db = require("../config/db");

// ✅ Get Customer Profile
const getCustomerProfile = async (req, res) => {
  const customerId = req.customer.customer_id;

  try {
    const [customer] = await db.query(
      "SELECT customer_id, name, email, phone, address FROM customers WHERE customer_id = ?",
      [customerId]
    );

    if (!customer || customer.length === 0) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer: customer[0] });
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Update Customer Profile (Without Profile Picture Logic)
const updateCustomerProfile = async (req, res) => {
  const customerId = req.customer.customer_id;
  const { name, phone, address } = req.body;

  try {
    await db.query(
      `UPDATE customers SET name = ?, phone = ?, address = ? WHERE customer_id = ?`,
      [name, phone, address, customerId]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating customer profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// ✅ Get Provider Profile & Reviews for Customer View
// ✅ Enhanced: Get Provider Profile, Reviews, Avg Rating & Total Reviews
const getProviderDetails = async (req, res) => {
  const providerId = req.params.id;

  try {
    const [providerResult] = await db.query(
      `SELECT provider_id AS id, name, service_type, 
              COALESCE(profile_pic, '/uploads/default_profile.png') AS profile_pic
       FROM providers 
       WHERE provider_id = ?`, 
      [providerId]
    );

    if (!providerResult.length) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // ✅ Fetch provider availability
    const [availability] = await db.query(
      `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, time_slot, is_available 
       FROM provider_availability 
       WHERE provider_id = ? 
       ORDER BY date ASC, FIELD(time_slot, 'morning', 'afternoon', 'evening')`,
      [providerId]
    );

    console.log(`Raw availability for provider ${providerId}:`, availability);

    // ✅ Transform into format: { "2025-05-14": ["morning", "evening"] }
    const availabilityMap = {};
    availability.forEach(({ date, time_slot, is_available }) => {
      if (is_available) {
        if (!availabilityMap[date]) {
          availabilityMap[date] = [];
        }
        availabilityMap[date].push(time_slot);
      }
    });

    console.log(`Transformed availability for provider ${providerId}:`, availabilityMap);

    // ✅ Send transformed availability
    res.json({ success: true, provider: providerResult[0], availability: availabilityMap });

  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ✅ Create Booking Request
const createBookingRequest = async (req, res) => {
  const customerId = req.customer.customer_id;
  const { provider_id, preferred_date, preferred_time, problem_statement } = req.body;

  if (!provider_id || !preferred_date || !preferred_time) {
    return res.status(400).json({ success: false, message: "Missing required booking fields" });
  }

  try {
    // ✅ Check Provider Availability without overwriting data
    const [availability] = await db.query(
      `SELECT is_available FROM provider_availability 
       WHERE provider_id = ? AND date = ? AND time_slot = ?`,
      [provider_id, preferred_date, preferred_time]
    );

    if (!availability.length || !availability[0].is_available) {
      return res.status(400).json({ success: false, message: "Provider not available at selected date/time." });
    }

    // ✅ Prevent Overwriting Booked Slots
    const [existingBooking] = await db.query(
      `SELECT booking_id FROM bookings 
       WHERE provider_id = ? AND preferred_date = ? AND preferred_time = ?`,
      [provider_id, preferred_date, preferred_time]
    );

    if (existingBooking.length) {
      return res.status(400).json({ success: false, message: "Time slot is already booked." });
    }

    // ✅ Store Booking Request Without Affecting Availability
    await db.query(
      `INSERT INTO bookings (customer_id, provider_id, preferred_date, preferred_time, problem_statement, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [customerId, provider_id, preferred_date, preferred_time, problem_statement]
    );

    res.json({ success: true, message: "Booking request submitted successfully!" });
  } catch (error) {
    console.error("Error processing booking:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  getProviderDetails,
  createBookingRequest
};
