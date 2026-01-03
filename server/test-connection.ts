import pool from './db';
import { config } from 'dotenv';

config();

try {
  console.log('🔍 Testando conexão com o banco...\n');
  
  // Testar conexão
  const result = await pool.query('SELECT NOW() as current_time');
  console.log('✅ Conexão OK!');
  console.log(`   Hora do servidor: ${result.rows[0].current_time}\n`);
  
  // Verificar usuários
  const users = await pool.query(
    'SELECT email, full_name, role, is_active, password_hash IS NOT NULL as has_password FROM users ORDER BY email'
  );
  
  console.log(`📋 Usuários no banco (${users.rows.length}):`);
  users.rows.forEach((user: any) => {
    console.log(`   - ${user.email} (${user.role}) - ${user.is_active ? 'Ativo' : 'Inativo'} - ${user.has_password ? 'Com senha' : 'Sem senha'}`);
  });
  
  // Testar login específico
  console.log('\n🔐 Testando login admin@stock.local...');
  const admin = await pool.query(
    'SELECT email, password_hash IS NOT NULL as has_password FROM users WHERE email = $1',
    ['admin@stock.local']
  );
  
  if (admin.rows.length > 0) {
    console.log(`   ✅ Usuário encontrado`);
    console.log(`   ✅ Tem senha: ${admin.rows[0].has_password}`);
  } else {
    console.log('   ❌ Usuário não encontrado!');
  }
  
} catch (error) {
  console.error('❌ Erro:', error);
} finally {
  await pool.end();
}

