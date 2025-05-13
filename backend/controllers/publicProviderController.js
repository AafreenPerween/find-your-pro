// backend/controllers/publicProviderController.js
const db = require("../config/db");


const getProviderById = async (req, res) => {
  const providerId = req.params.id;

  try {
    const [provider] = await db.query(
      "SELECT provider_id, name, address, service_type, experience, profile_pic FROM providers WHERE provider_id = ?",
      [providerId]
    );

    if (!provider || provider.length === 0) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    res.json({ success: true, provider: provider[0] });
  } catch (error) {
    console.error("Error fetching provider by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getProviderById };
