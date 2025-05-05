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

module.exports = {
  getCustomerProfile,
  updateCustomerProfile
};
