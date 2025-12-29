import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 데이터베이스 초기화 함수
async function initDatabase() {
  try {
    console.log('데이터베이스 초기화를 시작합니다...');

    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 스키마 실행
    await pool.query(schema);
    console.log('데이터베이스 스키마가 성공적으로 생성되었습니다.');

    // 초기 데이터 삽입
    await insertInitialData();
    console.log('초기 데이터가 성공적으로 삽입되었습니다.');

    console.log('데이터베이스 초기화가 완료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 중 오류 발생:', error);
    throw error;
  }
}

// 초기 데이터 삽입
async function insertInitialData() {
  try {
    // 기존 데이터 확인
    const menuCheck = await pool.query('SELECT COUNT(*) FROM menus');
    if (parseInt(menuCheck.rows[0].count) > 0) {
      console.log('이미 데이터가 존재합니다. 초기 데이터를 건너뜁니다.');
      return;
    }

    // 메뉴 데이터 삽입
    const menuResult = await pool.query(`
      INSERT INTO menus (name, description, price, image_url, stock) VALUES
      ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop&q=80&auto=format', 10),
      ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop&q=80&auto=format', 10),
      ('카페라떼', '부드러운 우유와 에스프레소의 조화', 5000, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop&q=80&auto=format', 10),
      ('카푸치노', '에스프레소와 스팀 밀크의 완벽한 조합', 5000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop&q=80&auto=format', 10),
      ('바닐라라떼', '달콤한 바닐라 시럽이 들어간 라떼', 5500, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop&q=80&auto=format', 10),
      ('카라멜마키아토', '카라멜 시럽과 에스프레소의 달콤한 만남', 6000, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&q=80&auto=format', 10)
      RETURNING id, name
    `);

    console.log('메뉴 데이터 삽입 완료:', menuResult.rows.length, '개');

    // 옵션 데이터 삽입 (모든 메뉴에 동일한 옵션 추가)
    const menus = menuResult.rows;
    for (const menu of menus) {
      await pool.query(`
        INSERT INTO options (name, price, menu_id) VALUES
        ('샷 추가', 500, $1),
        ('시럽 추가', 0, $1)
      `, [menu.id]);
    }

    console.log('옵션 데이터 삽입 완료');
  } catch (error) {
    console.error('초기 데이터 삽입 중 오류 발생:', error);
    throw error;
  }
}

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('데이터베이스 연결 성공:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message);
    return false;
  }
}

export { initDatabase, testConnection };

