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
        `SELECT * FROM WUSAP.Products WHERE discontinued = FALSE`,
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
    // Insert into Products table
    const insertSql = `INSERT INTO WUSAP.Products (name, suggestedPrice, unit) VALUES (?, ?, ?)`;
    await new Promise((resolve, reject) => {
      conn.prepare(insertSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([name, suggestedPrice, unit], (err) => err ? reject(err) : resolve());
      });
    });

    // Get inserted product ID
    const result = await new Promise((resolve, reject) => {
      conn.exec(`SELECT CURRENT_IDENTITY_VALUE() AS productID FROM DUMMY`, (err, res) =>
        err ? reject(err) : resolve(res[0])
      );
    });

    const newProductID = result.PRODUCTID;

    // Log the insert into TableLogs
    const logSql = `
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, ?, ?, ?)
    `;
    await new Promise((resolve, reject) => {
      conn.prepare(logSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([employeeID, "Products", newProductID, "INSERT"], (err) =>
          err ? reject(err) : resolve()
        );
      });
    });

    return {
      success: true,
      message: 'Producto agregado exitosamente',
      productID: newProductID
    };
  } finally {
    pool.release(conn);
  }
};
