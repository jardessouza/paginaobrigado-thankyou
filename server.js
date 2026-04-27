const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// CONFIG PADRÃO
const DEFAULT_CONFIG = {
    conversionId: 'AW-123456789',
    conversionLabel: 'AbC123DeFg_K',
    redirectUrl: 'https://seusite.com/produto',
    purchaseValue: '99.90',
    currency: 'BRL',
    companyName: 'Sua Empresa',
    delayRedirect: 3000,
    avatarText: 'Processando sua compra...',
};

// Armazenamento em memória
let config = { ...DEFAULT_CONFIG };

// ============================================
// ROTAS API
// ============================================

// GET configurações (lê do dashboard service via HTTP)
app.get('/api/config', async (req, res) => {
    // Se existir variável de ambiente com URL do dashboard, buscar de lá
    const dashboardUrl = process.env.DASHBOARD_URL;

    if (dashboardUrl) {
        try {
            const response = await fetch(`${dashboardUrl}/api/config`);
            const data = await response.json();
            res.json(data);
        } catch (error) {
            console.log('Usando config local');
            res.json(config);
        }
    } else {
        res.json(config);
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'thankyou', uptime: process.uptime() });
});

// Rota raiz serve thankyou
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'thankyou.html'));
});

app.get('/thankyou.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'thankyou.html'));
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🎉 THANK YOU PAGE SERVICE                                   ║
║                                                                ║
║   Server rodando em http://localhost:${PORT}                    ║
║                                                                ║
║   🔗 http://localhost:${PORT}                                  ║
║   💚 Health: http://localhost:${PORT}/health                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
});

process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

module.exports = app;
