import { Request, Response } from 'express';
import { shouldUseMockData } from '../config/database';
import { MockDataService } from '../config/mockData';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl } = req.body;

    // Converta o preço para número e valide
    const numericPrice = parseFloat(price as any);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    let product;
    if (shouldUseMockData()) {
      // Usar dados mock
      product = await MockDataService.createProduct({
        name,
        description,
        price: numericPrice,
        imageUrl,
      });
    } else {
      // Para Vercel, sempre usar dados mock por enquanto
      product = await MockDataService.createProduct({
        name,
        description,
        price: numericPrice,
        imageUrl,
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product' });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (shouldUseMockData()) {
      // Usar dados mock
      const allProducts = await MockDataService.getAllProducts();
      const startIndex = offset;
      const endIndex = startIndex + Number(limit);
      const rows = allProducts.slice(startIndex, endIndex);
      const count = allProducts.length;
      
      res.json({ count, rows });
    } else {
      // Para Vercel, sempre usar dados mock por enquanto
      const allProducts = await MockDataService.getAllProducts();
      const startIndex = offset;
      const endIndex = startIndex + Number(limit);
      const rows = allProducts.slice(startIndex, endIndex);
      const count = allProducts.length;
      
      res.json({ count, rows });
    }
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Error getting products' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl } = req.body;

    if (shouldUseMockData()) {
      // Usar dados mock
      const product = await MockDataService.updateProduct(Number(id), {
        name,
        description,
        price: parseFloat(price as any),
        imageUrl,
      });
      
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } else {
      // Para Vercel, sempre usar dados mock por enquanto
      const product = await MockDataService.updateProduct(Number(id), {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
      });
      
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (shouldUseMockData()) {
      // Usar dados mock
      const result = await MockDataService.deleteProduct(Number(id));
      
      if (result) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } else {
      // Para Vercel, sempre usar dados mock por enquanto
      const result = await MockDataService.deleteProduct(Number(id));
      
      if (result) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
