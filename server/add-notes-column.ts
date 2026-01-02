import pool from './db';
import { config } from 'dotenv';

config();

async function addNotesColumn() {
  try {
    console.log('🔄 Adicionando coluna notes na tabela inventory_movements...\n');
    
    // Adicionar coluna notes se não existir
    await pool.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'inventory_movements' AND column_name = 'notes'
          ) THEN
              ALTER TABLE public.inventory_movements ADD COLUMN notes text;
          END IF;
      END $$;
    `);
    
    console.log('✅ Coluna notes adicionada (ou já existia)');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addNotesColumn();

