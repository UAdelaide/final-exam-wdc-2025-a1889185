const express = require('express');
const path = require('path');
require('dotenv').config();
const mysql = require('mysql2/promise');

// Added session management
var session = require('express-session');

const app = express();

// Middleware
app.use(express.json());

app.use(session({
secret: 'WDC2025',
resave: false,
saveUninitialized: true,
cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;