import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

// 데이터베이스 생성 스크립트
async function createDatabase() {
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 postgres 데이터베이스에 연결
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  const dbName = process.env.DB_NAME || 'coffee_order_db';

  try {
    await adminClient.connect();
    console.log('PostgreSQL에 연결되었습니다.');

    // 데이터베이스 존재 여부 확인
    const checkDb = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (checkDb.rows.length > 0) {
      console.log(`데이터베이스 "${dbName}"가 이미 존재합니다.`);
    } else {
      // 데이터베이스 생성
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`데이터베이스 "${dbName}"가 성공적으로 생성되었습니다.`);
    }

    await adminClient.end();
  } catch (error) {
    console.error('데이터베이스 생성 중 오류 발생:', error.message);
    await adminClient.end();
    process.exit(1);
  }
}

createDatabase();

