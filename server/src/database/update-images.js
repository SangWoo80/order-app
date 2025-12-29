import pool from '../config/database.js';

// 메뉴 이미지 URL 업데이트
async function updateMenuImages() {
  try {
    console.log('메뉴 이미지 URL 업데이트를 시작합니다...');

    // 이미지 URL 매핑
    const imageUpdates = [
      { name: '아메리카노(ICE)', imageUrl: '/americano-ice.jpg' },
      { name: '아메리카노(HOT)', imageUrl: '/americano-hot.jpg' },
      { name: '카페라떼', imageUrl: '/caffe-latte.jpg' }
    ];

    for (const update of imageUpdates) {
      const result = await pool.query(
        'UPDATE menus SET image_url = $1 WHERE name = $2 RETURNING id, name, image_url',
        [update.imageUrl, update.name]
      );

      if (result.rows.length > 0) {
        console.log(`✓ ${update.name} 이미지 업데이트 완료: ${update.imageUrl}`);
      } else {
        console.log(`⚠ ${update.name} 메뉴를 찾을 수 없습니다.`);
      }
    }

    console.log('메뉴 이미지 URL 업데이트가 완료되었습니다.');
  } catch (error) {
    console.error('메뉴 이미지 URL 업데이트 중 오류 발생:', error);
    throw error;
  } finally {
    await pool.end();
    console.log('데이터베이스 연결이 종료되었습니다.');
  }
}

// 스크립트 실행
updateMenuImages()
  .then(() => {
    console.log('작업 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('작업 실패:', error);
    process.exit(1);
  });

