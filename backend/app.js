// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import { logAPIAccess } from './middleware/logMiddleware.js';
import productRoutes from './routes/productRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de CORS 
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // URL de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
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

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Test HANA connection
app.get('/api/test-hana', (req, res) => {
  const hanaPool = require('./db/hanaPool.js');
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
  }
);

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS habilitado para: ${corsOptions.origin}`);
});

export default app;