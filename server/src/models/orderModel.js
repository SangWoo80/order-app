import pool from '../config/database.js';

// 주문 생성
export async function createOrder(orderData) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Orders 테이블에 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (order_time, status, total_amount)
       VALUES (CURRENT_TIMESTAMP, 'received', $1)
       RETURNING id, order_time, status, total_amount`,
      [orderData.total_amount]
    );

    const order = orderResult.rows[0];
    const orderId = order.id;

    // OrderItems 생성
    for (const item of orderData.items) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [orderId, item.menu_id, item.menu_name, item.quantity, item.unit_price, item.total_price]
      );

      const orderItemId = itemResult.rows[0].id;

      // OrderItemOptions 생성
      for (const option of item.options) {
        await client.query(
          `INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price)
           VALUES ($1, $2, $3, $4)`,
          [orderItemId, option.option_id, option.option_name, option.option_price]
        );
      }
    }

    await client.query('COMMIT');

    return {
      order_id: order.id,
      order_time: order.order_time,
      status: order.status,
      total_amount: order.total_amount
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 생성 오류:', error);
    throw error;
  } finally {
    client.release();
  }
}

// 주문 목록 조회
export async function getOrders(filters = {}) {
  try {
    let query = `
      SELECT o.id, o.order_time, o.status, o.total_amount
      FROM orders o
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY o.order_time DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`;
      params.push(filters.offset);
    }

    const ordersResult = await pool.query(query, params);

    // 각 주문에 대한 아이템과 옵션 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsResult = await pool.query(
          `SELECT id, menu_id, menu_name, quantity, unit_price, total_price
           FROM order_items
           WHERE order_id = $1`,
          [order.id]
        );

        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            const optionsResult = await pool.query(
              `SELECT id, option_id, option_name, option_price
               FROM order_item_options
               WHERE order_item_id = $1`,
              [item.id]
            );

            return {
              id: item.id,
              menu_id: item.menu_id,
              menu_name: item.menu_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              options: optionsResult.rows
            };
          })
        );

        return {
          id: order.id,
          order_time: order.order_time,
          status: order.status,
          total_amount: order.total_amount,
          items: items
        };
      })
    );

    return orders;
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    throw error;
  }
}

// 주문 상세 조회
export async function getOrderById(orderId) {
  try {
    const orderResult = await pool.query(
      'SELECT id, order_time, status, total_amount FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];

    // 주문 아이템 조회
    const itemsResult = await pool.query(
      `SELECT id, menu_id, menu_name, quantity, unit_price, total_price
       FROM order_items
       WHERE order_id = $1`,
      [orderId]
    );

    const items = await Promise.all(
      itemsResult.rows.map(async (item) => {
        const optionsResult = await pool.query(
          `SELECT id, option_id, option_name, option_price
           FROM order_item_options
           WHERE order_item_id = $1`,
          [item.id]
        );

        return {
          id: item.id,
          menu_id: item.menu_id,
          menu_name: item.menu_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          options: optionsResult.rows
        };
      })
    );

    return {
      id: order.id,
      order_time: order.order_time,
      status: order.status,
      total_amount: order.total_amount,
      items: items
    };
  } catch (error) {
    console.error('주문 조회 오류:', error);
    throw error;
  }
}

// 주문 상태 변경
export async function updateOrderStatus(orderId, newStatus) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 현재 주문 상태 확인
    const orderResult = await client.query(
      'SELECT status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('주문을 찾을 수 없습니다.');
    }

    const currentStatus = orderResult.rows[0].status;

    // 주문 상태 업데이트
    const updateResult = await client.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, status, updated_at`,
      [newStatus, orderId]
    );

    // 상태가 'preparing'으로 변경될 때 재고 차감
    if (currentStatus === 'received' && newStatus === 'preparing') {
      // 주문 아이템 조회
      const itemsResult = await client.query(
        'SELECT menu_id, quantity FROM order_items WHERE order_id = $1',
        [orderId]
      );

      // 각 메뉴의 재고 차감
      for (const item of itemsResult.rows) {
        const stockResult = await client.query(
          'SELECT stock FROM menus WHERE id = $1',
          [item.menu_id]
        );

        if (stockResult.rows.length > 0) {
          const currentStock = stockResult.rows[0].stock;
          const newStock = currentStock - item.quantity;

          if (newStock < 0) {
            throw new Error(`메뉴 ID ${item.menu_id}의 재고가 부족합니다.`);
          }

          await client.query(
            'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newStock, item.menu_id]
          );
        }
      }
    }

    await client.query('COMMIT');

    return {
      order_id: updateResult.rows[0].id,
      status: updateResult.rows[0].status,
      updated_at: updateResult.rows[0].updated_at
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('주문 상태 변경 오류:', error);
    throw error;
  } finally {
    client.release();
  }
}

