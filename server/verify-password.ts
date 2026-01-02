import pool from './db';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

async function verifyPassword() {
  try {
    const email = 'admin@stock.local';
    const password = 'admin123';
    
    console.log('🔍 Verificando senha do usuário...\n');
    
    const result = await pool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const user = result.rows[0];
    console.log(`✅ Usuário encontrado: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Hash existe: ${!!user.password_hash}`);
    
    if (user.password_hash) {
      console.log(`   Hash (primeiros 30 chars): ${user.password_hash.substring(0, 30)}...`);
      
      console.log(`\n🔐 Testando senha "${password}"...`);
      const match = await bcrypt.compare(password, user.password_hash);
      console.log(`   Resultado: ${match ? '✅ CORRETO' : '❌ INCORRETO'}`);
      
      if (!match) {
        console.log('\n⚠️  A senha não confere!');
        console.log('   Vamos tentar gerar um novo hash e atualizar...');
        
        const newHash = await bcrypt.hash(password, 10);
        await pool.query(
          'UPDATE users SET password_hash = $1 WHERE email = $2',
          [newHash, email]
        );
        
        console.log('✅ Senha atualizada! Testando novamente...');
        const newMatch = await bcrypt.compare(password, newHash);
        console.log(`   Resultado: ${newMatch ? '✅ CORRETO' : '❌ INCORRETO'}`);
      }
    } else {
      console.log('❌ Usuário não possui senha!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

verifyPassword();

