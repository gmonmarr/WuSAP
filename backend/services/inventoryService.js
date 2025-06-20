// services/inventoryService.js

import pool from '../db/hanaPool.js';

import { logToTableLogs } from './tableLogService.js';

export const getAllInventory = async () => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Inventory`,
        (err, result) => err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const getInventoryByStore = async (storeID) => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Inventory WHERE storeID = ?`,
        [storeID],
        (err, result) => err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const getWarehouseProducts = async () => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT 
          p.PRODUCTID,
          p.NAME,
          p.SUGGESTEDPRICE,
          p.UNIT,
          p.DISCONTINUED,
          i.QUANTITY,
          i.INVENTORYID
        FROM WUSAP.Products p
        INNER JOIN WUSAP.Inventory i ON p.PRODUCTID = i.PRODUCTID
        WHERE i.STOREID = 1 
          AND (p.DISCONTINUED IS NULL OR p.DISCONTINUED = '' OR p.DISCONTINUED = 'FALSE' OR p.DISCONTINUED = FALSE)
          AND i.QUANTITY > 0
        ORDER BY p.NAME`,
        (err, result) => err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const getStoreInventoryWithProducts = async (storeID) => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT 
          p.PRODUCTID,
          p.NAME,
          p.SUGGESTEDPRICE,
          p.UNIT,
          p.DISCONTINUED,
          i.QUANTITY,
          i.INVENTORYID
        FROM WUSAP.Products p
        INNER JOIN WUSAP.Inventory i ON p.PRODUCTID = i.PRODUCTID
        WHERE i.STOREID = ? 
          AND (p.DISCONTINUED IS NULL OR p.DISCONTINUED = '' OR p.DISCONTINUED = 'FALSE' OR p.DISCONTINUED = FALSE)
          AND i.QUANTITY > 0
        ORDER BY p.NAME`,
        [storeID],
        (err, result) => err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const assignInventoryToStore = async (productID, storeID, quantity, employeeID) => {
  const conn = await pool.acquire();
  try {
    // 1. Check if inventory record exists for product + store
    const existing = await new Promise((resolve, reject) => {
      const checkSql = `SELECT * FROM WUSAP.Inventory WHERE productID = ? AND storeID = ?`;
      conn.prepare(checkSql, (err, stmt) => {
        if (err) return reject(err instanceof Error ? err : new Error(err));
        stmt.exec([productID, storeID], (err, rows) => err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(rows));
      });
    });

    let recordID;
    let actionType;

    if (existing.length > 0) {
      // 2a. If exists, update quantity
      const updateSql = `UPDATE WUSAP.Inventory SET quantity = ? WHERE productID = ? AND storeID = ?`;
      await new Promise((resolve, reject) => {
        conn.prepare(updateSql, (err, stmt) => {
          if (err) return reject(err instanceof Error ? err : new Error(String(err)));
          stmt.exec([quantity, productID, storeID], (err) => err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve());
        });
      });

      recordID = existing[0].INVENTORYID;
      actionType = "UPDATE";
    } else {
      // 2b. If not exists, insert
      const insertSql = `INSERT INTO WUSAP.Inventory (productID, storeID, quantity) VALUES (?, ?, ?)`;
      await new Promise((resolve, reject) => {
        conn.prepare(insertSql, (err, stmt) => {
          if (err) return reject(err instanceof Error ? err : new Error(err));
          stmt.exec([productID, storeID, quantity], (err) => err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve());
        });
      });

      const result = await new Promise((resolve, reject) => {
        conn.exec(
          `SELECT CURRENT_IDENTITY_VALUE() AS recordID FROM DUMMY`,
          (err, res) =>
            err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(res[0])
        );
      });

      recordID = result.RECORDID;
      actionType = "INSERT";
    }

    // 3. Log the action into TableLogs
    const logSql = `
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) => {
      conn.prepare(logSql, (err, stmt) => {
        if (err) return reject(err instanceof Error ? err : new Error(err));
        stmt.exec([employeeID, "Inventory", recordID, actionType], (err) =>
          err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve()
        );
      });
    });

    return {
      success: true,
      message: actionType === "INSERT"
        ? 'Inventario asignado exitosamente'
        : 'Inventario actualizado exitosamente',
      inventoryID: recordID
    };
  } finally {
    pool.release(conn);
  }
};

export const editInventory = async (inventoryID, quantity, employeeID, conn = null) => {
  let localConn = conn;
  let acquiredHere = false;
  if (!localConn) {
    localConn = await pool.acquire();
    acquiredHere = true;
  }
  try {
    const [oldInventory] = await Promise.race([
      new Promise((resolve, reject) => {
        localConn.exec(
          `SELECT quantity FROM WUSAP.Inventory WHERE inventoryID = ?`,
          [inventoryID],
          (err, rows) => err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve(rows)
        );
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout on SELECT")), 8000))
    ]);

    const oldQuantity = oldInventory ? Number(oldInventory.QUANTITY) : null;

    const updateSql = `UPDATE WUSAP.Inventory SET quantity = ? WHERE inventoryID = ?`;
    await Promise.race([
      new Promise((resolve, reject) => {
        localConn.prepare(updateSql, (err, stmt) => {
          if (err) return reject(err instanceof Error ? err : new Error(err));
          stmt.exec([quantity, inventoryID], (err) => err ? reject(err instanceof Error ? err : new Error(String(err))) : resolve());
        });
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout on UPDATE")), 8000))
    ]);

    await logToTableLogs({
      employeeID,
      tableName: "Inventory",
      recordID: inventoryID,
      action: "UPDATE",
      comment: `Inventory updated: inventoryID=${inventoryID}, quantity: ${oldQuantity} → ${quantity}, by employeeID=${employeeID}`
    }, localConn);

    return { success: true, message: 'Inventario actualizado exitosamente' };
  } finally {
    if (acquiredHere) await pool.release(localConn);
  }
};


export const getInventoryByStoreByProduct = async (storeID, productID) => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Inventory WHERE storeID = ? AND productID = ?`,
        [storeID, productID],
        (err, result) => err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
}

export const getInventoryByID = async (inventoryID, conn = null) => {
  let localConn = conn;
  let acquiredHere = false;
  if (!localConn) {
    localConn = await pool.acquire();
    acquiredHere = true;
  }
  try {
    return await new Promise((resolve, reject) => {
      localConn.exec(
        `SELECT * FROM WUSAP.Inventory WHERE inventoryID = ?`,
        [inventoryID],
        (err, result) => err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result)
      );
    });
  } finally {
    if (acquiredHere) await pool.release(localConn);
  }
};