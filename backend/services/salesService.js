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
    await conn.exec(
      `INSERT INTO WUSAP.Sale (saleDate, employeeID, saleTotal) VALUES (?, ?, ?)`,
      [sale.saleDate || new Date(), employeeID, Number(sale.saleTotal).toFixed(2)]
    );

    // Get saleID (Check your DB: alias might need to be UPPERCASE)
    const [saleRow] = await conn.exec(`SELECT CURRENT_IDENTITY_VALUE() AS SALEID FROM DUMMY`);
    const saleID = saleRow.SALEID;

    await logToTableLogs({
      employeeID,
      tableName: "Sale",
      recordID: saleID,
      action: "INSERT",
      comment: `Sale created: saleID=${saleID}, employeeID=${employeeID}, total=${Number(sale.saleTotal).toFixed(2)}, date=${sale.saleDate || new Date()}`
    }, conn);

    // Insert items and reduce inventory
    for (const item of saleItems) {
      console.log("🔹 Processing saleItem:", item);

      if (!item.inventoryID) {
        console.error("❌ saleItem missing inventoryID:", item);
        throw new Error(`saleItem missing inventoryID. Got: ${JSON.stringify(item)}`);
      }

      // Fetch inventory by inventoryID
      const [inventory] = await getInventoryByID(item.inventoryID, conn);
      console.log(`🔍 Inventory lookup for inventoryID=${item.inventoryID}:`, inventory);

      if (!inventory || inventory.QUANTITY < item.quantity) {
        console.error(`❌ Not enough inventory or missing for inventoryID=${item.inventoryID}`, {inventory});
        throw new Error(`Not enough inventory for inventoryID=${item.inventoryID}`);
      }
      const newQty = Number(inventory.QUANTITY) - Number(item.quantity);

      console.log(`🔄 Updating inventory: inventoryID=${item.inventoryID}, oldQty=${inventory.QUANTITY}, newQty=${newQty}`);

      await editInventory(item.inventoryID, newQty, employeeID);

      console.log(`✅ Inventory updated for inventoryID=${item.inventoryID}: newQty=${newQty}`);

      // Insert sale item
      await conn.exec(
        `INSERT INTO WUSAP.SaleItems (saleID, inventoryID, quantity, itemTotal)
         VALUES (?, ?, ?, ?)`,
        [saleID, item.inventoryID, item.quantity, Number(item.itemTotal).toFixed(2)]
      );

      console.log(`✅ Sale item inserted for saleID=${saleID}:`, item);

      // Get saleItemID for logging
      const [saleItemRow] = await conn.exec(
        `SELECT CURRENT_IDENTITY_VALUE() AS SALEITEMID FROM DUMMY`
      );
      const saleItemID = saleItemRow.SALEITEMID;

      await logToTableLogs({
        employeeID,
        tableName: "SaleItems",
        recordID: saleItemID,
        action: "INSERT",
        comment: `Sold: saleID=${saleID}, saleItemID=${saleItemID}, inventoryID=${item.inventoryID}, qty=${item.quantity}, price=${Number(item.itemTotal).toFixed(2)}, employeeID=${employeeID}`
      }, conn);
    }

    await conn.commit();
    return { success: true, saleID };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
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

    if (!oldSale) {
      console.error(`[deleteSale] No sale found for saleID=${saleID}.`);
      throw new Error(`Sale not found for saleID=${saleID}`);
    }

    // Get all saleItems with their inventoryID and quantities
    const oldItems = await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT * FROM WUSAP.SaleItems WHERE saleID = ?`,
        [saleID],
        (err, rows) => err ? reject(err) : resolve(rows)
      );
    });

    console.log(`[deleteSale] saleID=${saleID}, employeeID=${employeeID}`);
    console.log(`[deleteSale] Fetched oldItems:`, oldItems);

    // Restore inventory (refund quantities)
    if (oldItems.length > 0) {
      for (const item of oldItems) {
        try {
          // Now, get inventory directly by inventoryID
          const [inventory] = await getInventoryByID(item.INVENTORYID);

          if (inventory) {
            const oldQty = Number(inventory.QUANTITY);
            const restoreQty = Number(item.QUANTITY);
            const newQty = oldQty + restoreQty;
            await editInventory(inventory.INVENTORYID, newQty, employeeID, conn);

            await logToTableLogs({
              employeeID,
              tableName: "Inventory",
              recordID: inventory.INVENTORYID,
              action: "UPDATE",
              comment: `Refunded inventory on sale deletion: saleID=${saleID}, saleItemID=${item.SALEITEMID}, inventoryID=${inventory.INVENTORYID}, qtyRestored=${restoreQty}, oldQty=${oldQty}, newQty=${newQty}, deletedBy=${employeeID}`
            }, conn);
          } else {
            // If no inventory exists for some reason, still log with descriptive recordID
            await logToTableLogs({
              employeeID,
              tableName: "Inventory",
              recordID: `missing-inventory-${item.INVENTORYID}`,
              action: "SKIP_REFUND",
              comment: `Tried to refund inventory on sale deletion but no inventory found for inventoryID=${item.INVENTORYID}, saleItemID=${item.SALEITEMID}, saleID=${saleID}`
            }, conn);
          }
        } catch (err) {
          console.error(`Error refunding inventory for saleItemID=${item.SALEITEMID}:`, err);
          throw err;
        }
      }
    } else {
      console.log(`[deleteSale] No sale items to refund for saleID=${saleID}`);
    }

    // Delete SaleItems (will do nothing if none)
    await new Promise((resolve, reject) => {
      conn.exec(`DELETE FROM WUSAP.SaleItems WHERE saleID = ?`, [saleID], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // Log sale item deletions (if any)
    for (const item of oldItems) {
      await logToTableLogs({
        employeeID,
        tableName: "SaleItems",
        recordID: item.SALEITEMID,
        action: "DELETE",
        comment: `Deleted saleItem: saleID=${saleID}, inventoryID=${item.INVENTORYID}, qty=${item.QUANTITY}, deletedBy=${employeeID}`
      }, conn);
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
      comment: `Deleted sale: saleID=${saleID}, employeeID=${employeeID}, total=${oldSale.SALETOTAL ?? 'unknown'}, date=${oldSale.SALEDATE ?? 'unknown'}`
    }, conn);

    await conn.commit();
    console.log(`[deleteSale] SUCCESS: saleID=${saleID} deleted, inventory refunded.`);
    return { success: true, saleID };
  } catch (err) {
    await conn.rollback();
    console.error(`[deleteSale] ERROR:`, err);
    throw err;
  } finally {
    pool.release(conn);
  }
};
