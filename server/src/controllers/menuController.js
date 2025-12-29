import * as menuModel from '../models/menuModel.js';

// 메뉴 목록 조회
export async function getMenus(req, res) {
  try {
    console.log('메뉴 조회 요청 받음');
    const menus = await menuModel.getAllMenus();
    console.log('메뉴 조회 성공:', menus.length, '개');
    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '메뉴 조회 중 오류가 발생했습니다.',
      details: error.message
    });
  }
}

// 재고 조회
export async function getInventory(req, res) {
  try {
    const inventory = await menuModel.getInventory();
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('재고 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '재고 조회 중 오류가 발생했습니다.'
    });
  }
}

// 재고 수정
export async function updateInventory(req, res) {
  try {
    const { menuId } = req.params;
    const { change } = req.body;

    if (change === undefined || typeof change !== 'number') {
      return res.status(400).json({
        success: false,
        error: '재고 변경량(change)이 필요합니다.'
      });
    }

    const result = await menuModel.updateInventory(parseInt(menuId), change);
    
    res.json({
      success: true,
      data: {
        menu_id: result.id,
        name: result.name,
        stock: result.stock,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('재고 수정 오류:', error);
    
    if (error.message === '메뉴를 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    if (error.message === '재고는 0 이하로 내려갈 수 없습니다.') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: '재고 수정 중 오류가 발생했습니다.'
    });
  }
}

