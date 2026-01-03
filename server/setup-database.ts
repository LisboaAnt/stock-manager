import pool from './db';
import bcrypt from 'bcryptjs';

try {
  console.log('🔄 Iniciando configuração do banco de dados...');

  // 1. Criar enums
  console.log('📝 Criando tipos ENUM...');
  await pool.query(`
    DO $$ BEGIN
        CREATE TYPE movement_type AS ENUM ('ENTRY', 'EXIT', 'ADJUSTMENT');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
  `);

  await pool.query(`
    DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
  `);

  // Habilitar extensão UUID
  await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

  // 2. Criar tabelas
  console.log('📋 Criando tabelas...');
  
  // Categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.categories
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        name character varying(100) NOT NULL,
        description text,
        CONSTRAINT categories_pkey PRIMARY KEY (id)
    );
  `);

  // Suppliers
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.suppliers
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        name character varying(255) NOT NULL,
        cnpj_cpf character varying(20),
        email character varying(255),
        phone character varying(20),
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT suppliers_pkey PRIMARY KEY (id)
    );
  `);

  // Users (com password_hash)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.users
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        email character varying(255) NOT NULL,
        full_name character varying(100) NOT NULL,
        password_hash character varying(255),
        google_id character varying(255),
        avatar_url text,
        role user_role DEFAULT 'OPERATOR'::user_role,
        is_active boolean DEFAULT true,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_email_key UNIQUE (email),
        CONSTRAINT users_google_id_key UNIQUE (google_id)
    );
  `);

  // Adicionar coluna password_hash se não existir (para bancos já criados)
  await pool.query(`
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password_hash'
        ) THEN
            ALTER TABLE public.users ADD COLUMN password_hash character varying(255);
        END IF;
    END $$;
  `);

  // Products
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.products
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        category_id uuid,
        supplier_id uuid,
        name character varying(255) NOT NULL,
        sku character varying(50) NOT NULL,
        description text,
        price_cost numeric(10, 2) NOT NULL,
        price_sale numeric(10, 2) NOT NULL,
        current_stock integer DEFAULT 0,
        min_stock integer DEFAULT 5,
        image_url text,
        cloudinary_public_id character varying(255),
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT products_pkey PRIMARY KEY (id),
        CONSTRAINT products_sku_key UNIQUE (sku),
        CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id)
            REFERENCES public.categories (id) MATCH SIMPLE
            ON UPDATE NO ACTION ON DELETE NO ACTION,
        CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id)
            REFERENCES public.suppliers (id) MATCH SIMPLE
            ON UPDATE NO ACTION ON DELETE NO ACTION
    );
  `);

  // Inventory Movements
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.inventory_movements
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        product_id uuid NOT NULL,
        user_id uuid NOT NULL,
        type movement_type NOT NULL,
        quantity integer NOT NULL,
        reason text,
        created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT inventory_movements_pkey PRIMARY KEY (id),
        CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id)
            REFERENCES public.products (id) MATCH SIMPLE
            ON UPDATE NO ACTION ON DELETE NO ACTION,
        CONSTRAINT inventory_movements_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION ON DELETE NO ACTION
    );
  `);

  // Criar índices
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_movements_product ON public.inventory_movements(product_id);
  `);

  // System Settings
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.system_settings
    (
        id uuid NOT NULL DEFAULT uuid_generate_v4(),
        setting_key character varying(100) NOT NULL UNIQUE,
        setting_value text NOT NULL,
        updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT system_settings_pkey PRIMARY KEY (id)
    );
  `);

  // Inserir configurações padrão
  const defaultSettings = [
    { key: 'systemName', value: 'Stock Manager' },
    { key: 'minStockAlert', value: 'true' },
    { key: 'autoCalculateCost', value: 'true' },
    { key: 'retentionPeriod', value: '24' },
    { key: 'maxProducts', value: '10000' },
    { key: 'enableBarcodeScan', value: 'true' },
    { key: 'enableExpiryAlerts', value: 'true' },
    { key: 'defaultCurrency', value: 'BRL' },
  ];

  for (const setting of defaultSettings) {
    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES ($1, $2)
       ON CONFLICT (setting_key) DO NOTHING`,
      [setting.key, setting.value]
    );
  }

  // 3. Inserir usuários iniciais
  console.log('👤 Criando usuários iniciais...');
  
  const users = [
    {
      email: 'admin@stock.local',
      full_name: 'Administrador',
      password: 'admin123',
      role: 'ADMIN' as const,
    },
    {
      email: 'gerente@stock.local',
      full_name: 'Gerente',
      password: 'gerente123',
      role: 'MANAGER' as const,
    },
    {
      email: 'operador@stock.local',
      full_name: 'Operador',
      password: 'operador123',
      role: 'OPERATOR' as const,
    },
  ];

  for (const userData of users) {
    // Verificar se usuário já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );

    if (existingUser.rows.length === 0) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await pool.query(
        `INSERT INTO users (email, full_name, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (email) DO NOTHING`,
        [userData.email, userData.full_name, passwordHash, userData.role]
      );
      console.log(`  ✅ Usuário criado: ${userData.email} (${userData.role})`);
    } else {
      // Atualizar senha se não tiver hash
      const user = await pool.query(
        'SELECT password_hash FROM users WHERE email = $1',
        [userData.email]
      );
      
      const hasPasswordHash = user.rows[0]?.password_hash;
      if (hasPasswordHash) {
        console.log(`  ⏭️  Usuário já existe: ${userData.email}`);
      } else {
        const passwordHash = await bcrypt.hash(userData.password, 10);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [passwordHash, userData.email]
        );
        console.log(`  🔄 Senha atualizada para: ${userData.email}`);
      }
    }
  }

  console.log('✅ Banco de dados configurado com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('  Admin:    admin@stock.local / admin123');
  console.log('  Gerente:  gerente@stock.local / gerente123');
  console.log('  Operador: operador@stock.local / operador123');
  
} catch (error) {
  console.error('❌ Erro ao configurar banco de dados:', error);
  throw error;
} finally {
  await pool.end();
}

