# 🎉 Thank You Page Service

Página de obrigado pela compra com ativação automática do pixel Google Ads.

## 🚀 Como Rodar

```bash
npm install
npm start
```

Acesse em: http://localhost:3000

## 📝 Features

- Página de obrigado pela compra minimalista
- Avatar customizável (clique para adicionar foto)
- Barra de progresso com percentual
- Ativação automática do pixel Google Ads
- Redirecionamento automático
- Carrega configurações da Dashboard Service

## 🔗 API Endpoints

- `GET /api/config` - Obter configurações (busca do dashboard service)
- `GET /health` - Health check

## 🌍 Variáveis de Ambiente

```
DASHBOARD_URL=https://seu-dashboard.com (opcional)
PORT=3000
```

Se `DASHBOARD_URL` estiver definida, a página buscará as configurações do serviço de dashboard.

## 🚀 Deploy no Railway

1. Conecte ao GitHub
2. Configure variável `DASHBOARD_URL` (opcional)
3. Deploy automático a cada push

## 📲 URL para Lead

Compartilhe esta URL com seus leads:
```
https://seu-thankyou-service.up.railway.app
```
