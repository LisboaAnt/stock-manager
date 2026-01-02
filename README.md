# Stock Manager

Sistema de Gerenciamento de Estoque desenvolvido com Next.js e Express.js.

## 🚀 Getting Started

### Instalação

```bash
npm install
```

### Executar Frontend e Backend Simultaneamente

Para rodar o frontend (Next.js) e o backend (Express) ao mesmo tempo:

```bash
npm run dev:all
```

Isso irá iniciar:
- **Backend API** na porta `4000` (http://localhost:4000)
- **Frontend Next.js** na porta `3000` (http://localhost:3000)

### Executar Separadamente

**Apenas o Frontend:**
```bash
npm run dev
```

**Apenas o Backend:**
```bash
npm run server
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
MOCK_DATA=false
DATABASE_URL="postgresql://usuario:senha@host:porta/database?sslmode=require&channel_binding=require"
PORT=4000
```

### Configuração do Banco de Dados

O projeto suporta dois modos de operação:

- **`MOCK_DATA=true`** - Usa dados mock em memória (para desenvolvimento)
- **`MOCK_DATA=false`** - Usa banco de dados PostgreSQL real

### Configuração do PostgreSQL (Banco Real)

1. **Crie o arquivo `.env`** na raiz do projeto com sua string de conexão:
   ```env
   MOCK_DATA=false
   DATABASE_URL="postgresql://usuario:senha@host:porta/database?sslmode=require&channel_binding=require"
   PORT=4000
   ```

2. **Execute o script de inicialização do banco:**
   ```bash
   npm run setup-db
   ```
   
   Este script irá:
   - Criar os tipos ENUM necessários
   - Criar todas as tabelas
   - Adicionar o campo `password_hash` na tabela `users`
   - Criar 3 usuários iniciais com perfis diferentes

3. **Pronto!** O banco está configurado e pronto para uso.

## 🔐 Login

### Com Banco de Dados Real (MOCK_DATA=false)

Use as credenciais criadas pelo script de setup:
- **Admin:** `admin@stock.local` / `admin123`
- **Gerente:** `gerente@stock.local` / `gerente123`
- **Operador:** `operador@stock.local` / `operador123`

### Com Dados Mock (MOCK_DATA=true)

Use as credenciais mock:
- **Email:** `admin@stock.local`
- **Senha:** `admin123`

## 📚 Estrutura do Projeto

- `src/app/` - Páginas e rotas do Next.js
- `server/` - Backend Express com API REST
- `server/mock.ts` - Dados mock para desenvolvimento

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
