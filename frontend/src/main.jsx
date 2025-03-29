// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AddUser from './pages/admin/AddUser';
import OrdenStatus from './pages/general/OrdenStatus';
import { InventoryDashboard } from './pages/Proveedor/Inventario';
import UserList from './pages/admin/UserList';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/inicio-sesion" element={<Login />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/registrar-usuario" element={<AddUser />} />
        <Route path="/inventario" element={<InventoryDashboard/>} />
        <Route path="/orden-status" element={<OrdenStatus/>} />
        <Route path="/lista-usuarios" element={<UserList />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
