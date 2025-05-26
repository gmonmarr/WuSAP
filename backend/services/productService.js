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

export const addProduct = async (name, suggestedPrice, unit, discontinued = false, employeeID = 0) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Insert into Products table with discontinued field
    const insertSql = `INSERT INTO WUSAP.Products (NAME, SUGGESTEDPRICE, UNIT, DISCONTINUED) VALUES (?, ?, ?, ?)`;
    await new Promise((resolve, reject) => {
      conn.prepare(insertSql, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([name, suggestedPrice, unit, discontinued], (err) => err ? reject(err) : resolve());
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

    await conn.commit();
    return {
      success: true,
      message: 'Producto agregado exitosamente',
      productID: newProductID
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
};

/**
 * Update a product
 */
export const updateProduct = async (productID, productData, updatedByID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Check if product exists
    const checkResult = await new Promise((resolve, reject) => {
      conn.exec(`SELECT * FROM WUSAP.Products WHERE PRODUCTID = ?`, [productID], (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });

    if (!checkResult || checkResult.length === 0) {
      throw new Error('Product not found');
    }

    // Create SET clause dynamically based on provided fields
    const updateFields = [];
    const params = [];
    
    if (productData.name !== undefined) {
      updateFields.push('NAME = ?');
      params.push(productData.name);
    }
    
    if (productData.suggestedPrice !== undefined) {
      updateFields.push('SUGGESTEDPRICE = ?');
      params.push(productData.suggestedPrice);
    }
    
    if (productData.unit !== undefined) {
      updateFields.push('UNIT = ?');
      params.push(productData.unit);
    }
    
    if (productData.discontinued !== undefined) {
      updateFields.push('DISCONTINUED = ?');
      params.push(productData.discontinued);
    }
    
    // Exit if no fields to update
    if (updateFields.length === 0) {
      return { success: false, message: 'No fields to update' };
    }
    
    // Complete the params array with productID
    params.push(productID);
    
    const updateSQL = `
      UPDATE WUSAP.Products 
      SET ${updateFields.join(', ')} 
      WHERE PRODUCTID = ?
    `;
    
    await new Promise((resolve, reject) => {
      conn.prepare(updateSQL, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec(params, (err) => err ? reject(err) : resolve());
      });
    });
    
    // Log the update action
    await new Promise((resolve, reject) => {
      conn.prepare(`
        INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
        VALUES (?, 'Products', ?, 'UPDATE')
      `, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([updatedByID, productID], (err) => err ? reject(err) : resolve());
      });
    });
    
    await conn.commit();
    return { success: true, message: 'Product updated successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productID, deletedByID) => {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Check if product exists
    const checkResult = await new Promise((resolve, reject) => {
      conn.exec(`SELECT * FROM WUSAP.Products WHERE PRODUCTID = ?`, [productID], (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });

    if (!checkResult || checkResult.length === 0) {
      throw new Error('Product not found');
    }

    // Check if product is used in other tables (orders, inventory, etc.)
    const usageCheck = await new Promise((resolve, reject) => {
      conn.exec(`
        SELECT COUNT(*) AS USAGE_COUNT 
        FROM WUSAP.Inventory
        WHERE PRODUCTID = ?
      `, [productID], (err, result) =>
        err ? reject(err) : resolve(result)
      );
    });

    if (usageCheck[0].USAGE_COUNT > 0) {
      throw new Error(`No se puede eliminar el producto "${checkResult[0].NAME}" porque está siendo usado en una sucursal. Considere marcarlo como descontinuado en su lugar.`);
    }

    // Delete the product
    await new Promise((resolve, reject) => {
      conn.exec(`DELETE FROM WUSAP.Products WHERE PRODUCTID = ?`, [productID], (err) =>
        err ? reject(err) : resolve()
      );
    });

    // Log the delete action
    await new Promise((resolve, reject) => {
      conn.prepare(`
        INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
        VALUES (?, 'Products', ?, 'DELETE')
      `, (err, stmt) => {
        if (err) return reject(err);
        stmt.exec([deletedByID, productID], (err) => err ? reject(err) : resolve());
      });
    });

    await conn.commit();
    return { success: true, message: 'Product deleted successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
};
