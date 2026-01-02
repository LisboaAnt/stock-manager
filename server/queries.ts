import pool from './db';
import {
  User,
  Category,
  Supplier,
  Product,
  StockMovement,
  Role,
  MovementType,
  ExitReason,
} from './types';

// Users
export const getUserByEmail = async (email: string): Promise<(User & { passwordHash?: string }) | null> => {
  const result = await pool.query(
    'SELECT id, email, full_name as name, role, is_active as "isActive", password_hash as "passwordHash", created_at, updated_at FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  
  // Debug: verificar se passwordHash está vindo corretamente
  console.log(`[QUERY] passwordHash do banco:`, row.passwordHash ? `${row.passwordHash.substring(0, 20)}...` : 'null/undefined');
  console.log(`[QUERY] isActive do banco:`, row.isActive, `(tipo: ${typeof row.isActive})`);
  
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    isActive: row.isActive ?? row.is_active ?? true, // Usar isActive do alias ou is_active direto
    passwordHash: row.passwordHash || undefined,
  };
};

export const getUserById = async (id: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT id, email, full_name as name, role, is_active as "isActive", created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    isActive: row.isActive ?? row.is_active ?? true,
  };
};

export const getAllUsers = async (): Promise<User[]> => {
  const result = await pool.query(
    'SELECT id, email, full_name as name, role, is_active as "isActive" FROM users WHERE is_active = true ORDER BY full_name'
  );
  return result.rows.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as Role,
    isActive: row.isActive ?? row.is_active ?? true,
  }));
};

// Categories
export const getAllCategories = async (): Promise<Category[]> => {
  const result = await pool.query('SELECT id, name FROM categories ORDER BY name');
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
  }));
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const result = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
    [category.name]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
  };
};

export const updateCategory = async (id: string, category: Omit<Category, 'id'>): Promise<Category> => {
  const result = await pool.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name',
    [category.name, id]
  );
  if (result.rows.length === 0) {
    throw new Error('Categoria não encontrada');
  }
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
  };
};

export const deleteCategory = async (id: string): Promise<void> => {
  const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw new Error('Categoria não encontrada');
  }
};

// Suppliers
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  const result = await pool.query('SELECT id, name, cnpj_cpf as "documentId", email as "contactEmail" FROM suppliers ORDER BY name');
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    documentId: row.documentId || undefined,
    contactEmail: row.contactEmail || undefined,
  }));
};

export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const result = await pool.query(
    'INSERT INTO suppliers (name, cnpj_cpf, email) VALUES ($1, $2, $3) RETURNING id, name, cnpj_cpf as "documentId", email as "contactEmail"',
    [supplier.name, supplier.documentId || null, supplier.contactEmail || null]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    documentId: row.documentId || undefined,
    contactEmail: row.contactEmail || undefined,
  };
};

export const updateSupplier = async (id: string, supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const result = await pool.query(
    'UPDATE suppliers SET name = $1, cnpj_cpf = $2, email = $3 WHERE id = $4 RETURNING id, name, cnpj_cpf as "documentId", email as "contactEmail"',
    [supplier.name, supplier.documentId || null, supplier.contactEmail || null, id]
  );
  if (result.rows.length === 0) {
    throw new Error('Fornecedor não encontrado');
  }
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    documentId: row.documentId || undefined,
    contactEmail: row.contactEmail || undefined,
  };
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const result = await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw new Error('Fornecedor não encontrado');
  }
};

// Products
export const getAllProducts = async (): Promise<Product[]> => {
  const result = await pool.query(`
    SELECT 
      p.id,
      p.name,
      p.sku,
      p.sku as barcode,
      p.category_id as "categoryId",
      p.price_cost as "priceCost",
      p.price_sale as "priceSale",
      p.min_stock as "minStock",
      p.current_stock as "stockQuantity",
      CASE 
        WHEN p.supplier_id IS NOT NULL THEN ARRAY[p.supplier_id]
        ELSE ARRAY[]::uuid[]
      END as "supplierIds"
    FROM products p
    ORDER BY p.name
  `);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.sku,
    categoryId: row.categoryId,
    priceCost: Number.parseFloat(row.priceCost),
    priceSale: Number.parseFloat(row.priceSale),
    minStock: row.minStock,
    stockQuantity: row.stockQuantity,
    supplierIds: row.supplierIds || [],
  }));
};

export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  // Usar o primeiro supplier_id se houver
  const supplierId = product.supplierIds && product.supplierIds.length > 0 ? product.supplierIds[0] : null;
  
  const result = await pool.query(
    `INSERT INTO products (name, sku, category_id, supplier_id, price_cost, price_sale, min_stock, current_stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, name, sku, category_id as "categoryId", price_cost as "priceCost", 
               price_sale as "priceSale", min_stock as "minStock", current_stock as "stockQuantity",
               supplier_id as "supplierId"`,
    [
      product.name,
      product.sku,
      product.categoryId || null,
      supplierId,
      product.priceCost,
      product.priceSale,
      product.minStock,
      product.stockQuantity || 0,
    ]
  );
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.sku,
    categoryId: row.categoryId,
    priceCost: Number.parseFloat(row.priceCost),
    priceSale: Number.parseFloat(row.priceSale),
    minStock: row.minStock,
    stockQuantity: row.stockQuantity,
    supplierIds: row.supplierId ? [row.supplierId] : [],
  };
};

export const updateProduct = async (id: string, product: Omit<Product, 'id'>): Promise<Product> => {
  const supplierId = product.supplierIds && product.supplierIds.length > 0 ? product.supplierIds[0] : null;
  
  const result = await pool.query(
    `UPDATE products 
     SET name = $1, sku = $2, category_id = $3, supplier_id = $4, price_cost = $5, 
         price_sale = $6, min_stock = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING id, name, sku, category_id as "categoryId", price_cost as "priceCost", 
               price_sale as "priceSale", min_stock as "minStock", current_stock as "stockQuantity",
               supplier_id as "supplierId"`,
    [
      product.name,
      product.sku,
      product.categoryId || null,
      supplierId,
      product.priceCost,
      product.priceSale,
      product.minStock,
      id,
    ]
  );
  
  if (result.rows.length === 0) {
    throw new Error('Produto não encontrado');
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    barcode: row.sku,
    categoryId: row.categoryId,
    priceCost: Number.parseFloat(row.priceCost),
    priceSale: Number.parseFloat(row.priceSale),
    minStock: row.minStock,
    stockQuantity: row.stockQuantity,
    supplierIds: row.supplierId ? [row.supplierId] : [],
  };
};

export const deleteProduct = async (id: string): Promise<void> => {
  const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    throw new Error('Produto não encontrado');
  }
};

// Movements
export const getAllMovements = async (): Promise<StockMovement[]> => {
  const result = await pool.query(`
    SELECT 
      m.id,
      m.product_id as "productId",
      m.user_id as "userId",
      m.type,
      m.quantity,
      m.reason,
      m.notes,
      m.created_at as "createdAt",
      u.full_name as "userName"
    FROM inventory_movements m
    LEFT JOIN users u ON u.id = m.user_id
    ORDER BY m.created_at DESC
  `);
  return result.rows.map((row) => ({
    id: row.id,
    productId: row.productId,
    userId: row.userId,
    type: row.type as MovementType,
    reason: row.reason as ExitReason | undefined,
    quantity: row.quantity,
    unitPrice: 0, // TODO: adicionar campo unit_price na tabela ou calcular
    notes: row.notes || undefined,
    createdAt: row.createdAt.toISOString(),
    userName: row.userName || 'Usuário não encontrado', // Adicionar nome do usuário
  }));
};

export const createMovement = async (
  movement: Omit<StockMovement, 'id' | 'createdAt'>
): Promise<StockMovement> => {
  // Validação RF25: Bloquear saída se estoque insuficiente
  if (movement.type === 'EXIT') {
    const productResult = await pool.query('SELECT current_stock FROM products WHERE id = $1', [movement.productId]);
    if (productResult.rows.length === 0) {
      throw new Error('Produto não encontrado');
    }
    const currentStock = productResult.rows[0].current_stock;
    if (movement.quantity > currentStock) {
      throw new Error(`Estoque insuficiente! Disponível: ${currentStock} unidades (RF25)`);
    }
  }
  
  const result = await pool.query(
    `INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, created_at as "createdAt"`,
    [movement.productId, movement.userId, movement.type, movement.quantity, movement.reason || null, movement.notes || null]
  );
  
  // Atualizar estoque do produto
  if (movement.type === 'ENTRY') {
    await pool.query('UPDATE products SET current_stock = current_stock + $1 WHERE id = $2', [
      movement.quantity,
      movement.productId,
    ]);
  } else if (movement.type === 'EXIT') {
    await pool.query('UPDATE products SET current_stock = current_stock - $1 WHERE id = $2', [
      movement.quantity,
      movement.productId,
    ]);
  } else if (movement.type === 'ADJUSTMENT') {
    await pool.query('UPDATE products SET current_stock = $1 WHERE id = $2', [
      movement.quantity,
      movement.productId,
    ]);
  }

  return {
    ...movement,
    id: result.rows[0].id,
    createdAt: result.rows[0].createdAt.toISOString(),
  };
};

// Reports
export const getStockReport = async () => {
  const result = await pool.query(`
    SELECT 
      id,
      name,
      sku,
      current_stock as "stockQuantity",
      min_stock as "minStock",
      price_cost as "priceCost",
      (current_stock < min_stock) as "belowMin"
    FROM products
    ORDER BY name
  `);
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    sku: row.sku,
    stockQuantity: row.stockQuantity,
    minStock: row.minStock,
    priceCost: Number.parseFloat(row.priceCost || 0),
    belowMin: row.belowMin,
  }));
};

export const getSalesReport = async () => {
  const result = await pool.query(`
    SELECT 
      COALESCE(SUM(m.quantity * p.price_sale), 0) as "totalSales",
      COALESCE(SUM(m.quantity), 0) as "totalItems"
    FROM inventory_movements m
    JOIN products p ON p.id = m.product_id
    WHERE m.type = 'EXIT' AND m.reason = 'SALE'
  `);
  const row = result.rows[0];
  return {
    totalSales: Number.parseFloat(row.totalSales) || 0,
    totalItems: Number.parseInt(row.totalItems) || 0,
  };
};

// Relatórios detalhados de vendas (SOL-002) - apenas para ADMIN
export const getDetailedSalesReport = async () => {
  // Vendas por produto
  const salesByProduct = await pool.query(`
    SELECT 
      p.id,
      p.name as "productName",
      p.sku,
      COALESCE(SUM(m.quantity), 0) as "totalQuantity",
      COALESCE(SUM(m.quantity * p.price_sale), 0) as "totalRevenue",
      COUNT(m.id) as "saleCount"
    FROM products p
    LEFT JOIN inventory_movements m ON m.product_id = p.id AND m.type = 'EXIT' AND m.reason = 'SALE'
    GROUP BY p.id, p.name, p.sku
    HAVING COALESCE(SUM(m.quantity), 0) > 0
    ORDER BY "totalRevenue" DESC
  `);

  // Vendas por período (últimos 30 dias)
  const salesByPeriod = await pool.query(`
    SELECT 
      created_at::date as "date",
      COUNT(*) as "saleCount",
      SUM(quantity) as "totalQuantity",
      COALESCE(SUM(quantity * (SELECT price_sale FROM products WHERE id = product_id)), 0) as "totalRevenue"
    FROM inventory_movements
    WHERE type = 'EXIT' AND reason = 'SALE'
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY created_at::date
    ORDER BY "date" DESC
  `);

  // Produtos mais vendidos
  const topProducts = await pool.query(`
    SELECT 
      p.name as "productName",
      p.sku,
      SUM(m.quantity) as "totalQuantity",
      COALESCE(SUM(m.quantity * p.price_sale), 0) as "totalRevenue"
    FROM inventory_movements m
    JOIN products p ON p.id = m.product_id
    WHERE m.type = 'EXIT' AND m.reason = 'SALE'
    GROUP BY p.id, p.name, p.sku
    ORDER BY "totalQuantity" DESC
    LIMIT 10
  `);

  return {
    salesByProduct: salesByProduct.rows.map(row => ({
      productId: row.id,
      productName: row.productName,
      sku: row.sku,
      totalQuantity: Number.parseInt(row.totalQuantity) || 0,
      totalRevenue: Number.parseFloat(row.totalRevenue) || 0,
      saleCount: Number.parseInt(row.saleCount) || 0,
    })),
    salesByPeriod: salesByPeriod.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      saleCount: Number.parseInt(row.saleCount) || 0,
      totalQuantity: Number.parseInt(row.totalQuantity) || 0,
      totalRevenue: Number.parseFloat(row.totalRevenue) || 0,
    })),
    topProducts: topProducts.rows.map(row => ({
      productName: row.productName,
      sku: row.sku,
      totalQuantity: Number.parseInt(row.totalQuantity) || 0,
      totalRevenue: Number.parseFloat(row.totalRevenue) || 0,
    })),
  };
};

// System Settings
export const getSystemSettings = async (): Promise<Record<string, any>> => {
  const result = await pool.query('SELECT setting_key, setting_value FROM system_settings');
  const settings: Record<string, any> = {};
  
  for (const row of result.rows) {
    const key = row.setting_key;
    let value = row.setting_value;
    
    // Converter valores booleanos e numéricos
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (!Number.isNaN(Number(value)) && value !== '') value = Number(value);
    
    settings[key] = value;
  }
  
  return settings;
};

export const updateSystemSettings = async (settings: Record<string, any>): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
      await client.query(
        `INSERT INTO system_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, stringValue]
      );
    }
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

