// services/orderService.js

// Format:
// In order to do *this*
    // We need to do *that*

// Tables:
// Orders [orderID, orderDate, orderTotal, status, comments, storeID]
// OrderItems [orderItemID, orderID, productID, source, quantity, itemTotal]
// OrderHistory [historyID, orderID, timestamp, action, employeeID, comment]
// Inventory [INVENTORYID, PRODUCTID, STOREID, QUANTITY]
// TableLogs [logID, employeeID, tableName, recordID, action, comment]

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

import pool from '../db/hanaPool.js';
import { editInventory, getInventoryByStoreByProduct } from './inventoryService.js';
import { logToTableLogs } from './tableLogService.js';

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
 * Get all active orders (where status is not 'Cancelada' or 'Entregada')
 * ["Pendiente", "Aprobada", "Confirmada", "Entregada", "Cancelada"]
 */
export async function getAllActiveOrders() {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT * FROM WUSAP.Orders
      WHERE status NOT IN ('Cancelada', 'Entregada')
    `);
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
    // Fetch the order
    const [order] = await conn.exec(
      'SELECT * FROM WUSAP.Orders WHERE orderID = ?', [orderID]
    );

    // Fetch associated items
    const items = await conn.exec(
      'SELECT * FROM WUSAP.OrderItems WHERE orderID = ?', [orderID]
    );

    const history = await conn.exec(
      `SELECT * FROM WUSAP.OrderHistory WHERE orderID = ?`,
      [orderID]
    );
    return { order, items, history };
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
      JOIN WUSAP.OrderHistory oh ON o.orderID = oh.orderID
      WHERE oh.employeeID = ?
    `, [employeeID]);
    return result;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Create a new order with items and history, and log to TableLogs
 */
export async function createOrder(orderData, orderItems, employeeID, userRole) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    if (!orderData || !orderItems || !employeeID || !userRole) {
      throw new Error("Missing required data: orderData, orderItems, employeeID, or userRole");
    }

    // Force status to "Pendiente"
    const enforcedOrderData = {
      ...orderData,
      status: "Pendiente"
    };

    // Manager-specific validation
    if (userRole === 'manager') {
      const invalidItem = orderItems.find(item => item.source !== 'warehouse');
      if (invalidItem) {
        throw new Error(`Managers must set item.source to "warehouse". Found: "${invalidItem.source}"`);
      }
    }

    // Insert into Orders
    await conn.exec(
      `INSERT INTO WUSAP.Orders (orderDate, orderTotal, status, comments, storeID)
       VALUES (CURRENT_DATE, ?, ?, ?, ?)`,
      [
        enforcedOrderData.orderTotal,
        enforcedOrderData.status,
        enforcedOrderData.comments,
        enforcedOrderData.storeID
      ]
    );

    const [orderRow] = await conn.exec('SELECT CURRENT_IDENTITY_VALUE() AS ORDERID FROM DUMMY');
    const orderID = orderRow.ORDERID;

    await logToTableLogs({
      employeeID,
      tableName: "Orders",
      recordID: orderID,
      action: "INSERT",
      comment: `Created order with total ${enforcedOrderData.orderTotal}, status "${enforcedOrderData.status}", and ${orderItems.length} item(s).`
    });

    // Validate inventory
    for (const item of orderItems) {
      const inventory = await getInventoryByStoreByProduct(1, item.productID);
      if (inventory.length === 0) {
        throw new Error(`No inventory found for product ${item.productID}`);
      }
      const availableQty = inventory[0].QUANTITY;
      if (availableQty < item.quantity) {
        throw new Error(`Insufficient inventory for product ${item.productID}: ${availableQty} available, ${item.quantity} required`);
      }
    }

    // Insert order items
    for (const item of orderItems) {
      await conn.exec(
        `INSERT INTO WUSAP.OrderItems (orderID, productID, source, quantity, itemTotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderID, item.productID, item.source, item.quantity, item.itemTotal]
      );

      const [itemRow] = await conn.exec('SELECT CURRENT_IDENTITY_VALUE() AS ORDERITEMID FROM DUMMY');
      const orderItemID = itemRow.ORDERITEMID;

      await logToTableLogs({
        employeeID,
        tableName: "OrderItems",
        recordID: orderItemID,
        action: "INSERT",
        comment: `Inserted order item: productID=${item.productID}, source=${item.source}, quantity=${item.quantity}, itemTotal=${item.itemTotal}`
      });
    }

    // Insert history entry
    await conn.exec(
      `INSERT INTO WUSAP.OrderHistory (orderID, timestamp, action, employeeID, comment)
       VALUES (?, CURRENT_TIMESTAMP, 'CREATED', ?, ?)`,
      [orderID, employeeID, 'Created order']
    );

    const [historyRow] = await conn.exec('SELECT CURRENT_IDENTITY_VALUE() AS HISTORYID FROM DUMMY');

    await logToTableLogs({
      employeeID,
      tableName: "OrderHistory",
      recordID: historyRow.HISTORYID,
      action: "INSERT",
      comment: `Created order history entry for orderID=${orderID} after inserting all items.`
    });

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
 * Update an existing order with new items and history, and log to TableLogs
 */
function validateStatusTransition(from, to, userRole) {
  const transitionsByRole = {
    warehouse_manager: {
      Pendiente: ["Pendiente", "Aprobada", "Cancelada"],
      Aprobada: ["Confirmada", "Cancelada", "Entregada"],
      Confirmada: ["Entregada", "Cancelada"]
    },
    manager: {
      Pendiente: ["Pendiente","Cancelada"],
      Aprobada: ["Entregada"]
    }
  };

  const transitions = transitionsByRole[userRole];
  if (!transitions) return false;
  return transitions[from]?.includes(to);
}

export async function updateOrder(orderID, updatedOrder, updatedItems, employeeID, userRole) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);
    updatedItems = Array.isArray(updatedItems) ? updatedItems : [];

    // Unified query to get all relevant data
    const orderData = await conn.exec(
      `SELECT o.status AS oldStatus, o.orderTotal AS oldOrderTotal, o.comments AS oldComments,
              oi.orderItemID, oi.productID, oi.source, oi.quantity, oi.itemTotal,
              oh.employeeID AS creatorID, u.role AS creatorRole,
              o.storeID
       FROM WUSAP.Orders o
       JOIN WUSAP.OrderItems oi ON o.orderID = oi.orderID
       JOIN WUSAP.OrderHistory oh ON o.orderID = oh.orderID AND oh.action = 'CREATED'
       JOIN WUSAP.Employees u ON oh.employeeID = u.employeeID
       WHERE o.orderID = ?`,
      [orderID]
    );

    const fieldMap = {
      orderTotal: 'OLDORDERTOTAL',
      comments: 'OLDCOMMENTS',
      status: 'OLDSTATUS'
    };

    if (!orderData.length) throw new Error("Order not found");

    // --- FORMAT INPUTS TO MATCH DB ---
    // Coerce DECIMAL(12,2) to string with 2 decimals for both updated and original
    if (updatedOrder.orderTotal !== undefined && updatedOrder.orderTotal !== null) {
      updatedOrder.orderTotal = Number(updatedOrder.orderTotal).toFixed(2);
    }
    orderData[0].OLDORDERTOTAL = Number(orderData[0].OLDORDERTOTAL).toFixed(2);

    const oldStatus = orderData[0].OLDSTATUS;
    const storeID = orderData[0].STOREID;
    const creatorID = orderData[0].CREATORID;
    const creatorRole = orderData[0].CREATORROLE;
    const newStatus = updatedOrder.status;

    // Validate status transition based on role
    if (!validateStatusTransition(oldStatus, newStatus, userRole)) {
      throw new Error(`Invalid status transition: ${oldStatus} → ${newStatus}`);
    }

    // Manager cannot edit orders created by warehouse managers
    if (userRole === 'manager' && creatorRole === 'warehouse_manager') {
      throw new Error("Managers cannot edit orders created by warehouse managers");
    }

    // Check for changes on orderItems
    const orderItemMap = new Map();
    for (const row of orderData) {
      orderItemMap.set(row.ORDERITEMID, row);
    }

    const itemChanges = [];
    for (const item of updatedItems) {
      const original = orderItemMap.get(item.orderItemID);
      if (!original) throw new Error(`OrderItem ${item.orderItemID} does not belong to this order.`);

      const differences = [];
      if (original.PRODUCTID !== item.productID) differences.push("productID");
      if (original.SOURCE !== item.source) differences.push("source");
      if (Number(original.QUANTITY) !== Number(item.quantity)) differences.push("quantity");
      if (Number(original.ITEMTOTAL) !== Number(item.itemTotal)) differences.push("itemTotal");

      if (differences.length > 0) itemChanges.push({ item, differences });
    }

    console.log("Items to update:", itemChanges.map(change => ({
      orderItemID: change.item.orderItemID,
      productID: change.item.productID,
      source: change.item.source,
      quantity: change.item.quantity,
      itemTotal: change.item.itemTotal,
      differences: change.differences
    })));

    // Prevent managers from changing item source to anything other than 'warehouse'
    if (userRole === 'manager') {
      for (const change of itemChanges) {
        const { item } = change;
        if (item.source !== 'warehouse') {
          throw new Error(`Managers can only set item.source to "warehouse". Found: "${item.source}" in orderItem ${item.orderItemID}`);
        }
      }
    }

    // Only allow orderTotal or item edits in Pendiente; status can always be updated if valid
    const isOrderTotalEdit = updatedOrder.orderTotal !== orderData[0].OLDORDERTOTAL;
    const isItemEdit = itemChanges.length > 0;
    if ((isOrderTotalEdit || isItemEdit) && oldStatus !== "Pendiente") {
      throw new Error("Order total or items can only be modified when status is 'Pendiente'");
    }

    // Warehouse managers can't modify manager's order items
    if (userRole === 'warehouse_manager' && creatorRole === 'manager' && itemChanges.length > 0) {
      throw new Error("Warehouse managers cannot modify items on manager-created orders");
    }

    // Apply Order Updates
    const orderUpdateFields = [];

    // Coerce for safe comparison
    const oldOrderTotalNum = Number(orderData[0].OLDORDERTOTAL);
    const newOrderTotalNum = Number(updatedOrder.orderTotal);
    const oldComments = (orderData[0].OLDCOMMENTS ?? "").trim();
    const newComments = (updatedOrder.comments ?? "").trim();
    const oldStatusVal = (orderData[0].OLDSTATUS ?? "").trim();
    const newStatusVal = (updatedOrder.status ?? "").trim();

    if (oldOrderTotalNum !== newOrderTotalNum) orderUpdateFields.push("orderTotal");
    if (oldComments !== newComments) orderUpdateFields.push("comments");
    if (oldStatusVal !== newStatusVal) orderUpdateFields.push("status");

    await conn.exec(
      `UPDATE WUSAP.Orders SET orderTotal = ?, status = ?, comments = ? WHERE orderID = ?`,
      [updatedOrder.orderTotal, updatedOrder.status, updatedOrder.comments, orderID]
    );

    let logComment = 'No changes detected';
    if (orderUpdateFields.length > 0) {
      logComment = `Updated order. ${orderUpdateFields.map(field => {
        if (field === "orderTotal") {
          const oldVal = oldOrderTotalNum.toFixed(2);
          const newVal = newOrderTotalNum.toFixed(2);
          return `${field}: ${oldVal} → ${newVal}`;
        } else if (field === "comments") {
          return `comments: ${oldComments} → ${newComments}`;
        } else if (field === "status") {
          return `status: ${oldStatusVal} → ${newStatusVal}`;
        }
      }).join(' | ')}`;
    }

    await logToTableLogs({
      employeeID,
      tableName: "Orders",
      recordID: orderID,
      action: "UPDATE",
      comment: logComment
    });

    for (const change of itemChanges) {
      const { item, differences } = change;
      try {
        await conn.exec(
          `UPDATE WUSAP.OrderItems SET productID = ?, source = ?, quantity = ?, itemTotal = ?
          WHERE orderItemID = ?`,
          [item.productID, item.source, item.quantity, item.itemTotal, item.orderItemID]
        );
        await logToTableLogs({
          employeeID,
          tableName: "OrderItems",
          recordID: item.orderItemID,
          action: "UPDATE",
          comment: `Updated orderItem ${item.orderItemID}: ${differences.map(f => {
            const old = orderItemMap.get(item.orderItemID)[f.toUpperCase()];
            const newVal = item[f];
            return `${f}: ${old} → ${newVal}`;
          }).join(' | ')}`
        });
      } catch (err) {
        console.error(`Failed to update orderItem ${item.orderItemID}:`, err);
        throw err;
      }
    }

    // Record order history
    const itemChangesLog = itemChanges.map(change => {
      return `Updated orderItem ${change.item.orderItemID}: ${change.differences.map(f => {
        const old = orderItemMap.get(change.item.orderItemID)[f.toUpperCase()];
        const newVal = change.item[f];
        return `${f}: ${old} → ${newVal}`;
      }).join(', ')}`;
    }).join(' | ');

    let historyComment = logComment;
    if (itemChangesLog) {
      historyComment += ` | Items: ${itemChangesLog}`;
    }

    await conn.exec(
      `INSERT INTO WUSAP.OrderHistory (orderID, timestamp, action, employeeID, comment)
      VALUES (?, CURRENT_TIMESTAMP, 'UPDATED', ?, ?)`,
      [orderID, employeeID, historyComment]
    );

    const [historyRow] = await conn.exec('SELECT CURRENT_IDENTITY_VALUE() AS HISTORYID FROM DUMMY');
    await logToTableLogs({
      employeeID,
      tableName: "OrderHistory",
      recordID: historyRow.HISTORYID,
      action: "INSERT",
      comment: `Inserted update history entry`
    });

    // Subtract inventory if warehouse manager approves warehouse-sourced items
    if (userRole === 'warehouse_manager' && oldStatus === 'Pendiente' && newStatus === 'Aprobada') {
      // If warehouse manager is approving a manager's order, use original items directly
      const warehouseItems =
        userRole === 'warehouse_manager' && creatorRole === 'manager'
          ? orderData
              .filter(row => row.SOURCE === 'warehouse')
              .map(row => ({
                orderItemID: row.ORDERITEMID,
                productID: row.PRODUCTID,
                quantity: row.QUANTITY,
                source: row.SOURCE
              }))
          : updatedItems.filter(item => item.source === 'warehouse');

      for (const item of warehouseItems) {
        const [inventory] = await getInventoryByStoreByProduct(1, item.productID);
        if (!inventory || inventory.QUANTITY < item.quantity) {
          throw new Error(`Not enough stock in warehouse for product ${item.productID}`);
        }
        const newQty = inventory.QUANTITY - item.quantity;
        await conn.exec(`UPDATE WUSAP.Inventory SET quantity = ? WHERE inventoryID = ?`, [newQty, inventory.INVENTORYID]);
        await logToTableLogs({
          employeeID,
          tableName: "Inventory",
          recordID: inventory.INVENTORYID,
          action: "UPDATE",
          comment: `Subtracted ${item.quantity} of product ${item.productID} after approval`
        });
      }
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
