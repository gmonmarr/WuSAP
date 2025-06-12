// src/pages/general/OrdenStatusInfo.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import NavBar from "../../components/Navbar";
import { orderService, authService } from "../../services/api";
import "@ui5/webcomponents/dist/Card";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Icon";
import "@ui5/webcomponents/dist/Avatar";
import "@ui5/webcomponents-fiori/dist/Timeline";
import "@ui5/webcomponents-fiori/dist/TimelineItem";
import "@ui5/webcomponents-icons/dist/shipping-status.js";
import "@ui5/webcomponents-icons/dist/message-success.js";
import "@ui5/webcomponents-icons/dist/request.js";
import "@ui5/webcomponents-icons/dist/status-positive.js";
import "@ui5/webcomponents-icons/dist/status-critical.js";
import "@ui5/webcomponents-icons/dist/status-negative.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import { Dialog, DialogTitle, DialogContent, Box, Grid, Typography, List, ListItem, ListItemText, DialogActions, Button, CircularProgress, Alert } from "@mui/material";

const OrdenStatusInfo = () => {
  const { ordenId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  // Load order details on component mount
  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = authService.getUser();
        setUser(currentUser);
        
        if (!ordenId) {
          throw new Error('ID de orden no proporcionado');
        }
        
        // Fetch full order details
        const response = await orderService.getOrderWithFullDetails(ordenId);
        
        if (!response.data || !response.data.order) {
          throw new Error('Orden no encontrada');
        }
        
        setOrden(response.data);
        
      } catch (err) {
        console.error('Error loading order details:', err);
        setError('Error al cargar los detalles de la orden: ' + (err.response?.data?.details || err.message));
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();
  }, [ordenId]);

  // Function to refresh order details
  const refreshOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrderWithFullDetails(ordenId);
      
      if (!response.data || !response.data.order) {
        throw new Error('Orden no encontrada');
      }
      
      setOrden(response.data);
      
    } catch (err) {
      console.error('Error refreshing order details:', err);
      setError('Error al actualizar los detalles: ' + (err.response?.data?.details || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get progress based on status
  const getProgress = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente': return 25;
      case 'aprobada': return 50;
      case 'confirmada': return 75;
      case 'entregada': return 100;
      case 'cancelada': return 0;
      default: return 0;
    }
  };

  // Get current phase
  const getFaseActual = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente': return 'Solicitud Pendiente';
      case 'aprobada': return 'Solicitud Aprobada';
      case 'confirmada': return 'Pedido Confirmado';
      case 'entregada': return 'Orden Completada';
      case 'cancelada': return 'Orden Cancelada';
      default: return 'Estado Desconocido';
    }
  };

  // Get status color
  const getEstadoColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'entregada': return '#107e3e'; // Verde
      case 'confirmada': return '#0a6ed1'; // Azul
      case 'aprobada': return '#e9730c'; // Naranja
      case 'pendiente': return '#6a6d70'; // Gris
      case 'cancelada': return '#bb0000'; // Rojo
      default: return '#6a6d70';
    }
  };

  // Get timeline icon based on action
  const getTimelineIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'created': return 'request';
      case 'updated': return 'shipping-status';
      default: return 'message-success';
    }
  };

  // Get phases
  const getFases = (status) => {
    const progress = getProgress(status);
    return [
      { label: "Solicitud", valor: 25, color: "#567bff", complete: progress >= 25 },
      { label: "Aprobación", valor: 25, color: "#3a57e5", complete: progress >= 50 },
      { label: "Enviado", valor: 25, color: "#2e4bc6", complete: progress >= 75 },
      { label: "Recibido", valor: 25, color: "#1d377a", complete: progress === 100 }
    ];
  };
  // eslint-disable-next-line no-unused-vars
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (loading) {
    return (
      <div style={{ 
        background: "var(--background-primary, #f5f5f5)",
        color: "var(--text-primary, #333)",
        minHeight: "100vh"
      }}>
        <NavBar />
        <Header title={`Orden ${ordenId}`} />
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '300px' 
        }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  if (error || !orden) {
    return (
      <div style={{ 
        background: "var(--background-primary, #f5f5f5)",
        color: "var(--text-primary, #333)",
        minHeight: "100vh"
      }}>
        <NavBar />
        <Header title={`Orden ${ordenId}`} />
        <Box sx={{ p: 2 }}>
          <Alert severity="error">
            {error || 'No se pudieron cargar los detalles de la orden'}
          </Alert>
          <Button 
            onClick={() => navigate('/orden-status')} 
            sx={{ mt: 2 }}
            variant="contained"
          >
            Volver al historial
          </Button>
        </Box>
      </div>
    );
  }

  const fases = getFases(orden.order.STATUS);
  const progreso = getProgress(orden.order.STATUS);

  return (
    <div style={{ 
      background: "var(--background-primary, #f5f5f5)",
      color: "var(--text-primary, #333)",
      overflow: "visible",
      height: "auto"
    }}>
      <NavBar />
      <Header title={`Orden REQ${ordenId}`} />
      
      <div style={{ 
        padding: "1.5rem",
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        paddingBottom: "5rem",
        overflow: "visible",
        height: "auto"
      }}>
        {/* Refresh button */}
        <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "flex-end" }}>
          <ui5-button 
            icon="refresh" 
            design="Emphasized"
            onClick={refreshOrderDetails}
            disabled={loading}
            tooltip="Actualizar detalles"
          >
            Actualizar
          </ui5-button>
        </div>

        {/* Sección de tarjeta principal con información general */}
        <ui5-card
          style={{ 
            boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))",
            marginBottom: "1.5rem"
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
                  background: getEstadoColor(orden.order.STATUS),
                  color: "#fff",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "2rem",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  display: "inline-block"
                }}>
                  {getFaseActual(orden.order.STATUS)}
                </div>
                <div style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "var(--text-primary, #333)"
                }}>
                  REQ{orden.order.ORDERID}
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
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Total:</div>
                <div style={{ fontWeight: "600" }}>{formatCurrency(orden.order.ORDERTOTAL)}</div>
                
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Fecha de pedido:</div>
                <div>{formatDate(orden.order.ORDERDATE)}</div>
                
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Productos:</div>
                <div>{orden.items?.length || 0} artículos</div>
                
                <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Estado:</div>
                <div style={{ color: getEstadoColor(orden.order.STATUS), fontWeight: "600" }}>
                  {orden.order.STATUS}
                </div>

                {orden.order.COMMENTS && (
                  <>
                    <div style={{ fontWeight: "600", color: "var(--text-secondary, #666)" }}>Comentarios:</div>
                    <div>{orden.order.COMMENTS}</div>
                  </>
                )}
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
                      color: getEstadoColor(orden.order.STATUS)
                    }}>
                      {progreso}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Leyenda de fases */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                width: "100%",
                maxWidth: "300px"
              }}>
                {fases.map((fase, index) => (
                  <div key={index} style={{ 
                    display: "flex", 
                    flexDirection: "column",
                    alignItems: "center",
                    fontSize: "0.8rem"
                  }}>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      background: fase.complete ? fase.color : "#e0e0e0",
                      marginBottom: "0.25rem"
                    }}></div>
                    <span style={{ 
                      color: fase.complete ? "#333" : "#999",
                      fontWeight: fase.complete ? "600" : "400"
                    }}>
                      {fase.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ui5-card>

        {/* Productos */}
        {orden.items && orden.items.length > 0 && (
          <ui5-card style={{ 
            marginBottom: "1.5rem",
            boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))"
          }}>
            <div style={{ padding: "1.5rem" }}>
              <ui5-label style={{ 
                fontWeight: "bold", 
                marginBottom: "1rem", 
                display: "block",
                fontSize: "1.1rem",
                color: "#333"
              }}>
                Productos en la Orden:
              </ui5-label>
              <div style={{ 
                display: "grid",
                gap: "1rem"
              }}>
                {orden.items.map((item, index) => (
                  <div key={index} style={{
                    padding: "1rem",
                    background: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0"
                  }}>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "1rem", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: "600", color: "#333" }}>
                          {item.PRODUCTNAME || `Producto ID: ${item.PRODUCTID}`}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>
                          Origen: {item.SOURCE}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>Cantidad</div>
                        <div style={{ fontWeight: "600" }}>{item.QUANTITY} {item.PRODUCTUNIT || 'und'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>Precio Unit.</div>
                        <div>{formatCurrency(item.PRODUCTPRICE || 0)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>Total</div>
                        <div style={{ fontWeight: "600" }}>{formatCurrency(item.ITEMTOTAL)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ui5-card>
        )}

        {/* Timeline de historial */}
        {orden.history && orden.history.length > 0 && (
          <ui5-card style={{ 
            marginBottom: "2rem",
            boxShadow: "var(--card-shadow, 0 1px 4px rgba(0,0,0,0.1))"
          }}>
            <div style={{ padding: "1.5rem" }}>
              <ui5-label style={{ 
                fontWeight: "bold", 
                marginBottom: "1rem", 
                display: "block",
                fontSize: "1.1rem",
                color: "#333"
              }}>
                Historial de la Orden:
              </ui5-label>
              
              <div style={{ 
                width: "100%",
                overflow: "visible"
              }}>
                <ui5-timeline style={{ 
                  width: "100%",
                  height: "auto"
                }}>
                  {orden.history.map((historyItem, index) => (
                    <ui5-timeline-item 
                      key={index}
                      icon={getTimelineIcon(historyItem.ACTION)}
                      title-text={historyItem.ACTION === 'CREATED' ? 'Orden creada' : 'Orden actualizada'}
                      subtitle-text={formatDate(historyItem.TIMESTAMP)}
                    >
                      <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
                        {historyItem.COMMENT && (
                          <div style={{ 
                            fontSize: "0.9rem", 
                            color: "#666",
                            marginBottom: "0.5rem",
                            lineHeight: "1.4"
                          }}>
                            {historyItem.COMMENT}
                          </div>
                        )}
                        {historyItem.EMPLOYEENAME && historyItem.EMPLOYEELASTNAME && (
                          <div style={{ 
                            fontSize: "0.8rem", 
                            color: "#999" 
                          }}>
                            Por: {historyItem.EMPLOYEENAME} {historyItem.EMPLOYEELASTNAME} (ID: {historyItem.EMPLOYEEID})
                          </div>
                        )}
                      </div>
                    </ui5-timeline-item>
                  ))}
                </ui5-timeline>
              </div>
              
              {/* Espacio adicional para asegurar visibilidad */}
              <div style={{ 
                height: "2rem",
                borderTop: "1px solid #e5e5e5", 
                marginTop: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "0.9rem"
              }}>
                ✓ Fin del historial
              </div>
            </div>
          </ui5-card>
        )}
        
        {/* Espaciador final mucho más grande para asegurar scroll completo */}
        <div style={{ 
          height: "8rem", 
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ccc",
          fontSize: "0.8rem"
        }}>
          --- Fin del contenido ---
        </div>
      </div>

      {/* Dialog for product details - Ya no se usa pero mantengo por si acaso */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Producto</DialogTitle>
        <DialogContent>
          <Typography>
            Información detallada del producto seleccionado...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OrdenStatusInfo;