import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const profile = (process.env.DB_PROFILE || 'local').toLowerCase();
const isLocal = profile === 'local';

const localConfig = {
  connectionString: process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL,
  host: process.env.LOCAL_DB_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.LOCAL_DB_USER || process.env.DB_USER || 'postgres',
  password: process.env.LOCAL_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.LOCAL_DB_NAME || process.env.DB_NAME || 'postgres',
  port: Number(process.env.LOCAL_DB_PORT || process.env.DB_PORT || 5432),
};

const cloudConfig = {
  connectionString: process.env.CLOUD_DATABASE_URL || process.env.DATABASE_URL,
  host: process.env.CLOUD_DB_HOST || process.env.DB_HOST || 'localhost',
  user: process.env.CLOUD_DB_USER || process.env.DB_USER || 'postgres',
  password: process.env.CLOUD_DB_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.CLOUD_DB_NAME || process.env.DB_NAME || 'postgres',
  port: Number(process.env.CLOUD_DB_PORT || process.env.DB_PORT || 5432),
};

const selectedConfig = isLocal ? localConfig : cloudConfig;

// Create connection pool
const pool = new Pool({
  ...selectedConfig,
  ssl: isLocal ? false : {
    rejectUnauthorized: false,
  },
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log(`✅ Database connected successfully (PostgreSQL, profile: ${profile})`);

    // Migrations
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255)');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expire TIMESTAMP WITH TIME ZONE');
    console.log('✅ Database migration: reset password columns verified');

    client.release();
  } catch (error) {
    console.error(`❌ Database connection failed (${profile}):`, error.message);
    // Don't exit process in development to allow user to fix .env
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export { pool, testConnection };
