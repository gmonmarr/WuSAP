// services/orderService.js

import pool from '../db/hanaPool.js';

// Format:
// In order to do *this*
    // We need to do *that*

// Tables:
// Orders [orderID, orderDate, orderTotal, status, comments, storeID, createdAt, updatedAt]
// OrderItems [orderItemID, orderID, productID, source, quantity, itemTotal]
// OrderHistory [historyID, orderItemID, timestamp, action, employeeID, comment]

// Get all orders

// Get AN order by ID
    // Fetch from Orders by orderID
    // Fetch from OrderItems by orderID
    // Fetch from OrderHistory by orderItemID

// Get all orders by store 
// Get all orders by employee

// Create order 
    // Create order items
    // Create order history
// Update order
    // Update order items
    // Update order history

/**
 * Get all orders
 */
export async function getAllOrders() {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec('SELECT * FROM WUSAP.Orders');
    return result;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get an order by ID (with items and history)
 */
export async function getOrderById(orderID) {
  const conn = await pool.acquire();
  try {
    const order = await conn.exec('SELECT * FROM WUSAP.Orders WHERE orderID = ?', [orderID]);
    const items = await conn.exec('SELECT * FROM WUSAP.OrderItems WHERE orderID = ?', [orderID]);

    const itemIDs = items.map(item => item.orderItemID);
    let history = [];
    if (itemIDs.length > 0) {
      const placeholders = itemIDs.map(() => '?').join(',');
      history = await conn.exec(
        `SELECT * FROM WUSAP.OrderHistory WHERE orderItemID IN (${placeholders})`,
        itemIDs
      );
    }

    return { order: order[0], items, history };
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get all orders for a specific store
 */
export async function getOrdersByStore(storeID) {
  const conn = await pool.acquire();
  try {
    return await conn.exec('SELECT * FROM WUSAP.Orders WHERE storeID = ?', [storeID]);
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get all orders associated with a specific employee
 */
export async function getOrdersByEmployee(employeeID) {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT DISTINCT o.*
      FROM WUSAP.Orders o
      JOIN WUSAP.OrderItems oi ON o.orderID = oi.orderID
      JOIN WUSAP.OrderHistory oh ON oi.orderItemID = oh.orderItemID
      WHERE oh.employeeID = ?
    `, [employeeID]);
    return result;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Create a new order with items and history
 */
export async function createOrder(orderData, orderItems, employeeID) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    await conn.prepare(`
      INSERT INTO WUSAP.Orders (orderDate, orderTotal, status, comments, storeID, createdAt, updatedAt)
      VALUES (CURRENT_DATE, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).then(stmt => stmt.exec([
      orderData.orderTotal,
      orderData.status,
      orderData.comments,
      orderData.storeID
    ]));

    const [newOrder] = await conn.exec('SELECT TOP 1 * FROM WUSAP.Orders ORDER BY orderID DESC');
    const orderID = newOrder.orderID;

    for (const item of orderItems) {
      await conn.exec(`
        INSERT INTO WUSAP.OrderItems (orderID, productID, source, quantity, itemTotal)
        VALUES (?, ?, ?, ?, ?)`,
        [orderID, item.productID, item.source, item.quantity, item.itemTotal]
      );

      const [itemRow] = await conn.exec('SELECT TOP 1 * FROM WUSAP.OrderItems ORDER BY orderItemID DESC');

      await conn.exec(`
        INSERT INTO WUSAP.OrderHistory (orderItemID, timestamp, action, employeeID, comment)
        VALUES (?, CURRENT_TIMESTAMP, 'CREATED', ?, ?)`,
        [itemRow.orderItemID, employeeID, 'Created order item']
      );
    }

    await conn.commit();
    return { success: true, orderID };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Update an existing order and its items, adding history records
 */
export async function updateOrder(orderID, updatedOrder, updatedItems, employeeID) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    await conn.exec(`
      UPDATE WUSAP.Orders
      SET orderTotal = ?, status = ?, comments = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE orderID = ?
    `, [updatedOrder.orderTotal, updatedOrder.status, updatedOrder.comments, orderID]);

    for (const item of updatedItems) {
      await conn.exec(`
        UPDATE WUSAP.OrderItems
        SET productID = ?, source = ?, quantity = ?, itemTotal = ?
        WHERE orderItemID = ?
      `, [item.productID, item.source, item.quantity, item.itemTotal, item.orderItemID]);

      await conn.exec(`
        INSERT INTO WUSAP.OrderHistory (orderItemID, timestamp, action, employeeID, comment)
        VALUES (?, CURRENT_TIMESTAMP, 'UPDATED', ?, ?)`,
        [item.orderItemID, employeeID, 'Updated order item']
      );
    }

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}

