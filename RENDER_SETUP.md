# Guia de Deploy no Render (Gratuito)

## Backend no Render

### 1. Criar conta no Render
- Acesse https://render.com
- Crie uma conta gratuita (pode usar GitHub)

### 2. Criar novo Web Service
1. Clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Selecione o repositório `stock-manager`

### 3. Configurações do Serviço

**Informações Básicas:**
- **Name**: `stock-manager-api`
- **Region**: Escolha a mais próxima (ex: `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `server` ⚠️ **IMPORTANTE**
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/index.js`

**Plano:**
- Selecione **Free** (gratuito)

### 4. Variáveis de Ambiente

Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://seu-usuario:senha@host:porta/banco?sslmode=require
MOCK_DATA=false
FRONTEND_URL=https://seu-frontend.vercel.app
NODE_ENV=production
PORT=10000
```

**Nota sobre PORT**: O Render define automaticamente a porta, mas você pode usar `10000` como padrão.

### 5. Deploy

1. Clique em "Create Web Service"
2. O Render começará o build automaticamente
3. Aguarde o deploy completar (pode levar alguns minutos)

### 6. Obter URL do Backend

Após o deploy, você receberá uma URL como:
```
https://stock-manager-api.onrender.com
```

## Frontend no Vercel

### 1. Configurar variável de ambiente

No Vercel, adicione:
```
NEXT_PUBLIC_API_URL=https://stock-manager-api.onrender.com
```

## Importante sobre o Render Free

⚠️ **Limitações do plano gratuito:**
- O serviço "dorme" após 15 minutos de inatividade
- O primeiro request após dormir pode levar 30-60 segundos para "acordar"
- 750 horas grátis por mês (suficiente para 24/7 em um serviço)

### Alternativas para evitar o "sleep":
1. Use um serviço de "ping" gratuito (ex: UptimeRobot) para manter o serviço ativo
2. Considere upgrade para plano pago ($7/mês) se precisar de disponibilidade 24/7
3. Use Railway (tem plano gratuito melhor) ou VPS próprio

## Troubleshooting

### Erro de Build
- Verifique se o `Root Directory` está como `server`
- Verifique se todas as dependências estão no `server/package.json`
- Veja os logs de build no Render

### Erro de Conexão
- Verifique se o `DATABASE_URL` está correto
- Verifique se o banco permite conexões externas
- Verifique se o CORS está configurado corretamente

### Serviço não inicia
- Verifique os logs no Render
- Verifique se o `Start Command` está correto: `node dist/index.js`
- Verifique se o arquivo `dist/index.js` existe após o build

