import { randomUUID } from 'crypto';
import {
  User,
  Category,
  Supplier,
  Product,
  StockMovement,
  ExitReason,
  Role,
} from './types';

const now = () => new Date().toISOString();

export const users: User[] = [
  {
    id: randomUUID(),
    email: 'admin@stock.local',
    name: 'Admin',
    role: 'ADMIN',
    isActive: true,
    password: 'admin123',
  },
  {
    id: randomUUID(),
    email: 'gerente@stock.local',
    name: 'Gerente',
    role: 'MANAGER',
    isActive: true,
    password: 'gerente123',
  },
  {
    id: randomUUID(),
    email: 'operador@stock.local',
    name: 'Operador',
    role: 'OPERATOR',
    isActive: true,
    password: 'operador123',
  },
];

export const categories: Category[] = [
  { id: randomUUID(), name: 'Bebidas' },
  { id: randomUUID(), name: 'Alimentos' },
];

export const suppliers: Supplier[] = [
  { id: randomUUID(), name: 'Fornecedor A', documentId: '12345678901', contactEmail: 'contato@fornecedorA.com' },
  { id: randomUUID(), name: 'Fornecedor B', documentId: '98765432100', contactEmail: 'contato@fornecedorB.com' },
];

export const products: Product[] = [
  {
    id: randomUUID(),
    name: 'Refrigerante 2L',
    sku: 'REF-2L-001',
    barcode: '789000000001',
    categoryId: categories[0].id,
    priceCost: 4.5,
    priceSale: 7.5,
    minStock: 10,
    stockQuantity: 50,
    supplierIds: [suppliers[0].id],
  },
  {
    id: randomUUID(),
    name: 'Arroz 5kg',
    sku: 'ARZ-5K-001',
    barcode: '789000000010',
    categoryId: categories[1].id,
    priceCost: 18,
    priceSale: 26,
    minStock: 15,
    stockQuantity: 80,
    supplierIds: [suppliers[1].id],
  },
];

export const movements: StockMovement[] = [
  {
    id: randomUUID(),
    productId: products[0].id,
    userId: users[1].id,
    type: 'ENTRY',
    quantity: 30,
    unitPrice: 4.5,
    notes: 'Compra inicial',
    createdAt: now(),
  },
  {
    id: randomUUID(),
    productId: products[1].id,
    userId: users[2].id,
    type: 'EXIT',
    reason: 'SALE' as ExitReason,
    quantity: 5,
    unitPrice: 26,
    notes: 'Venda balcão',
    createdAt: now(),
  },
];

export const login = (email: string, password: string) => {
  const user = users.find((u) => u.email === email && u.password === password && u.isActive);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return {
    token: 'mock-token-' + safeUser.id,
    user: safeUser,
  };
};


