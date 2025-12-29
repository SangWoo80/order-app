import express from 'express';
import menusRouter from './menus.js';
import ordersRouter from './orders.js';

const router = express.Router();

// 메뉴 관련 라우트
router.use('/menus', menusRouter);
console.log('메뉴 라우트 등록됨: /menus');

// 주문 관련 라우트
router.use('/orders', ordersRouter);
console.log('주문 라우트 등록됨: /orders');

export default router;

