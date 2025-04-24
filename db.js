import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'school',
    password: '*Bhovad9',
});

connection.connect(err => {
  if (err) {
    console.error("Failed to connect DB: ", err);
    return;
  }
  console.log("Connected to MySQL Database!");
});

export default connection;