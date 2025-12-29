import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// PostgreSQL 연결 풀 생성
// Render.com에서는 DATABASE_URL 환경 변수를 제공합니다
let poolConfig;

if (process.env.DATABASE_URL) {
  // DATABASE_URL 형식: postgresql://user:password@host:port/database
  // Render External Database URL은 SSL이 필요합니다
  const isExternal = process.env.DATABASE_URL.includes('render.com') || 
                     process.env.DATABASE_URL.includes('amazonaws.com') ||
                     process.env.DATABASE_URL.includes('azure.com');
  
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isExternal ? { rejectUnauthorized: false } : false
  };
} else {
  // 개별 환경 변수 사용
  // Render External Database의 경우 SSL이 필요할 수 있습니다
  const isExternal = process.env.DB_HOST && (
    process.env.DB_HOST.includes('render.com') ||
    process.env.DB_HOST.includes('amazonaws.com') ||
    process.env.DB_HOST.includes('azure.com')
  );
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'coffee_order_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: isExternal ? { rejectUnauthorized: false } : false
  };
}

const pool = new Pool(poolConfig);

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err);
});

export default pool;

