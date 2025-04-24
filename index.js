const express = require('express');


const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

connection.connect(err => {
  if (err) {
    console.error("Failed to connect DB: ", err);
    return;
  }
  console.log("Connected to MySQL Database!");
});

const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies

app.post('/addSchool', (req, res) => {
    try {
        console.log(req.body);
        
        let q = "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
        let values = [req.body.name, req.body.address, req.body.latitude, req.body.longitude];

        connection.query(q, values, (err, result) => {
            if (err) {
                console.error("Query error: ", err);
                res.status(500).json({ error: "Database error" });
                return;
            }
            res.status(201).json({ message: "School added successfully", id: result.insertId });
        });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal server error" });

    }
});

app.get('/listSchool', (req, res) => {
    try {
        console.log(req.body);
        
        const { latitude, longitude } = req.body;  // Extract user's latitude and longitude from the request body

        // Ensure both lat and lon are provided
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Latitude and Longitude are required.' });
        }

        const query = `
    SELECT 
      id, 
      name, 
      address, 
      latitude, 
      longitude,
      (6371 * acos(
        cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(latitude))
      )) AS distance
    FROM schools
    ORDER BY distance ASC;  -- Sort by distance, nearest first
  `;

  connection.query(query, [latitude, longitude, latitude], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ schools: results });
        });
    } catch (error) {
        console.error("Error: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
