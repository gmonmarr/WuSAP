// components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css'; 

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

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

//Modify the Path Here to the Correct Page

  const navItems = [
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/registrar-usuario', label: 'Registrar usuario', icon: 'add-employee' },
    { path: '/lista-usuarios', label: 'Gestionar usuarios', icon: 'group' },
    { path: '/tablero', label: 'Dashboard', icon: 'business-objects-experience' },
    { path: '/orden-status', label: 'Ordenes de Producción', icon: 'business-objects-experience' },
    { path: '/hacer-pedido', label: 'Hacer Pedido', icon: 'cart' }
  ];

  useEffect(() => {
  }, []);

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
          <button className="icon-button profile-button">
            <ui5-avatar 
              initials="DM"
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
