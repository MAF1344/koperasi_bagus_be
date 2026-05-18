import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback if DATABASE_URL is not provided
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully (PostgreSQL)');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't exit process in development to allow user to fix .env
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export { pool, testConnection };
