// tableLogController.js

import { getTableLogs, logToTableLogs } from '../services/tableLogService.js';

/**
 * GET /logs
 * Query logs by tableName, employeeID, or recordID
 */
export async function getLogs(req, res) {
  try {
    const { tableName, employeeID, recordID } = req.query;

    const logs = await getTableLogs({ tableName, employeeID, recordID });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /logs
 * Manually insert a new log entry
 */
export async function createLog(req, res) {
  const { employeeID, tableName, recordID, action, comment = '' } = req.body;

  if (!employeeID || !tableName || !recordID || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: employeeID, tableName, recordID, action'
    });
  }

  try {
    await logToTableLogs({
      employeeID,
      tableName,
      recordID,
      action,
      comment
    });
    res.status(201).json({ success: true, message: 'Log created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}
