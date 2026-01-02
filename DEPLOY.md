# Guia de Deploy

## Frontend (Vercel)

### 1. Configuração no Vercel

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL da sua API backend (ex: `https://seu-backend.railway.app`)

### 2. Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Deploy

O Vercel detectará automaticamente o Next.js e fará o deploy. O arquivo `vercel.json` já está configurado.

## Backend (Railway, Render, ou similar)

### Opção 1: Railway

1. Crie uma conta no [Railway](https://railway.app)
2. Crie um novo projeto
3. Conecte seu repositório GitHub
4. Configure o diretório raiz como `server/`
5. Configure as variáveis de ambiente:
   - `DATABASE_URL`: URL do seu banco PostgreSQL (Neon, Supabase, etc)
   - `MOCK_DATA`: `false`
   - `PORT`: Deixe vazio (Railway define automaticamente)
6. Railway detectará automaticamente o Node.js e fará o deploy

### Opção 2: Render

1. Crie uma conta no [Render](https://render.com)
2. Crie um novo "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Configure as variáveis de ambiente (mesmas do Railway)

### Opção 3: VPS/Server próprio

1. Instale Node.js e npm no servidor
2. Clone o repositório
3. Entre na pasta `server/`
4. Execute:
   ```bash
   npm install
   npm run build
   ```
5. Configure as variáveis de ambiente no `.env`
6. Execute com PM2 ou similar:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name stock-manager-api
   ```

## Variáveis de Ambiente

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://seu-backend.railway.app
```

### Backend (Railway/Render/VPS)
```
DATABASE_URL=postgresql://usuario:senha@host:porta/banco
MOCK_DATA=false
PORT=4000
```

## Banco de Dados

O banco de dados deve rodar em servidor local (na loja do cliente) conforme mencionado na landing page. Para desenvolvimento/testes, você pode usar:

- **Neon** (já configurado): https://neon.tech
- **Supabase**: https://supabase.com
- **PostgreSQL local**: Instalação direta no servidor

## Notas Importantes

1. O frontend no Vercel não inclui o código do servidor (`.vercelignore`)
2. O backend precisa ser hospedado separadamente
3. Certifique-se de que o CORS está configurado corretamente no backend para aceitar requisições do domínio do Vercel
4. O banco de dados deve estar acessível do servidor onde o backend está hospedado

