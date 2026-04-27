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
    avatarImage: null,
};

// ============================================
// INICIALIZAR BANCO DE DADOS
// ============================================

const initDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pixel_config (
                id SERIAL PRIMARY KEY,
                conversion_id VARCHAR(255) NOT NULL,
                conversion_label VARCHAR(255) NOT NULL,
                redirect_url VARCHAR(500) NOT NULL,
                purchase_value DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL,
                company_name VARCHAR(255) NOT NULL,
                delay_redirect INTEGER NOT NULL,
                avatar_text VARCHAR(500) NOT NULL,
                avatar_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_pixel_config_updated_at
            ON pixel_config(updated_at DESC);
        `);

        // Adicionar coluna auto_redirect se não existir
        try {
            await pool.query(`
                ALTER TABLE pixel_config
                ADD COLUMN auto_redirect BOOLEAN DEFAULT true;
            `);
        } catch (err) {
            // Coluna já existe, ignorar erro
            if (!err.message.includes('already exists')) {
                console.error('Erro ao adicionar coluna auto_redirect:', err);
            }
        }

        const result = await pool.query('SELECT COUNT(*) FROM pixel_config');
        if (result.rows[0].count === '0') {
            await pool.query(`
                INSERT INTO pixel_config (
                    conversion_id, conversion_label, redirect_url,
                    purchase_value, currency, company_name,
                    delay_redirect, avatar_text, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `, [
                DEFAULT_CONFIG.conversionId,
                DEFAULT_CONFIG.conversionLabel,
                DEFAULT_CONFIG.redirectUrl,
                parseFloat(DEFAULT_CONFIG.purchaseValue),
                DEFAULT_CONFIG.currency,
                DEFAULT_CONFIG.companyName,
                DEFAULT_CONFIG.delayRedirect,
                DEFAULT_CONFIG.avatarText,
            ]);
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
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
            avatarImage: row.avatar_image,
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

(async () => {
    await initDatabase();

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
})();

process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
    process.exit(1);
});

module.exports = app;
