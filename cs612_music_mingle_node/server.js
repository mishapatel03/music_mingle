import express from 'express';

import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/index.js'
import connection from './db/index.js';
import { authenticateToken } from './middleware/index.js';

dotenv.config();

const port = 8081;
const app = express();

app.use(cors());

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected');
});

// Middleware
app.use(express.json());

// Routes
app.use(userRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

