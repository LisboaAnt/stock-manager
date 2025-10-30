import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes';

const app = express();

app.use(cors());
app.use(bodyParser.json());

// ATENÇÃO: na Vercel a função fica montada em /api
// portanto o router deve ficar em '/'
app.use('/', router);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Exporta handler compatível com @vercel/node
export default function handler(req: any, res: any) {
  return (app as any)(req, res);
}
