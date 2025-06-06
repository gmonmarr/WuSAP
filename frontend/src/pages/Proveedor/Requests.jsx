// src/pages/Proveedor/Requests.jsx

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";
import { orderService, authService } from '../../services/api';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

const Requests = () => {
  const theme = useTheme();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Get user info from token
  const user = authService.getUser();
  const userRole = user?.role;

  // Status transitions based on user role (matching backend validation)
  const getValidTransitions = (currentStatus, userRole) => {
    const transitionsByRole = {
      warehouse_manager: {
        Pendiente: ["Aprobada", "Cancelada"],
        Aprobada: ["Confirmada", "Cancelada", "Entregada"],
        Confirmada: ["Entregada", "Cancelada"]
      },
      manager: {
        Pendiente: ["Cancelada"],
        Aprobada: ["Entregada", "Cancelada"]
      }
    };

    return transitionsByRole[userRole]?.[currentStatus] || [];
  };

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Warehouse managers see all active orders from all stores
      // Regular managers only see their store's orders
      const response = userRole === 'warehouse_manager' 
        ? await orderService.getAllActiveOrders()
        : await orderService.getOrdersByStore();
      
      if (response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Error al cargar las órdenes. Por favor, intente nuevamente.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = async (orderID, newStatus) => {
    try {
      setUpdating(true);
      
      // Find the order to update
      const orderToUpdate = orders.find(order => order.ORDERID === orderID);
      if (!orderToUpdate) {
        throw new Error('Orden no encontrada');
      }

      // Prepare update data
      const updatedOrder = {
        orderTotal: orderToUpdate.ORDERTOTAL,
        status: newStatus,
        comments: orderToUpdate.COMMENTS || ''
      };

      // Get order details to include items
      const orderDetails = await orderService.getOrderById(orderID);
      const rawItems = orderDetails.data.items || [];
      
      // Transform items to match backend expected format (lowercase field names)
      const updatedItems = rawItems.map(item => ({
        orderItemID: item.ORDERITEMID,
        productID: item.PRODUCTID,
        source: item.SOURCE,
        quantity: item.QUANTITY,
        itemTotal: item.ITEMTOTAL
      }));

      // Update order via API
      await orderService.updateOrder(orderID, updatedOrder, updatedItems);
      
      // Reload orders to get updated data
      await loadOrders();
      
      // Close details dialog if open
      if (detailsOpen && selectedOrder?.ORDERID === orderID) {
        setDetailsOpen(false);
      }
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(`Error al actualizar el estado: ${err.response?.data?.message || err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleOrderClick = async (order) => {
    try {
      // Get full order details including items and history
      const response = await orderService.getOrderById(order.ORDERID);
      setSelectedOrder({
        ...order,
        items: response.data.items || [],
        history: response.data.history || []
      });
      setDetailsOpen(true);
    } catch (err) {
      console.error('Error loading order details:', err);
      setError('Error al cargar los detalles de la orden');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregada':
        return 'success';
      case 'Confirmada':
        return 'info';
      case 'Aprobada':
        return 'warning';
      case 'Pendiente':
        return 'secondary';
      case 'Cancelada':
        return 'error';
      default:
        return 'primary';
    }
  };

  // Helper function to safely get border color
  const getBorderColor = (status, theme) => {
    const colorKey = getStatusColor(status);
    try {
      return theme.palette[colorKey]?.main || theme.palette.primary.main;
    } catch {
      return theme.palette.primary.main;
    }
  };

  const getStatusLabel = (status) => {
    return status || 'Sin estado';
  };

  const getPriorityFromComments = (comments) => {
    if (!comments) return 'media';
    const lowerComments = comments.toLowerCase();
    if (lowerComments.includes('urgente') || lowerComments.includes('asap') || lowerComments.includes('prioridad alta')) {
      return 'alta';
    }
    if (lowerComments.includes('baja prioridad') || lowerComments.includes('no urgente')) {
      return 'baja';
    }
    return 'media';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
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

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesStatusFilter = filter === 'all' || order.STATUS === filter;
    const orderIdMatch = `REQ${order.ORDERID}`.toLowerCase().includes(searchTerm.toLowerCase());
    const commentsMatch = (order.COMMENTS || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = orderIdMatch || commentsMatch;
    return matchesStatusFilter && matchesSearch;
  }).sort((a, b) => a.ORDERID - b.ORDERID); // Sort by ORDERID ascending

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: "#f8f9fa",
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <AvisoPerdidaInfo />
        <Navbar />
        <Header title="Solicitudes de Material Activas" />
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <CircularProgress />
        </Box>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: "#f8f9fa",
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title="Solicitudes de Material" />
      <Box sx={{ 
        flex: 1,
        maxWidth: 1600,
        width: "100%",
        margin: "0 auto", 
        padding: "1.5rem 2rem",
        display: "flex",
        flexDirection: "column"
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        <StyledPaper sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 150px)",
          overflow: "hidden"
        }}>
          <Box sx={{ 
            p: { xs: 2, md: 2 }, 
            pt: { xs: 1, md: 1.5 },
            pb: 2,
            borderBottom: '1px solid', 
            borderColor: 'divider' 
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Gestiona las solicitudes de material del almacén
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              gap: 2
            }}>
              <Box sx={{ flex: { md: '1' } }}>
                <Typography variant="subtitle2" gutterBottom sx={{ ml: 0.5 }}>
                  Estado
                </Typography>
                <ToggleButtonGroup
                  value={filter}
                  exclusive
                  onChange={handleFilterChange}
                  aria-label="filtro de estado"
                  size="small"
                  sx={{
                    display: 'flex',
                    width: '100%',
                    '& .MuiToggleButton-root': {
                      flex: 1,
                      borderRadius: '4px !important',
                      mx: 0.2,
                      textTransform: 'none',
                      fontWeight: 500,
                      py: 1,
                    }
                  }}
                >
                  <ToggleButton value="all">
                    Todas
                  </ToggleButton>
                  <ToggleButton value="Pendiente">
                    Pendiente
                  </ToggleButton>
                  <ToggleButton value="Aprobada">
                    Aprobada
                  </ToggleButton>
                  <ToggleButton value="Confirmada">
                    Confirmada
                  </ToggleButton>
                  <ToggleButton value="Entregada">
                    Entregada
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ 
                width: { xs: '100%', md: '300px' }, 
                mt: { xs: 2, md: 3.5 },
                display: 'flex',
                gap: 1
              }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por ID o comentarios..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f9f9f9',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={loadOrders}
                  disabled={loading}
                  sx={{
                    minWidth: '48px',
                    borderRadius: '8px',
                    borderColor: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.dark,
                      backgroundColor: theme.palette.primary.light + '10',
                    }
                  }}
                >
                  <RefreshIcon />
                </Button>
              </Box>
            </Box>
          </Box>

          <Box sx={{ 
            flex: 1,
            overflow: "auto",
            p: "1.5rem 2rem",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
              "&:hover": {
                background: "#666",
              },
            },
          }}>
            <List sx={{ py: 0 }}>
              {filteredOrders.map((order) => {
                const priority = getPriorityFromComments(order.COMMENTS);
                const validTransitions = getValidTransitions(order.STATUS, userRole);
                
                return (
                  <Paper 
                    key={order.ORDERID} 
                    elevation={1}
                    sx={{ 
                      mb: 2, 
                      borderRadius: '8px',
                      overflow: 'hidden',
                      borderLeft: `4px solid ${getBorderColor(order.STATUS, theme)}`,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <ListItem
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                              REQ{order.ORDERID}
                            </Typography>
                            <Chip
                              label={getStatusLabel(order.STATUS)}
                              color={getStatusColor(order.STATUS)}
                              size="small"
                              sx={{ fontWeight: 500, minWidth: '90px', justifyContent: 'center' }}
                            />
                            {priority !== 'media' && (
                              <Chip
                                label={`Prioridad: ${priority.charAt(0).toUpperCase() + priority.slice(1)}`}
                                color={priority === 'alta' ? 'error' : 'default'}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 500 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                              Total: {formatCurrency(order.ORDERTOTAL)}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, md: 3 }, mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Fecha:</strong> {formatDate(order.ORDERDATE)}
                              </Typography>
                              {order.COMMENTS && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Comentarios:</strong> {order.COMMENTS}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: { xs: 2, sm: 0 },
                        ml: { xs: 0, sm: 'auto' },
                        alignSelf: { xs: 'flex-end', sm: 'center' }
                      }}>
                        {validTransitions.map((nextStatus) => (
                          <Button
                            key={nextStatus}
                            size="small"
                            variant={nextStatus === 'Cancelada' ? 'outlined' : 'contained'}
                            color={
                              nextStatus === 'Cancelada' ? 'error' :
                              nextStatus === 'Entregada' ? 'success' :
                              nextStatus === 'Confirmada' ? 'info' :
                              nextStatus === 'Aprobada' ? 'warning' : 'primary'
                            }
                            onClick={() => handleStatusChange(order.ORDERID, nextStatus)}
                            disabled={updating}
                            sx={{ 
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 500,
                              minWidth: '100px'
                            }}
                          >
                            {nextStatus}
                          </Button>
                        ))}
                        <IconButton
                          size="small"
                          onClick={() => handleOrderClick(order)}
                          sx={{ 
                            borderRadius: '8px',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              backgroundColor: 'rgba(25, 118, 210, 0.08)',
                            },
                            ml: 1
                          }}
                        >
                          <ExpandMoreIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </Paper>
                );
              })}
              {filteredOrders.length === 0 && (
                <Box sx={{ 
                  py: 8, 
                  textAlign: 'center', 
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '8px',
                  border: '1px dashed',
                  borderColor: 'divider',
                }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    No se encontraron solicitudes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Intente con otros filtros o términos de búsqueda
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
          
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            px: 1.5,
            py: 0.75,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper"
          }}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: 'text.secondary',
                fontSize: '0.8rem'
              }}
            >
              {filteredOrders.length} solicitudes
            </Typography>
            <Button 
              variant="text" 
              color="primary"
              size="small"
              onClick={() => setFilter('all')}
              sx={{ 
                textTransform: 'none', 
                fontSize: '0.8rem',
                py: 0,
                px: 0.75,
                minWidth: 'auto'
              }}
            >
              Ver todas
            </Button>
          </Box>
        </StyledPaper>
      </Box>

      {/* Order Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 2.5
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Detalles de la Solicitud REQ{selectedOrder.ORDERID}
              </Typography>
              <Chip
                label={getStatusLabel(selectedOrder.STATUS)}
                color={getStatusColor(selectedOrder.STATUS)}
                size="small"
                sx={{ mt: 1 }}
              />
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    REQ{selectedOrder.ORDERID} - Total: {formatCurrency(selectedOrder.ORDERTOTAL)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Fecha de orden</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {formatDate(selectedOrder.ORDERDATE)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Estado actual</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedOrder.STATUS}
                  </Typography>
                </Grid>

                {selectedOrder.COMMENTS && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Comentarios</Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderRadius: '8px' 
                      }}
                    >
                      <Typography variant="body1">{selectedOrder.COMMENTS}</Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Artículos de la orden
                    </Typography>
                    <Paper variant="outlined" sx={{ borderRadius: '8px' }}>
                      {selectedOrder.items.map((item, index) => (
                        <Box 
                          key={item.ORDERITEMID || index}
                          sx={{ 
                            p: 2, 
                            borderBottom: index < selectedOrder.items.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider'
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">Producto ID</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {item.PRODUCTID}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                              <Typography variant="body1">{item.QUANTITY}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">Origen</Typography>
                              <Typography variant="body1">{item.SOURCE}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                              <Typography variant="body2" color="text.secondary">Total</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {formatCurrency(item.ITEMTOTAL)}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}

                {/* Order History */}
                {selectedOrder.history && selectedOrder.history.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      Historial de la orden
                    </Typography>
                    <Paper variant="outlined" sx={{ borderRadius: '8px' }}>
                      {selectedOrder.history.map((historyItem, index) => (
                        <Box 
                          key={historyItem.HISTORYID || index}
                          sx={{ 
                            p: 2, 
                            borderBottom: index < selectedOrder.history.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider'
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">Acción</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {historyItem.ACTION}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">Fecha</Typography>
                              <Typography variant="body1">
                                {formatDate(historyItem.TIMESTAMP)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="text.secondary">Empleado</Typography>
                              <Typography variant="body1">{historyItem.EMPLOYEEID}</Typography>
                            </Grid>
                            {historyItem.COMMENT && (
                              <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">Comentario</Typography>
                                <Typography variant="body1">{historyItem.COMMENT}</Typography>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              {getValidTransitions(selectedOrder.STATUS, userRole).map((nextStatus) => (
                <Button
                  key={nextStatus}
                  variant={nextStatus === 'Cancelada' ? 'outlined' : 'contained'}
                  color={
                    nextStatus === 'Cancelada' ? 'error' :
                    nextStatus === 'Entregada' ? 'success' :
                    nextStatus === 'Confirmada' ? 'info' :
                    nextStatus === 'Aprobada' ? 'warning' : 'primary'
                  }
                  onClick={() => {
                    handleStatusChange(selectedOrder.ORDERID, nextStatus);
                  }}
                  disabled={updating}
                  sx={{ 
                    mr: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Marcar como {nextStatus}
                </Button>
              ))}
              <Button 
                onClick={() => setDetailsOpen(false)}
                sx={{ 
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default Requests; 