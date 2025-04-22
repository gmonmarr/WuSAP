// src/pages/general/OrdenStatus.jsx

import React, { useState } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/Navbar";
import OrdenStatusCard from "../../components/OrdenStatusCard";
import "@ui5/webcomponents/dist/Card";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents-icons/dist/search.js";
import { useNavigate } from "react-router-dom";
import "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents-icons/dist/detail-view.js";

const OrdenStatus = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      name: 'ORD001',
      date: '2024-04-01',
      status: 'delivered',
      deliveryDate: '2024-04-03',
      products: [
        { name: 'Acero Inoxidable', quantity: 100, unit: 'kg' },
        { name: 'Tornillos Hexagonales', quantity: 500, unit: 'piezas' }
      ],
      total: 15000
    },
    {
      id: 'ORD002',
      name: 'ORD002',
      date: '2024-04-02',
      status: 'on_route',
      estimatedDelivery: '2024-04-04',
      products: [
        { name: 'Alambre de Cobre', quantity: 200, unit: 'metros' },
        { name: 'Pintura Industrial', quantity: 50, unit: 'litros' }
      ],
      total: 12000
    },
    {
      id: 'ORD003',
      name: 'ORD003',
      date: '2024-04-03',
      status: 'in_progress',
      estimatedDelivery: '2024-04-05',
      products: [
        { name: 'Resina Epóxica', quantity: 30, unit: 'kg' },
        { name: 'Tuercas de Seguridad', quantity: 1000, unit: 'piezas' }
      ],
      total: 8000
    },
    {
      id: 'ORD004',
      name: 'ORD004',
      date: '2024-04-04',
      status: 'delivered',
      deliveryDate: '2024-04-06',
      products: [
        { name: 'Acero Inoxidable', quantity: 150, unit: 'kg' },
        { name: 'Pintura Industrial', quantity: 30, unit: 'litros' }
      ],
      total: 11000
    },
    {
      id: 'ORD005',
      name: 'ORD005',
      date: '2024-04-05',
      status: 'on_route',
      estimatedDelivery: '2024-04-07',
      products: [
        { name: 'Tornillos Hexagonales', quantity: 800, unit: 'piezas' },
        { name: 'Alambre de Cobre', quantity: 150, unit: 'metros' }
      ],
      total: 9500
    }
  ]);
  
  const [selectedOrden, setSelectedOrden] = useState(orders[0]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtrar órdenes basadas en la búsqueda
  const filteredOrdenes = orders.filter(orden => 
    orden.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    orden.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agregar esta función para navegación
  const verDetallesOrden = (ordenId) => {
    navigate(`/orden-status/${ordenId}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <NavBar />
      <Header title="Orden & Status" />
      
      <div style={{ 
        padding: "1.5rem", 
        display: "flex", 
        gap: "1.5rem",
        flexDirection: "row",
        flexWrap: "wrap"
      }}>
        {/* Columna izquierda - Buscador y Tarjetas de órdenes */}
        <div style={{ flex: "1", minWidth: "300px" }}>
          {/* Buscador */}
          <div style={{ marginBottom: "1rem" }}>
            <ui5-input
              placeholder="Buscar por número de orden o material..."
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%" }}
              show-clear-icon
            >
              <ui5-icon 
                slot="icon" 
                name="search"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%"
                }}
              ></ui5-icon>
            </ui5-input>
          </div>
          
          {/* Tarjetas de órdenes */}
          {filteredOrdenes.length > 0 ? (
            filteredOrdenes.map((orden) => (
              <div 
                key={orden.id} 
                onClick={() => setSelectedOrden(orden)}
                style={{ cursor: "pointer" }}
              >
                <OrdenStatusCard
                  ordenNumber={orden.id}
                  numOrden={orden.name}
                  material={orden.products.map(p => `${p.name} (${p.quantity} ${p.unit})`).join(', ')}
                  isSelected={selectedOrden.id === orden.id}
                />
              </div>
            ))
          ) : (
            <div style={{ 
              padding: "1rem", 
              textAlign: "center", 
              background: "#fff", 
              borderRadius: "8px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
            }}>
              No se encontraron órdenes
            </div>
          )}
        </div>
        
        {/* Columna derecha - Dashboard de progreso */}
        <div style={{ 
          flex: "2", 
          minWidth: "400px", 
          background: "#fff", 
          borderRadius: "8px",
          padding: "1.5rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              margin: 0,
              color: "#333"
            }}>
              Progreso de orden {selectedOrden.id}:
            </h3>
            
            {/* Nuevo botón para ver detalles */}
            <ui5-button 
              icon="detail-view" 
              design="Transparent"
              onClick={() => verDetallesOrden(selectedOrden.id)}
              tooltip="Ver detalles completos"
            >
              Ver detalles
            </ui5-button>
          </div>
          
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem 0"
            }}>
              {/* Gráfico circular más grande y elegante */}
              <div style={{ 
                width: "280px", 
                height: "280px", 
                borderRadius: "50%", 
                position: "relative",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 0px 20px rgba(0,0,0,0.08)",
                marginBottom: "2rem"
              }}>
                {/* Círculo exterior dividido en 4 partes */}
                <div style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: `conic-gradient(
                    #567bff 0% 25%, 
                    #3a57e5 25% 50%, 
                    #2e4bc6 50% 75%, 
                    #1d377a 75% 100%
                  )`
                }}></div>
                {/* Círculo interior blanco */}
                <div style={{
                  position: "absolute",
                  width: "70%",
                  height: "70%",
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0px 0px 10px rgba(0,0,0,0.03)"
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                  }}>
                    <div style={{
                      fontSize: "1rem",
                      fontWeight: "500",
                      color: "#666",
                      marginBottom: "0.25rem"
                    }}>
                      TOTAL:
                    </div>
                    <div style={{
                      fontSize: "2.25rem",
                      fontWeight: "600",
                      color: "#3f51b5"
                    }}>
                      ${selectedOrden.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda de fases (en lugar de barras de progreso) */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                width: "100%",
                maxWidth: "500px",
                margin: "0 auto"
              }}>
                {[
                  { label: "Fase 1", color: "#567bff" },
                  { label: "Fase 2", color: "#3a57e5" },
                  { label: "Fase 3", color: "#2e4bc6" },
                  { label: "Fase 4", color: "#1d377a" }
                ].map((fase, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center",
                    marginRight: index < 3 ? "1rem" : 0
                  }}>
                    <div style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%",
                      background: fase.color,
                      marginRight: "0.5rem"
                    }}></div>
                    <span style={{ 
                      fontSize: "0.875rem", 
                      color: "#555"
                    }}>
                      {fase.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <ui5-label style={{ 
              fontWeight: "bold", 
              marginBottom: "0.5rem", 
              display: "block",
              fontSize: "1rem",
              color: "#333"
            }}>
              Materiales:
            </ui5-label>
            <div style={{ 
              minHeight: "100px", 
              padding: "0.75rem",
              background: "#f9f9f9",
              borderRadius: "4px",
              color: "#666",
              fontSize: "0.9rem"
            }}>
              {selectedOrden.products.map((product, index) => (
                <div key={index} style={{ marginBottom: "0.5rem" }}>
                  {product.name}: {product.quantity} {product.unit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdenStatus;
