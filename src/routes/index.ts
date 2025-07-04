import express from 'express';
import { indexController } from '../controllers/indexControllers';

const router = express.Router();

// GET home page
router.get('/', indexController);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version endpoint
router.get('/api/v1', (req, res) => {
  res.json({
    message: 'Welcome to BNB Mock API',
    version: '1.0.0',
    status: 'running'
  });
});

export default router; 