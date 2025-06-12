// src/pages/general/OrdenStatus.jsx

import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import NavBar from "../../components/Navbar";
import OrdenStatusCard from "../../components/OrdenStatusCard";
import { orderService, authService } from "../../services/api";
import "@ui5/webcomponents/dist/Card";
import "@ui5/webcomponents/dist/Label";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents-icons/dist/search.js";
import { useNavigate } from "react-router-dom";
import "@ui5/webcomponents/dist/Button";
import "@ui5/webcomponents-icons/dist/detail-view.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import { CircularProgress, Alert, Box } from "@mui/material";

const OrdenStatus = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  // Load user and orders on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = authService.getUser();
        setUser(currentUser);
        
        // Fetch orders with details for current store
        const response = await orderService.getOrdersWithDetailsForStore();
        const ordersData = response.data || [];
        
        // Transform and set orders
        setOrders(ordersData);
        
        // Set first order as selected if available
        if (ordersData.length > 0) {
          setSelectedOrden(ordersData[0]);
        }
        
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Error al cargar las órdenes: ' + (err.response?.data?.details || err.message));
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Function to refresh orders
  const refreshOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrdersWithDetailsForStore();
      const ordersData = response.data || [];
      
      setOrders(ordersData);
      
      // Keep selected order if it still exists, otherwise select first
      if (selectedOrden) {
        const stillExists = ordersData.find(order => order.ORDERID === selectedOrden.ORDERID);
        if (stillExists) {
          setSelectedOrden(stillExists);
        } else if (ordersData.length > 0) {
          setSelectedOrden(ordersData[0]);
        }
      } else if (ordersData.length > 0) {
        setSelectedOrden(ordersData[0]);
      }
      
    } catch (err) {
      console.error('Error refreshing orders:', err);
      setError('Error al actualizar las órdenes: ' + (err.response?.data?.details || err.message));
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrar órdenes basadas en la búsqueda
  const filteredOrdenes = orders.filter(orden => 
    `REQ${orden.ORDERID}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (orden.COMMENTS || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    orden.STATUS.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para obtener el progreso basado en el status
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

  // Función para obtener la fase actual
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

  // Función para obtener color del estado
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

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Agregar esta función para navegación
  const verDetallesOrden = (ordenId) => {
    navigate(`/orden-status/${ordenId}`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column" }}>
        <NavBar />
        <Header title="Orden & Status" />
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

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <Header title="Orden & Status" />
      
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}
      
      <div style={{ 
        padding: "1.5rem", 
        display: "flex", 
        gap: "1.5rem",
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1
      }}>
        {/* Columna izquierda - Buscador y Tarjetas de órdenes */}
        <div style={{ 
          flex: "1", 
          minWidth: "300px",
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 200px)",
          overflow: "hidden"
        }}>
          {/* Buscador y botón refresh */}
          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexShrink: 0 }}>
            <ui5-input
              placeholder="Buscar por número de orden, comentarios o status..."
              value={searchQuery}
              onInput={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1 }}
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
            <ui5-button 
              icon="refresh" 
              design="Emphasized"
              onClick={refreshOrders}
              disabled={loading}
              tooltip="Actualizar órdenes"
            ></ui5-button>
          </div>
          
          {/* Contenedor scrolleable de tarjetas de órdenes */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "8px",
            marginRight: "-8px"
          }}>
            {/* Tarjetas de órdenes */}
            {filteredOrdenes.length > 0 ? (
              filteredOrdenes.map((orden) => (
                <div 
                  key={orden.ORDERID} 
                  onClick={() => setSelectedOrden(orden)}
                  style={{ cursor: "pointer", marginBottom: "0.5rem" }}
                >
                  <OrdenStatusCard
                    ordenNumber={`REQ${orden.ORDERID}`}
                    numOrden={`REQ${orden.ORDERID}`}
                    material={`${orden.ITEMCOUNT} producto(s) - ${orden.STATUS}`}
                    isSelected={selectedOrden && selectedOrden.ORDERID === orden.ORDERID}
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
                {orders.length === 0 ? 'No hay órdenes disponibles' : 'No se encontraron órdenes'}
              </div>
            )}
          </div>
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
          {selectedOrden ? (
            <>
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
                  Progreso de orden REQ{selectedOrden.ORDERID}:
                </h3>
                
                {/* Botón para ver detalles */}
                <ui5-button 
                  icon="detail-view" 
                  design="Transparent"
                  onClick={() => verDetallesOrden(selectedOrden.ORDERID)}
                  tooltip="Ver detalles completos"
                >
                  Ver detalles
                </ui5-button>
              </div>
              
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ 
                  display: "flex", 
                  gap: "2.5rem",
                  alignItems: "stretch",
                  justifyContent: "space-between",
                  padding: "1rem 0",
                  minHeight: "400px"
                }}>
                  {/* Información de la orden a la izquierda */}
                  <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                    minWidth: "320px",
                    justifyContent: "center"
                  }}>
                    {/* Primera fila - Información principal */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem"
                    }}>
                      {/* Tarjeta de Fecha */}
                      <div style={{
                        background: "#f8f9ff",
                        padding: "1.25rem",
                        borderRadius: "12px",
                        border: "1px solid #e1e5ff",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Fecha de Pedido
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
                          {formatDate(selectedOrden.ORDERDATE)}
                        </div>
                      </div>

                      {/* Tarjeta de Total */}
                      <div style={{
                        background: "#f0f9ff",
                        padding: "1.25rem",
                        borderRadius: "12px",
                        border: "1px solid #bae6fd",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Total
                        </div>
                        <div style={{ fontSize: "1.3rem", fontWeight: "700", color: "#0369a1" }}>
                          {formatCurrency(selectedOrden.ORDERTOTAL)}
                        </div>
                      </div>
                    </div>

                    {/* Segunda fila - Estado y productos */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem"
                    }}>
                      {/* Tarjeta de Productos */}
                      <div style={{
                        background: "#f0fdf4",
                        padding: "1.25rem",
                        borderRadius: "12px",
                        border: "1px solid #bbf7d0",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Productos
                        </div>
                        <div style={{ fontSize: "1.1rem", fontWeight: "600", color: "#166534" }}>
                          {selectedOrden.ITEMCOUNT} artículos
                        </div>
                      </div>

                      {/* Tarjeta de Estado */}
                      <div style={{
                        background: getEstadoColor(selectedOrden.STATUS) + "15",
                        padding: "1.25rem",
                        borderRadius: "12px",
                        border: `1px solid ${getEstadoColor(selectedOrden.STATUS)}30`,
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          Estado Actual
                        </div>
                        <div style={{ 
                          fontSize: "1.1rem", 
                          fontWeight: "600", 
                          color: getEstadoColor(selectedOrden.STATUS)
                        }}>
                          {selectedOrden.STATUS}
                        </div>
                      </div>
                    </div>

                    {/* Información adicional en fila completa */}
                    {(selectedOrden.COMMENTS || selectedOrden.LASTUPDATED) && (
                      <div style={{
                        background: "#fafafa",
                        padding: "1.25rem",
                        borderRadius: "12px",
                        border: "1px solid #e5e5e5",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                      }}>
                        {selectedOrden.COMMENTS && selectedOrden.LASTUPDATED ? (
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1.5rem"
                          }}>
                            <div>
                              <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Comentarios
                              </div>
                              <div style={{ fontSize: "0.9rem", color: "#333", lineHeight: "1.4" }}>
                                {selectedOrden.COMMENTS}
                              </div>
                            </div>
                            <div>
                              <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                Última Actualización
                              </div>
                              <div style={{ fontSize: "0.9rem", color: "#333" }}>
                                {formatDate(selectedOrden.LASTUPDATED)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {selectedOrden.COMMENTS && (
                              <>
                                <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  Comentarios
                                </div>
                                <div style={{ fontSize: "0.9rem", color: "#333", lineHeight: "1.4" }}>
                                  {selectedOrden.COMMENTS}
                                </div>
                              </>
                            )}
                            {selectedOrden.LASTUPDATED && (
                              <>
                                <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  Última Actualización
                                </div>
                                <div style={{ fontSize: "0.9rem", color: "#333" }}>
                                  {formatDate(selectedOrden.LASTUPDATED)}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Gráfico circular a la derecha */}
                  <div style={{ 
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <div style={{ 
                      width: "360px", 
                      height: "360px", 
                      borderRadius: "50%", 
                      position: "relative",
                      background: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0px 0px 30px rgba(0,0,0,0.12)"
                    }}>
                      {/* Círculo exterior */}
                      <div style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: `conic-gradient(
                          ${getProgress(selectedOrden.STATUS) >= 25 ? '#567bff' : '#e0e0e0'} 0% 25%, 
                          ${getProgress(selectedOrden.STATUS) >= 50 ? '#3a57e5' : '#e0e0e0'} 25% 50%, 
                          ${getProgress(selectedOrden.STATUS) >= 75 ? '#2e4bc6' : '#e0e0e0'} 50% 75%, 
                          ${getProgress(selectedOrden.STATUS) >= 100 ? '#1d377a' : '#e0e0e0'} 75% 100%
                        )`
                      }}></div>
                      {/* Círculo interior */}
                      <div style={{
                        position: "absolute",
                        width: "70%",
                        height: "70%",
                        borderRadius: "50%",
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "inset 0px 0px 20px rgba(0,0,0,0.06)"
                      }}>
                        <div style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}>
                          <div style={{
                            fontSize: "1.2rem",
                            fontWeight: "500",
                            color: "#666",
                            marginBottom: "0.7rem",
                            letterSpacing: "0.5px"
                          }}>
                            PROGRESO
                          </div>
                          <div style={{
                            fontSize: "3.5rem",
                            fontWeight: "700",
                            color: getEstadoColor(selectedOrden.STATUS),
                            lineHeight: "1"
                          }}>
                            {getProgress(selectedOrden.STATUS)}%
                          </div>
                          <div style={{
                            fontSize: "1rem",
                            color: "#999",
                            textAlign: "center",
                            marginTop: "0.7rem",
                            lineHeight: "1.3",
                            maxWidth: "180px",
                            fontWeight: "500"
                          }}>
                            {getFaseActual(selectedOrden.STATUS)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              color: "#666",
              fontSize: "1.1rem"
            }}>
              Selecciona una orden para ver su progreso
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdenStatus;
