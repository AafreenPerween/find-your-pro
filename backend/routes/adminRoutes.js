const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuthMiddleware');

router.post('/login', adminController.adminLogin);

router.get('/dashboard-data', adminAuth, adminController.getDashboardData);
// This is what your frontend fetches
router.get('/api/requests', adminController.getAllServiceRequests);

router.get('/providers', adminController.getAllProviders);



router.get('/customers', adminController.getAllCustomers); 




router.get('/test-admin', (req, res) => {
    db.query('SELECT * FROM admins', (err, results) => {
      if (err) {
        console.error('❌ Query error:', err);
        return res.status(500).json({ message: 'DB error' });
      }
      console.log('✅ Test results:', results);
      res.json(results);
    });
  });

module.exports = router;
