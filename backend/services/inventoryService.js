// services/inventoryService.js

import pool from '../db/hanaPool.js';

export const getAllInventory = async () => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Inventory`,
        (err, result) => err ? reject(err) : resolve(result)
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
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const assignInventoryToStore = async (productID, storeID, quantity, employeeID = 0) => {
  const conn = await pool.acquire();
  try {
    // 1. Check if inventory record exists for product + store
    const existing = await new Promise((resolve, reject) => {
      const checkSql = `SELECT * FROM WUSAP.Inventory WHERE productID = ? AND storeID = ?`;
      conn.prepare(checkSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([productID, storeID], (err, rows) => err ? reject(err) : resolve(rows));
      });
    });

    let recordID;
    let actionType;

    if (existing.length > 0) {
      // 2a. If exists, update quantity
      const updateSql = `UPDATE WUSAP.Inventory SET quantity = ? WHERE productID = ? AND storeID = ?`;
      await new Promise((resolve, reject) => {
        conn.prepare(updateSql, (err, stmt) => {
          if (err) return reject(err);
          stmt.exec([quantity, productID, storeID], (err) => err ? reject(err) : resolve());
        });
      });

      recordID = existing[0].INVENTORYID;
      actionType = "UPDATE";
    } else {
      // 2b. If not exists, insert
      const insertSql = `INSERT INTO WUSAP.Inventory (productID, storeID, quantity) VALUES (?, ?, ?)`;
      await new Promise((resolve, reject) => {
        conn.prepare(insertSql, (err, stmt) => {
          if (err) return reject(err);
          stmt.exec([productID, storeID, quantity], (err) => err ? reject(err) : resolve());
        });
      });

      const result = await new Promise((resolve, reject) => {
        conn.exec(`SELECT CURRENT_IDENTITY_VALUE() AS recordID FROM DUMMY`, (err, res) =>
          err ? reject(err) : resolve(res[0])
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
        if (err) return reject(err);
        stmt.exec([employeeID, "Inventory", recordID, actionType], (err) =>
          err ? reject(err) : resolve()
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
