const db = require('../config/db');
const jwt = require('jsonwebtoken');

// exports.adminLogin = (req, res) => {
//   const { email, password } = req.body;

//   console.log("🔐 Admin login attempt", { email, password });

//   const query = 'SELECT * FROM admins WHERE email = ?';
//   db.query(query, [email], async (err, results) => {
//     if (err) {
//       console.error('❌ Query Error:', err);
//       return res.status(500).json({ message: 'Server error' });
//     }

//     console.log('📦 Query results:', results);

//     if (results.length === 0) {
//       console.log('🚫 No admin found with that email');
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     const admin = results[0];
//     console.log('📜 Found admin:', admin);

//     if (password !== admin.password) {
//       console.log('🚫 Invalid password');
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ adminId: admin.admin_id }, 'your_admin_secret_key', {
//       expiresIn: '1d',
//     });

//     console.log('🛡️ Admin logged in successfully');
//     res.json({ success: true, token });
//   });
// };


// exports.adminLogin = (req, res) => {
//   const { email, password } = req.body;

//   console.log("🔐 Admin login attempt", { email, password });

//   // Test the database connection with a simple query
//   db.query('SELECT 1', (err, results) => {
//     if (err) {
//       console.error('❌ Database connection error:', err);
//       return res.status(500).json({ message: 'Server error' });
//     }
//     console.log('✅ Database connected successfully:', results);
//   });

//   const query = 'SELECT * FROM admins WHERE email = ?';
//   db.query(query, [email], async (err, results) => {
//     if (err) {
//       console.error('❌ Query Error:', err);
//       return res.status(500).json({ message: 'Server error' });
//     }

//     console.log('📦 Query results:', results);

//     if (results.length === 0) {
//       console.log('🚫 No admin found with that email');
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     const admin = results[0];
//     console.log('📜 Found admin:', admin);

//     if (password !== admin.password) {
//       console.log('🚫 Invalid password');
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ adminId: admin.admin_id }, 'your_admin_secret_key', {
//       expiresIn: '1d',
//     });

//     console.log('🛡️ Admin logged in successfully');
//     res.json({ success: true, token });
//   });
// };


// 

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Admin login attempt", { email, password });

  try {
    // Use promise-based query instead of callback-based
    const [results] = await db.query('SELECT * FROM admins WHERE email = ?', [email]);
    console.log("📦 Query results:", results);

    if (results.length === 0) {
      console.log("🚫 No admin found with that email");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const admin = results[0];

    if (password !== admin.password) {
      console.log("🚫 Invalid password");
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ adminId: admin.admin_id }, 'your_admin_secret_key', { expiresIn: '1d' });

    console.log("🛡️ Admin logged in successfully");
    res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Query Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
