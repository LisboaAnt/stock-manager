import dotenv from 'dotenv';

dotenv.config();

// Por padrão na Vercel usamos MOCK (sem DB). Para habilitar DB, defina USE_DB=true.
const USE_DB = process.env.USE_DB === 'true';

let sequelize: any = null;
let isDatabaseConnected = false;
let useMockData = !USE_DB; // se não explicitamente habilitado, usa mock

if (USE_DB) {
  try {
    // Importa Sequelize apenas quando DB estiver habilitado para evitar require de mysql2 na Vercel
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Sequelize } = require('sequelize');

    const dialect = (process.env.DB_DIALECT as any) || 'mysql';
    sequelize = new Sequelize(
      process.env.DB_NAME || 'default_db_name',
      process.env.DB_USER || 'default_user',
      process.env.DB_PASSWORD || 'default_password',
      {
        host: process.env.DB_HOST || 'localhost',
        dialect,
        port: Number(process.env.DB_PORT) || 3306,
        logging: false,
      }
    );

    (async () => {
      try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        isDatabaseConnected = true;
        useMockData = false;
      } catch (err) {
        console.warn('⚠️  Unable to connect to the database, using mock data instead.');
        useMockData = true;
        isDatabaseConnected = false;
      }
    })();
  } catch (err) {
    // Qualquer erro ao tentar carregar Sequelize/dialeto cai para mock
    console.warn('⚠️  DB disabled (falling back to mock). Reason:', (err as Error).message);
    sequelize = null;
    useMockData = true;
    isDatabaseConnected = false;
  }
}

export const shouldUseMockData = () => useMockData;
export const isDatabaseAvailable = () => isDatabaseConnected;
export default sequelize;
