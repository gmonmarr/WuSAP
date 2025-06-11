// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './config/rolePermissions';
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
import WarehouseMain from './pages/Proveedor/WarehouseMain';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <Router basename="/WuSAP/"> */}
    <Router>
      <Routes>
{/* Rutas públicas */}
        <Route path="/" element={<App />} />
        
        {/* Rutas protegidas - Perfil (cualquier usuario autenticado) */}
        <Route path="/perfil" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        
        {/* Dashboard - Owner, Manager (Sales removed) */}
        <Route path="/tablero" element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.MANAGER]}>
            <DashboardGeneral />
          </ProtectedRoute>
        } />
        
        {/* Pedidos - Manager */}
        <Route path="/hacer-pedido" element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER]}>
            <OrderPage />
          </ProtectedRoute>
        } />
        
        {/* Ventas - Manager, Sales */}
        <Route path="/registrar-ventas" element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.SALES]}>
            <SalesPage />
          </ProtectedRoute>
        } />
        <Route path='/historial-ventas' element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.SALES]}>
            <SalesHistory />
          </ProtectedRoute>
        } />
        
        {/* Warehouse Manager Landing Page */}
        <Route path="/warehouse" element={
          <ProtectedRoute allowedRoles={[ROLES.WAREHOUSE_MANAGER]}>
            <WarehouseMain />
          </ProtectedRoute>
        } />
        
        {/* Productos - Warehouse Manager */}
        <Route path="/productos" element={
          <ProtectedRoute allowedRoles={[ROLES.WAREHOUSE_MANAGER]}>
            <ProductsPage />
          </ProtectedRoute>
        } />
        <Route path='/solicitar-material' element={
          <ProtectedRoute allowedRoles={[ROLES.WAREHOUSE_MANAGER]}>
            <OrderProvider />
          </ProtectedRoute>
        } />
        <Route path='/catalogo-productos' element={
          <ProtectedRoute allowedRoles={[ROLES.WAREHOUSE_MANAGER]}>
            <ProductsPage />
          </ProtectedRoute>
        } />
        
        {/* Inventario - Owner, Manager, Warehouse Manager */}
        <Route path="/inventario" element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]}>
            <InventoryDashboard />
          </ProtectedRoute>
        } />
        <Route path="/productos-sucursal" element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]}>
            <ProductosSucursalPage />
          </ProtectedRoute>
        } />
        <Route path='/solicitudes' element={
          <ProtectedRoute allowedRoles={[ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]}>
            <Requests />
          </ProtectedRoute>
        } />
        <Route path="/orden-status" element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]}>
            <OrdenStatus />
          </ProtectedRoute>
        } />
        <Route path="/orden-status/:ordenId" element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]}>
            <OrdenStatusInfo />
          </ProtectedRoute>
        } />
        <Route path='/alertas' element={
          <ProtectedRoute allowedRoles={[ROLES.OWNER, ROLES.MANAGER, ROLES.WAREHOUSE_MANAGER]}>
            <Alertas />
          </ProtectedRoute>
        } />
        
        {/* Admin - Solo Admin */}
        <Route path="/lista-usuarios" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <UserList />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminMain />
          </ProtectedRoute>
        } />
        <Route path="/admin/locations" element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <Locations />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </React.StrictMode>
);

