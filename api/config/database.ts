import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

type Dialect = 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';

const dialect: Dialect = (process.env.DB_DIALECT as Dialect) || 'mysql';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'default_db_name',
  process.env.DB_USER || 'default_user',
  process.env.DB_PASSWORD || 'default_password', 
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: dialect,
    port: Number(process.env.DB_PORT) || 3306,
  }
);

let isDatabaseConnected = false;
let useMockData = false;

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    isDatabaseConnected = true;
    useMockData = false;
  } catch (error) {
    console.warn('⚠️  Unable to connect to the database, using mock data instead.');
    console.log('🔧 Mock data mode activated - no database required.');
    isDatabaseConnected = false;
    useMockData = true;
  }
};

testConnection();

// Função para verificar se deve usar dados mock
export const shouldUseMockData = () => useMockData;

// Função para verificar se o banco está conectado
export const isDatabaseAvailable = () => isDatabaseConnected;

export default sequelize;
