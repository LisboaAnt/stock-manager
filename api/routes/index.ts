import express from 'express';
import { login, register } from '../controllers/authController';
import { createProduct, getProducts, updateProduct, deleteProduct } from '../controllers/productController';
import authenticateToken from '../middleware/auth';
import { shouldUseMockData, isDatabaseAvailable } from '../config/database';

const router = express.Router();

// Endpoint de status para verificar se está usando dados mock
router.get('/status', (req, res) => {
  res.json({
    databaseAvailable: isDatabaseAvailable(),
    usingMockData: shouldUseMockData(),
    message: shouldUseMockData() ? 'Using mock data - no database required' : 'Using database'
  });
});

router.post('/login', login);
router.post('/register', register);
router.post('/products', authenticateToken, createProduct);
router.get('/products', authenticateToken, getProducts);
router.put('/products/:id', authenticateToken, updateProduct);
router.delete('/products/:id', authenticateToken, deleteProduct);

export default router;
