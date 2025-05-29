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
export async function updateOrder(orderID, updatedOrder, updatedItems, employeeID, userRole) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Ensure updatedItems is iterable
    updatedItems = Array.isArray(updatedItems) ? updatedItems : [];

    // ✅ Validate manager's ownership and item linkage
    await validateManagerOrderOwnershipAndItemLink(orderID, updatedItems, employeeID, userRole);

    const [originalOrder] = await conn.exec(
      'SELECT status, orderTotal, comments FROM WUSAP.Orders WHERE orderID = ?',
      [orderID]
    );

    const oldStatus = originalOrder.STATUS;
    const newStatus = updatedOrder.status;

    if (userRole === 'manager' && updatedOrder.status === 'Aprobada') {
      throw new Error("Managers cannot set status to 'Aprobada'.");
    }

    // Validate transition
    if (!validateStatusTransition(oldStatus, newStatus)) {
      throw new Error(`Invalid status transition: ${oldStatus} → ${newStatus}`);
    }

    let skipItemEdits = false;

    // Step: Check if items changed
    const itemChanged = await checkItemChanges(conn, updatedItems);

    if (itemChanged) {
      // Block all item edits if order is not "Pendiente"
      if (oldStatus !== "Pendiente") {
        updatedItems = [];
        skipItemEdits = true;
      }

      // Also block warehouse manager edits on manager-created orders
      const [creator] = await conn.exec(
        `SELECT TOP 1 oh.employeeID, u.role
         FROM WUSAP.OrderHistory oh
         JOIN WUSAP.Employees u ON oh.employeeID = u.employeeID
         WHERE oh.orderID = ? AND oh.action = 'CREATED'`,
        [orderID]
      );

      if (userRole === 'warehouse_manager' && creator.ROLE === 'manager') {
        updatedItems = [];
        skipItemEdits = true;
      }
    }

    // Validate sources if manager
    if (userRole === 'manager') {
      const invalidItem = updatedItems.find(item => item.source !== 'warehouse');
      if (invalidItem) {
        throw new Error(`Managers must set item.source to "warehouse". Found: "${invalidItem.source}"`);
      }
    }

    // Queue inventory actions (only if we’re applying item updates)
    const inventoryActions = [];
    if (!skipItemEdits && userRole === 'warehouse_manager' && oldStatus === 'Pendiente' && newStatus === 'Aprobada') {
      for (const item of updatedItems) {
        const available = await getInventoryByStoreByProduct(1, item.productID);
        if (!available.length || available[0].QUANTITY < item.quantity) {
          throw new Error(`Not enough inventory for product ${item.productID}`);
        }
        inventoryActions.push({ ...item });
      }
    }

    // Apply updates
    const changes = await applyOrderUpdates(conn, orderID, updatedOrder, updatedItems, employeeID, skipItemEdits);

    const comment = `Updated order. ${changes.join(' | ')}`;
    await conn.exec(
      `INSERT INTO WUSAP.OrderHistory (orderID, timestamp, action, employeeID, comment)
       VALUES (?, CURRENT_TIMESTAMP, 'UPDATED', ?, ?)`,
      [orderID, employeeID, comment]
    );

    const [historyRow] = await conn.exec('SELECT CURRENT_IDENTITY_VALUE() AS HISTORYID FROM DUMMY');
    await logToTableLogs({
      employeeID,
      tableName: "OrderHistory",
      recordID: historyRow.HISTORYID,
      action: "INSERT",
      comment
    });

    await conn.commit();

    // Apply inventory subtraction when approved by another warehouse manager
    if (oldStatus === "Pendiente" && newStatus === "Aprobada" && userRole === "warehouse_manager") {
      await updateInventoryFromOrderStatus(orderID, updatedItems, "toAprobadaByWarehouseManager", employeeID);
    }

    // Apply inventory addition when order is delivered
    if (newStatus === "Entregada") {
      const [orderInfo] = await conn.exec(`SELECT storeID FROM WUSAP.Orders WHERE orderID = ?`, [orderID]);
      await updateInventoryFromOrderStatus(orderID, updatedItems, "toEntregada", employeeID, orderInfo.STOREID);
    }

    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}

function validateStatusTransition(from, to) {
  const transitions = {
    Pendiente: ["Aprobada", "Cancelada"],
    Aprobada: ["Confirmada", "Cancelada", "Entregada"],
    Confirmada: ["Entregada"]
  };
  return transitions[from]?.includes(to);
}

async function checkItemChanges(conn, updatedItems) {
  for (const item of updatedItems) {
    const [original] = await conn.exec(
      'SELECT productID, source, quantity, itemTotal FROM WUSAP.OrderItems WHERE orderItemID = ?',
      [item.orderItemID]
    );

    if (
      original.PRODUCTID !== item.productID ||
      original.SOURCE !== item.source ||
      Number(original.QUANTITY) !== Number(item.quantity) ||
      Number(original.ITEMTOTAL) !== Number(item.itemTotal)
    ) {
      return true;
    }
  }
  return false;
}

async function applyOrderUpdates(conn, orderID, updatedOrder, updatedItems, employeeID, skipItemEdits = false) {
  const changes = [];

  const [original] = await conn.exec(
    `SELECT orderTotal, status, comments FROM WUSAP.Orders WHERE orderID = ?`,
    [orderID]
  );

  if (Number(original.ORDERTOTAL) !== Number(updatedOrder.orderTotal)) {
    changes.push(`orderTotal: ${original.ORDERTOTAL} → ${updatedOrder.orderTotal}`);
  }
  if (original.STATUS !== updatedOrder.status) {
    changes.push(`status: ${original.STATUS} → ${updatedOrder.status}`);
  }
  if ((original.COMMENTS || '') !== (updatedOrder.comments || '')) {
    changes.push(`comments: ${original.COMMENTS || ''} → ${updatedOrder.comments || ''}`);
  }

  await conn.exec(
    `UPDATE WUSAP.Orders SET orderTotal = ?, status = ?, comments = ? WHERE orderID = ?`,
    [updatedOrder.orderTotal, updatedOrder.status, updatedOrder.comments, orderID]
  );

  await logToTableLogs({
    employeeID,
    tableName: "Orders",
    recordID: orderID,
    action: "UPDATE",
    comment: `Updated: ${changes.join(', ')}`
  });

  if (!skipItemEdits) {
    for (const item of updatedItems) {
      const [originalItem] = await conn.exec(
        `SELECT productID, source, quantity, itemTotal FROM WUSAP.OrderItems WHERE orderItemID = ?`,
        [item.orderItemID]
      );

      const itemChanges = [];
      if (originalItem.PRODUCTID !== item.productID)
        itemChanges.push(`productID: ${originalItem.PRODUCTID} → ${item.productID}`);
      if (originalItem.SOURCE !== item.source)
        itemChanges.push(`source: ${originalItem.SOURCE} → ${item.source}`);
      if (Number(originalItem.QUANTITY) !== Number(item.quantity))
        itemChanges.push(`quantity: ${originalItem.QUANTITY} → ${item.quantity}`);
      if (Number(originalItem.ITEMTOTAL) !== Number(item.itemTotal))
        itemChanges.push(`itemTotal: ${originalItem.ITEMTOTAL} → ${item.itemTotal}`);

      if (itemChanges.length > 0) {
        await conn.exec(
          `UPDATE WUSAP.OrderItems SET productID = ?, source = ?, quantity = ?, itemTotal = ?
           WHERE orderItemID = ?`,
          [item.productID, item.source, item.quantity, item.itemTotal, item.orderItemID]
        );

        const changeStr = `Item ${item.orderItemID}: ${itemChanges.join(', ')}`;
        changes.push(changeStr);

        await logToTableLogs({
          employeeID,
          tableName: "OrderItems",
          recordID: item.orderItemID,
          action: "UPDATE",
          comment: changeStr
        });
      }
    }
  }

  return changes;
}

async function validateManagerOrderOwnershipAndItemLink(orderID, updatedItems, employeeID, userRole) {
  if (userRole !== 'manager') return;

  const conn = await pool.acquire();
  try {
    // Ensure the manager is the creator
    const [creator] = await conn.exec(
      `SELECT TOP 1 oh.employeeID
       FROM WUSAP.OrderHistory oh
       WHERE oh.orderID = ? AND oh.action = 'CREATED'`,
      [orderID]
    );

    if (!creator || creator.EMPLOYEEID !== employeeID) {
      throw new Error("Managers can only modify their own orders");
    }

    // Check orderID match for each item
    for (const item of updatedItems) {
      const [row] = await conn.exec(
        `SELECT orderID FROM WUSAP.OrderItems WHERE orderItemID = ?`,
        [item.orderItemID]
      );

      if (!row || row.ORDERID !== orderID) {
        throw new Error(`OrderItem ${item.orderItemID} does not belong to Order ${orderID}`);
      }
    }
  } finally {
    await pool.release(conn);
  }
}

export const updateInventoryFromOrderStatus = async (
  orderID,
  updatedItems,
  statusChange,
  employeeID,
  targetStoreID = null
) => {
  const conn = await pool.acquire();
  try {
    for (const item of updatedItems) {
      const { productID, quantity } = item;

      let action = '';
      let storeID = 1;

      // --- Check for creator to avoid unnecessary subtraction ---
      if (statusChange === 'toAprobadaByWarehouseManager') {
        const [creatorRow] = await conn.exec(
          `SELECT TOP 1 oh.employeeID, e.role
           FROM WUSAP.OrderHistory oh
           JOIN WUSAP.Employees e ON oh.employeeID = e.employeeID
           WHERE oh.orderID = ? AND oh.action = 'CREATED'`,
          [orderID]
        );

        if (creatorRow?.EMPLOYEEID === employeeID) {
          // Warehouse manager is approving their own order → skip subtraction
          continue;
        }

        action = 'SUBTRACT';
        storeID = 1;
      } else if (statusChange === 'toEntregada') {
        action = 'ADD';
        storeID = targetStoreID;
      } else {
        continue;
      }

      // Get current inventory
      const [inventory] = await getInventoryByStoreByProduct(storeID, productID);
      if (!inventory) {
        throw new Error(`No inventory found for product ${productID} at store ${storeID}`);
      }

      const inventoryID = inventory.INVENTORYID;
      const currentQty = inventory.QUANTITY;
      const newQty = action === 'ADD' ? currentQty + quantity : currentQty - quantity;

      // Update inventory
      await conn.exec(
        `UPDATE WUSAP.Inventory SET quantity = ? WHERE inventoryID = ?`,
        [newQty, inventoryID]
      );

      // Log update
      await conn.exec(
        `INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action, comment)
         VALUES (?, 'Inventory', ?, 'UPDATE', ?)`,
        [
          employeeID,
          inventoryID,
          `${action} ${quantity} of product ${productID} for status ${statusChange}`
        ]
      );
    }

    return { success: true };
  } catch (err) {
    throw err;
  } finally {
    pool.release(conn);
  }
};
