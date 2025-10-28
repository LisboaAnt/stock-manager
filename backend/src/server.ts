import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sequelize, { shouldUseMockData, isDatabaseAvailable } from './config/database';
import router from './routes';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);

const startServer = async () => {
  try {
    if (isDatabaseAvailable()) {
      // Banco de dados disponível - sincronizar
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
      console.log('✅ Database synchronized successfully.');
    } else {
      // Usando dados mock - não precisa sincronizar banco
      console.log('🔧 Using mock data - no database synchronization needed.');
    }
    
    app.listen(3001, () => {
      console.log('🚀 Server running on port 3001');
      console.log('📊 API endpoints available at http://localhost:3001/api');
      if (shouldUseMockData()) {
        console.log('🎭 Mock data mode active - no database required');
      }
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
  }
};

startServer();
