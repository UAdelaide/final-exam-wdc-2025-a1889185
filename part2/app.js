const express = require('express');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

// Added session management
var session = require('express-session');

const app = express();

// Middleware
app.use(express.json());

// Set session magnagement variables
app.use(session({
  secret: 'WDC2025',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static(path.join(__dirname, '/public')));

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Create a table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('owner', 'walker') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS Dogs(
        dog_id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        size ENUM('small', 'medium', 'large') NOT NULL,
        FOREIGN KEY (owner_id) REFERENCES Users(user_id)
      )
      `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkRequests (
        request_id INT AUTO_INCREMENT PRIMARY KEY,
        dog_id INT NOT NULL,
        requested_time DATETIME NOT NULL,
        duration_minutes INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkApplications (
        application_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        CONSTRAINT unique_application UNIQUE (request_id, walker_id)
      )
    `);
    await db.execute(`
      CREATE TABLE IF NOT EXISTS WalkRatings (
        rating_id INT AUTO_INCREMENT PRIMARY KEY,
        request_id INT NOT NULL,
        walker_id INT NOT NULL,
        owner_id INT NOT NULL,
        rating INT CHECK (rating BETWEEN 1 AND 5),
        comments TEXT,
        rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
        FOREIGN KEY (walker_id) REFERENCES Users(user_id),
        FOREIGN KEY (owner_id) REFERENCES Users(user_id),
        CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
      )
    `);

    // Insert data if table is empty
    let [rows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('shaggy123', 'shaggy@mysteryinc.com', 'zoinkssc00b', 'owner'),
        ('bruce123', 'brucewayne@wayneindustries.com', 'batman123', 'owner')
      `);
    }
    [rows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO Dogs (owner_id, name, size) VALUES
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
        ((SELECT user_id FROM Users WHERE username = 'shaggy123'), 'Scooby', 'large'),
        ((SELECT user_id FROM Users WHERE username = 'bruce123'), 'Ace', 'medium'),
        ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Min', 'medium')
      `);
    }
    [rows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (rows[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
        ((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')), '2025-06-10 09:45:00', 45, 'Beachside Ave', 'accepted'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Scooby' AND owner_id = (SELECT user_id FROM Users WHERE username = 'shaggy123')), '2025-06-20 10:00:00', 40, 'All you can eat Buffet', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Ace' AND owner_id = (SELECT user_id FROM Users WHERE username = 'bruce123')), '2025-06-19 20:30:00', 30, 'Patrol', 'completed'),
        ((SELECT dog_id FROM Dogs WHERE name = 'Min' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:30:00', 30, 'CBD', 'open')
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
module.exports.db = db; 