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
git clone [URL_DEL_REPOSITORIO]
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
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wusap
JWT_SECRET=tu_secreto_aqui
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
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── general/
│   │   │   └── Proveedor/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
└── README.md
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
- UI5 Web Components
- Vite
- React Router

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para cualquier consulta o sugerencia, por favor contactar al equipo de desarrollo.
