// src/config/rolePermissions.js

// Definición de roles disponibles
export const ROLES = {
  ADMIN: 'admin',
  OWNER: 'owner', 
  MANAGER: 'manager',
  WAREHOUSE_MANAGER: 'warehouse_manager',
  SALES: 'sales'
};

// Configuración de permisos por ruta
export const ROUTE_PERMISSIONS = {
  // Rutas públicas (no requieren autenticación)
  '/': [],
  
  // Rutas que requieren autenticación pero sin restricción de rol específico
  '/perfil': ['authenticated'],
  
  // Dashboard - Owner, Manager (Sales removed)
  '/tablero': [ROLES.OWNER, ROLES.MANAGER],
  
  // Pedidos - Manager
  '/hacer-pedido': [ROLES.MANAGER],
  
  // Ventas - Manager, Sales
  '/registrar-ventas': [ROLES.MANAGER, ROLES.SALES],
  '/historial-ventas': [ROLES.MANAGER, ROLES.SALES],
  
  // Warehouse Manager Landing Page
  '/warehouse': [ROLES.WAREHOUSE_MANAGER],
  
  // Productos - Warehouse Manager
  '/productos': [ROLES.WAREHOUSE_MANAGER],
  '/solicitar-material': [ROLES.WAREHOUSE_MANAGER],
  
  // Inventario - Owner, Manager, Warehouse Manager
  '/inventario': [ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER],
  '/productos-sucursal': [ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER],
  '/solicitudes': [ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER],
  '/orden-status': [ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER],
  '/orden-status/:ordenId': [ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER],
  
  // Admin - Solo Admin
  '/lista-usuarios': [ROLES.ADMIN],
  '/admin': [ROLES.ADMIN],
  '/admin/locations': [ROLES.ADMIN],
  
  // Otras rutas
  '/catalogo-productos': [ROLES.WAREHOUSE_MANAGER],
  '/alertas': [ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]
};

// Configuración de navegación por rol
export const NAVIGATION_BY_ROLE = {
  [ROLES.OWNER]: [
    { path: '/tablero', label: 'Tablero', icon: 'grid' },
    { path: '/productos-sucursal', label: 'Inventario', icon: 'inventory' },
    { path: '/orden-status', label: 'Órdenes de Producción', icon: 'order-status' },
    { path: '/alertas', label: 'Alertas', icon: 'alert' }
  ],
  
  [ROLES.MANAGER]: [
    { path: '/tablero', label: 'Tablero', icon: 'grid' },
    { path: '/productos-sucursal', label: 'Inventario', icon: 'inventory' },
    { path: '/hacer-pedido', label: 'Hacer Pedido', icon: 'basket' },
    { path: '/orden-status', label: 'Órdenes de Producción', icon: 'order-status' },
    { path: '/solicitudes', label: 'Solicitudes', icon: 'request' },
    { path: '/registrar-ventas', label: 'Registrar Ventas', icon: 'sales-document' },
    { path: '/historial-ventas', label: 'Historial de Ventas', icon: 'trend-up' },
    { path: '/alertas', label: 'Alertas', icon: 'alert' }
  ],
  
  [ROLES.WAREHOUSE_MANAGER]: [
    { path: '/warehouse', label: 'Panel de Almacén', icon: 'building' },
    { path: '/productos', label: 'Gestión de Productos', icon: 'product' },
    { path: '/productos-sucursal', label: 'Inventario', icon: 'inventory' },
    { path: '/solicitudes', label: 'Solicitudes', icon: 'request' },
    { path: '/orden-status', label: 'Órdenes de Producción', icon: 'workflow-tasks' },
  ],
  
  [ROLES.SALES]: [
    { path: '/registrar-ventas', label: 'Registrar Ventas', icon: 'sales-document' },
    { path: '/historial-ventas', label: 'Historial de Ventas', icon: 'monitor-payments' }
  ],
  
  [ROLES.ADMIN]: [
    { path: '/admin', label: 'Panel Admin', icon: 'manager' },
    { path: '/lista-usuarios', label: 'Gestionar Usuarios', icon: 'group' },
    { path: '/admin/locations', label: 'Ubicaciones', icon: 'building' }
  ]
};

// Función helper para verificar permisos
export const hasPermission = (userRole, route) => {
  const permissions = ROUTE_PERMISSIONS[route];
  
  if (!permissions) {
    // Si la ruta no está definida, denegar acceso por defecto
    return false;
  }
  
  if (permissions.length === 0) {
    // Ruta pública
    return true;
  }
  
  if (permissions.includes('authenticated')) {
    // Solo requiere estar autenticado
    return !!userRole;
  }
  
  // Verificar rol específico
  return permissions.includes(userRole);
};

// Función helper para obtener navegación por rol
export const getNavigationForRole = (userRole) => {
  return NAVIGATION_BY_ROLE[userRole] || [];
};

// Función helper para obtener la página de inicio por rol
export const getDefaultPageForRole = (userRole) => {
  const roleRedirects = {
    [ROLES.OWNER]: '/tablero',
    [ROLES.MANAGER]: '/tablero', 
    [ROLES.SALES]: '/registrar-ventas',
    [ROLES.WAREHOUSE_MANAGER]: '/warehouse',
    [ROLES.ADMIN]: '/admin'
  };
  
  return roleRedirects[userRole] || '/tablero';
}; 