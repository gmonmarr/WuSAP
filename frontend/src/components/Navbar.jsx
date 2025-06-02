// components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css'; 
import { authService } from '../services/api.js';

import "@ui5/webcomponents/dist/Avatar.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents-icons/dist/message-popup.js";
import "@ui5/webcomponents-icons/dist/bell.js";
import "@ui5/webcomponents-icons/dist/menu.js";
import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/add-employee.js";
import "@ui5/webcomponents-icons/dist/group.js";
import "@ui5/webcomponents-icons/dist/business-objects-experience.js";
import "@ui5/webcomponents-icons/dist/cart.js";
import "@ui5/webcomponents-icons/dist/log.js";
import "@ui5/webcomponents-icons/dist/map.js";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Obtener datos del usuario y actualizar las iniciales
    const updateUserInitials = () => {
      const user = authService.getUser();
      if (user && user.name && user.lastName) {
        // Obtener la primera letra del nombre y apellido
        const firstInitial = user.name.charAt(0).toUpperCase();
        const lastInitial = user.lastName.charAt(0).toUpperCase();
        setUserInitials(`${firstInitial}${lastInitial}`);
      } else {
        setUserInitials('');
      }
    };

    updateUserInitials();
    
    // Escuchar eventos de cambio en sessionStorage
    const handleStorageChange = () => {
      updateUserInitials();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUserInitials('');
    navigate('/');
    setSidebarOpen(false);
  };

//Modify the Path Here to the Correct Page

  const navItems = [
    // Owner
    { path: '/tablero', label: 'Owner:Tablero', icon: 'home' },
    // Manager
    { path: '/hacer-pedido', label: 'Manager: Hacer Pedido', icon: 'cart' },
    // Warehouse Manager
    { path: '/productos', label: 'Warehouse Manager: Gestion de Productos', icon: 'business-objects-experience' },
    { path: '/solicitar-material', label: 'Warehouse Manager: Solicitar Material', icon: 'cart' },
    // Owner/Manager/Warehouse Manager
    { path: '/inventario', label: 'Owner/Manager/Warehouse Manager: Estadisticas Inventario', icon: 'map' },
    { path: '/productos-sucursal', label: 'Owner/Manager/Warehouse Manager: Inventario', icon: 'business-objects-experience' },
    { path: '/solicitudes', label: 'Manager/Warehouse Manager: Solicitudes', icon: 'business-objects-experience' },
    { path: '/orden-status', label: 'Owner/Manager/Warehouse Manager: Ordenes de Producción', icon: 'business-objects-experience' },
    // Admin
    { path: '/lista-usuarios', label: 'Admin: Gestionar usuarios', icon: 'group' },
    { path: '/admin', label: 'Admin: Admin View', icon: 'group' },
    { path: '/admin/locations', label: 'Admin:Ubicaciones', icon: 'map' },

    { path: '/historial-pedido', label: 'Removed: Historial de Pedidos ', icon: 'business-objects-experience' },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          <button className="menu-button" onClick={toggleSidebar}>
            <ui5-icon name="menu" class="menu-icon-ui5"></ui5-icon>
            <span className="menu-text">MENÚ</span>
          </button>
        </div>
        <div className="navbar-right">
          <button className="icon-button chat-button">
            <ui5-icon name="message-popup" class="nav-icon"></ui5-icon>
          </button>
          <button className="icon-button notification-button">
            <ui5-icon name="bell" class="nav-icon"></ui5-icon>
          </button>
          <button className="icon-button profile-button" onClick={() => handleNavigation('/perfil')}>
            <ui5-avatar 
              initials={userInitials || "?"}
              size="XS" 
              interactive
              color-scheme="Accent6"
            ></ui5-avatar>
          </button>
        </div>
      </header>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title" onClick={() => handleNavigation('/')}>WuSAP</h2>
        </div>
        <nav className="nav-menu">
          <ul>
            {navItems.map((item, index) => (
              <li 
                key={index} 
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => handleNavigation(item.path)}
              >
                <div className="nav-item">
                  <ui5-icon name={item.icon} class="nav-item-icon"></ui5-icon>
                  <span>{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>
            <ui5-icon name="log" class="nav-item-icon"></ui5-icon>
            <span>Cerrar Sesión</span>
          </button>
        </div>
        
        <div className="sidebar-footer">
          <p>© {currentYear} WuSAP</p>
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Navbar;
