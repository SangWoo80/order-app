import express from 'express';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

// 주문 생성
router.post('/', orderController.createOrder);

// 주문 목록 조회
router.get('/', orderController.getOrders);

// 주문 상세 조회
router.get('/:orderId', orderController.getOrderById);

// 주문 상태 변경
router.patch('/:orderId/status', orderController.updateOrderStatus);

export default router;

