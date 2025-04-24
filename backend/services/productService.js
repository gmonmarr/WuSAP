// services/productService.js

import pool from '../db/hanaPool.js';

export const getAllProducts = async () => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Products`,
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const getActiveProductsService = async () => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Products WHERE isDiscontinued = FALSE`,
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

export const addProduct = async (name, suggestedPrice, unit, employeeID = 0) => {
  const conn = await pool.acquire();
  try {
    const sql = `INSERT INTO WUSAP.Products (name, suggestedPrice, unit) VALUES (?, ?, ?)`;
    await new Promise((resolve, reject) => {
      conn.prepare(sql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([name, suggestedPrice, unit], (err) => err ? reject(err) : resolve());
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
        `INSERT INTO WUSAP.TableLogs (tableLogID, employeeID, tableName, recordID, "action", "timestamp") VALUES (0, ?, 'Products', ?, 'INSERT', CURRENT_TIMESTAMP)`,
        (err, stmt) => {
          if (err) return reject(err);
          stmt.exec([employeeID, RECORDID], (err) => err ? reject(err) : resolve());
        }
      );
    });

    return {
      success: true,
      message: 'Producto agregado exitosamente',
      productID: RECORDID
    };
  } finally {
    pool.release(conn);
  }
};
