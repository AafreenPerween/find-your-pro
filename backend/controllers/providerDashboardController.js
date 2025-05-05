const db = require("../config/db");
const fs = require("fs");
const path = require("path");

// ✅ Get Provider Profile
const getProviderProfile = async (req, res) => {
  const providerId = req.provider.provider_id;

  try {
    const [provider] = await db.query(
      "SELECT provider_id, name, email, phone, address, service_type, experience, profile_pic FROM providers WHERE provider_id = ?",
      [providerId]
    );

    if (!provider || provider.length === 0) {
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
  const providerId = req.provider.provider_id;
  const { name, phone, address, experience } = req.body;

  try {
    // Get current profile picture
    const [existingData] = await db.query(
      "SELECT profile_pic FROM providers WHERE provider_id = ?",
      [providerId]
    );

    const oldPic = existingData[0]?.profile_pic;
    const newPic = req.file ? req.file.filename : oldPic || "default-profile.jpg";

    // Delete old picture if a new one is uploaded (and it's not the default)
    if (req.file && oldPic && oldPic !== "default-profile.jpg" && oldPic !== newPic) {
      const oldPicPath = path.join(__dirname, "..", "uploads/providers", oldPic);
      if (fs.existsSync(oldPicPath)) {
        fs.unlinkSync(oldPicPath);
      }
    }

    // Update DB
    await db.query(
      `UPDATE providers SET name = ?, phone = ?, address = ?, experience = ?, profile_pic = ? WHERE provider_id = ?`,
      [name, phone, address, experience, newPic, providerId]
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating provider profile:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getProviderProfile,
  updateProviderProfile
};
