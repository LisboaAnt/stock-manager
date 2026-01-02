export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  password?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  documentId?: string;
  contactEmail?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  priceCost: number;
  priceSale: number;
  minStock: number;
  stockQuantity: number;
  supplierIds: string[];
}

export type MovementType = 'ENTRY' | 'EXIT' | 'ADJUSTMENT';
export type ExitReason = 'SALE' | 'TRANSFER' | 'INTERNAL_USE';

export interface StockMovement {
  id: string;
  productId: string;
  userId: string;
  type: MovementType;
  reason?: ExitReason;
  quantity: number;
  unitPrice: number;
  notes?: string;
  createdAt: string;
  userName?: string; // Nome do usuário (opcional, vem do JOIN)
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}


