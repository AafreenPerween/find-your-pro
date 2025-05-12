const mysql = require("mysql2");

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD ||  "Pa77word",
    port: process.env.DB_PORT || 3306,  // Default MySQL port   
    database: process.env.DB_NAME || "findyourpro",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Convert pool to promise-based API
const db = pool.promise();

db.getConnection()
    .then(() => console.log("✅ Connected to MySQL database"))
    .catch((err) => console.error("❌ Database connection error:", err));

module.exports = db;
