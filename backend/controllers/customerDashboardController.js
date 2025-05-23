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
  const { provider_id, service_type, preferred_date, preferred_time, problem_statement } = req.body;

  // ✅ Validate required fields
  if (!provider_id || !preferred_date || !preferred_time ) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    // ✅ Check if the selected slot is available
    const [availability] = await db.query(
      `SELECT is_available FROM provider_availability 
       WHERE provider_id = ? AND date = ? AND time_slot = ?`,
      [provider_id, preferred_date, preferred_time]
    );

    if (!availability.length || !availability[0].is_available) {
      return res.status(400).json({ success: false, message: "Provider not available at selected date/time." });
    }

    // ✅ Prevent duplicate bookings (Ensure slot isn’t already booked)
    const [existingBooking] = await db.query(
      `SELECT request_id FROM requests 
       WHERE provider_id = ? AND preferred_date = ? AND preferred_time= ?`,
      [provider_id, preferred_date, preferred_time]
    );

    await db.query(
      `UPDATE provider_availability
       SET is_available =0
       WHERE provider_id = ? AND date = ? AND time_slot = ?`,
      [provider_id, preferred_date, preferred_time]
    );

    if (existingBooking.length) {
      return res.status(400).json({ success: false, message: "Time slot is already booked." });
    }

    // ✅ Store booking request
    await db.query(
      `INSERT INTO requests (customer_id, provider_id, preferred_date, preferred_time, problem_statement, status) 
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [customerId, provider_id, preferred_date, preferred_time, problem_statement]
    );


    return res.json({
    success: true,
    message: "Booking request submitted successfully! Redirecting to your Bookings..."
});

  } catch (error) {
    console.error("Error processing booking request:", error);
  }
};


const cancelBooking = async (req, res) => {
  const customerId = req.customer.customer_id;
  const requestId = req.params.id;

  try {
    const [result] = await db.query(
      `UPDATE requests SET status = 'cancelled' WHERE request_id = ? AND customer_id = ? AND status IN ('pending', 'accepted')`,
      [requestId, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Request not found or cannot be cancelled." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error cancelling request:", err);
    res.status(500).json({ success: false });
  }
};

const completeBooking = async (req, res) => {
  const customerId = req.customer.customer_id;
  const requestId = req.params.id;

  try {
    const [result] = await db.query(
      `UPDATE requests SET status = 'completed' WHERE request_id = ? AND customer_id = ? AND status = 'accepted'`,
      [requestId, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Request not found or not accepted." });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error marking complete:", err);
    res.status(500).json({ success: false });
  }
};


const getCustomerBookings = async (req, res) => {
  const customerId = req.customer.customer_id;

  try {
    // ✅ Fetch current requests (pending) with provider name
    const [pendingRequests] = await db.query(
      `SELECT r.request_id, r.provider_id, p.name AS provider_name, p.service_type AS provider_service,
              r.preferred_date, r.preferred_time, r.status, r.created_at 
       FROM requests r
       JOIN providers p ON r.provider_id = p.provider_id
       WHERE r.customer_id = ? AND r.status IN ('pending','accepted')
       ORDER BY r.created_at DESC`,
      [customerId]
    );

    // ✅ Fetch past bookings (accepted/rejected) with provider name
    const [bookingHistory] = await db.query(
      `SELECT r.request_id, r.provider_id, p.name AS provider_name, p.service_type AS provider_service,
              r.preferred_date, r.preferred_time, r.status, r.created_at 
       FROM requests r
       JOIN providers p ON r.provider_id = p.provider_id
       WHERE r.customer_id = ? AND r.status IN ('cancelled', 'rejected','completed')
       ORDER BY r.created_at DESC`,
      [customerId]
    );

    res.json({ success: true, pendingRequests, bookingHistory });

  } catch (error) {
    console.error("Error fetching customer bookings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


const updateCustomerBookingStatus = async (req, res) => {
  const customerId = req.customer.customer_id;
  const requestId = req.params.id;
  const { newStatus } = req.body;

  try {
    // Get the request to ensure it's owned by the customer
    const [[request]] = await db.query(
      `SELECT * FROM requests WHERE request_id = ? AND customer_id = ?`,
      [requestId, customerId]
    );

    if (!request) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Update booking status
    await db.query(
      `UPDATE requests SET status = ? WHERE request_id = ?`,
      [newStatus, requestId]
    );

    // If cancelled or rejected, mark the slot available again
    if (newStatus === "cancelled" || newStatus === "rejected") {
      await db.query(
        `UPDATE provider_availability
         SET is_available = true
         WHERE provider_id = ? AND available_date = ? AND available_time = ?`,
        [request.provider_id, request.preferred_date, request.preferred_time]
      );
    }

    res.json({ success: true, message: "Booking status updated" });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  getProviderDetails,
  createBookingRequest,
  getCustomerBookings,
  cancelBooking,
  completeBooking,
  updateCustomerBookingStatus

};
