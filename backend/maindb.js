require('dotenv').config();
const { Pool } = require('pg');
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

pool.on('connect', () => {
  console.log('[database] PostgreSQL connection established');
});

pool.on('error', (error) => {
  console.error('[database] PostgreSQL pool error:', error.message, error.code || 'NO_CODE');
});

module.exports = pool;