import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload { id: number; email: string }

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.sendStatus(401); 

  // Aceita token fictício sem validar JWT
  if (token === 'mock-token') {
    (req as any).user = { id: 1, email: 'admin@stockmanager.com' } as UserPayload;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) return res.sendStatus(403); // Proibido

    if (decoded) {
      (req as any).user = decoded as UserPayload;
    }

    next();
  });
};

export default authenticateToken;
