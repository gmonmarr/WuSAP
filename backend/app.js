// app.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import { logAPIAccess } from './middleware/logMiddleware.js';
import { verifyToken } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(logAPIAccess); // ESTE DEBE ESTAR ANTES DE LAS RUTAS
app.use('/api', authRoutes);

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Catch-all for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;