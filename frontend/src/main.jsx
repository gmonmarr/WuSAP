// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Profile from './pages/Profile';
import OrdenStatus from './pages/general/OrdenStatus';
import { InventoryDashboard } from './pages/Proveedor/Inventario';
import UserList from './pages/admin/UserList';
import { DashboardGeneral } from './pages/Dashboard';
import OrderPage from './pages/general/OrderPage';
import SalesPage from './pages/general/SalesPage';
import OrdenStatusInfo from './pages/general/OrdenStatusInfo';
import AdminMain from './pages/admin/AdminMain';
import Locations from './pages/admin/Locations';
// import { ProductCatalog } from './pages/ListaProductos';
import SalesHistory from './pages/general/SalesHistory';
import Requests from './pages/Proveedor/Requests';
import OrderProvider from './pages/Proveedor/OrderProvider';
import ProductsPage from './pages/general/ProductsPage';
import ProductosSucursalPage from './pages/general/ProductosSucursalPage';
import Alertas from './pages/general/Alertas';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <Router basename="/WuSAP/"> */}
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/inicio-sesion" element={<Login />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/inventario" element={<InventoryDashboard/>} />
        <Route path="/orden-status" element={<OrdenStatus/>} />
        <Route path="/lista-usuarios" element={<UserList />} />
        <Route path="/tablero" element={<DashboardGeneral />}/>
        <Route path="/hacer-pedido" element={<OrderPage />}/>
        <Route path="/registrar-ventas" element={<SalesPage />}/>
        <Route path="/orden-status/:ordenId" element={<OrdenStatusInfo />} />
        <Route path="/admin" element={<AdminMain />} />
        <Route path="/admin/locations" element={<Locations />} />
        <Route path="/productos" element={<ProductsPage />} />
        <Route path="/productos-sucursal" element={<ProductosSucursalPage />} />
        {/*<Route path='/lista-productos' element={<ProductCatalog/>} />*/}
                  <Route path='/historial-ventas' element={<SalesHistory/>} />
        <Route path='/solicitudes' element={<Requests/>} />
        <Route path='/solicitar-material' element={<OrderProvider/>} />
        <Route path='/catalogo-productos' element={<ProductsPage/>} />
        <Route path='/alertas' element={<Alertas/>} />
      </Routes>
    </Router>
  </React.StrictMode>
);

