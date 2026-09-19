require('dotenv').config();
const { Pool } = require('pg');
const isVercel = Boolean(process.env.VERCEL);

if (isVercel && !process.env.DATABASE_URL && !process.env.PGHOST) {
  throw new Error('[database] Missing DATABASE_URL or PGHOST in Vercel environment variables');
}

const databaseConfig = process.env.DATABASE_URL
  ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }
  : {
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    port: Number(process.env.PGPORT || 5432),
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'shamadb',
  };

const pool = new Pool({
  ...databaseConfig,
  max: 10,
});

console.log(`[database] Configuration source: ${process.env.DATABASE_URL ? 'DATABASE_URL' : 'PGHOST/PG* variables'}`);

pool.on('connect', () => {
  console.log('[database] PostgreSQL connection established');
});

pool.on('error', (error) => {
  console.error('[database] PostgreSQL pool error:', error.message, error.code || 'NO_CODE');
});

module.exports = pool;