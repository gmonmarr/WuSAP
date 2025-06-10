// controllers/dashboardController.js

import { 
  getDashboardKPIs, 
  getSalesByEmployee, 
  getTopProducts, 
  getSalesTimeline,
  getOrdersStatus,
  getStoreInfo
} from '../services/dashboardService.js';

// Obtener todos los datos del dashboard
export const getDashboardData = async (req, res) => {
  try {
    const userStoreID = req.user.storeID;
    const userRole = req.user.role;

    console.log('Dashboard request from user:', {
      userID: req.user.employeeID,
      storeID: userStoreID,
      role: userRole
    });

    // Obtener todos los datos en paralelo
    const [
      kpis,
      salesByEmployee,
      topProducts,
      salesTimeline,
      ordersStatus,
      storeInfo
    ] = await Promise.all([
      getDashboardKPIs(userStoreID, userRole),
      getSalesByEmployee(userStoreID, userRole),
      getTopProducts(userStoreID, userRole),
      getSalesTimeline(userStoreID, userRole),
      getOrdersStatus(userStoreID, userRole),
      userStoreID ? getStoreInfo(userStoreID) : null
    ]);

    console.log('Dashboard data retrieved:', {
      kpis,
      employeeCount: salesByEmployee?.length || 0,
      topProductsCount: topProducts?.length || 0,
      salesTimelineCount: salesTimeline?.length || 0,
      ordersStatusCount: ordersStatus?.length || 0
    });

    res.status(200).json({
      success: true,
      data: {
        kpis,
        employees: salesByEmployee, // Cambiado el nombre para que coincida con el frontend
        topProducts,
        salesTimeline,
        ordersStatus,
        storeInfo
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Obtener solo KPIs
export const getKPIs = async (req, res) => {
  try {
    const userStoreID = req.user.storeID;
    const userRole = req.user.role;
    
    const kpis = await getDashboardKPIs(userStoreID, userRole);
    
    res.status(200).json({
      success: true,
      data: kpis
    });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Obtener ventas por empleado
export const getEmployeeSales = async (req, res) => {
  try {
    const userStoreID = req.user.storeID;
    const userRole = req.user.role;
    
    const salesByEmployee = await getSalesByEmployee(userStoreID, userRole);
    
    res.status(200).json({
      success: true,
      data: salesByEmployee
    });
  } catch (error) {
    console.error('Error fetching employee sales:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 