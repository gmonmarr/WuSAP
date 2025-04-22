// middleware/logMiddleware.js

import pool from "../db/hanaPool.js";
import jwt from "jsonwebtoken";

export const logAPIAccess = (req, res, next) => {
  res.on("finish", async () => {
    let employeeID = null;

    // ✅ Extract employeeID from token if present
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        employeeID = decoded.employeeID;
      } catch {
        employeeID = null; // Invalid or expired token
      }
    }

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    const method = req.method;
    const endpoint = req.originalUrl;
    const statusCode = res.statusCode;
    const userAgent = req.headers["user-agent"] || null;

    const conn = await pool.acquire();
    const sql = `
      INSERT INTO WUSAP.APILogs (employeeID, ipAddress, method, endpoint, statusCode, userAgent)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    conn.prepare(sql, (err, stmt) => {
      if (!err) {
        stmt.exec([employeeID, ipAddress, method, endpoint, statusCode, userAgent], () => {
          pool.release(conn);
        });
      } else {
        pool.release(conn);
        console.error("❌ Error logging API request:", err.message);
      }
    });
  });

  next();
};
