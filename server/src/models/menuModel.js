import pool from '../config/database.js';

// 모든 메뉴와 옵션 조회
export async function getAllMenus() {
  try {
    // 메뉴 조회
    const menuResult = await pool.query(`
      SELECT id, name, description, price, image_url, stock
      FROM menus
      ORDER BY id
    `);

    // 각 메뉴에 대한 옵션 조회
    const menus = await Promise.all(
      menuResult.rows.map(async (menu) => {
        const optionsResult = await pool.query(
          'SELECT id, name, price FROM options WHERE menu_id = $1 ORDER BY id',
          [menu.id]
        );
        return {
          id: menu.id,
          name: menu.name,
          description: menu.description,
          price: menu.price,
          image_url: menu.image_url,
          stock: menu.stock,
          options: optionsResult.rows
        };
      })
    );

    return menus;
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    throw error;
  }
}

// 재고 조회
export async function getInventory() {
  try {
    const result = await pool.query(`
      SELECT id, name, stock
      FROM menus
      ORDER BY id
    `);
    return result.rows;
  } catch (error) {
    console.error('재고 조회 오류:', error);
    throw error;
  }
}

// 재고 수정
export async function updateInventory(menuId, change) {
  try {
    // 현재 재고 확인
    const currentResult = await pool.query(
      'SELECT stock FROM menus WHERE id = $1',
      [menuId]
    );

    if (currentResult.rows.length === 0) {
      throw new Error('메뉴를 찾을 수 없습니다.');
    }

    const currentStock = currentResult.rows[0].stock;
    const newStock = currentStock + change;

    if (newStock < 0) {
      throw new Error('재고는 0 이하로 내려갈 수 없습니다.');
    }

    // 재고 업데이트
    const result = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock',
      [newStock, menuId]
    );

    return result.rows[0];
  } catch (error) {
    console.error('재고 수정 오류:', error);
    throw error;
  }
}

