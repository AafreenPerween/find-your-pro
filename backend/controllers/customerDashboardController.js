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
    // Get provider basic info
    const [providerResult] = await db.query(
      `SELECT provider_id AS id, name, service_type, 
              COALESCE(profile_pic, '/uploads/default_profile.png') AS profile_pic
       FROM providers 
       WHERE provider_id = ?`,
      [providerId]
    );

    if (!providerResult || providerResult.length === 0) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    const provider = providerResult[0];

    // Get reviews with customer names
    const [reviews] = await db.query(
      `SELECT c.name AS customerName, r.rating, r.comment
       FROM reviews r
       JOIN customers c ON r.customer_id = c.customer_id
       WHERE r.provider_id = ?`,
      [providerId]
    );

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : null;

    // Attach additional info to response
    provider.reviews = reviews;
    provider.totalReviews = totalReviews;
    provider.averageRating = averageRating;

    res.json({ success: true, provider });
  } catch (error) {
    console.error("Error fetching provider details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const createBookingRequest = async (req, res) => {
  const customerId = req.customer.customer_id;
  const { provider_id, preferred_date, preferred_time, notes } = req.body;
  console.log("Booking data:", { customerId, provider_id, preferred_date, preferred_time, notes });

  if (!provider_id || !preferred_date || !preferred_time) {
    return res.status(400).json({
      success: false,
      message: "Missing booking fields",
      missingFields: {
        provider_id: !!provider_id,
        preferred_date: !!preferred_date,
        preferred_time: !!preferred_time
      }
    });
  }
  console.log("Booking data:", { customerId, provider_id, preferred_date, preferred_time, notes });

  try {
    await db.query(
      `INSERT INTO requests (customer_id, provider_id, preferred_date, preferred_time, notes, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [customerId, provider_id, preferred_date, preferred_time, notes || ""]
    );

    res.json({ success: true, message: "Booking request submitted" });
  } catch (error) {
    console.error("Error creating booking request:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = {
  getCustomerProfile,
  updateCustomerProfile,
  getProviderDetails,
  createBookingRequest
};
