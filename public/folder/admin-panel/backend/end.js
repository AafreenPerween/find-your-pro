// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// const app = express();
// app.use(cors());
// app.use(express.json());

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '', // your MySQL password
//   database: 'findyoupro'
// });

// app.get('/api/workers', (req, res) => {
//   db.query('SELECT * FROM workers', (err, results) => {
//     if (err) return res.status(500).send(err);
//     res.json(results);
//   });
// });

// app.post('/api/workers', (req, res) => {
//   const { name, profession, phone, location } = req.body;
//   db.query('INSERT INTO workers (name, profession, phone, location) VALUES (?, ?, ?, ?)',
//     [name, profession, phone, location],
//     (err) => {
//       if (err) return res.status(500).send(err);
//       res.send({ success: true });
//     }
//   );
// });

// app.listen(3000, () => console.log('Server running on port 3000'));





// // CREATE TABLE workers (
// //     id INT AUTO_INCREMENT PRIMARY KEY,
// //     name VARCHAR(100),
// //     profession VARCHAR(100),
// //     phone VARCHAR(15),
// //     location VARCHAR(100)
// //   );
  