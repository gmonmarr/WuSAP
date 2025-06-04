// services/salesService.js

import pool from '../db/hanaPool.js';
import { logToTableLogs } from './tableLogService.js';
import { getInventoryByStoreByProduct, editInventory, getInventoryByID } from './inventoryService.js';

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

// Update sale and its items (replace all items)
// export const updateSale = async (saleID, sale, saleItems, employeeID) => {
//   const conn = await pool.acquire();
//   try {
//     await conn.setAutoCommit(false);

//     // Update sale
//     await new Promise((resolve, reject) => {
//       conn.prepare(
//         `UPDATE WUSAP.Sale SET saleDate = ?, saleTotal = ? WHERE saleID = ?`,
//         (err, stmt) => {
//           if (err) return reject(err);
//           stmt.exec(
//             [sale.saleDate || new Date(), Number(sale.saleTotal).toFixed(2), saleID],
//             (err) => err ? reject(err) : resolve()
//           );
//         }
//       );
//     });

//     await logToTableLogs({
//       employeeID,
//       tableName: "Sale",
//       recordID: saleID,
//       action: "UPDATE",
//       comment: `Updated sale to total ${Number(sale.saleTotal).toFixed(2)}`
//     });

//     // Delete old items
//     await new Promise((resolve, reject) => {
//       conn.exec(
//         `DELETE FROM WUSAP.SaleItems WHERE saleID = ?`,
//         [saleID],
//         (err) => err ? reject(err) : resolve()
//       );
//     });

//     // Insert new items
//     for (const item of saleItems) {
//       await new Promise((resolve, reject) => {
//         conn.prepare(
//           `INSERT INTO WUSAP.SaleItems (saleID, inventoryID, quantity, itemTotal)
//            VALUES (?, ?, ?, ?)`,
//           (err, stmt) => {
//             if (err) return reject(err);
//             stmt.exec(
//               [saleID, item.inventoryID, item.quantity, Number(item.itemTotal).toFixed(2)],
//               (err) => err ? reject(err) : resolve()
//             );
//           }
//         );
//       });

//       // Get saleItemID for logging
//       const saleItemID = await new Promise((resolve, reject) => {
//         conn.exec(
//           `SELECT CURRENT_IDENTITY_VALUE() AS saleItemID FROM DUMMY`,
//           (err, rows) => err ? reject(err) : resolve(rows[0].SALEITEMID)
//         );
//       });

//       await logToTableLogs({
//         employeeID,
//         tableName: "SaleItems",
//         recordID: saleItemID,
//         action: "INSERT",
//         comment: `Added sale item (inventoryID: ${item.inventoryID}, qty: ${item.quantity})`
//       });
//     }

//     await conn.commit();
//     return { success: true, saleID };
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     pool.release(conn);
//   }
// };

// Create new sale (+items), reduce inventory and detailed log
export const postSale = async (sale, saleItems, employeeID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    console.log("🧾 postSale called. Sale:", sale);
    console.log("🧾 saleItems received:", saleItems);

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

    await logToTableLogs({
      employeeID,
      tableName: "Sale",
      recordID: saleID,
      action: "INSERT",
      comment: `Sale created: saleID=${saleID}, employeeID=${employeeID}, total=${Number(sale.saleTotal).toFixed(2)}, date=${sale.saleDate || new Date()}`
    });

    // Insert items and reduce inventory
    for (const item of saleItems) {
      console.log("🔹 Processing saleItem:", item);

      // Defensive: check required field
      if (!item.inventoryID) {
        console.error("❌ saleItem missing inventoryID:", item);
        throw new Error(`saleItem missing inventoryID. Got: ${JSON.stringify(item)}`);
      }

      // Fetch inventory by inventoryID
      const [inventory] = await getInventoryByID(item.inventoryID);
      console.log(`🔍 Inventory lookup for inventoryID=${item.inventoryID}:`, inventory);

      if (!inventory || inventory.QUANTITY < item.quantity) {
        console.error(`❌ Not enough inventory or missing for inventoryID=${item.inventoryID}`, {inventory});
        throw new Error(`Not enough inventory for inventoryID=${item.inventoryID}`);
      }
      const newQty = Number(inventory.QUANTITY) - Number(item.quantity);
      await editInventory(item.inventoryID, newQty, employeeID);

      // Insert sale item
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
        comment: `Sold: saleID=${saleID}, saleItemID=${saleItemID}, inventoryID=${item.inventoryID}, qty=${item.quantity}, price=${Number(item.itemTotal).toFixed(2)}, employeeID=${employeeID}`
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


// Delete sale (and its items), restore inventory, detailed logs
export const deleteSale = async (saleID, employeeID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Get old sale and items for logs & inventory restoration
    const oldSale = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.Sale WHERE saleID = ?`,
        [saleID],
        (err, rows) => err ? reject(err) : resolve(rows[0])
      );
    });
    const oldItems = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT si.*, i.productID, i.storeID
         FROM WUSAP.SaleItems si
         JOIN WUSAP.Inventory i ON si.inventoryID = i.inventoryID
         WHERE si.saleID = ?`,
        [saleID],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    // Restore inventory (refund quantities)
    for (const item of oldItems) {
      try {
        const [inventory] = await getInventoryByStoreByProduct(item.storeID, item.productID);

        if (inventory) {
          const oldQty = Number(inventory.QUANTITY);
          const restoreQty = Number(item.QUANTITY);
          const newQty = oldQty + restoreQty;
          await editInventory(inventory.INVENTORYID, newQty, employeeID);

          await logToTableLogs({
            employeeID,
            tableName: "Inventory",
            recordID: inventory.INVENTORYID,
            action: "UPDATE",
            comment: `Refunded inventory on sale deletion: saleID=${saleID}, saleItemID=${item.SALEITEMID}, inventoryID=${inventory.INVENTORYID}, productID=${item.productID}, storeID=${item.storeID}, qtyRestored=${restoreQty}, oldQty=${oldQty}, newQty=${newQty}, deletedBy=${employeeID}`
          });
        } else {
          // Skip if inventory link is missing (do not create)
          console.warn(`[deleteSale] No inventory record for storeID=${item.storeID}, productID=${item.productID}, skipping refund.`);
          await logToTableLogs({
            employeeID,
            tableName: "Inventory",
            recordID: null,
            action: "SKIP_REFUND",
            comment: `Tried to refund inventory on sale deletion but no inventory found for productID=${item.productID}, storeID=${item.storeID}`
          });
        }
      } catch (err) {
        console.error(`Error refunding inventory for saleItemID=${item.SALEITEMID}:`, err);
        throw err;
      }
    }

    // Delete SaleItems
    await new Promise((resolve, reject) => {
      conn.exec(`DELETE FROM WUSAP.SaleItems WHERE saleID = ?`, [saleID], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // Log sale item deletions
    for (const item of oldItems) {
      await logToTableLogs({
        employeeID,
        tableName: "SaleItems",
        recordID: item.SALEITEMID,
        action: "DELETE",
        comment: `Deleted saleItem: saleID=${saleID}, inventoryID=${item.inventoryID}, productID=${item.productID}, storeID=${item.storeID}, qty=${item.QUANTITY}, deletedBy=${employeeID}`
      });
    }

    // Delete sale
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
      comment: `Deleted sale: saleID=${saleID}, employeeID=${employeeID}, total=${oldSale.SALETOTAL}, date=${oldSale.SALEDATE}`
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
