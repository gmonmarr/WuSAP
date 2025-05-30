// services/salesService.js

import pool from '../db/hanaPool.js';
import { logToTableLogs } from './logService.js';

// Get all sales
export const getAllSales = async () => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT s.saleID, s.saleDate, s.employeeID, e.name AS employeeName, s.saleTotal
         FROM WUSAP.Sale s
         LEFT JOIN WUSAP.Employees e ON s.employeeID = e.employeeID
         ORDER BY s.saleDate DESC`,
        (err, result) => err ? reject(err) : resolve(result)
      );
    });
  } finally {
    pool.release(conn);
  }
};

// Get one sale (with its items)
export const getSaleById = async (saleID) => {
  const conn = await pool.acquire();
  try {
    // Sale info
    const sale = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT s.*, e.name AS employeeName
         FROM WUSAP.Sale s
         LEFT JOIN WUSAP.Employees e ON s.employeeID = e.employeeID
         WHERE s.saleID = ?`,
        [saleID],
        (err, rows) => err ? reject(err) : resolve(rows[0])
      );
    });
    if (!sale) return null;
    // Items
    const saleItems = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT si.*, i.productID, i.storeID
         FROM WUSAP.SaleItems si
         LEFT JOIN WUSAP.Inventory i ON si.inventoryID = i.inventoryID
         WHERE si.saleID = ?`,
        [saleID],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });
    return { ...sale, saleItems };
  } finally {
    pool.release(conn);
  }
};

// Create new sale (+items)
export const postSale = async (sale, saleItems, employeeID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Insert sale
    await new Promise((resolve, reject) => {
      conn.prepare(
        `INSERT INTO WUSAP.Sale (saleDate, employeeID, saleTotal) VALUES (?, ?, ?)`,
        (err, stmt) => {
          if (err) return reject(err);
          stmt.exec([sale.saleDate || new Date(), employeeID, Number(sale.saleTotal).toFixed(2)], (err) => err ? reject(err) : resolve());
        }
      );
    });

    // Get saleID
    const saleID = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT CURRENT_IDENTITY_VALUE() AS saleID FROM DUMMY`,
        (err, rows) => err ? reject(err) : resolve(rows[0].SALEID)
      );
    });

    // Log sale insertion
    await logToTableLogs({
      employeeID,
      tableName: "Sale",
      recordID: saleID,
      action: "INSERT",
      comment: `Created sale for total ${Number(sale.saleTotal).toFixed(2)}`
    });

    // Insert items
    for (const item of saleItems) {
      await new Promise((resolve, reject) => {
        conn.prepare(
          `INSERT INTO WUSAP.SaleItems (saleID, inventoryID, quantity, itemTotal)
           VALUES (?, ?, ?, ?)`,
          (err, stmt) => {
            if (err) return reject(err);
            stmt.exec(
              [saleID, item.inventoryID, item.quantity, Number(item.itemTotal).toFixed(2)],
              (err) => err ? reject(err) : resolve()
            );
          }
        );
      });

      // Get saleItemID for logging
      const saleItemID = await new Promise((resolve, reject) => {
        conn.exec(
          `SELECT CURRENT_IDENTITY_VALUE() AS saleItemID FROM DUMMY`,
          (err, rows) => err ? reject(err) : resolve(rows[0].SALEITEMID)
        );
      });

      await logToTableLogs({
        employeeID,
        tableName: "SaleItems",
        recordID: saleItemID,
        action: "INSERT",
        comment: `Added sale item (inventoryID: ${item.inventoryID}, qty: ${item.quantity})`
      });
    }

    await conn.commit();
    return { success: true, saleID };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    pool.release(conn);
  }
};

// Update sale and its items (replace all items)
export const updateSale = async (saleID, sale, saleItems, employeeID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Update sale
    await new Promise((resolve, reject) => {
      conn.prepare(
        `UPDATE WUSAP.Sale SET saleDate = ?, saleTotal = ? WHERE saleID = ?`,
        (err, stmt) => {
          if (err) return reject(err);
          stmt.exec(
            [sale.saleDate || new Date(), Number(sale.saleTotal).toFixed(2), saleID],
            (err) => err ? reject(err) : resolve()
          );
        }
      );
    });

    await logToTableLogs({
      employeeID,
      tableName: "Sale",
      recordID: saleID,
      action: "UPDATE",
      comment: `Updated sale to total ${Number(sale.saleTotal).toFixed(2)}`
    });

    // Delete old items
    await new Promise((resolve, reject) => {
      conn.exec(
        `DELETE FROM WUSAP.SaleItems WHERE saleID = ?`,
        [saleID],
        (err) => err ? reject(err) : resolve()
      );
    });

    // Insert new items
    for (const item of saleItems) {
      await new Promise((resolve, reject) => {
        conn.prepare(
          `INSERT INTO WUSAP.SaleItems (saleID, inventoryID, quantity, itemTotal)
           VALUES (?, ?, ?, ?)`,
          (err, stmt) => {
            if (err) return reject(err);
            stmt.exec(
              [saleID, item.inventoryID, item.quantity, Number(item.itemTotal).toFixed(2)],
              (err) => err ? reject(err) : resolve()
            );
          }
        );
      });

      // Get saleItemID for logging
      const saleItemID = await new Promise((resolve, reject) => {
        conn.exec(
          `SELECT CURRENT_IDENTITY_VALUE() AS saleItemID FROM DUMMY`,
          (err, rows) => err ? reject(err) : resolve(rows[0].SALEITEMID)
        );
      });

      await logToTableLogs({
        employeeID,
        tableName: "SaleItems",
        recordID: saleItemID,
        action: "INSERT",
        comment: `Added sale item (inventoryID: ${item.inventoryID}, qty: ${item.quantity})`
      });
    }

    await conn.commit();
    return { success: true, saleID };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    pool.release(conn);
  }
};

// Delete sale (and its items)
export const deleteSale = async (saleID, employeeID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Get old items to log their deletion
    const oldItems = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT saleItemID FROM WUSAP.SaleItems WHERE saleID = ?`,
        [saleID],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    await new Promise((resolve, reject) => {
      conn.exec(`DELETE FROM WUSAP.SaleItems WHERE saleID = ?`, [saleID], (err) =>
        err ? reject(err) : resolve()
      );
    });

    for (const item of oldItems) {
      await logToTableLogs({
        employeeID,
        tableName: "SaleItems",
        recordID: item.SALEITEMID,
        action: "DELETE",
        comment: "Deleted sale item on sale deletion"
      });
    }

    await new Promise((resolve, reject) => {
      conn.exec(`DELETE FROM WUSAP.Sale WHERE saleID = ?`, [saleID], (err) =>
        err ? reject(err) : resolve()
      );
    });

    await logToTableLogs({
      employeeID,
      tableName: "Sale",
      recordID: saleID,
      action: "DELETE",
      comment: "Deleted sale and all related sale items"
    });

    await conn.commit();
    return { success: true, saleID };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    pool.release(conn);
  }
};
