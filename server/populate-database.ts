import pool from './db';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

// Funções auxiliares para reduzir complexidade cognitiva
async function findOrCreateEntity(
  insertQuery: string,
  insertParams: any[],
  selectQuery: string,
  selectParams: any[],
  entityName: string,
  entityLabel: string
): Promise<string | null> {
  const result = await pool.query(insertQuery, insertParams);
  if (result.rows.length > 0) {
    console.log(`  ✅ ${entityName} criado: ${entityLabel}`);
    return result.rows[0].id;
  }
  
  const existing = await pool.query(selectQuery, selectParams);
  if (existing.rows.length > 0) {
    console.log(`  ⏭️  ${entityName} já existe: ${entityLabel}`);
    return existing.rows[0].id;
  }
  
  return null;
}

async function createCategories(): Promise<{ [key: string]: string }> {
  console.log('📁 Criando categorias...');
  const categories = [
    { name: 'Papelaria' },
    { name: 'Alimentos' },
    { name: 'Bebidas' },
    { name: 'Limpeza' },
    { name: 'Higiene Pessoal' },
    { name: 'Utilidades Domésticas' },
    { name: 'Material Escolar' },
    { name: 'Informática' },
  ];

  const categoryIds: { [key: string]: string } = {};
  for (const cat of categories) {
    const id = await findOrCreateEntity(
      'INSERT INTO categories (name) VALUES ($1) ON CONFLICT DO NOTHING RETURNING id',
      [cat.name],
      'SELECT id FROM categories WHERE name = $1',
      [cat.name],
      'Categoria',
      cat.name
    );
    if (id) {
      categoryIds[cat.name] = id;
    }
  }
  return categoryIds;
}

async function createSuppliers(): Promise<{ [key: string]: string }> {
  console.log('\n🚚 Criando fornecedores...');
  const suppliers = [
    { name: 'Bic Brasil', documentId: '12.345.678/0001-90', email: 'contato@bic.com.br' },
    { name: 'Faber-Castell', documentId: '23.456.789/0001-01', email: 'vendas@faber-castell.com.br' },
    { name: 'Coca-Cola Andina', documentId: '34.567.890/0001-12', email: 'comercial@coca-cola.com.br' },
    { name: 'Nestlé Brasil', documentId: '45.678.901/0001-23', email: 'vendas@nestle.com.br' },
    { name: 'Unilever', documentId: '56.789.012/0001-34', email: 'contato@unilever.com.br' },
    { name: 'Procter & Gamble', documentId: '67.890.123/0001-45', email: 'vendas@pg.com.br' },
    { name: 'Samsung Electronics', documentId: '78.901.234/0001-56', email: 'comercial@samsung.com.br' },
    { name: 'Distribuidora Central', documentId: '89.012.345/0001-67', email: 'pedidos@distcentral.com.br' },
  ];

  const supplierIds: { [key: string]: string } = {};
  for (const sup of suppliers) {
    const id = await findOrCreateEntity(
      `INSERT INTO suppliers (name, cnpj_cpf, email) 
       VALUES ($1, $2, $3) 
       ON CONFLICT DO NOTHING 
       RETURNING id`,
      [sup.name, sup.documentId, sup.email],
      'SELECT id FROM suppliers WHERE name = $1',
      [sup.name],
      'Fornecedor',
      sup.name
    );
    if (id) {
      supplierIds[sup.name] = id;
    }
  }
  return supplierIds;
}

function getProductsData() {
  return [
      // Papelaria
      { name: 'Caneta Bic Azul', sku: 'BIC-AZ-001', category: 'Papelaria', supplier: 'Bic Brasil', priceCost: 1.50, priceSale: 2.50, minStock: 50, stock: 120 },
      { name: 'Caneta Bic Preta', sku: 'BIC-PT-001', category: 'Papelaria', supplier: 'Bic Brasil', priceCost: 1.50, priceSale: 2.50, minStock: 50, stock: 100 },
      { name: 'Caneta Bic Vermelha', sku: 'BIC-VM-001', category: 'Papelaria', supplier: 'Bic Brasil', priceCost: 1.50, priceSale: 2.50, minStock: 30, stock: 80 },
      { name: 'Lápis HB Faber-Castell', sku: 'FC-LAP-HB', category: 'Material Escolar', supplier: 'Faber-Castell', priceCost: 0.80, priceSale: 1.50, minStock: 100, stock: 250 },
      { name: 'Borracha Branca', sku: 'BOR-001', category: 'Papelaria', supplier: 'Distribuidora Central', priceCost: 0.50, priceSale: 1.00, minStock: 50, stock: 150 },
      { name: 'Caderno 10 Matérias', sku: 'CAD-10M', category: 'Material Escolar', supplier: 'Distribuidora Central', priceCost: 8.00, priceSale: 15.00, minStock: 20, stock: 45 },
      { name: 'Régua 30cm', sku: 'REG-30', category: 'Material Escolar', supplier: 'Distribuidora Central', priceCost: 2.00, priceSale: 4.00, minStock: 30, stock: 60 },
      { name: 'Apontador', sku: 'APO-001', category: 'Papelaria', supplier: 'Distribuidora Central', priceCost: 1.20, priceSale: 2.50, minStock: 40, stock: 90 },
      
      // Alimentos
      { name: 'Arroz 5kg Tio João', sku: 'ARZ-5KG', category: 'Alimentos', supplier: 'Nestlé Brasil', priceCost: 18.00, priceSale: 26.00, minStock: 30, stock: 80 },
      { name: 'Feijão 1kg Carioca', sku: 'FEI-1KG', category: 'Alimentos', supplier: 'Nestlé Brasil', priceCost: 6.50, priceSale: 9.50, minStock: 40, stock: 100 },
      { name: 'Açúcar 1kg Cristal', sku: 'ACU-1KG', category: 'Alimentos', supplier: 'Nestlé Brasil', priceCost: 3.50, priceSale: 5.50, minStock: 50, stock: 120 },
      { name: 'Óleo de Soja 900ml', sku: 'OLE-900', category: 'Alimentos', supplier: 'Nestlé Brasil', priceCost: 4.00, priceSale: 6.50, minStock: 40, stock: 90 },
      { name: 'Macarrão Espaguete 500g', sku: 'MAC-500', category: 'Alimentos', supplier: 'Nestlé Brasil', priceCost: 2.50, priceSale: 4.00, minStock: 50, stock: 110 },
      { name: 'Leite Integral 1L', sku: 'LEI-1L', category: 'Alimentos', supplier: 'Nestlé Brasil', priceCost: 3.80, priceSale: 5.50, minStock: 60, stock: 150 },
      
      // Bebidas
      { name: 'Coca-Cola 2L', sku: 'COC-2L', category: 'Bebidas', supplier: 'Coca-Cola Andina', priceCost: 5.00, priceSale: 7.50, minStock: 40, stock: 100 },
      { name: 'Coca-Cola 350ml', sku: 'COC-350', category: 'Bebidas', supplier: 'Coca-Cola Andina', priceCost: 1.80, priceSale: 3.00, minStock: 100, stock: 250 },
      { name: 'Guaraná Antarctica 2L', sku: 'GUA-2L', category: 'Bebidas', supplier: 'Coca-Cola Andina', priceCost: 4.50, priceSale: 6.50, minStock: 30, stock: 80 },
      { name: 'Água Mineral 500ml', sku: 'AGU-500', category: 'Bebidas', supplier: 'Distribuidora Central', priceCost: 0.80, priceSale: 1.50, minStock: 100, stock: 300 },
      { name: 'Suco de Laranja 1L', sku: 'SUC-LAR-1L', category: 'Bebidas', supplier: 'Distribuidora Central', priceCost: 3.50, priceSale: 5.50, minStock: 40, stock: 90 },
      
      // Limpeza
      { name: 'Detergente Ypê 500ml', sku: 'DET-500', category: 'Limpeza', supplier: 'Unilever', priceCost: 1.80, priceSale: 3.00, minStock: 50, stock: 120 },
      { name: 'Sabão em Pó Omo 1kg', sku: 'SAB-OMO-1KG', category: 'Limpeza', supplier: 'Unilever', priceCost: 12.00, priceSale: 18.00, minStock: 30, stock: 70 },
      { name: 'Água Sanitária 1L', sku: 'SAN-1L', category: 'Limpeza', supplier: 'Unilever', priceCost: 2.50, priceSale: 4.50, minStock: 40, stock: 95 },
      { name: 'Desinfetante Pinho Sol 500ml', sku: 'DES-500', category: 'Limpeza', supplier: 'Unilever', priceCost: 3.50, priceSale: 6.00, minStock: 30, stock: 75 },
      { name: 'Esponja de Aço', sku: 'ESP-001', category: 'Limpeza', supplier: 'Distribuidora Central', priceCost: 1.00, priceSale: 2.00, minStock: 50, stock: 130 },
      
      // Higiene Pessoal
      { name: 'Sabonete Protex', sku: 'SAB-PROT', category: 'Higiene Pessoal', supplier: 'Procter & Gamble', priceCost: 1.50, priceSale: 2.50, minStock: 60, stock: 150 },
      { name: 'Shampoo Pantene 400ml', sku: 'SHA-PAN-400', category: 'Higiene Pessoal', supplier: 'Procter & Gamble', priceCost: 8.00, priceSale: 14.00, minStock: 30, stock: 65 },
      { name: 'Creme Dental Colgate 90g', sku: 'CRE-COL-90', category: 'Higiene Pessoal', supplier: 'Procter & Gamble', priceCost: 2.50, priceSale: 4.50, minStock: 50, stock: 110 },
      { name: 'Papel Higiênico 4 Rolos', sku: 'PAP-4R', category: 'Higiene Pessoal', supplier: 'Procter & Gamble', priceCost: 4.50, priceSale: 7.50, minStock: 40, stock: 95 },
      
      // Utilidades Domésticas
      { name: 'Fósforo Caixa', sku: 'FOS-001', category: 'Utilidades Domésticas', supplier: 'Distribuidora Central', priceCost: 0.50, priceSale: 1.00, minStock: 100, stock: 250 },
      { name: 'Vela Comum', sku: 'VEL-001', category: 'Utilidades Domésticas', supplier: 'Distribuidora Central', priceCost: 1.00, priceSale: 2.00, minStock: 50, stock: 120 },
      { name: 'Lâmpada LED 9W', sku: 'LAM-LED-9W', category: 'Utilidades Domésticas', supplier: 'Distribuidora Central', priceCost: 5.00, priceSale: 8.50, minStock: 30, stock: 70 },
  ];
}

async function createProduct(
  prod: ReturnType<typeof getProductsData>[0],
  categoryIds: { [key: string]: string },
  supplierIds: { [key: string]: string }
): Promise<string | null> {
  const categoryId = categoryIds[prod.category];
  const supplierId = supplierIds[prod.supplier];
  
  if (!categoryId) {
    console.log(`  ⚠️  Categoria não encontrada: ${prod.category}`);
    return null;
  }

  const result = await pool.query(
    `INSERT INTO products (name, sku, category_id, supplier_id, price_cost, price_sale, min_stock, current_stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (sku) DO UPDATE 
     SET current_stock = EXCLUDED.current_stock
     RETURNING id`,
    [prod.name, prod.sku, categoryId, supplierId, prod.priceCost, prod.priceSale, prod.minStock, prod.stock]
  );
  
  if (result.rows.length > 0) {
    console.log(`  ✅ Produto criado: ${prod.name} (Estoque: ${prod.stock})`);
    return result.rows[0].id;
  }
  
  const existing = await pool.query('SELECT id FROM products WHERE sku = $1', [prod.sku]);
  if (existing.rows.length > 0) {
    await pool.query('UPDATE products SET current_stock = $1 WHERE sku = $2', [prod.stock, prod.sku]);
    console.log(`  🔄 Produto atualizado: ${prod.name} (Estoque: ${prod.stock})`);
    return existing.rows[0].id;
  }
  
  return null;
}

async function createProducts(
  categoryIds: { [key: string]: string },
  supplierIds: { [key: string]: string }
): Promise<{ [key: string]: string }> {
  console.log('\n📦 Criando produtos...');
  const products = getProductsData();
  const productIds: { [key: string]: string } = {};

  for (const prod of products) {
    const id = await createProduct(prod, categoryIds, supplierIds);
    if (id) {
      productIds[prod.sku] = id;
    }
  }
  return productIds;
}

async function getAdminUserId(): Promise<string | null> {
  const userId = await pool.query("SELECT id FROM users WHERE email = 'admin@stock.local' LIMIT 1");
  return userId.rows[0]?.id || null;
}

function getEntriesData() {
  return [
    { sku: 'BIC-AZ-001', quantity: 120, date: new Date('2024-01-15') },
    { sku: 'BIC-PT-001', quantity: 100, date: new Date('2024-01-15') },
    { sku: 'BIC-VM-001', quantity: 80, date: new Date('2024-01-15') },
    { sku: 'COC-2L', quantity: 100, date: new Date('2024-01-10') },
    { sku: 'ARZ-5KG', quantity: 80, date: new Date('2024-01-12') },
    { sku: 'FEI-1KG', quantity: 100, date: new Date('2024-01-12') },
  ];
}

function getSalesData() {
  return [
    { sku: 'BIC-AZ-001', quantity: 5, date: new Date('2024-01-20'), reason: 'SALE' },
    { sku: 'BIC-AZ-001', quantity: 3, date: new Date('2024-01-22'), reason: 'SALE' },
    { sku: 'BIC-PT-001', quantity: 4, date: new Date('2024-01-21'), reason: 'SALE' },
    { sku: 'BIC-VM-001', quantity: 2, date: new Date('2024-01-23'), reason: 'SALE' },
    { sku: 'COC-2L', quantity: 8, date: new Date('2024-01-18'), reason: 'SALE' },
    { sku: 'COC-350', quantity: 15, date: new Date('2024-01-19'), reason: 'SALE' },
    { sku: 'ARZ-5KG', quantity: 10, date: new Date('2024-01-16'), reason: 'SALE' },
    { sku: 'FEI-1KG', quantity: 12, date: new Date('2024-01-17'), reason: 'SALE' },
    { sku: 'LEI-1L', quantity: 20, date: new Date('2024-01-20'), reason: 'SALE' },
    { sku: 'DET-500', quantity: 8, date: new Date('2024-01-21'), reason: 'SALE' },
    { sku: 'SAB-PROT', quantity: 15, date: new Date('2024-01-22'), reason: 'SALE' },
    { sku: 'CRE-COL-90', quantity: 6, date: new Date('2024-01-23'), reason: 'SALE' },
  ];
}

async function createEntry(
  entry: ReturnType<typeof getEntriesData>[0],
  productIds: { [key: string]: string },
  adminUserId: string
): Promise<void> {
  const productId = productIds[entry.sku];
  if (!productId) return;

  await pool.query(
    `INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, created_at)
     VALUES ($1, $2, 'ENTRY', $3, 'Compra inicial', $4)`,
    [productId, adminUserId, entry.quantity, entry.date]
  );
}

async function createSale(
  sale: ReturnType<typeof getSalesData>[0],
  productIds: { [key: string]: string },
  adminUserId: string
): Promise<void> {
  const productId = productIds[sale.sku];
  if (!productId) return;

  await pool.query(
    `INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, created_at)
     VALUES ($1, $2, 'EXIT', $3, $4, $5)`,
    [productId, adminUserId, sale.quantity, sale.reason, sale.date]
  );
  
  await pool.query(
    'UPDATE products SET current_stock = current_stock - $1 WHERE id = $2',
    [sale.quantity, productId]
  );
  
  console.log(`  ✅ Venda registrada: ${sale.sku} (${sale.quantity} unidades)`);
}

async function createMovements(
  productIds: { [key: string]: string },
  adminUserId: string
): Promise<void> {
  console.log('\n📊 Criando movimentações de estoque...');
  
  const entries = getEntriesData();
  for (const entry of entries) {
    await createEntry(entry, productIds, adminUserId);
  }

  const sales = getSalesData();
  for (const sale of sales) {
    await createSale(sale, productIds, adminUserId);
  }
}

function printSummary(
  categoriesCount: number,
  suppliersCount: number,
  productsCount: number,
  entriesCount: number,
  salesCount: number
): void {
  console.log('\n✅ Banco de dados populado com sucesso!');
  console.log('\n📋 Resumo:');
  console.log(`   - ${categoriesCount} categorias`);
  console.log(`   - ${suppliersCount} fornecedores`);
  console.log(`   - ${productsCount} produtos`);
  console.log(`   - ${entriesCount} entradas de estoque`);
  console.log(`   - ${salesCount} vendas registradas`);
  console.log('\n🛒 Caneta Bic Azul está na categoria Papelaria e tem vendas registradas!');
}

async function populateDatabase() {
  try {
    console.log('🔄 Populando banco de dados com dados de exemplo...\n');

    const categoryIds = await createCategories();
    const supplierIds = await createSuppliers();
    const productIds = await createProducts(categoryIds, supplierIds);
    const adminUserId = await getAdminUserId();

    if (!adminUserId) {
      throw new Error('Usuário admin não encontrado');
    }

    await createMovements(productIds, adminUserId);

    const categories = await pool.query('SELECT COUNT(*) as count FROM categories');
    const suppliers = await pool.query('SELECT COUNT(*) as count FROM suppliers');
    const products = await pool.query('SELECT COUNT(*) as count FROM products');
    const entries = getEntriesData();
    const sales = getSalesData();

    printSummary(
      parseInt(categories.rows[0].count),
      parseInt(suppliers.rows[0].count),
      parseInt(products.rows[0].count),
      entries.length,
      sales.length
    );
    
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

populateDatabase();

