import pool from '../db/hanaPool.js';

/**
 * Get all locations
 */
export async function getAllLocations() {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT 
        STOREID,
        NAME,
        LOCATION,
        ISACTIVE
      FROM WUSAP.LOCATIONS
      ORDER BY STOREID
    `);
    return result;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(storeID) {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT 
        STOREID,
        NAME,
        LOCATION,
        ISACTIVE
      FROM WUSAP.LOCATIONS
      WHERE STOREID = ?
    `, [storeID]);
    
    return result.length > 0 ? result[0] : null;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Create a new location
 */
export async function createLocation(locationData, createdByID) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Get the next STOREID - handle case where table might be empty
    const maxIdResult = await conn.exec(`
      SELECT COALESCE(MAX(STOREID), 0) + 1 AS NEXTID
      FROM WUSAP.LOCATIONS
    `);
    
    // Ensure we have a valid next ID
    let nextStoreID = 1; // Default to 1 if table is empty
    if (maxIdResult && maxIdResult.length > 0 && maxIdResult[0].NEXTID) {
      nextStoreID = maxIdResult[0].NEXTID;
    }

    // Insert the new location with explicit STOREID
    await conn.exec(`
      INSERT INTO WUSAP.LOCATIONS (STOREID, NAME, LOCATION, ISACTIVE)
      VALUES (?, ?, ?, ?)
    `, [
      nextStoreID, 
      locationData.name, 
      locationData.location, 
      locationData.isActive !== undefined ? locationData.isActive : true
    ]);

    // Log the create action
    await conn.exec(`
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, 'LOCATIONS', ?, 'CREATE')
    `, [createdByID, nextStoreID]);

    await conn.commit();
    return { 
      success: true, 
      message: 'Location created successfully',
      storeID: nextStoreID 
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Update a location
 */
export async function updateLocation(storeID, locationData, updatedByID) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Check if location exists
    const existingLocation = await getLocationById(storeID);
    if (!existingLocation) {
      throw new Error('Location not found');
    }

    // Create SET clause dynamically based on provided fields
    const updateFields = [];
    const params = [];
    
    if (locationData.name !== undefined) {
      updateFields.push('NAME = ?');
      params.push(locationData.name);
    }
    
    if (locationData.location !== undefined) {
      updateFields.push('LOCATION = ?');
      params.push(locationData.location);
    }
    
    if (locationData.isActive !== undefined) {
      updateFields.push('ISACTIVE = ?');
      params.push(locationData.isActive);
    }
    
    // Exit if no fields to update
    if (updateFields.length === 0) {
      return { success: false, message: 'No fields to update' };
    }
    
    // Complete the params array with storeID
    params.push(storeID);
    
    const updateSQL = `
      UPDATE WUSAP.LOCATIONS 
      SET ${updateFields.join(', ')} 
      WHERE STOREID = ?
    `;
    
    await conn.exec(updateSQL, params);
    
    // Log the update action
    await conn.exec(`
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, 'LOCATIONS', ?, 'UPDATE')
    `, [updatedByID, storeID]);
    
    await conn.commit();
    return { success: true, message: 'Location updated successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(storeID, deletedByID) {
  const conn = await pool.acquire();
  try {
    await conn.setAutoCommit(false);

    // Check if location exists
    const existingLocation = await getLocationById(storeID);
    if (!existingLocation) {
      throw new Error('Location not found');
    }

    // Check if location has employees assigned
    const hasEmployees = await checkLocationHasEmployees(storeID);
    if (hasEmployees) {
      // Get the employees assigned to provide more details
      const employees = await getEmployeesByLocation(storeID);
      const employeeNames = employees.map(emp => `${emp.NAME} ${emp.LASTNAME}`).join(', ');
      throw new Error(`No se puede eliminar la ubicación "${existingLocation.NAME}" porque tiene empleados asignados: ${employeeNames}. Primero reasigne o desactive estos empleados.`);
    }

    // Delete the location
    await conn.exec(`
      DELETE FROM WUSAP.LOCATIONS
      WHERE STOREID = ?
    `, [storeID]);

    // Log the delete action
    await conn.exec(`
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action)
      VALUES (?, 'LOCATIONS', ?, 'DELETE')
    `, [deletedByID, storeID]);

    await conn.commit();
    return { success: true, message: 'Location deleted successfully' };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Check if LOCATIONS table exists and get its structure
 */
export async function checkLocationsTable() {
  const conn = await pool.acquire();
  try {
    // Check if table exists
    const tableExists = await conn.exec(`
      SELECT COUNT(*) AS TABLE_COUNT
      FROM SYS.TABLES 
      WHERE SCHEMA_NAME = 'WUSAP' AND TABLE_NAME = 'LOCATIONS'
    `);
    
    if (tableExists[0].TABLE_COUNT > 0) {
      // Get table structure
      const tableStructure = await conn.exec(`
        SELECT COLUMN_NAME, DATA_TYPE_NAME, IS_NULLABLE, DEFAULT_VALUE
        FROM SYS.TABLE_COLUMNS 
        WHERE SCHEMA_NAME = 'WUSAP' AND TABLE_NAME = 'LOCATIONS'
        ORDER BY POSITION
      `);
      
      return { exists: true, structure: tableStructure };
    } else {
      return { exists: false, structure: null };
    }
  } finally {
    await pool.release(conn);
  }
}

/**
 * Create LOCATIONS table if it doesn't exist
 */
export async function createLocationsTable() {
  const conn = await pool.acquire();
  try {
    await conn.exec(`
      CREATE TABLE WUSAP.LOCATIONS (
        STOREID INTEGER NOT NULL PRIMARY KEY,
        NAME NVARCHAR(255) NOT NULL,
        LOCATION NVARCHAR(500) NOT NULL,
        ISACTIVE BOOLEAN DEFAULT TRUE
      )
    `);
    
    return { success: true, message: 'LOCATIONS table created successfully' };
  } catch (err) {
    // If table already exists, that's okay
    if (err.message.includes('already exists') || err.code === 288) {
      return { success: true, message: 'LOCATIONS table already exists' };
    }
    throw err;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Check if location has employees assigned
 */
export async function checkLocationHasEmployees(storeID) {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT COUNT(*) AS EMPLOYEE_COUNT
      FROM WUSAP.Employees
      WHERE STOREID = ?
    `, [storeID]);
    
    return result[0].EMPLOYEE_COUNT > 0;
  } finally {
    await pool.release(conn);
  }
}

/**
 * Get employees assigned to a location
 */
export async function getEmployeesByLocation(storeID) {
  const conn = await pool.acquire();
  try {
    const result = await conn.exec(`
      SELECT NAME, LASTNAME, EMAIL
      FROM WUSAP.Employees
      WHERE STOREID = ?
      ORDER BY NAME, LASTNAME
    `, [storeID]);
    
    return result;
  } finally {
    await pool.release(conn);
  }
} 