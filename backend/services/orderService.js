// services/orderService.js

// Format:
// In order to do *this*
// We need to do *that*

// Tables:
// Orders [ORDERID, ORDERDATE, ORDERTOTAL, STATUS, COMMENTS, STOREID]
// OrderItems [ORDERITEMID, ORDERID, PRODUCTID, SOURCE, QUANTITY, ITEMTOTAL]
// OrderHistory [HISTORYID, ORDERID, TIMESTAMP, ACTION, EMPLOYEE, COMMENT]
// Inventory [INVENTORYID, PRODUCTID, STOREID, QUANTITY]
// TableLogs [LOGID, EMPLOYEEID, TABLENAME, RECORDID, ACTION, COMMENT]

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

import pool from "../db/hanaPool.js";
import {
  editInventory,
  getInventoryByStoreByProduct,
  assignInventoryToStore,
} from "./inventoryService.js";
import { logToTableLogs } from "./tableLogService.js";

/**
 * Get all orders
 */
export async function getAllOrders() {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec("SELECT * FROM WUSAP.Orders");
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
      "SELECT * FROM WUSAP.Orders WHERE orderID = ?",
      [orderID]
    );

    // Fetch associated items
    const items = await conn.exec(
      "SELECT * FROM WUSAP.OrderItems WHERE orderID = ?",
      [orderID]
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
    return await conn.exec("SELECT * FROM WUSAP.Orders WHERE storeID = ?", [
      storeID,
    ]);
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get all orders for a specific store with detailed information including items and products
 */
export async function getOrdersWithDetailsForStore(storeID) {
  const conn = await pool.acquire();
  try {
    // Get orders with aggregated item count and latest history action
    const ordersQuery = `
      SELECT 
        o.ORDERID,
        o.ORDERDATE,
        o.ORDERTOTAL,
        o.STATUS,
        o.COMMENTS,
        o.STOREID,
        COALESCE(itemcount.ITEMCOUNT, 0) as ITEMCOUNT,
        MAX(oh.TIMESTAMP) as LASTUPDATED
      FROM WUSAP.Orders o
      LEFT JOIN (
        SELECT ORDERID, COUNT(*) as ITEMCOUNT
        FROM WUSAP.OrderItems
        GROUP BY ORDERID
      ) itemcount ON o.ORDERID = itemcount.ORDERID
      LEFT JOIN WUSAP.OrderHistory oh ON o.ORDERID = oh.ORDERID
      WHERE o.STOREID = ?
      GROUP BY o.ORDERID, o.ORDERDATE, o.ORDERTOTAL, o.STATUS, o.COMMENTS, o.STOREID, itemcount.ITEMCOUNT
      ORDER BY o.ORDERDATE DESC, o.ORDERID DESC
    `;

    return await conn.exec(ordersQuery, [storeID]);
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get detailed order information with items and products for a specific order
 */
export async function getOrderWithFullDetails(orderID) {
  const conn = await pool.acquire();
  try {
    // Get order basic info
    const [order] = await conn.exec(
      "SELECT * FROM WUSAP.Orders WHERE ORDERID = ?",
      [orderID]
    );

    if (!order) {
      throw new Error("Order not found");
    }

    // Get order items with product details
    const items = await conn.exec(
      `
      SELECT 
        oi.ORDERITEMID,
        oi.ORDERID,
        oi.PRODUCTID,
        oi.SOURCE,
        oi.QUANTITY,
        oi.ITEMTOTAL,
        p.NAME as PRODUCTNAME,
        p.UNIT as PRODUCTUNIT,
        p.SUGGESTEDPRICE as PRODUCTPRICE
      FROM WUSAP.OrderItems oi
      LEFT JOIN WUSAP.Products p ON oi.PRODUCTID = p.PRODUCTID
      WHERE oi.ORDERID = ?
      ORDER BY oi.ORDERITEMID
    `,
      [orderID]
    );

    // Get order history
    const history = await conn.exec(
      `
      SELECT 
        oh.HISTORYID,
        oh.ORDERID,
        oh.TIMESTAMP,
        oh.ACTION,
        oh.EMPLOYEEID,
        oh.COMMENT,
        e.NAME as EMPLOYEENAME,
        e.LASTNAME as EMPLOYEELASTNAME
      FROM WUSAP.OrderHistory oh
      LEFT JOIN WUSAP.Employees e ON oh.EMPLOYEEID = e.EMPLOYEEID
      WHERE oh.ORDERID = ?
      ORDER BY oh.TIMESTAMP DESC
    `,
      [orderID]
    );

    return {
      order,
      items,
      history,
    };
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
    const result = await conn.exec(
      `
      SELECT DISTINCT o.*
      FROM WUSAP.Orders o
      JOIN WUSAP.OrderItems oi ON o.orderID = oi.orderID
      JOIN WUSAP.OrderHistory oh ON o.orderID = oh.orderID
      WHERE oh.employeeID = ?
    `,
      [employeeID]
    );
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
      throw new Error(
        "Missing required data: orderData, orderItems, employeeID, or userRole"
      );
    }

    // Force status to "Pendiente"
    const enforcedOrderData = {
      ...orderData,
      status: "Pendiente",
    };

    // Manager-specific validation
    if (userRole === "manager") {
      const invalidItem = orderItems.find(
        (item) => item.source !== "warehouse"
      );
      if (invalidItem) {
        throw new Error(
          `Managers must set item.source to "warehouse". Found: "${invalidItem.source}"`
        );
      }
    }

    // Product validation
    for (const item of orderItems) {
      // 1. Check product exists
      const [product] = await conn.exec(
        "SELECT productID FROM WUSAP.Products WHERE productID = ?",
        [item.productID]
      );
      if (!product) {
        throw new Error(`Product does not exist: ${item.productID}`);
      }
      // 2. For managers, check warehouse inventory exists and is sufficient
      if (userRole === "manager") {
        const inventory = await getInventoryByStoreByProduct(1, item.productID);
        if (inventory.length === 0) {
          throw new Error(`No inventory found for product ${item.productID}`);
        }
        const availableQty = inventory[0].QUANTITY;
        if (availableQty < item.quantity) {
          throw new Error(
            `Insufficient inventory for product ${item.productID}: ${availableQty} available, ${item.quantity} required`
          );
        }
      }
      // 3. For warehouse_managers, no inventory check needed
    }

    // Insert into Orders
    await conn.exec(
      `INSERT INTO WUSAP.Orders (orderDate, orderTotal, status, comments, storeID)
       VALUES (CURRENT_DATE, ?, ?, ?, ?)`,
      [
        enforcedOrderData.orderTotal,
        enforcedOrderData.status,
        enforcedOrderData.comments,
        enforcedOrderData.storeID,
      ]
    );

    const [orderRow] = await conn.exec(
      "SELECT CURRENT_IDENTITY_VALUE() AS ORDERID FROM DUMMY"
    );
    const orderID = orderRow.ORDERID;

    await logToTableLogs({
      employeeID,
      tableName: "Orders",
      recordID: orderID,
      action: "INSERT",
      comment: `Created order with total ${enforcedOrderData.orderTotal}, status "${enforcedOrderData.status}", and ${orderItems.length} item(s).`,
    });

    // Insert order items
    for (const item of orderItems) {
      await conn.exec(
        `INSERT INTO WUSAP.OrderItems (orderID, productID, source, quantity, itemTotal)
         VALUES (?, ?, ?, ?, ?)`,
        [orderID, item.productID, item.source, item.quantity, item.itemTotal]
      );

      const [itemRow] = await conn.exec(
        "SELECT CURRENT_IDENTITY_VALUE() AS ORDERITEMID FROM DUMMY"
      );
      const orderItemID = itemRow.ORDERITEMID;

      await logToTableLogs({
        employeeID,
        tableName: "OrderItems",
        recordID: orderItemID,
        action: "INSERT",
        comment: `Inserted order item: productID=${item.productID}, source=${item.source}, quantity=${item.quantity}, itemTotal=${item.itemTotal}`,
      });
    }

    // Insert history entry
    await conn.exec(
      `INSERT INTO WUSAP.OrderHistory (orderID, timestamp, action, employeeID, comment)
       VALUES (?, CURRENT_TIMESTAMP, 'CREATED', ?, ?)`,
      [orderID, employeeID, "Created order"]
    );

    const [historyRow] = await conn.exec(
      "SELECT CURRENT_IDENTITY_VALUE() AS HISTORYID FROM DUMMY"
    );

    await logToTableLogs({
      employeeID,
      tableName: "OrderHistory",
      recordID: historyRow.HISTORYID,
      action: "INSERT",
      comment: `Created order history entry for orderID=${orderID} after inserting all items.`,
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
// --- 1. VALIDATION HELPERS ---
export function validateStatusTransition(from, to, userRole) {
  const transitionsByRole = {
    warehouse_manager: {
      Pendiente: ["Pendiente", "Aprobada", "Cancelada"],
      Aprobada: ["Confirmada", "Cancelada", "Entregada"],
      Confirmada: ["Entregada", "Cancelada"],
    },
    manager: {
      Pendiente: ["Pendiente", "Cancelada"],
      Aprobada: ["Entregada", "Cancelada"],
    },
  };

  const transitions = transitionsByRole[userRole];
  if (!transitions) return false;
  return transitions[from]?.includes(to);
}

function validateManagerEdit(userRole, creatorRole) {
  if (userRole === "manager" && creatorRole === "warehouse_manager") {
    throw new Error(
      "Managers cannot edit orders created by warehouse managers"
    );
  }
}

function validateOrderEdits({ oldStatus, isOrderTotalEdit, isItemEdit }) {
  if ((isOrderTotalEdit || isItemEdit) && oldStatus !== "Pendiente") {
    throw new Error(
      "Order total or items can only be modified when status is 'Pendiente'"
    );
  }
}

function validateWarehouseManagerEdits({ userRole, creatorRole, itemChanges }) {
  if (
    userRole === "warehouse_manager" &&
    creatorRole === "manager" &&
    itemChanges.length > 0
  ) {
    throw new Error(
      "Warehouse managers cannot modify items on manager-created orders"
    );
  }
}

function validateManagerSourceChanges(userRole, itemChanges) {
  if (userRole === "manager") {
    for (const change of itemChanges) {
      if (change.item.source !== "warehouse") {
        throw new Error(
          `Managers can only set item.source to "warehouse". Found: "${change.item.source}" in orderItem ${change.item.orderItemID}`
        );
      }
    }
  }
}

// --- 2. DIFF/CHANGE HELPERS ---

function calcOrderItemChanges(orderData, updatedItems) {
  const orderItemMap = new Map();
  for (const row of orderData) orderItemMap.set(row.ORDERITEMID, row);

  const itemChanges = [];
  for (const item of updatedItems) {
    const original = orderItemMap.get(item.orderItemID);
    if (!original)
      throw new Error(
        `OrderItem ${item.orderItemID} does not belong to this order.`
      );

    const differences = [];
    if (original.PRODUCTID !== item.productID) differences.push("productID");
    if (original.SOURCE !== item.source) differences.push("source");
    if (Number(original.QUANTITY) !== Number(item.quantity))
      differences.push("quantity");
    if (Number(original.ITEMTOTAL) !== Number(item.itemTotal))
      differences.push("itemTotal");

    if (differences.length > 0) itemChanges.push({ item, differences });
  }
  return itemChanges;
}

function isOrderTotalEdit(oldOrderTotal, newOrderTotal) {
  return Number(oldOrderTotal) !== Number(newOrderTotal);
}

function isItemEdit(itemChanges) {
  return itemChanges.length > 0;
}

// --- 3. DATABASE HELPERS ---

async function fetchOrderData(conn, orderID) {
  return conn.exec(
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
}

function formatOrderDecimals(orderData, updatedOrder) {
  if (
    updatedOrder.orderTotal !== undefined &&
    updatedOrder.orderTotal !== null
  ) {
    updatedOrder.orderTotal = Number(updatedOrder.orderTotal).toFixed(2);
  }
  orderData[0].OLDORDERTOTAL = Number(orderData[0].OLDORDERTOTAL).toFixed(2);
}

// --- 4. ORDER UPDATES/LOGGING HELPERS ---

async function updateOrderRow(conn, updatedOrder, orderID) {
  return conn.exec(
    `UPDATE WUSAP.Orders SET orderTotal = ?, status = ?, comments = ? WHERE orderID = ?`,
    [
      updatedOrder.orderTotal,
      updatedOrder.status,
      updatedOrder.comments,
      orderID,
    ]
  );
}

async function logOrderUpdate({
  employeeID,
  orderID,
  orderUpdateFields,
  oldOrderTotalNum,
  newOrderTotalNum,
  oldComments,
  newComments,
  oldStatusVal,
  newStatusVal,
}) {
  let logComment = "No changes detected";
  if (orderUpdateFields.length > 0) {
    logComment = `Updated order. ${orderUpdateFields
      .map((field) => {
        if (field === "orderTotal") {
          const oldVal = oldOrderTotalNum.toFixed(2);
          const newVal = newOrderTotalNum.toFixed(2);
          return `${field}: ${oldVal} → ${newVal}`;
        } else if (field === "comments") {
          return `comments: ${oldComments} → ${newComments}`;
        } else if (field === "status") {
          return `status: ${oldStatusVal} → ${newStatusVal}`;
        }
      })
      .join(" | ")}`;
  }
  await logToTableLogs({
    employeeID,
    tableName: "Orders",
    recordID: orderID,
    action: "UPDATE",
    comment: logComment,
  });
}

async function updateOrderItemRow(conn, item) {
  await conn.exec(
    `UPDATE WUSAP.OrderItems SET productID = ?, source = ?, quantity = ?, itemTotal = ?
    WHERE orderItemID = ?`,
    [
      item.productID,
      item.source,
      item.quantity,
      item.itemTotal,
      item.orderItemID,
    ]
  );
}

async function logOrderItemUpdate({
  employeeID,
  item,
  differences,
  orderItemMap,
}) {
  await logToTableLogs({
    employeeID,
    tableName: "OrderItems",
    recordID: item.orderItemID,
    action: "UPDATE",
    comment: `Updated orderItem ${item.orderItemID}: ${differences
      .map((f) => {
        const old = orderItemMap.get(item.orderItemID)[f.toUpperCase()];
        const newVal = item[f];
        return `${f}: ${old} → ${newVal}`;
      })
      .join(" | ")}`,
  });
}

function buildHistoryComment(
  orderUpdateFields,
  logComment,
  itemChanges,
  orderItemMap
) {
  const itemChangesLog = itemChanges
    .map((change) => {
      return `Updated orderItem ${change.item.orderItemID}: ${change.differences
        .map((f) => {
          const old = orderItemMap.get(change.item.orderItemID)[
            f.toUpperCase()
          ];
          const newVal = change.item[f];
          return `${f}: ${old} → ${newVal}`;
        })
        .join(", ")}`;
    })
    .join(" | ");

  if (orderUpdateFields.length > 0 && itemChangesLog) {
    return `${logComment} | Items: ${itemChangesLog}`;
  } else if (orderUpdateFields.length > 0) {
    return logComment;
  } else if (itemChangesLog) {
    return `Updated order items. | Items: ${itemChangesLog}`;
  } else {
    return "No changes detected";
  }
}

async function insertOrderHistory(conn, orderID, employeeID, comment) {
  await conn.exec(
    `INSERT INTO WUSAP.OrderHistory (orderID, timestamp, action, employeeID, comment)
    VALUES (?, CURRENT_TIMESTAMP, 'UPDATED', ?, ?)`,
    [orderID, employeeID, comment]
  );
  const [historyRow] = await conn.exec(
    "SELECT CURRENT_IDENTITY_VALUE() AS HISTORYID FROM DUMMY"
  );
  await logToTableLogs({
    employeeID,
    tableName: "OrderHistory",
    recordID: historyRow.HISTORYID,
    action: "INSERT",
    comment: `Inserted update history entry`,
  });
}

// --- 5. INVENTORY HELPERS ---

async function handleInventoryOnEntregada(
  conn,
  orderData,
  storeID,
  employeeID
) {
  for (const row of orderData) {
    // Try to get inventory
    const [inventory] = await getInventoryByStoreByProduct(
      storeID,
      row.PRODUCTID
    );

    if (inventory) {
      // If inventory exists, edit (add) the quantity
      const newQty = Number(inventory.QUANTITY) + Number(row.QUANTITY);
      await editInventory(inventory.INVENTORYID, newQty, employeeID);
    } else {
      // If not found, assign/create inventory entry for this store-product
      await assignInventoryToStore(
        row.PRODUCTID,
        storeID,
        Number(row.QUANTITY),
        employeeID
      );
    }
  }
}

async function handleInventoryOnCancel(conn, orderData, employeeID) {
  for (const row of orderData) {
    // Only items that were sourced from warehouse
    if (row.SOURCE === "warehouse") {
      const [inventory] = await getInventoryByStoreByProduct(1, row.PRODUCTID);
      let newQty;
      if (inventory) {
        newQty = Number(inventory.QUANTITY) + Number(row.QUANTITY);
        await conn.exec(
          `UPDATE WUSAP.Inventory SET quantity = ? WHERE inventoryID = ?`,
          [newQty, inventory.INVENTORYID]
        );
      } else {
        // If no inventory record exists, create it
        await conn.exec(
          `INSERT INTO WUSAP.Inventory (productID, storeID, quantity) VALUES (?, ?, ?)`,
          [row.PRODUCTID, 1, row.QUANTITY]
        );
      }
      await logToTableLogs({
        employeeID,
        tableName: "Inventory",
        recordID: inventory ? inventory.INVENTORYID : null,
        action: "UPDATE",
        comment: `Restored ${row.QUANTITY} of product ${row.PRODUCTID} to warehouse after cancellation`,
      });
    }
  }
}

async function handleInventoryOnAprobada(
  conn,
  userRole,
  creatorRole,
  oldStatus,
  newStatus,
  orderData,
  updatedItems,
  employeeID
) {
  if (
    userRole === "warehouse_manager" &&
    oldStatus === "Pendiente" &&
    newStatus === "Aprobada"
  ) {
    // If warehouse manager is approving a manager's order, use original items directly
    const warehouseItems =
      userRole === "warehouse_manager" && creatorRole === "manager"
        ? orderData
            .filter((row) => row.SOURCE === "warehouse")
            .map((row) => ({
              orderItemID: row.ORDERITEMID,
              productID: row.PRODUCTID,
              quantity: row.QUANTITY,
              source: row.SOURCE,
            }))
        : updatedItems.filter((item) => item.source === "warehouse");

    for (const item of warehouseItems) {
      const [inventory] = await getInventoryByStoreByProduct(1, item.productID);
      if (!inventory || inventory.QUANTITY < item.quantity) {
        throw new Error(
          `Not enough stock in warehouse for product ${item.productID}`
        );
      }
      const newQty = inventory.QUANTITY - item.quantity;
      await editInventory(inventory.INVENTORYID, newQty, employeeID);
    }
  }
}

// --- 6. MAIN FUNCTION ---
export async function updateOrder(
  orderID,
  updatedOrder,
  updatedItems,
  employeeID,
  userRole
) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);
    updatedItems = Array.isArray(updatedItems) ? updatedItems : [];

    // 1. Fetch and format
    const orderData = await fetchOrderData(conn, orderID);
    if (!orderData.length) throw new Error("Order not found");

    // Fill missing fields with current values
    if (
      updatedOrder.orderTotal === undefined ||
      updatedOrder.orderTotal === null
    ) {
      updatedOrder.orderTotal = orderData[0].OLDORDERTOTAL;
    }
    if (updatedOrder.comments === undefined || updatedOrder.comments === null) {
      updatedOrder.comments = orderData[0].OLDCOMMENTS;
    }
    if (updatedOrder.status === undefined || updatedOrder.status === null) {
      updatedOrder.status = orderData[0].OLDSTATUS;
    }

    // Format decimals
    formatOrderDecimals(orderData, updatedOrder);

    const oldStatus = orderData[0].OLDSTATUS;
    const storeID = orderData[0].STOREID;
    const creatorRole = orderData[0].CREATORROLE;
    const newStatus = updatedOrder.status;

    // 2. Validate transitions and permissions
    if (!validateStatusTransition(oldStatus, newStatus, userRole))
      throw new Error(`Invalid status transition: ${oldStatus} → ${newStatus}`);
    validateManagerEdit(userRole, creatorRole);

    // 3. Find item changes
    const itemChanges = calcOrderItemChanges(orderData, updatedItems);

    // 4. Further validations
    validateManagerSourceChanges(userRole, itemChanges);
    validateOrderEdits({
      oldStatus,
      isOrderTotalEdit: isOrderTotalEdit(
        orderData[0].OLDORDERTOTAL,
        updatedOrder.orderTotal
      ),
      isItemEdit: isItemEdit(itemChanges),
    });
    validateWarehouseManagerEdits({ userRole, creatorRole, itemChanges });

    // 5. Update and log order
    const orderUpdateFields = [];
    const oldOrderTotalNum = Number(orderData[0].OLDORDERTOTAL);
    const newOrderTotalNum = Number(updatedOrder.orderTotal);
    const oldComments = (orderData[0].OLDCOMMENTS ?? "").trim();
    const newComments = (updatedOrder.comments ?? "").trim();
    const oldStatusVal = (orderData[0].OLDSTATUS ?? "").trim();
    const newStatusVal = (updatedOrder.status ?? "").trim();

    if (oldOrderTotalNum !== newOrderTotalNum)
      orderUpdateFields.push("orderTotal");
    if (oldComments !== newComments) orderUpdateFields.push("comments");
    if (oldStatusVal !== newStatusVal) orderUpdateFields.push("status");

    await updateOrderRow(conn, updatedOrder, orderID);
    await logOrderUpdate({
      employeeID,
      orderID,
      orderUpdateFields,
      oldOrderTotalNum,
      newOrderTotalNum,
      oldComments,
      newComments,
      oldStatusVal,
      newStatusVal,
    });

    // 6. Update and log order items
    const orderItemMap = new Map();
    for (const row of orderData) orderItemMap.set(row.ORDERITEMID, row);

    for (const change of itemChanges) {
      await updateOrderItemRow(conn, change.item);
      await logOrderItemUpdate({
        employeeID,
        item: change.item,
        differences: change.differences,
        orderItemMap,
      });
    }

    // 7. Log history
    const logComment =
      orderUpdateFields.length > 0
        ? `Updated order. ${orderUpdateFields
            .map((field) => {
              if (field === "orderTotal") {
                const oldVal = oldOrderTotalNum.toFixed(2);
                const newVal = newOrderTotalNum.toFixed(2);
                return `${field}: ${oldVal} → ${newVal}`;
              } else if (field === "comments") {
                return `comments: ${oldComments} → ${newComments}`;
              } else if (field === "status") {
                return `status: ${oldStatusVal} → ${newStatusVal}`;
              }
            })
            .join(" | ")}`
        : "No changes detected";

    const historyComment = buildHistoryComment(
      orderUpdateFields,
      logComment,
      itemChanges,
      orderItemMap
    );

    await insertOrderHistory(conn, orderID, employeeID, historyComment);

    // 8. Inventory adjustments
    if (oldStatus !== "Entregada" && newStatus === "Entregada") {
      await handleInventoryOnEntregada(conn, orderData, storeID, employeeID);
    }
    if (oldStatus === "Aprobada" && newStatus === "Cancelada") {
      await handleInventoryOnCancel(conn, orderData, employeeID);
    }
    await handleInventoryOnAprobada(
      conn,
      userRole,
      creatorRole,
      oldStatus,
      newStatus,
      orderData,
      updatedItems,
      employeeID
    );

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}
