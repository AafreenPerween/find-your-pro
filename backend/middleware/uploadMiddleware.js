const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the uploads directory exists
const uploadPath = path.join(process.cwd(), "uploads/providers");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

//console.log("MULTER Upload Path:", uploadPath);

// Set storage options for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Use the ensured directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = Date.now() + ext; // Unique filename
    cb(null, fileName);
  },
});

// Initialize multer with storage options
const upload = multer({ storage });

module.exports = upload;
