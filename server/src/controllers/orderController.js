import * as orderModel from '../models/orderModel.js';

// 주문 생성
export async function createOrder(req, res) {
  try {
    const { items, total_amount } = req.body;

    // 유효성 검사
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '주문 아이템이 필요합니다.'
      });
    }

    if (!total_amount || typeof total_amount !== 'number' || total_amount < 0) {
      return res.status(400).json({
        success: false,
        error: '올바른 총 금액이 필요합니다.'
      });
    }

    // 각 아이템 유효성 검사
    for (const item of items) {
      if (!item.menu_id || !item.menu_name || !item.quantity || !item.unit_price || !item.total_price) {
        return res.status(400).json({
          success: false,
          error: '주문 아이템 정보가 올바르지 않습니다.'
        });
      }
    }

    const order = await orderModel.createOrder({
      items,
      total_amount
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 생성 중 오류가 발생했습니다.'
    });
  }
}

// 주문 목록 조회
export async function getOrders(req, res) {
  try {
    const { status, limit, offset } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    const orders = await orderModel.getOrders(filters);
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 목록 조회 중 오류가 발생했습니다.'
    });
  }
}

// 주문 상세 조회
export async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;
    const order = await orderModel.getOrderById(parseInt(orderId));

    if (!order) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '주문 조회 중 오류가 발생했습니다.'
    });
  }
}

// 주문 상태 변경
export async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status || !['received', 'preparing', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '올바른 주문 상태가 필요합니다. (received, preparing, completed)'
      });
    }

    const result = await orderModel.updateOrderStatus(parseInt(orderId), status);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('주문 상태 변경 오류:', error);
    
    if (error.message === '주문을 찾을 수 없습니다.') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    if (error.message.includes('재고가 부족합니다')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: '주문 상태 변경 중 오류가 발생했습니다.'
    });
  }
}

