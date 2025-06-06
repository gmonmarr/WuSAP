// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import { logAPIAccess } from './middleware/logMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import prediccionRoutes from './routes/prediccionRoutes.js';
import hanaPool from './db/hanaPool.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(logAPIAccess); // ESTE DEBE ESTAR ANTES DE LAS RUTAS
app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', inventoryRoutes);
app.use('/api', orderRoutes);
app.use('/api', employeeRoutes);
app.use('/api', locationRoutes);
app.use('/api', prediccionRoutes);

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test HANA connection
app.get('/api/test-hana', (req, res) => {
  hanaPool.acquire().then((conn) => {
    conn.exec('SELECT CURRENT_TIMESTAMP AS "Current Time" FROM DUMMY', (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Error connecting to HANA DB' });
      } else {
        res.json({ message: 'Connected to HANA DB', data: rows });
      }
      hanaPool.release(conn);
    });
  }).catch((err) => {
    res.status(500).json({ error: 'Error acquiring HANA connection' });
  });
});

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;