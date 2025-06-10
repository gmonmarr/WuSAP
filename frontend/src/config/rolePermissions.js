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
  '/inicio-sesion': [],
  
  // Rutas que requieren autenticación pero sin restricción de rol específico
  '/perfil': ['authenticated'],
  
  // Dashboard - Owner, Manager (Sales removed)
  '/tablero': [ROLES.OWNER, ROLES.MANAGER],
  
  // Pedidos - Manager
  '/hacer-pedido': [ROLES.MANAGER],
  
  // Ventas - Manager, Sales
  '/registrar-ventas': [ROLES.MANAGER, ROLES.SALES],
  '/historial-ventas': [ROLES.MANAGER, ROLES.SALES],
  
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
    { path: '/tablero', label: 'Tablero', icon: 'home' },
    { path: '/inventario', label: 'Estadísticas Inventario', icon: 'map' },
    { path: '/productos-sucursal', label: 'Inventario', icon: 'business-objects-experience' },
    { path: '/orden-status', label: 'Órdenes de Producción', icon: 'business-objects-experience' },
    { path: '/alertas', label: 'Alertas', icon: 'bell' }
  ],
  
  [ROLES.MANAGER]: [
    { path: '/tablero', label: 'Tablero', icon: 'home' },
    { path: '/hacer-pedido', label: 'Hacer Pedido', icon: 'cart' },
    { path: '/registrar-ventas', label: 'Registrar Ventas', icon: 'cart' },
    { path: '/historial-ventas', label: 'Historial de Ventas', icon: 'business-objects-experience' },
    { path: '/inventario', label: 'Estadísticas Inventario', icon: 'map' },
    { path: '/productos-sucursal', label: 'Inventario', icon: 'business-objects-experience' },
    { path: '/solicitudes', label: 'Solicitudes', icon: 'business-objects-experience' },
    { path: '/orden-status', label: 'Órdenes de Producción', icon: 'business-objects-experience' },
    { path: '/alertas', label: 'Alertas', icon: 'bell' }
  ],
  
  [ROLES.WAREHOUSE_MANAGER]: [
    { path: '/productos', label: 'Gestión de Productos', icon: 'business-objects-experience' },
    { path: '/solicitar-material', label: 'Remove: Solicitar Material', icon: 'cart' },
    { path: '/inventario', label: 'Estadísticas Inventario', icon: 'map' },
    { path: '/productos-sucursal', label: 'Inventario', icon: 'business-objects-experience' },
    { path: '/solicitudes', label: 'Solicitudes', icon: 'business-objects-experience' },
    { path: '/orden-status', label: 'Órdenes de Producción', icon: 'business-objects-experience' },
    { path: '/catalogo-productos', label: 'Catálogo de Productos', icon: 'business-objects-experience' },
  ],
  
  [ROLES.SALES]: [
    { path: '/registrar-ventas', label: 'Registrar Ventas', icon: 'cart' },
    { path: '/historial-ventas', label: 'Historial de Ventas', icon: 'business-objects-experience' }
  ],
  
  [ROLES.ADMIN]: [
    { path: '/lista-usuarios', label: 'Gestionar Usuarios', icon: 'group' },
    { path: '/admin', label: 'Panel Admin', icon: 'group' },
    { path: '/admin/locations', label: 'Ubicaciones', icon: 'map' }
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
    [ROLES.WAREHOUSE_MANAGER]: '/productos-sucursal',
    [ROLES.ADMIN]: '/admin'
  };
  
  return roleRedirects[userRole] || '/tablero';
}; 