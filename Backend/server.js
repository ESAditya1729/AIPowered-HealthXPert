const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { sql, config } = require('./db');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public')); // Serve HTML files

// SignUp Route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        await sql.connect(config);
        const hashedPassword = await bcrypt.hash(password, 10);
        await sql.query`INSERT INTO Users (Username, Password) VALUES (${username}, ${hashedPassword})`;
        res.send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Signup failed');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT * FROM Users WHERE Username = ${username}`;
        if (result.recordset.length === 0) return res.status(400).send('User not found');

        const user = result.recordset[0];
        const match = await bcrypt.compare(password, user.Password);
        match ? res.send('Login successful!') : res.status(401).send('Invalid credentials');
    } catch (err) {
        console.error(err);
        res.status(500).send('Login failed');
    }
});

// Run server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
