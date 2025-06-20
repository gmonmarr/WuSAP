// tableLogService.js

import pool from '../db/hanaPool.js';

/**
 * Insert a new log entry into WUSAP.TableLogs.
 * Now self-contained (acquires its own connection).
 */
export async function logToTableLogs({
  employeeID,
  tableName,
  recordID,
  action,
  comment = ''
}, conn = null) {
  let localConn = conn;
  let acquiredHere = false;
  if (!localConn) {
    localConn = await pool.acquire();
    acquiredHere = true;
  }
  try {
    if (!employeeID || isNaN(Number(employeeID))) {
      throw new Error("Missing or invalid employeeID for TableLogs");
    }
    if (!tableName || !recordID || !action) {
      throw new Error("Missing tableName, recordID or action in TableLogs");
    }

    const sql = `
      INSERT INTO WUSAP.TableLogs (employeeID, tableName, recordID, action, comment)
      VALUES (?, ?, ?, ?, ?)
    `;

    await localConn.exec(sql, [Number(employeeID), tableName, recordID, action, comment]);
  } finally {
    if (acquiredHere) await pool.release(localConn);
  }
}

/**
 * Fetch logs optionally filtered by tableName, employeeID, or recordID.
 */
export async function getTableLogs({ tableName, employeeID, recordID }) {
  const conn = await pool.acquire();
  try {
    let query = `SELECT * FROM WUSAP.TableLogs WHERE 1=1`;
    const params = [];

    if (tableName) {
      query += ` AND tableName = ?`;
      params.push(tableName);
    }
    if (employeeID) {
      query += ` AND employeeID = ?`;
      params.push(employeeID);
    }
    if (recordID) {
      query += ` AND recordID = ?`;
      params.push(recordID);
    }

    query += ` ORDER BY timestamp DESC`;

    return await conn.exec(query, params);
  } finally {
    await pool.release(conn);
  }
}
