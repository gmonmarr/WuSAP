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

1. Clonar el repositorio:
```bash
git clone https://github.com/gmonmarr/WuSAP.git
cd WuSAP
```

2. Instalar dependencias del frontend:
```bash
cd frontend
npm install
```

3. Instalar dependencias del backend:
```bash
cd ../backend
npm install
```

## Configuración

### Frontend
1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Crear un archivo `.env` en la raíz del frontend con las siguientes variables:
```
VITE_API_URL=http://localhost:3000
```

### Backend
1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear un archivo `.env` en la raíz del backend con las siguientes variables:
```
HANA_SERVER_NODE=[ligaHANAapi:443]
HANA_USER=[USUARIOHANA]
HANA_PASSWORD=[CONTRASEÑAHANA]
HANA_SCHEMA=WUSAP

JWT_SECRET=[secretoJWT]
JWT_EXPIRATION=8h
```

## Ejecución del Proyecto

### Frontend
1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Backend
1. Navegar al directorio del backend:
```bash
cd backend
```

2. Iniciar el servidor:
```bash
npm start
```

El backend estará disponible en `http://localhost:3000`

## Estructura del Proyecto

```
WuSAP/
├── backend
│   ├── app.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   └── productController.js
│   ├── db
│   │   └── hanaPool.js
│   ├── middleware
│   │   ├── authMiddleware.js
│   │   ├── handleValidation.js
│   │   ├── logMiddleware.js
│   │   └── validation.js
│   ├── models
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   └── productRoutes.js
│   └── services
│       ├── authService.js
│       ├── inventoryService.js
│       └── productService.js
├── Documentos
│   ├── Documento de Administración.pdf
│   ├── Plan de Pruebas.pdf
│   └── SRS - Documento de Requerimientos con apego en estándares internacionales.pdf
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── components
│   │   │   ├── AvisoPerdidaInfo.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── ListComponent.css
│   │   │   ├── ListComponent.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Navbar.css
│   │   │   ├── Navbar.jsx
│   │   │   ├── OrdenStatusCard.jsx
│   │   │   └── ProductCard.jsx
│   │   ├── hooks
│   │   │   └── useBlocker.jsx
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── admin
│   │   │   │   ├── AddUser.css
│   │   │   │   ├── AddUser.jsx
│   │   │   │   ├── AdminMain.css
│   │   │   │   ├── AdminMain.jsx
│   │   │   │   ├── UserList.css
│   │   │   │   └── UserList.jsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── general
│   │   │   │   ├── DashVentas.txt
│   │   │   │   ├── OrdenStatus.jsx
│   │   │   │   ├── OrdenStatusInfo.jsx
│   │   │   │   ├── OrderHistory.jsx
│   │   │   │   └── OrderPage.jsx
│   │   │   ├── ListaProductos.txt
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Proveedor
│   │   │       ├── Inventario.tsx
│   │   │       ├── OrderProvider.jsx
│   │   │       └── Requests.jsx
│   │   └── services
│   │       └── api.js
│   └── vite.config.js
└── README.md

20 directories, 59 files
```

## Componentes Principales

### Frontend
- **Navbar**: Barra de navegación principal
- **Header**: Encabezado de páginas
- **OrdenStatus**: Seguimiento de estado de órdenes
- **OrderPage**: Gestión de pedidos
- **Requests**: Gestión de solicitudes
- **OrderProvider**: Interfaz para proveedores

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
