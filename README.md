# WuSAP - Sistema de Gestión de Materiales

WuSAP es un sistema de gestión de materiales diseñado para facilitar el seguimiento y control de pedidos, solicitudes y estado de órdenes en un entorno industrial.

## Características Principales

- **Gestión de Pedidos**: Creación y seguimiento de pedidos de materiales
- **Solicitudes de Material**: Sistema para solicitar materiales internamente
- **Estado de Órdenes**: Seguimiento en tiempo real del estado de las órdenes
- **Gestión de Proveedores**: Interfaz para proveedores con seguimiento de pedidos
- **Dashboard**: Visualización de estadísticas y estado general

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- Git

## Instalación

Clonar el repositorio:
```bash
git clone https://github.com/gmonmarr/WuSAP.git
cd WuSAP
```

### Frontend
1. Instalar dependencias del frontend
```bash
cd frontend
npm install
```

2. Crear archivo .env
```bash
VITE_API_SERVER=http://localhost:3000
```

3. Correr
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Backend

1. Instalar dependencias del backend
```bash
cd /backend
npm install
pip install -r requirements.txt
```

2. Crear el .env
```bash
HANA_SERVER_NODE=
HANA_USER=
HANA_PASSWORD=
HANA_SCHEMA=
CORS_ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=
JWT_EXPIRATION=
```

3. Correr
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`


## Estructura del Proyecto

```
WuSAP
├── backend
│   ├── app.js
│   ├── babel.config.cjs
│   ├── controllers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── employeeController.js
│   │   ├── inventoryController.js
│   │   ├── locationController.js
│   │   ├── orderController.js
│   │   ├── prediccionController.js
│   │   ├── productController.js
│   │   ├── salesController.js
│   │   └── tableLogController.js
│   ├── coverage
│   │   ├── cobertura-coverage.xml
│   │   ├── lcov-report
│   │   │   ├── base.css
│   │   │   ├── block-navigation.js
│   │   │   ├── db
│   │   │   │   ├── hanaPool.js.html
│   │   │   │   └── index.html
│   │   │   ├── favicon.png
│   │   │   ├── index.html
│   │   │   ├── prettify.css
│   │   │   ├── prettify.js
│   │   │   ├── services
│   │   │   │   ├── authService.js.html
│   │   │   │   ├── employeeService.js.html
│   │   │   │   ├── index.html
│   │   │   │   ├── inventoryService.js.html
│   │   │   │   ├── locationService.js.html
│   │   │   │   ├── orderService.js.html
│   │   │   │   ├── productService.js.html
│   │   │   │   ├── salesService.js.html
│   │   │   │   └── tableLogService.js.html
│   │   │   ├── sort-arrow-sprite.png
│   │   │   └── sorter.js
│   │   └── lcov.info
│   ├── db
│   │   └── hanaPool.js
│   ├── eslint.config.js
│   ├── jest-to-csv.js
│   ├── jest.config.cjs
│   ├── manifest.yml
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   ├── handleValidation.js
│   │   ├── logMiddleware.js
│   │   └── validation.js
│   ├── package-lock.json
│   ├── package.json
│   ├── requirements.txt
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── prediccionRoutes.js
│   │   ├── productRoutes.js
│   │   └── salesRoutes.js
│   ├── sales_predictor.joblib
│   ├── scripts
│   │   ├── inserts.py
│   │   ├── predicciones.py
│   │   └── sales_predictor.joblib
│   ├── services
│   │   ├── authService.js
│   │   ├── dashboardService.js
│   │   ├── employeeService.js
│   │   ├── inventoryService.js
│   │   ├── locationService.js
│   │   ├── orderService.js
│   │   ├── productService.js
│   │   ├── salesService.js
│   │   └── tableLogService.js
│   ├── swagger
│   │   ├── docs
│   │   │   ├── authEndpoints.js
│   │   │   ├── dashboardEndpoints.js
│   │   │   ├── orderEndpoints.js
│   │   │   ├── otherEndpoints.js
│   │   │   ├── productEndpoints.js
│   │   │   ├── salesEndpoints.js
│   │   │   └── schemas.js
│   │   ├── README.md
│   │   └── swaggerConfig.js
│   └── tests
│       ├── authService.test.js
│       ├── createOrder.test.js
│       ├── employeeService.test.js
│       ├── inventoryService.test.js
│       ├── locationService.test.js
│       ├── orderService.test.js
│       ├── productService.test.js
│       ├── salesService.test.js
│       ├── tableLogService.test.js
│       └── updateOrder.test.js
├── Documentos
│   ├── Documento de Administración.pdf
│   ├── Plan de Pruebas.pdf
│   ├── SRS - Documento de Requerimientos con apego en estándares internacionales.pdf
│   └── WUSAPschema.sql
├── frontend
│   ├── babel.config.cjs
│   ├── eslint.config.js
│   ├── index.html
│   ├── jest-css-stub.js
│   ├── jest.config.mjs
│   ├── manifest.yml
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── __tests__
│   │   │   │   └── ProductCard.test.jsx
│   │   │   ├── AvisoPerdidaInfo.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ListComponent.css
│   │   │   ├── ListComponent.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Navbar.jsx
│   │   │   ├── OrdenStatusCard.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── config
│   │   │   └── rolePermissions.js
│   │   ├── hooks
│   │   │   └── useBlocker.jsx
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── admin
│   │   │   │   ├── AdminMain.css
│   │   │   │   ├── AdminMain.jsx
│   │   │   │   ├── Locations.jsx
│   │   │   │   ├── UserList.css
│   │   │   │   └── UserList.jsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── general
│   │   │   │   ├── Alertas.jsx
│   │   │   │   ├── OrdenStatus.jsx
│   │   │   │   ├── OrdenStatusInfo.jsx
│   │   │   │   ├── OrderPage.jsx
│   │   │   │   ├── ProductosSucursalPage.jsx
│   │   │   │   ├── ProductsPage.jsx
│   │   │   │   ├── SalesHistory.jsx
│   │   │   │   └── SalesPage.jsx
│   │   │   ├── ListaProductos.txt
│   │   │   ├── Login.jsx
│   │   │   ├── Login.test.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Proveedor
│   │   │       ├── Inventario.tsx
│   │   │       ├── Requests.jsx
│   │   │       ├── WarehouseMain.css
│   │   │       └── WarehouseMain.jsx
│   │   ├── services
│   │   │   └── api.js
│   │   ├── setupTests.js
│   │   └── vite-env.d.ts
│   ├── tests
│   │   ├── admin_navigation.py
│   │   ├── store_manager_navigation.py
│   │   └── warehouse_manager_navigation.py
│   └── vite.config.js
└── README.md

28 directories, 145 files
```

## Componentes Principales

### Frontend
- **Navbar**: Barra de navegación principal
- **Header**: Encabezado de páginas
- **OrdenStatus**: Seguimiento de estado de órdenes
- **OrderPage**: Gestión de pedidos
- **Requests**: Gestión de solicitudes


### Backend
- **AuthController**: Manejo de autenticación
- **OrderController**: Gestión de órdenes
- **RequestController**: Gestión de solicitudes
- **UserController**: Gestión de usuarios

## Tecnologías Utilizadas

### Frontend
- React
- Material-UI
- SAP UI5
- Vite
- React Router

### Backend
- Node.js
- Express
- SAP HANA
- JWT
