import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login, users, categories, suppliers, products, movements } from './mock';
import { StockMovement, Product } from './types';
import {
  getUserByEmail,
  getUserById,
  getAllUsers,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllMovements,
  createMovement,
  getStockReport,
  getSalesReport,
  getDetailedSalesReport,
  getSystemSettings,
  updateSystemSettings,
} from './queries';

config();

const app = express();
app.use(express.json());
// CORS configurado para aceitar requisições do frontend
app.use(cors({ 
  origin: process.env.FRONTEND_URL || '*',
  credentials: true 
}));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
// USE_MOCK será true se MOCK_DATA não for exatamente 'false' (case-insensitive)
const MOCK_DATA_ENV = process.env.MOCK_DATA?.toLowerCase().trim();
const USE_MOCK = MOCK_DATA_ENV !== 'false';

// JWT Configuration
const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

// Funções auxiliares JWT
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return authHeader;
}

// Auth
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`[LOGIN] Tentativa de login: ${email}, MOCK_DATA=${USE_MOCK}`);
  
  if (USE_MOCK) {
    const result = login(email, password);
    if (!result) return res.status(401).json({ message: 'Credenciais inválidas' });
    return res.json(result);
  }
  
  try {
  const user = await getUserByEmail(email);
    console.log(`[LOGIN] Usuário encontrado:`, user ? { id: user.id, email: user.email, hasPassword: !!user.passwordHash, isActive: user.isActive } : 'null');
    
    if (!user) {
      console.log(`[LOGIN] ❌ Usuário não encontrado`);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    if (!user.isActive) {
      console.log(`[LOGIN] ❌ Usuário inativo`);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar senha
    if (!user.passwordHash) {
      console.log(`[LOGIN] ❌ Usuário sem senha configurada`);
      return res.status(401).json({ message: 'Usuário não possui senha configurada' });
    }
    
    console.log(`[LOGIN] Comparando senha... (senha recebida: "${password.substring(0, 3)}...")`);
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    console.log(`[LOGIN] Senha válida: ${passwordMatch ? '✅ SIM' : '❌ NÃO'}`);
    
    if (!passwordMatch) {
      console.log(`[LOGIN] ❌ Senha não confere`);
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  
    // Remover passwordHash da resposta
    const { passwordHash, ...safeUser } = user;
    
    // Gerar token JWT
    const token = generateToken(user.id);
    
    console.log(`[LOGIN] ✅ Login bem-sucedido para ${user.email}`);
  return res.json({
    token,
      user: safeUser,
  });
  } catch (error) {
    console.error('[LOGIN] ❌ Erro no login:', error);
    if (error instanceof Error) {
      console.error('[LOGIN] Stack:', error.stack);
    }
    return res.status(500).json({ message: 'Erro ao processar login' });
  }
});

// Users
app.get('/api/users/me', async (req, res) => {
  if (USE_MOCK) {
    const { password, ...user } = users[0];
    return res.json(user);
  }
  
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization || req.headers['x-auth-token'] as string;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }
    
    // Verificar e decodificar token JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    
    // Buscar usuário pelo ID do token
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // getUserById já retorna o usuário sem passwordHash
    res.json(user);
  } catch (error) {
    console.error('[USERS/ME] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
    res.status(500).json({ message });
  }
});

app.get('/api/users', async (_req, res) => {
  if (USE_MOCK) {
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    return res.json(usersWithoutPassword);
  }
  
  try {
    const data = await getAllUsers();
    res.json(data);
  } catch (error) {
    console.error('[USERS] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar usuários';
    res.status(500).json({ message });
  }
});

// Categories
app.get('/api/categories', async (_req, res) => {
  if (USE_MOCK) {
    return res.json(categories);
  }
  
  try {
    const data = await getAllCategories();
    res.json(data);
  } catch (error) {
    console.error('[CATEGORIES] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar categorias';
    res.status(500).json({ message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { name } = req.body;
  
  if (USE_MOCK) {
    const newCategory = { id: randomUUID(), name };
    categories.push(newCategory);
    return res.status(201).json(newCategory);
  }
  
  try {
    const category = await createCategory({ name });
    res.status(201).json(category);
  } catch (error) {
    console.error('[CATEGORIES] Erro ao criar:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar categoria';
    res.status(500).json({ message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (USE_MOCK) {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ message: 'Categoria não encontrada' });
    categories[index] = { ...categories[index], name };
    return res.json(categories[index]);
  }
  
  try {
    const category = await updateCategory(id, { name });
    res.json(category);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    if (error instanceof Error && error.message.includes('não encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  
  if (USE_MOCK) {
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return res.status(404).json({ message: 'Categoria não encontrada' });
    categories.splice(index, 1);
    return res.status(204).send();
  }
  
  try {
    await deleteCategory(id);
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    if (error instanceof Error && error.message.includes('não encontrada')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao excluir categoria' });
  }
});

// Suppliers
app.get('/api/suppliers', async (_req, res) => {
  if (USE_MOCK) {
    return res.json(suppliers);
  }
  
  try {
    const data = await getAllSuppliers();
    res.json(data);
  } catch (error) {
    console.error('[SUPPLIERS] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar fornecedores';
    res.status(500).json({ message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  const { name, documentId, contactEmail } = req.body;
  
  if (USE_MOCK) {
    const newSupplier = {
      id: randomUUID(),
      name,
      documentId,
      contactEmail,
    };
    suppliers.push(newSupplier);
    return res.status(201).json(newSupplier);
  }
  
  try {
    const supplier = await createSupplier({ name, documentId, contactEmail });
    res.status(201).json(supplier);
  } catch (error) {
    console.error('[SUPPLIERS] Erro ao criar:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar fornecedor';
    res.status(500).json({ message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  const { id } = req.params;
  const { name, documentId, contactEmail } = req.body;
  
  if (USE_MOCK) {
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ message: 'Fornecedor não encontrado' });
    suppliers[index] = { ...suppliers[index], name, documentId, contactEmail };
    return res.json(suppliers[index]);
  }
  
  try {
    const supplier = await updateSupplier(id, { name, documentId, contactEmail });
    res.json(supplier);
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Erro ao atualizar fornecedor' });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  const { id } = req.params;
  
  if (USE_MOCK) {
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ message: 'Fornecedor não encontrado' });
    suppliers.splice(index, 1);
    return res.status(204).send();
  }
  
  try {
    await deleteSupplier(id);
    res.status(204).send();
  } catch (error) {
    console.error('[SUPPLIERS] Erro ao excluir:', error);
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Erro ao excluir fornecedor';
    res.status(500).json({ message });
  }
});

// Products
app.get('/api/products', async (_req, res) => {
  if (USE_MOCK) {
    return res.json(products);
  }
  
  try {
    const data = await getAllProducts();
    res.json(data);
  } catch (error) {
    console.error('[PRODUCTS] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar produtos';
    res.status(500).json({ message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, sku, barcode, categoryId, priceCost, priceSale, minStock, stockQuantity, supplierIds } = req.body;
  
  if (USE_MOCK) {
    const newProduct: Product = {
      id: randomUUID(),
      name,
      sku,
      barcode: barcode || sku,
      categoryId,
      priceCost,
      priceSale,
      minStock,
      stockQuantity: stockQuantity || 0,
      supplierIds: supplierIds || [],
    };
    products.push(newProduct);
    return res.status(201).json(newProduct);
  }
  
  try {
    const product = await createProduct({
      name,
      sku,
      barcode: barcode || sku,
      categoryId,
      priceCost,
      priceSale,
      minStock,
      stockQuantity: stockQuantity || 0,
      supplierIds: supplierIds || [],
    });
    res.status(201).json(product);
  } catch (error) {
    console.error('[PRODUCTS] Erro ao criar:', error);
    const message = error instanceof Error ? error.message : 'Erro ao criar produto';
    res.status(500).json({ message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sku, barcode, categoryId, priceCost, priceSale, minStock, stockQuantity, supplierIds } = req.body;
  
  if (USE_MOCK) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ message: 'Produto não encontrado' });
    products[index] = {
      ...products[index],
      name,
      sku,
      barcode: barcode || sku,
      categoryId,
      priceCost,
      priceSale,
      minStock,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : products[index].stockQuantity,
      supplierIds: supplierIds || products[index].supplierIds,
    };
    return res.json(products[index]);
  }
  
  try {
    const product = await updateProduct(id, {
      name,
      sku,
      barcode: barcode || sku,
      categoryId,
      priceCost,
      priceSale,
      minStock,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : 0,
      supplierIds: supplierIds || [],
    });
    res.json(product);
  } catch (error) {
    console.error('[PRODUCTS] Erro ao atualizar:', error);
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar produto';
    res.status(500).json({ message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  
  if (USE_MOCK) {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ message: 'Produto não encontrado' });
    products.splice(index, 1);
    return res.status(204).send();
  }
  
  try {
    await deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    console.error('[PRODUCTS] Erro ao excluir:', error);
    if (error instanceof Error && error.message.includes('não encontrado')) {
      return res.status(404).json({ message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Erro ao excluir produto';
    res.status(500).json({ message });
  }
});

// Movements
app.get('/api/movements', async (_req, res) => {
  if (USE_MOCK) {
    return res.json(movements);
  }
  
  try {
    const data = await getAllMovements();
    res.json(data);
  } catch (error) {
    console.error('[MOVEMENTS] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar movimentações';
    res.status(500).json({ message });
  }
});

// Funções auxiliares para reduzir complexidade cognitiva
function validateMovementData(data: Partial<Omit<StockMovement, 'id' | 'createdAt'>>): string | null {
  if (!data.productId || !data.userId || !data.type || !data.quantity) {
    return 'Dados inválidos: productId, userId, type e quantity são obrigatórios';
  }
  return null;
}

function validateStockAvailability(productId: string, quantity: number): { valid: boolean; message?: string } {
  const product = products.find((p) => p.id === productId);
  if (!product) {
    return { valid: false, message: 'Produto não encontrado' };
  }
  if (quantity > product.stockQuantity) {
    return { 
      valid: false, 
      message: `Estoque insuficiente! Disponível: ${product.stockQuantity} unidades (RF25)` 
    };
  }
  return { valid: true };
}

function createMockMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement {
  const move: StockMovement = {
    id: randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  movements.push(move);
  return move;
}

function updateProductStock(productId: string, type: string, quantity: number): void {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  
  if (type === 'ENTRY') {
    product.stockQuantity += quantity;
  } else if (type === 'EXIT') {
    product.stockQuantity -= quantity;
  } else if (type === 'ADJUSTMENT') {
    product.stockQuantity = quantity;
  }
}

async function handleMockMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): Promise<{ status: number; body: StockMovement | { message: string } }> {
  if (data.type === 'EXIT') {
    const validation = validateStockAvailability(data.productId, data.quantity);
    if (!validation.valid) {
      return { 
        status: validation.message === 'Produto não encontrado' ? 404 : 400, 
        body: { message: validation.message || 'Erro de validação' } 
      };
    }
  }
  
  const move = createMockMovement(data);
  updateProductStock(data.productId, data.type, data.quantity);
  return { status: 201, body: move };
}

async function handleDatabaseMovement(data: Omit<StockMovement, 'id' | 'createdAt'>): Promise<{ status: number; body: StockMovement | { message: string } }> {
  try {
    const move = await createMovement(data);
    console.log('[MOVEMENT] ✅ Movimentação criada com sucesso:', move.id);
    return { status: 201, body: move };
  } catch (error) {
    console.error('[MOVEMENT] ❌ Erro ao criar movimentação:', error);
    if (error instanceof Error) {
      return { status: 400, body: { message: error.message } };
    }
    return { status: 500, body: { message: 'Erro ao criar movimentação' } };
  }
}

app.post('/api/movements', async (req, res) => {
  const { productId, userId, type, reason, quantity, unitPrice, notes } = req.body as Omit<StockMovement, 'id' | 'createdAt'>;
  
  console.log('[MOVEMENT] Dados recebidos:', { productId, userId, type, reason, quantity });
  
  const validationError = validateMovementData({ productId, userId, type, quantity });
  if (validationError) {
    console.log('[MOVEMENT] ❌ Dados inválidos');
    return res.status(400).json({ message: validationError });
  }
  
  const movementData = { productId, userId, type, reason, quantity, unitPrice, notes };
  const result = USE_MOCK 
    ? await handleMockMovement(movementData)
    : await handleDatabaseMovement(movementData);
  
  return res.status(result.status).json(result.body);
});

// Reports
app.get('/api/reports/stock', async (_req, res) => {
  if (USE_MOCK) {
    const report = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stockQuantity: p.stockQuantity,
      minStock: p.minStock,
      priceCost: p.priceCost,
      belowMin: p.stockQuantity < p.minStock,
    }));
    return res.json(report);
  }
  
  try {
    const report = await getStockReport();
    res.json(report);
  } catch (error) {
    console.error('[REPORTS/STOCK] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao gerar relatório de estoque';
    res.status(500).json({ message });
  }
});

app.get('/api/reports/sales', async (_req, res) => {
  if (USE_MOCK) {
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
    return res.json(summary);
  }
  
  try {
    const summary = await getSalesReport();
    res.json(summary);
  } catch (error) {
    console.error('[REPORTS/SALES] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao gerar relatório de vendas';
    res.status(500).json({ message });
  }
});

// Relatórios detalhados de vendas (SOL-002) - apenas para ADMIN
app.get('/api/reports/sales/detailed', async (_req, res) => {
  if (USE_MOCK) {
    // Mock data para desenvolvimento
    const salesMovements = movements.filter((m) => m.type === 'EXIT' && m.reason === 'SALE');
    const productsMap = new Map(products.map(p => [p.id, p]));
    
    const salesByProduct = Array.from(
      salesMovements.reduce((acc, m) => {
        const product = productsMap.get(m.productId);
        if (!product) return acc;
        const key = m.productId;
        if (!acc.has(key)) {
          acc.set(key, {
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            totalQuantity: 0,
            totalRevenue: 0,
            saleCount: 0,
          });
        }
        const item = acc.get(key)!;
        item.totalQuantity += m.quantity;
        item.totalRevenue += m.quantity * product.priceSale;
        item.saleCount += 1;
        return acc;
      }, new Map())
    ).map(([_, v]) => v);

    const salesByPeriodUnsorted = Array.from(
      salesMovements.reduce((acc, m) => {
        const date = new Date(m.createdAt).toISOString().split('T')[0];
        if (!acc.has(date)) {
          acc.set(date, {
            date,
            saleCount: 0,
            totalQuantity: 0,
            totalRevenue: 0,
          });
        }
        const item = acc.get(date)!;
        const product = productsMap.get(m.productId);
        item.saleCount += 1;
        item.totalQuantity += m.quantity;
        item.totalRevenue += m.quantity * (product?.priceSale || 0);
        return acc;
      }, new Map())
    ).map(([_, v]) => v);
    const salesByPeriod = salesByPeriodUnsorted.toSorted((a, b) => b.date.localeCompare(a.date));

    const sortedProducts = salesByProduct.toSorted((a, b) => b.totalQuantity - a.totalQuantity);
    const topProducts = sortedProducts.slice(0, 10);

    return res.json({
      salesByProduct,
      salesByPeriod,
      topProducts,
    });
  }
  
  try {
    const detailed = await getDetailedSalesReport();
    res.json(detailed);
  } catch (error) {
    console.error('[REPORTS/SALES/DETAILED] Erro:', error);
    const message = error instanceof Error ? error.message : 'Erro ao gerar relatório detalhado de vendas';
    res.status(500).json({ message });
  }
});

// System Settings - apenas ADMIN (RF34)
app.get('/api/settings', async (_req, res) => {
  if (USE_MOCK) {
    // Retornar configurações padrão em modo MOCK
    return res.json({
      systemName: 'Stock Manager',
      minStockAlert: true,
      autoCalculateCost: true,
      retentionPeriod: 24,
      maxProducts: 10000,
      enableBarcodeScan: true,
      enableExpiryAlerts: true,
      defaultCurrency: 'BRL',
    });
  }
  
  try {
    const settings = await getSystemSettings();
    res.json(settings);
  } catch (error) {
    console.error('[SETTINGS] Erro ao buscar:', error);
    const message = error instanceof Error ? error.message : 'Erro ao buscar configurações';
    res.status(500).json({ message });
  }
});

app.put('/api/settings', async (req, res) => {
  if (USE_MOCK) {
    // Em modo MOCK, apenas retornar sucesso
    return res.json({ message: 'Configurações salvas com sucesso (modo MOCK)' });
  }
  
  try {
    // Verificar se é ADMIN (deveria ter middleware de autenticação, mas por enquanto apenas validação básica)
    const settings = req.body;
    await updateSystemSettings(settings);
    res.json({ message: 'Configurações salvas com sucesso' });
  } catch (error) {
    console.error('[SETTINGS] Erro ao salvar:', error);
    const message = error instanceof Error ? error.message : 'Erro ao salvar configurações';
    res.status(500).json({ message });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n🚀 API running on port ${PORT}`);
  console.log(`📊 Modo: ${USE_MOCK ? '🔴 MOCK (dados em memória)' : '🟢 BANCO DE DADOS REAL'}`);
  console.log(`📝 MOCK_DATA env: "${process.env.MOCK_DATA}"`);
  console.log(`🔗 DATABASE_URL configured: ${!!process.env.DATABASE_URL}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Não configurado'}`);
  console.log(`\n`);
});


