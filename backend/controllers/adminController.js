const db = require('../config/db');
const jwt = require('jsonwebtoken');

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch admin by email
    const [results] = await db.query(
      'SELECT * FROM admins WHERE email = ?',
      [email]
    );
    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const admin = results[0];
    if (password !== admin.password) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { adminId: admin.admin_id },
      'your_admin_secret_key',
      { expiresIn: '1d' }
    );

    return res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Query Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    // 1. Total providers (workers)
    const [providerRows] = await db.query(
      'SELECT COUNT(*) AS workerCount FROM providers'
    );
    const workerCount = providerRows[0]?.workerCount || 0;

    // 2. Total customers
    const [customerRows] = await db.query(
      'SELECT COUNT(*) AS customerCount FROM customers'
    );
    const customerCount = customerRows[0]?.customerCount || 0;

    // 3. Pending requests
    const [pendingRows] = await db.query(
      "SELECT COUNT(*) AS pendingRequests FROM requests WHERE status = 'pending'"
    );
    const pendingRequests = pendingRows[0]?.pendingRequests || 0;

    // 4. Total requests
    const [totalRows] = await db.query(
      'SELECT COUNT(*) AS totalRequests FROM requests'
    );
    const totalRequests = totalRows[0]?.totalRequests || 0;

    // 5. 5 most recent requests with customer & provider names
    const [recentRows] = await db.query(
      `SELECT
         r.request_id AS id,
         c.name           AS customer,
         p.name           AS worker,
         r.status,
         DATE_FORMAT(r.created_at, '%Y-%m-%d') AS date
       FROM requests r
       LEFT JOIN customers c  ON r.customer_id = c.customer_id
       LEFT JOIN providers p  ON r.provider_id = p.provider_id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );
    const recentRequests = recentRows;

    return res.json({
      success: true,
      workerCount,
      customerCount,
      pendingRequests,
      totalRequests,
      recentRequests,
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard data:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard data" });
  }
};
