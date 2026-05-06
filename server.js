import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {testConnection} from './src/config/database.js';

// Import routes
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';

// Sprint 5 - Simpan Pinjam routes
import simpananRoutes from './src/routes/simpananRoutes.js';
import pinjamanRoutes from './src/routes/pinjamanRoutes.js';
import angsuranRoutes from './src/routes/angsuranRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600,
  }),
);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Test database connection
testConnection();

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Koperasi BAGUS API',
    version: '1.0.0',
    sprint: 'Sprint 5 - Simpan Pinjam',
    status: 'running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);

// Sprint 5 - Simpan Pinjam Routes
app.use('/api/simpanan', simpananRoutes);
app.use('/api/pinjaman', pinjamanRoutes);
app.use('/api/angsuran', angsuranRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({message: 'Route not found'});
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && {stack: err.stack}),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
