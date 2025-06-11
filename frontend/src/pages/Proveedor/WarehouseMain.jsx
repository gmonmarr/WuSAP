import React from 'react';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import './WarehouseMain.css';

// UI5 WebComponents
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents-icons/dist/product.js";
import "@ui5/webcomponents-icons/dist/inventory.js";
import "@ui5/webcomponents-icons/dist/request.js";
import "@ui5/webcomponents-icons/dist/workflow-tasks.js";

const WarehouseMain = () => {
  const navigate = useNavigate();

  const warehouseOptions = [
    {
      path: '/productos',
      title: 'Gestión de Productos',
      description: 'Administrar catálogo de productos',
      icon: 'product'
    },
    {
      path: '/productos-sucursal',
      title: 'Inventario',
      description: 'Control de inventario y stock',
      icon: 'inventory'
    },
    {
      path: '/solicitudes',
      title: 'Solicitudes',
      description: 'Gestionar solicitudes de material',
      icon: 'request'
    },
        {
      path: '/orden-status',
      title: 'Órdenes de Producción',
      description: 'Seguimiento de órdenes',
      icon: 'workflow-tasks'
    }
  ];

  return (
    <>
      <Navbar />
      <Header title="Panel de Gestión de Almacén" />
      
      <div className="warehouse-main-container">
        <ui5-card class="warehouse-card">
          <ui5-card-header
            title-text="Centro de Control de Almacén"
            subtitle-text="Selecciona una opción para gestionar el almacén"
            interactive
            slot="header"
          ></ui5-card-header>
          
          <div className="warehouse-card-content">
            <div className="warehouse-menu-grid">
              {warehouseOptions.map((option, index) => (
                <div 
                  key={index}
                  className="warehouse-menu-item" 
                  onClick={() => navigate(option.path)}
                >
                  <div className="menu-item-icon">
                    <ui5-icon name={option.icon} interactive></ui5-icon>
                  </div>
                  <div className="menu-item-text">
                    <h3>{option.title}</h3>
                    <p>{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ui5-card>
      </div>
    </>
  );
};

export default WarehouseMain; 