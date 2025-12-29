import express from 'express';
import * as menuController from '../controllers/menuController.js';

const router = express.Router();

// 메뉴 목록 조회
router.get('/', (req, res, next) => {
  console.log('GET /api/menus 요청 받음');
  menuController.getMenus(req, res, next);
});

// 재고 조회
router.get('/inventory', menuController.getInventory);

// 재고 수정
router.patch('/:menuId/inventory', menuController.updateInventory);

export default router;

