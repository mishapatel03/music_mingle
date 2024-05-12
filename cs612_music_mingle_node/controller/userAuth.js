import connection from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    const { email, password } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the email already exists
    connection.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
            res.status(500).send('Error registering user');
        } else if (results.length > 0) {
            // If email already exists, send a 400 Bad Request response
            res.status(400).send({ errorMessage: 'Email already exists' });
        } else {
            // If email doesn't exist, insert user information into the users table
            connection.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
                if (err) {
                    res.status(500).send('Error registering user');
                } else {
                    res.status(200).send({ success: true });
                }
            });
        }
    });
};

export const login = (req, res) => {
    const { email, password } = req.body;
    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error logging in' });
        } else if (results.length === 0) {
            res.status(404).json({ message: 'User not found' });
        } else {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ userId: user.id }, 'bf80b6c614347fca6b4d7b16b547d0b5fb08e43a8496d45bf45ec545d77c81c4', { expiresIn: '5h' });

                res.status(200).json({ success: true, message: 'Login successful', token });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        }
    });
};
