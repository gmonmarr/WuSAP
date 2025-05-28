// src/pages/general/OrdenStatusInfo.jsx

// import React, { useState, useEffect } from "react";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import NavBar from "../../components/Navbar";
import "@ui5/webcomponents/dist/Card";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Icon";
import "@ui5/webcomponents/dist/Avatar";
// Fix: Timeline and TimelineItem are in the fiori package
import "@ui5/webcomponents-fiori/dist/Timeline";
import "@ui5/webcomponents-fiori/dist/TimelineItem";
import "@ui5/webcomponents-icons/dist/shipping-status.js";
import "@ui5/webcomponents-icons/dist/message-success.js";
import "@ui5/webcomponents-icons/dist/request.js";
import "@ui5/webcomponents-icons/dist/status-positive.js";
import "@ui5/webcomponents-icons/dist/status-critical.js";
import "@ui5/webcomponents-icons/dist/status-negative.js";
import { Dialog, DialogTitle, DialogContent, Box, Grid, Typography, List, ListItem, ListItemText, DialogActions, Button } from "@mui/material";

const OrdenStatusInfo = () => {
  const { ordenId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  
  // Mock data - esto vendría de tu API
  // eslint-disable-next-line no-unused-vars
  const [orden, setOrden] = useState({
    id: ordenId || "1",
    numOrden: "N00XXXX",
    estado: "pendiente",
    material: "madera",
    fechaPedido: "02/03/2025",
    cantidad: "32 pz",
    sucursal: "San Nicolás",
    progreso: 75,
    ultimosMovimientos: [
      {
        descripcion: "El pedido N00XXXX está en camino",
        fecha: "05/03/2025",
        estatus: "shipping-status",
        persona: "Sistema"
      },
      {
        descripcion: "Aprobación de solicitud por proveedor Juan Garza",
        fecha: "03/03/2025",
        estatus: "message-success",
        persona: "Juan Garza"
      },
      {
        descripcion: "Creación de solicitud por distribuidor José Pérez",
        fecha: "02/03/2025",
        estatus: "request",
        persona: "José Pérez"
      }
    ]
  });

  // Fases del progreso
  const fases = [
    { label: "Solicitud", valor: 25, color: "#567bff", complete: orden.progreso >= 25 },
    { label: "Aprobación", valor: 25, color: "#3a57e5", complete: orden.progreso >= 50 },
    { label: "Enviado", valor: 25, color: "#2e4bc6", complete: orden.progreso >= 75 },
    { label: "Recibido", valor: 25, color: "#1d377a", complete: orden.progreso === 100 }
  ];

  // Obtener la fase actual basada en el progreso
  const getFaseActual = () => {
    if (orden.progreso < 25) return "Solicitud iniciada";
    if (orden.progreso < 50) return "Solicitud completada";
    if (orden.progreso < 75) return "Aprobación completada";
    if (orden.progreso < 100) return "Envío en proceso";
    return "Orden completada";
  };

  // Estado de la orden para colores
  const getEstadoColor = () => {
    if (orden.progreso === 100) return "#107e3e"; // Verde para completado
    if (orden.progreso >= 50) return "#0a6ed1"; // Azul para en progreso
    return "#6a6d70"; // Gris para estados iniciales
  };

  const [open, setOpen] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "var(--background-primary, #f5f5f5)",
      color: "var(--text-primary, #333)"
    }}>
      <NavBar />
      <Header title={`Orden ${ordenId}`} />
      
      <div style={{ 
        padding: "1.5rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Sección de tarjeta principal con información general */}
        <ui5-card
          style={{ 
            boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))"
          }}
        >
          <div style={{
            padding: "2rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "2rem",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            {/* Lado izquierdo - Datos generales */}
            <div style={{ 
              flex: "1 1 300px",
              paddingRight: "2rem"
            }}>
              <div style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "var(--text-primary, #333)",
                marginBottom: "1.25rem"
              }}>
                Detalles del Pedido
              </div>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                marginBottom: "1.5rem",
                gap: "1rem"
              }}>
                <div style={{
                  background: getEstadoColor(),
                  color: "#fff",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "2rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  display: "inline-block"
                }}>
                  {getFaseActual()}
                </div>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "var(--text-primary, #333)"
                }}>
                  {orden.numOrden}
                </div>
              </div>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr", 
                gap: "1rem 2rem",
                fontSize: "1rem",
                borderTop: "1px solid var(--border-color, #e5e5e5)",
                paddingTop: "1.25rem"
              }}>
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Material:</div>
                <div>{orden.material}</div>
                
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Fecha de pedido:</div>
                <div>{orden.fechaPedido}</div>
                
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Cantidad:</div>
                <div>{orden.cantidad}</div>
                
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Sucursal:</div>
                <div>{orden.sucursal}</div>
              </div>
            </div>
            
            {/* Lado derecho - Círculo de progreso */}
            <div style={{ 
              flex: "0 1 320px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center"
            }}>
              {/* Gráfico circular mejorado */}
              <div style={{ 
                width: "240px", 
                height: "240px", 
                borderRadius: "50%", 
                position: "relative",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 0px 30px rgba(0,0,0,0.05)",
                margin: "0 auto 1.5rem",
              }}>
                {/* Círculo exterior dividido en 4 partes */}
                <div style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: `conic-gradient(
                    ${fases[0].complete ? fases[0].color : "#e0e0e0"} 0% 25%, 
                    ${fases[1].complete ? fases[1].color : "#e0e0e0"} 25% 50%, 
                    ${fases[2].complete ? fases[2].color : "#e0e0e0"} 50% 75%, 
                    ${fases[3].complete ? fases[3].color : "#e0e0e0"} 75% 100%
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
                      PROGRESO
                    </div>
                    <div style={{
                      fontSize: "2.5rem",
                      fontWeight: "600",
                      color: getEstadoColor()
                    }}>
                      {orden.progreso}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Leyenda de fases mejorada */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem 1.5rem",
                width: "100%",
                maxWidth: "300px",
                margin: "0 auto"
              }}>
                {fases.map((fase, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    alignItems: "center"
                  }}>
                    <div style={{ 
                      width: "12px", 
                      height: "12px", 
                      borderRadius: "50%",
                      background: fase.complete ? fase.color : "#e0e0e0",
                      marginRight: "0.5rem",
                      boxShadow: fase.complete ? `0 0 10px ${fase.color}40` : "none"
                    }}></div>
                    <span style={{ 
                      fontSize: "0.875rem", 
                      color: fase.complete ? "#333" : "#777",
                      fontWeight: fase.complete ? "500" : "400"
                    }}>
                      {fase.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ui5-card>
        
        {/* Línea de tiempo con los movimientos de la orden */}
        <ui5-card
          style={{ 
            boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))",
            overflow: "hidden"
          }}
        >
          <div style={{ 
            padding: "1.5rem 2rem",
            borderBottom: "1px solid var(--border-color, #e5e5e5)",
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "var(--text-primary, #333)"
          }}>
            Historial de la Orden
          </div>
          
          <div style={{ padding: "1.5rem 2rem" }}>
            {/* Usando el componente Timeline de UI5 */}
            <ui5-timeline>
              {orden.ultimosMovimientos.map((movimiento, index) => (
                <ui5-timeline-item
                  key={index}
                  icon={movimiento.estatus}
                  title-text={movimiento.descripcion}
                  subtitle-text={`Responsable: ${movimiento.persona}`}
                  time-text={movimiento.fecha}
                ></ui5-timeline-item>
              ))}
            </ui5-timeline>
          </div>
        </ui5-card>
        
        {/* Sección de información adicional */}
        <div style={{ 
          display: "flex", 
          gap: "1.5rem",
          marginTop: "1.5rem",
          flexWrap: "wrap"
        }}>
          {/* Tarjeta de Información adicional */}
          <ui5-card
            style={{ 
              flex: "1 1 300px",
              minHeight: "200px",
              boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))"
            }}
          >
            <div style={{ 
              padding: "1.5rem",
              borderBottom: "1px solid var(--border-color, #e5e5e5)",
              fontSize: "1.125rem",
              fontWeight: "600"
            }}>
              Información Adicional
            </div>
            <div style={{ padding: "1.5rem" }}>
              <p style={{ margin: "0 0 1rem 0", lineHeight: "1.5" }}>
                Esta orden contiene productos de {orden.material} procesados en la sucursal de {orden.sucursal}.
              </p>
              <p style={{ margin: "0", lineHeight: "1.5" }}>
                Para más información sobre el estado de la entrega, contacte con el departamento de logística.
              </p>
            </div>
          </ui5-card>
          
          {/* Tarjeta de Contacto */}
          <ui5-card
            style={{ 
              flex: "1 1 300px",
              minHeight: "200px",
              boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))"
            }}
          >
            <div style={{ 
              padding: "1.5rem",
              borderBottom: "1px solid var(--border-color, #e5e5e5)",
              fontSize: "1.125rem",
              fontWeight: "600"
            }}>
              Contacto
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>Responsable:</div>
                <div>{orden.ultimosMovimientos[0].persona}</div>
              </div>
              <div>
                <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>Sucursal:</div>
                <div>{orden.sucursal}</div>
              </div>
            </div>
          </ui5-card>
        </div>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detalles de la Orden {orden.id}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Orden: {orden.id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" gutterBottom>
                  Fecha: {orden.fechaPedido}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" gutterBottom>
                  Estado: {orden.estado}
                </Typography>
              </Grid>
              {orden.estado === 'delivered' && (
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>
                    Fecha de entrega: {orden.fechaPedido}
                  </Typography>
                </Grid>
              )}
              {orden.estado !== 'delivered' && (
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>
                    Entrega estimada: {orden.fechaPedido}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Productos:
                </Typography>
                <List>
                  {orden.ultimosMovimientos.map((movimiento, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={movimiento.descripcion}
                        secondary={`Responsable: ${movimiento.persona}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Total: ${orden.cantidad.split(' ')[0]}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrdenStatusInfo;