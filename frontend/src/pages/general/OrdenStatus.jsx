import React, { useState } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/NavBar";
import OrdenStatusCard from "../../components/OrdenStatusCard";
import "@ui5/webcomponents/dist/Card";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents-icons/dist/search.js";

const OrdenStatus = () => {
  const [ordenes] = useState([
    {
      id: 1,
      numOrden: "# NI1937",
      material: "Material1",
      progreso: 100
    },
    {
      id: 2,
      numOrden: "# NI1821",
      material: "Material2",
      progreso: 75
    },
    {
      id: 3,
      numOrden: "# NI2342",
      material: "Material3",
      progreso: 50
    }
  ]);
  
  const [selectedOrden, setSelectedOrden] = useState(ordenes[0]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filtrar órdenes basadas en la búsqueda
  const filteredOrdenes = ordenes.filter(orden => 
    orden.numOrden.toLowerCase().includes(searchQuery.toLowerCase()) ||
    orden.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
    orden.id.toString().includes(searchQuery)
  );

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
                  numOrden={orden.numOrden}
                  material={orden.material}
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
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ 
              fontSize: "1.25rem", 
              margin: "0 0 1.5rem 0",
              color: "#333"
            }}>
              Progreso de orden{selectedOrden.id}:
            </h3>
            
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
                      {selectedOrden.progreso}%
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
              Comentarios:
            </ui5-label>
            <div style={{ 
              minHeight: "100px", 
              padding: "0.75rem",
              background: "#f9f9f9",
              borderRadius: "4px",
              color: "#666",
              fontSize: "0.9rem"
            }}>
              {selectedOrden.id === 1 ? 
                "La orden está completa y lista para entrega." : 
                selectedOrden.id === 2 ? 
                "Progreso al 75%. En espera de materiales adicionales." : 
                "Iniciando proceso de producción. Avance del 50%."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdenStatus;
