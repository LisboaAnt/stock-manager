import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { login, users, categories, suppliers, products, movements } from './mock';
import { StockMovement } from './types';
import { randomUUID } from 'crypto';

config();

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const USE_MOCK = process.env.MOCK_DATA !== 'false';

// Helpers
const requireMock = (res: express.Response) => {
  if (!USE_MOCK) {
    res.status(501).json({ message: 'Modo não-mock não implementado ainda. Ajuste MOCK_DATA=true para usar dados mock.' });
    return false;
  }
  return true;
};

// Auth
app.post('/api/auth/login', (req, res) => {
  if (!requireMock(res)) return;
  const { email, password } = req.body;
  const result = login(email, password);
  if (!result) return res.status(401).json({ message: 'Credenciais inválidas' });
  return res.json(result);
});

// Users
app.get('/api/users/me', (_req, res) => {
  if (!requireMock(res)) return;
  // mock: retorna admin
  const { password, ...user } = users[0];
  res.json(user);
});

// Categories
app.get('/api/categories', (_req, res) => {
  if (!requireMock(res)) return;
  res.json(categories);
});

// Suppliers
app.get('/api/suppliers', (_req, res) => {
  if (!requireMock(res)) return;
  res.json(suppliers);
});

// Products
app.get('/api/products', (_req, res) => {
  if (!requireMock(res)) return;
  res.json(products);
});

// Movements
app.get('/api/movements', (_req, res) => {
  if (!requireMock(res)) return;
  res.json(movements);
});

app.post('/api/movements', (req, res) => {
  if (!requireMock(res)) return;
  const { productId, userId, type, reason, quantity, unitPrice, notes } = req.body as Omit<StockMovement, 'id' | 'createdAt'>;
  const move: StockMovement = {
    id: randomUUID(),
    productId,
    userId,
    type,
    reason,
    quantity,
    unitPrice,
    notes,
    createdAt: new Date().toISOString(),
  };
  movements.push(move);
  // update stock
  const product = products.find((p) => p.id === productId);
  if (product) {
    if (type === 'ENTRY') product.stockQuantity += quantity;
    if (type === 'EXIT') product.stockQuantity -= quantity;
    if (type === 'ADJUSTMENT') product.stockQuantity = quantity;
  }
  res.status(201).json(move);
});

// Reports (mock simples)
app.get('/api/reports/stock', (_req, res) => {
  if (!requireMock(res)) return;
  const report = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    stockQuantity: p.stockQuantity,
    minStock: p.minStock,
    belowMin: p.stockQuantity < p.minStock,
  }));
  res.json(report);
});

app.get('/api/reports/sales', (_req, res) => {
  if (!requireMock(res)) return;
  // mock: soma EXIT movements
  const summary = movements
    .filter((m) => m.type === 'EXIT')
    .reduce(
      (acc, m) => {
        acc.totalSales += m.quantity * m.unitPrice;
        acc.totalItems += m.quantity;
        return acc;
      },
      { totalSales: 0, totalItems: 0 },
    );
  res.json(summary);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${PORT} (mock=${USE_MOCK})`);
});

