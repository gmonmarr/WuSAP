// services/employeeService.js

import pool from '../db/hanaPool.js';

/**
 * Get all employees
 */
export async function getAllEmployees() {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT 
        e.*,
        l.NAME AS LOCATION_NAME
      FROM WUSAP.Employees e
      LEFT JOIN WUSAP.LOCATIONS l ON e.STOREID = l.STOREID
      ORDER BY e.EMPLOYEEID
    `);
    return result;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Update an employee
 */
export async function updateEmployee(employeeID, employeeData, updatedByID) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Create SET clause dynamically based on provided fields
    const updateFields = [];
    const params = [];
    
    if (employeeData.name !== undefined) {
      updateFields.push('NAME = ?');
      params.push(employeeData.name);
    }
    
    if (employeeData.lastname !== undefined) {
      updateFields.push('LASTNAME = ?');
      params.push(employeeData.lastname);
    }
    
    if (employeeData.email !== undefined) {
      updateFields.push('EMAIL = ?');
      params.push(employeeData.email);
    }
    
    if (employeeData.role !== undefined) {
      // Validate role is one of the allowed values
      const validRoles = ["admin", "manager", "sales", "owner"];
      if (!validRoles.includes(employeeData.role)) {
        throw new Error("El rol debe ser admin, manager, sales o owner");
      }
      
      updateFields.push('ROLE = ?');
      params.push(employeeData.role);
    }
    
    if (employeeData.userPhoto !== undefined) {
      updateFields.push('USERPHOTO = ?');
      params.push(employeeData.userPhoto);
    }
    
    if (employeeData.cellphone !== undefined) {
      updateFields.push('CELLPHONE = ?');
      params.push(employeeData.cellphone);
    }
    
    if (employeeData.isActive !== undefined) {
      updateFields.push('ISACTIVE = ?');
      params.push(employeeData.isActive);
    }
    
    if (employeeData.isBlocked !== undefined) {
      updateFields.push('ISBLOCKED = ?');
      params.push(employeeData.isBlocked);
    }
    
    if (employeeData.blockReason !== undefined) {
      updateFields.push('BLOCKREASON = ?');
      params.push(employeeData.blockReason);
    }
    
    if (employeeData.storeID !== undefined) {
      updateFields.push('STOREID = ?');
      params.push(employeeData.storeID);
    }
    
    // Exit if no fields to update
    if (updateFields.length === 0) {
      return { success: false, message: 'No fields to update' };
    }
    
    // Complete the params array with employeeID
    params.push(employeeID);
    
    const updateSQL = `
      UPDATE WUSAP.Employees 
      SET ${updateFields.join(', ')} 
      WHERE EMPLOYEEID = ?
    `;
    
    await conn.exec(updateSQL, params);
    
    // Log the update action
    await conn.exec(`
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, 'Employees', ?, 'UPDATE')
    `, [updatedByID, employeeID]);
    
    await conn.commit();
    return { success: true, message: 'Employee updated successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
} 