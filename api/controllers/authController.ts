import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { shouldUseMockData } from '../config/database';
import { MockDataService } from '../config/mockData';

// Função para registro de novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (shouldUseMockData()) {
      // Usar dados mock
      const existingUser = await MockDataService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar o usuário
      const user = await MockDataService.createUser({
        email,
        password: hashedPassword,
      });
      
      res.status(201).json({ id: user.id, email: user.email });
    } else {
      // Para Vercel, sempre usar dados mock por enquanto
      const existingUser = await MockDataService.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Criar o usuário
      const user = await MockDataService.createUser({
        email,
        password: hashedPassword,
      });
      
      res.status(201).json({ id: user.id, email: user.email });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

// Função para login do usuário
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Modo fictício: aceita email existente e senha '123456' e retorna token estático
    const user = await MockDataService.getUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (password !== '123456') return res.status(400).json({ error: 'Invalid credentials' });

    // Token fictício (não assinado) para simplificar em ambiente serverless
    const token = 'mock-token';
    return res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
};
