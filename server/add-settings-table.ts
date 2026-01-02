import pool from './db';

async function addSettingsTable() {
  try {
    console.log('🔄 Adicionando tabela system_settings...');

    // Criar tabela
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

    console.log('✅ Tabela system_settings criada');

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

    console.log('✅ Configurações padrão inseridas');
    console.log('✅ Tabela de configurações configurada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar tabela de configurações:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addSettingsTable();

