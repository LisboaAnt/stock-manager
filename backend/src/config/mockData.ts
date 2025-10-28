// Dados mock para quando não há conexão com banco de dados
export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface MockUser {
  id: number;
  email: string;
  password: string;
}

// Dados mock de produtos
export const mockProducts: MockProduct[] = [
  {
    id: 1,
    name: "Smartphone Samsung Galaxy S24",
    description: "Smartphone Android com tela de 6.2 polegadas, 128GB de armazenamento",
    price: 2999.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Galaxy+S24"
  },
  {
    id: 2,
    name: "Notebook Dell Inspiron 15",
    description: "Notebook com processador Intel i5, 8GB RAM, 256GB SSD",
    price: 2499.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Dell+Inspiron"
  },
  {
    id: 3,
    name: "Fone de Ouvido Sony WH-1000XM4",
    description: "Fone de ouvido sem fio com cancelamento de ruído ativo",
    price: 899.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Sony+WH1000XM4"
  },
  {
    id: 4,
    name: "Monitor LG UltraWide 29\"",
    description: "Monitor ultrawide 29 polegadas, resolução 2560x1080",
    price: 1299.99,
    imageUrl: "https://via.placeholder.com/300x300?text=LG+UltraWide"
  },
  {
    id: 5,
    name: "Teclado Mecânico Logitech MX Keys",
    description: "Teclado sem fio com retroiluminação e teclas mecânicas",
    price: 299.99,
    imageUrl: "https://via.placeholder.com/300x300?text=Logitech+MX+Keys"
  }
];

// Dados mock de usuários (senhas são "123456" hasheadas)
export const mockUsers: MockUser[] = [
  {
    id: 1,
    email: "admin@stockmanager.com",
    password: "$2b$10$ivzvOP2oF8Cc5ZURkg3ge.T9.iQJJVB/w3qooQGLsOCDDolHI6ReG" // 123456
  },
  {
    id: 2,
    email: "user@stockmanager.com", 
    password: "$2b$10$ivzvOP2oF8Cc5ZURkg3ge.T9.iQJJVB/w3qooQGLsOCDDolHI6ReG" // 123456
  }
];

// Simulação de operações CRUD em memória
export class MockDataService {
  private static products: MockProduct[] = [...mockProducts];
  private static users: MockUser[] = [...mockUsers];
  private static nextProductId = mockProducts.length + 1;
  private static nextUserId = mockUsers.length + 1;

  // Operações de Produtos
  static async getAllProducts(): Promise<MockProduct[]> {
    return [...this.products];
  }

  static async getProductById(id: number): Promise<MockProduct | null> {
    return this.products.find(p => p.id === id) || null;
  }

  static async createProduct(productData: Omit<MockProduct, 'id'>): Promise<MockProduct> {
    const newProduct: MockProduct = {
      id: this.nextProductId++,
      ...productData
    };
    this.products.push(newProduct);
    return newProduct;
  }

  static async updateProduct(id: number, productData: Partial<Omit<MockProduct, 'id'>>): Promise<MockProduct | null> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = { ...this.products[index], ...productData };
    return this.products[index];
  }

  static async deleteProduct(id: number): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }

  // Operações de Usuários
  static async getUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(u => u.email === email) || null;
  }

  static async getUserById(id: number): Promise<MockUser | null> {
    return this.users.find(u => u.id === id) || null;
  }

  static async createUser(userData: Omit<MockUser, 'id'>): Promise<MockUser> {
    const newUser: MockUser = {
      id: this.nextUserId++,
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }
}
