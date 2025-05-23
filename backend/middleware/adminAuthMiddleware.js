const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  try {
    const verified = jwt.verify(token, 'your_admin_secret_key');
    req.admin = verified;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};