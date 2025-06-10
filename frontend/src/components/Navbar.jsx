// components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css'; 
import { authService } from '../services/api.js';
import { getNavigationForRole } from '../config/rolePermissions.js';

import "@ui5/webcomponents/dist/Avatar.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents-icons/dist/discussion-2.js";
import "@ui5/webcomponents-icons/dist/alert.js";
import "@ui5/webcomponents-icons/dist/menu.js";
import "@ui5/webcomponents-icons/dist/grid.js";
import "@ui5/webcomponents-icons/dist/add-employee.js";
import "@ui5/webcomponents-icons/dist/group.js";
import "@ui5/webcomponents-icons/dist/product.js";
import "@ui5/webcomponents-icons/dist/basket.js";
import "@ui5/webcomponents-icons/dist/log.js";
import "@ui5/webcomponents-icons/dist/locate-me.js";
import "@ui5/webcomponents-icons/dist/order-status.js";
import "@ui5/webcomponents-icons/dist/inventory.js";
import "@ui5/webcomponents-icons/dist/sales-document.js";
import "@ui5/webcomponents-icons/dist/request.js";
import "@ui5/webcomponents-icons/dist/filter.js";
import "@ui5/webcomponents-icons/dist/trend-up.js";
import "@ui5/webcomponents-icons/dist/workflow-tasks.js";
import "@ui5/webcomponents-icons/dist/monitor-payments.js";
import "@ui5/webcomponents-icons/dist/shipping-status.js";
import "@ui5/webcomponents-icons/dist/manager.js";
import "@ui5/webcomponents-icons/dist/building.js";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('');
  const [navItems, setNavItems] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Obtener datos del usuario y actualizar las iniciales y navegación
    const updateUserData = () => {
      const user = authService.getUser();
      if (user && user.name && user.lastName) {
        // Obtener la primera letra del nombre y apellido
        const firstInitial = user.name.charAt(0).toUpperCase();
        const lastInitial = user.lastName.charAt(0).toUpperCase();
        setUserInitials(`${firstInitial}${lastInitial}`);
        
        // Obtener elementos de navegación basados en el rol
        const userNavItems = getNavigationForRole(user.role);
        setNavItems(userNavItems);
      } else {
        setUserInitials('');
        setNavItems([]);
      }
    };

    updateUserData();
    
    // Escuchar eventos de cambio en localStorage
    const handleStorageChange = () => {
      updateUserData();
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

// Navigation items are now loaded dynamically based on user role

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
            <ui5-icon name="discussion-2" class="nav-icon"></ui5-icon>
          </button>
          <button className="icon-button notification-button">
            <ui5-icon name="alert" class="nav-icon"></ui5-icon>
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
