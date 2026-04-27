const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

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

// ============================================
// ROTAS API
// ============================================

// GET configurações (lê do banco de dados)
app.get('/api/config', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM pixel_config ORDER BY updated_at DESC LIMIT 1'
        );

        if (result.rows.length === 0) {
            return res.json(DEFAULT_CONFIG);
        }

        const row = result.rows[0];
        res.json({
            conversionId: row.conversion_id,
            conversionLabel: row.conversion_label,
            redirectUrl: row.redirect_url,
            purchaseValue: row.purchase_value.toString(),
            currency: row.currency,
            companyName: row.company_name,
            delayRedirect: row.delay_redirect,
            avatarText: row.avatar_text,
        });
    } catch (error) {
        console.error('Erro ao buscar config:', error);
        res.json(DEFAULT_CONFIG);
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
