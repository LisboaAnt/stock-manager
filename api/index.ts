import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Na Vercel, a rota pública é /api/* → mantenha o prefixo '/api'
app.use('/api', router);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Exporta o app Express diretamente; @vercel/node invoca como handler
export default app;
