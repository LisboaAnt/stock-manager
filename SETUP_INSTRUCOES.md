# Instruções de Configuração do Banco de Dados

## Passo 1: Criar arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
MOCK_DATA=false
DATABASE_URL="postgresql://neondb_owner:npg_aDB7OAUc1owS@ep-billowing-resonance-ad7mlt4i-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
PORT=4000
```

## Passo 2: Executar o script de setup

Execute o seguinte comando para inicializar o banco de dados:

```bash
npm run setup-db
```

Este script irá:
- ✅ Criar os tipos ENUM (movement_type, user_role)
- ✅ Criar todas as tabelas necessárias
- ✅ Adicionar campo `password_hash` na tabela `users`
- ✅ Criar 3 usuários iniciais com diferentes perfis

## Passo 3: Verificar credenciais

Após executar o script, você poderá fazer login com:

- **Administrador:** `admin@stock.local` / `admin123`
- **Gerente:** `gerente@stock.local` / `gerente123`
- **Operador:** `operador@stock.local` / `operador123`

## Passo 4: Iniciar o servidor

Para iniciar o servidor com o banco de dados real:

```bash
npm run dev:all
```

Ou apenas o backend:

```bash
npm run server
```

**Nota:** Certifique-se de que `MOCK_DATA=false` no arquivo `.env` para usar o banco de dados real.

