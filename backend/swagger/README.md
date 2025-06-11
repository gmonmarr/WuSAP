# 📚 Documentación Swagger API WuSAP

¡Bienvenido a la documentación completa de la API WuSAP! Esta documentación está organizada por módulos para facilitar la navegación y comprensión.

## 🚀 Acceso Rápido

### URL de Documentación
- **Desarrollo**: `http://localhost:3000/api-docs`

### Características Principales
- ✅ **Documentación Interactiva**: Prueba endpoints directamente desde la interfaz
- ✅ **Autenticación JWT**: Incluye soporte completo para tokens Bearer
- ✅ **Organización por Módulos**: Cada funcionalidad está agrupada por tags
- ✅ **Schemas Reutilizables**: Modelos de datos consistentes
- ✅ **Ejemplos Completos**: Cada endpoint incluye ejemplos detallados
- ✅ **Filtros y Búsqueda**: Encuentra endpoints rápidamente

## 📋 Módulos Disponibles

### 🔐 Authentication
Gestión de usuarios y autenticación JWT
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (Admin)
- `GET /api/auth/verify` - Verificar token

### 📦 Products
Gestión completa de productos
- `GET /api/product` - Listar productos
- `GET /api/product/active` - Productos activos
- `POST /api/product` - Crear producto
- `PUT /api/product/{id}` - Actualizar producto
- `DELETE /api/product/{id}` - Eliminar producto

### 📋 Orders
Gestión de pedidos y órdenes
- `GET /api/orders` - Todas las órdenes
- `GET /api/orders/active` - Órdenes activas
- `GET /api/orders/{id}` - Detalles de orden
- `POST /api/orders` - Crear orden
- `PUT /api/orders/{id}` - Actualizar orden

### 💰 Sales
Registro y gestión de ventas
- `GET /api/sales` - Historial de ventas
- `GET /api/sales/{id}` - Detalles de venta
- `POST /api/sales` - Registrar venta
- `DELETE /api/sales/{id}` - Eliminar venta

### 📊 Dashboard
Métricas y análisis de negocio
- `GET /api/dashboard` - Datos completos del dashboard
- `GET /api/dashboard/kpis` - Indicadores clave
- `GET /api/dashboard/employees` - Rendimiento por empleado

### 📦 Inventory
Control completo de inventario
- `GET /api/inventory` - Todo el inventario del sistema
- `GET /api/inventory/store` - Inventario de la tienda del usuario
- `GET /api/inventory/store/products` - Inventario con detalles de productos
- `GET /api/inventory/warehouse` - Productos del almacén principal
- `GET /api/inventory/by-sandp` - Inventario por tienda y producto
- `POST /api/inventory` - Crear registro de inventario
- `PUT /api/inventory` - Actualizar cantidad de inventario

### 👥 Employees
Gestión de empleados
- `GET /api/employees` - Lista de empleados (Solo Admin)
- `PUT /api/employees/{id}` - Actualizar empleado (Solo Admin)

### 📍 Locations
Gestión completa de ubicaciones y tiendas
- `GET /api/locations` - Lista de ubicaciones (Solo Admin)
- `GET /api/locations/{id}` - Detalles de ubicación
- `POST /api/locations` - Crear ubicación (Solo Admin)
- `PUT /api/locations/{id}` - Actualizar ubicación (Solo Admin)
- `DELETE /api/locations/{id}` - Eliminar ubicación (Solo Admin)
- `GET /api/locations/{id}/employees` - Empleados por ubicación
- `GET /api/locations/check-table` - Verificar estructura de tabla
- `POST /api/locations/create-table` - Crear tabla de ubicaciones

### 🤖 Predictions
Predicciones de ventas con IA
- `GET /api/predicciones` - Obtener predicciones de ventas

### 🔧 Test
Endpoints de prueba y diagnóstico
- `GET /api/test` - Verificar API
- `GET /api/test-hana` - Probar conexión HANA

## 🔑 Autenticación

### Obtener Token JWT
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wusap.com", 
    "password": "tu_password"
  }'
```

### Usar Token en Requests
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer TU_JWT_TOKEN_AQUI"
```

### Configurar en Swagger UI
1. Haz clic en el botón **"Authorize"** 🔒
2. Ingresa: `Bearer TU_JWT_TOKEN_AQUI`
3. Haz clic en **"Authorize"**
4. ¡Ahora puedes probar todos los endpoints protegidos!

## 👥 Roles de Usuario

### Permisos por Rol
- **admin**: Acceso completo a todo el sistema
- **owner**: Acceso completo excepto gestión de usuarios
- **manager**: Gestión operativa completa
- **warehouse_manager**: Gestión de inventario y órdenes
- **sales**: Gestión de ventas y productos

### Endpoints por Rol
```
🔴 Solo Admin: POST /api/auth/register
🟡 Gerencia: GET /api/dashboard/*, GET /api/orders/*
🟢 Ventas: POST /api/sales, GET/POST /api/product
🔵 Todos: GET /api/test, POST /api/auth/login
```

## 📱 Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* Datos específicos */ }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Descripción del error",
  "details": { /* Detalles adicionales */ }
}
```

### Respuesta Paginada
```json
{
  "success": true,
  "data": [ /* Array de elementos */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🛠️ Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Error de validación |
| 401 | Unauthorized | Token inválido/faltante |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email duplicado) |
| 500 | Internal Error | Error del servidor |

## 📝 Ejemplos de Uso

### Crear una Venta Completa
```json
POST /api/sales
{
  "customerId": 1,
  "paymentMethod": "card",
  "notes": "Venta con descuento especial",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "unitPrice": 1299.99
    },
    {
      "productId": 5,
      "quantity": 1,
      "unitPrice": 899.99
    }
  ]
}
```

### Actualizar Estado de Orden
```json
PUT /api/orders/123
{
  "status": "Confirmada",
  "notes": "Orden confirmada y lista para envío",
  "deliveryDate": "2024-01-25T10:30:00Z"
}
```

### Consultar KPIs del Dashboard
```json
GET /api/dashboard/kpis?period=month&compareWithPrevious=true
```

## 🔄 Actualización de Documentación

La documentación se actualiza automáticamente cuando se modifican los archivos en la carpeta `/swagger/docs/`. 

### Estructura de Archivos
```
backend/swagger/
├── swaggerConfig.js      # Configuración principal
└── docs/
    ├── schemas.js        # Modelos de datos
    ├── authEndpoints.js  # Endpoints de autenticación
    ├── productEndpoints.js # Endpoints de productos
    ├── orderEndpoints.js   # Endpoints de órdenes
    ├── salesEndpoints.js   # Endpoints de ventas
    ├── dashboardEndpoints.js # Endpoints de dashboard
    └── otherEndpoints.js   # Otros endpoints
```

## 🆘 Soporte

¿Tienes dudas sobre la API? 
- 📧 Email: support@wusap.com
- 📚 Documentación: [Accede a la documentación interactiva](http://localhost:3000/api-docs)
- 🐛 Reportar bugs: Usa los endpoints de test para diagnóstico

---

**¡Explora, prueba y desarrolla con confianza usando la API WuSAP!** 🚀 