// src/pages/admin/AdminMain.jsx

import React from 'react';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import './AdminMain.css';

// UI5 WebComponents
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents-icons/dist/menu.js";
import "@ui5/webcomponents-icons/dist/person-placeholder.js";
import "@ui5/webcomponents-icons/dist/map.js";

const AdminMain = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Header title="Panel de Administración" />
      
      <div className="admin-main-container">
        <ui5-card class="admin-card">
          <ui5-card-header
            title-text="Gestión del Sistema"
            subtitle-text="Selecciona una opción para administrar"
            interactive
            slot="header"
          ></ui5-card-header>
          
          <div className="admin-card-content">
            <div className="admin-menu-grid">
              <div className="admin-menu-item" onClick={() => navigate('/lista-usuarios')}>
                <div className="menu-item-icon">
                  <ui5-icon name="person-placeholder" interactive></ui5-icon>
                </div>
                <div className="menu-item-text">
                  <h3>Usuarios</h3>
                  <p>Gestionar usuarios del sistema</p>
                </div>
              </div>
              
              <div className="admin-menu-item" onClick={() => navigate('/admin/locations')}>
                <div className="menu-item-icon">
                  <ui5-icon name="map" interactive></ui5-icon>
                </div>
                <div className="menu-item-text">
                  <h3>Ubicaciones</h3>
                  <p>Gestionar ubicaciones y sucursales</p>
                </div>
              </div>
            </div>
          </div>
        </ui5-card>
      </div>
    </>
  );
};

export default AdminMain;
