import { initDatabase, testConnection } from './init.js';
import pool from '../config/database.js';

// 데이터베이스 설정 스크립트
async function setup() {
  try {
    console.log('데이터베이스 설정을 시작합니다...\n');

    // 연결 테스트
    const connected = await testConnection();
    if (!connected) {
      console.error('데이터베이스 연결에 실패했습니다. .env 파일의 설정을 확인하세요.');
      process.exit(1);
    }

    // 데이터베이스 초기화
    await initDatabase();

    console.log('\n데이터베이스 설정이 완료되었습니다!');
    process.exit(0);
  } catch (error) {
    console.error('데이터베이스 설정 중 오류 발생:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setup();

