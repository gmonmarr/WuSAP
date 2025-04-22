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
    const sql = `INSERT INTO WUSAP.Inventory (productID, storeID, quantity) VALUES (?, ?, ?)`;
    await new Promise((resolve, reject) => {
      conn.prepare(sql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([productID, storeID, quantity], (err) => err ? reject(err) : resolve());
      });
    });

    const [{ RECORDID }] = await new Promise((resolve, reject) => {
      conn.exec(`SELECT CURRENT_IDENTITY_VALUE() AS recordID FROM DUMMY`, (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });

    // Log insert into TableLogs
    await new Promise((resolve, reject) => {
      conn.prepare(
        `INSERT INTO WUSAP.TableLogs (tableLogID, employeeID, tableName, recordID, "action", "timestamp") VALUES (0, ?, 'Inventory', ?, 'INSERT', CURRENT_TIMESTAMP)`,
        (err, stmt) => {
          if (err) return reject(err);
          stmt.exec([employeeID, RECORDID], (err) => err ? reject(err) : resolve());
        }
      );
    });

    return {
      success: true,
      message: 'Inventario asignado exitosamente',
      inventoryID: RECORDID
    };
  } finally {
    pool.release(conn);
  }
};
