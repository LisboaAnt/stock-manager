# 🚀 Deploy Stock Manager na Vercel

Este guia mostra como fazer deploy do sistema Stock Manager (Frontend + Backend) na Vercel.

## 📋 **Estrutura do Projeto**

```
stock-manager/
├── api/                    # Backend (Vercel Functions)
│   ├── index.ts           # Entry point da API
│   ├── routes/            # Rotas da API
│   ├── controllers/       # Controllers
│   ├── middleware/        # Middleware de autenticação
│   └── config/           # Configurações e dados mock
├── frontend/              # Frontend Next.js
│   ├── src/app/          # Páginas da aplicação
│   └── package.json      # Dependências do frontend
├── package.json          # Dependências principais
└── vercel.json          # Configuração da Vercel
```

## 🔧 **Configuração**

### **1. Instalar Vercel CLI**
```bash
npm i -g vercel
```

### **2. Fazer Login na Vercel**
```bash
vercel login
```

### **3. Instalar Dependências**
```bash
npm install
```

## 🚀 **Deploy**

### **Opção 1: Deploy via Vercel CLI**
```bash
vercel
```

### **Opção 2: Deploy via GitHub**
1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte seu repositório GitHub
4. A Vercel detectará automaticamente a configuração

## 🌐 **URLs após Deploy**

- **Frontend**: `https://seu-projeto.vercel.app`
- **API**: `https://seu-projeto.vercel.app/api`

## 🔐 **Credenciais de Acesso**

- **Admin**: `admin@stockmanager.com` / `123456`
- **Usuário**: `user@stockmanager.com` / `123456`

## 📊 **Endpoints da API**

- `GET /api/status` - Status do sistema
- `POST /api/login` - Login
- `POST /api/register` - Registro
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto
- `PUT /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto

## 🎭 **Dados Mock**

O sistema usa dados mock automaticamente na Vercel (não precisa de banco de dados):

- **5 produtos pré-cadastrados**
- **2 usuários de teste**
- **Dados persistem durante a sessão**

## ⚙️ **Variáveis de Ambiente**

Configure na Vercel Dashboard:
- `JWT_SECRET`: Chave secreta para JWT (opcional)

## 🔄 **Desenvolvimento Local**

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
vercel dev
```

## 📝 **Notas Importantes**

1. **Backend**: Usa Vercel Functions (serverless)
2. **Frontend**: Next.js otimizado para Vercel
3. **Dados**: Mock data (sem necessidade de banco)
4. **Autenticação**: JWT com dados em memória
5. **CORS**: Configurado para funcionar na Vercel

## 🎯 **Próximos Passos**

Para produção real, considere:
- Implementar banco de dados (PostgreSQL na Vercel)
- Adicionar sistema de permissões
- Implementar cache
- Adicionar logs e monitoramento
