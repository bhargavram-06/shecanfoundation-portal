const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/db');

const app = express();

// 1. Connect to MongoDB Atlas
connectDB();

// 2. Define Explicit CORS Options to pass Browser Preflight checks
const corsOptions = {
    origin: 'https://shecanfoundation-portall.vercel.app', // Your exact Vercel frontend domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// 3. Apply CORS Middleware globally
app.use(cors(corsOptions));

// 4. Force intercept Preflight OPTIONS requests globally across all routes
app.options('*', cors(corsOptions));

// 5. Native Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. API Route Bindings
app.use('/api/forms', require('./routes/formRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// 7. Base Health Check Route (Helps confirm Render is up)
app.get('/', (req, res) => {
    res.send('She Can Foundation Backend API running smoothly...');
});

// 8. Bind Server to Production Environment Port Assignment
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));