const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log("Upload directory:", uploadDir); // ← this should now show the correct root path


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `provider_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Filter for image files
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, jpg, png) are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;


// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ✅ Base upload directory
// const baseUploadDir = path.join(process.cwd(), "uploads");

// // ✅ Ensure both provider and customer upload folders exist
// const providerDir = path.join(baseUploadDir, "providers");
// const customerDir = path.join(baseUploadDir, "customers");

// [providerDir, customerDir].forEach((dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// });

// console.log("Provider Upload Directory:", providerDir);
// console.log("Customer Upload Directory:", customerDir);

// // ✅ Multer storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Determine user type from request path or middleware
//     if (req.originalUrl.includes("/provider")) {
//       cb(null, providerDir);
//     } else if (req.originalUrl.includes("/customer")) {
//       cb(null, customerDir);
//     } else {
//       cb(new Error("Invalid upload path"));
//     }
//   },
//   filename: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     const prefix = req.originalUrl.includes("/provider") ? "provider" : "customer";
//     const filename = `${prefix}_${Date.now()}${ext}`;
//     cb(null, filename);
//   },
// });

// // ✅ Image file filter
// const fileFilter = function (req, file, cb) {
//   const allowedTypes = /jpeg|jpg|png/;
//   const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = allowedTypes.test(file.mimetype);
//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb(new Error("Only image files (jpeg, jpg, png) are allowed"));
//   }
// };

// const upload = multer({ storage, fileFilter });

// module.exports = upload;
