import pool from '../db/hanaPool.js';

// Obtener KPIs generales de la tienda
export const getDashboardKPIs = async (storeID = null, userRole = null) => {
  const conn = await pool.acquire();
  try {
    // Consulta simplificada para ventas totales
    const salesData = await new Promise((resolve, reject) => {
      let query = `SELECT 
        COALESCE(SUM(s.saleTotal), 0) as totalSales,
        COUNT(s.saleID) as totalTransactions,
        COALESCE(AVG(s.saleTotal), 0) as avgTicket
       FROM WUSAP.Sale s`;
       
      if (storeID && userRole !== 'admin' && userRole !== 'owner') {
        query += ` JOIN WUSAP.Employees e ON s.employeeID = e.employeeID WHERE e.storeID = ${storeID}`;
      }
      
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result[0] || {})
      );
    });

    // Consulta simplificada para órdenes
    const ordersData = await new Promise((resolve, reject) => {
      let query = `SELECT COUNT(*) as pendingCount FROM WUSAP.Orders o WHERE o.status = 'Pendiente'`;
      
      if (storeID && userRole !== 'admin' && userRole !== 'owner') {
        query = `SELECT COUNT(*) as pendingCount FROM WUSAP.Orders o WHERE o.storeID = ${storeID} AND o.status = 'Pendiente'`;
      }
      
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result[0] || {})
      );
    });

    // Consulta mejorada para inventario bajo (productos críticos o con menos del 20% del stock promedio)
    const inventoryData = await new Promise((resolve, reject) => {
      let query = `SELECT COUNT(*) as lowStockCount FROM WUSAP.Inventory i 
                   WHERE i.quantity <= 5 OR 
                         i.quantity < (SELECT AVG(quantity) * 0.2 FROM WUSAP.Inventory WHERE quantity > 0)`;
      
      if (storeID && userRole !== 'admin' && userRole !== 'owner') {
        query = `SELECT COUNT(*) as lowStockCount FROM WUSAP.Inventory i 
                 WHERE i.storeID = ${storeID} AND 
                       (i.quantity <= 5 OR 
                        i.quantity < (SELECT AVG(quantity) * 0.2 FROM WUSAP.Inventory WHERE quantity > 0 AND storeID = ${storeID}))`;
      }
      
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result[0] || {})
      );
    });

    // Consulta simplificada para empleados
    const employeesData = await new Promise((resolve, reject) => {
      let query = `SELECT COUNT(*) as employeeCount FROM WUSAP.Employees e WHERE e.isActive = TRUE`;
      
      if (storeID && userRole !== 'admin' && userRole !== 'owner') {
        query = `SELECT COUNT(*) as employeeCount FROM WUSAP.Employees e WHERE e.storeID = ${storeID} AND e.isActive = TRUE`;
      }
      
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result[0] || {})
      );
    });

    return {
      totalSales: parseFloat(salesData.TOTALSALES || 0),
      totalTransactions: parseInt(salesData.TOTALTRANSACTIONS || 0),
      pendingOrders: parseInt(ordersData.PENDINGCOUNT || 0),
      lowStockProducts: parseInt(inventoryData.LOWSTOCKCOUNT || 0),
      activeEmployees: parseInt(employeesData.EMPLOYEECOUNT || 0),
      avgTicket: parseFloat(salesData.AVGTICKET || 0) // Ticket promedio
    };
  } finally {
    pool.release(conn);
  }
};

// Obtener ventas por empleado
export const getSalesByEmployee = async (storeID = null, userRole = null) => {
  const conn = await pool.acquire();
  try {
    // Primero, obtener todos los empleados activos (excluyendo owners)
    let employeeQuery = `SELECT 
      e.employeeID,
      e.name,
      e.lastname,
      e.role,
      e.storeID
     FROM WUSAP.Employees e
     WHERE e.isActive = TRUE AND LOWER(e.role) NOT IN ('owner', 'dueño', 'propietario')`;
     
    if (storeID && userRole !== 'admin' && userRole !== 'owner') {
      employeeQuery += ` AND e.storeID = ${storeID}`;
    }

    const employees = await new Promise((resolve, reject) => {
      conn.exec(employeeQuery, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result || [])
      );
    });

    // Luego, obtener ventas por empleado
    let salesQuery = `SELECT 
      s.employeeID,
      SUM(s.saleTotal) as totalSales,
      COUNT(s.saleID) as salesCount,
      AVG(s.saleTotal) as avgSale
     FROM WUSAP.Sale s
     GROUP BY s.employeeID`;

    const sales = await new Promise((resolve, reject) => {
      conn.exec(salesQuery, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result || [])
      );
    });

    // Combinar datos de empleados con sus ventas
    const result = employees.map(emp => {
      const empSales = sales.find(s => s.EMPLOYEEID === emp.EMPLOYEEID) || {};
      return {
        employeeID: emp.EMPLOYEEID,
        name: emp.NAME,
        lastname: emp.LASTNAME,
        role: emp.ROLE,
        storeID: emp.STOREID,
        totalSales: parseFloat(empSales.TOTALSALES || 0),
        salesCount: parseInt(empSales.SALESCOUNT || 0),
        avgSale: parseFloat(empSales.AVGSALE || 0)
      };
    });

    return result.sort((a, b) => b.totalSales - a.totalSales);
  } finally {
    pool.release(conn);
  }
};

// Obtener productos más vendidos
export const getTopProducts = async (storeID = null, userRole = null) => {
  const conn = await pool.acquire();
  try {
    let query = `SELECT 
      p.productID,
      p.name as productName,
      COALESCE(SUM(si.quantity), 0) as totalQuantitySold
     FROM WUSAP.Products p
     LEFT JOIN WUSAP.Inventory i ON p.productID = i.productID
     LEFT JOIN WUSAP.SaleItems si ON i.inventoryID = si.inventoryID`;
     
    if (storeID && userRole !== 'admin' && userRole !== 'owner') {
      query += ` WHERE i.storeID = ${storeID}`;
    }
    
    query += ` GROUP BY p.productID, p.name ORDER BY totalQuantitySold DESC LIMIT 10`;

    return await new Promise((resolve, reject) => {
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result || [])
      );
    });
  } finally {
    pool.release(conn);
  }
};

// Obtener datos de ventas por día (últimos 7 días)
export const getSalesTimeline = async (storeID = null, userRole = null) => {
  const conn = await pool.acquire();
  try {
    let query = `SELECT 
      s.saleDate as saleDay,
      SUM(s.saleTotal) as dailySales,
      COUNT(s.saleID) as dailyTransactions
     FROM WUSAP.Sale s`;
     
    if (storeID && userRole !== 'admin' && userRole !== 'owner') {
      query += ` JOIN WUSAP.Employees e ON s.employeeID = e.employeeID WHERE e.storeID = ${storeID}`;
    }
    
    query += ` GROUP BY s.saleDate ORDER BY s.saleDate DESC`;

    return await new Promise((resolve, reject) => {
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result || [])
      );
    });
  } finally {
    pool.release(conn);
  }
};

// Obtener estado de órdenes
export const getOrdersStatus = async (storeID = null, userRole = null) => {
  const conn = await pool.acquire();
  try {
    let query = `SELECT 
      o.status,
      COUNT(*) as orderCount
     FROM WUSAP.Orders o`;
     
    if (storeID && userRole !== 'admin' && userRole !== 'owner') {
      query += ` WHERE o.storeID = ${storeID}`;
    }
    
    query += ` GROUP BY o.status ORDER BY orderCount DESC`;

    return await new Promise((resolve, reject) => {
      conn.exec(query, (err, result) => 
        err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result || [])
      );
    });
  } finally {
    pool.release(conn);
  }
};

// Obtener información de la tienda del usuario
export const getStoreInfo = async (storeID) => {
  const conn = await pool.acquire();
  try {
    return await new Promise((resolve, reject) => {
      conn.exec(
        `SELECT 
          l.storeID,
          l.name as storeName,
          l.location,
          COUNT(DISTINCT e.employeeID) as employeeCount,
          COUNT(DISTINCT i.productID) as productCount,
          SUM(i.quantity) as totalInventory
         FROM WUSAP.Locations l
         LEFT JOIN WUSAP.Employees e ON l.storeID = e.storeID AND e.isActive = TRUE
         LEFT JOIN WUSAP.Inventory i ON l.storeID = i.storeID
         WHERE l.storeID = ?
         GROUP BY l.storeID, l.name, l.location`,
        [storeID],
        (err, result) => 
          err ? reject(err instanceof Error ? err : new Error(err)) : resolve(result[0])
      );
    });
  } finally {
    pool.release(conn);
  }
};
