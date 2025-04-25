// src/pages/Proveedor/Requests.jsx

import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";

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
  
  // Sample data with updated statuses
  const [requests, setRequests] = useState([
    {
      id: 'REQ001',
      material: 'Tela Algodón',
      quantity: '100 metros',
      requestedBy: 'Área de Producción',
      date: '2024-04-06',
      status: 'in_progress',
      priority: 'alta',
      details: 'Color: Negro, Peso: 150g/m²',
      estimatedDelivery: '2024-04-08'
    },
    {
      id: 'REQ002',
      material: 'Botones',
      quantity: '1000 unidades',
      requestedBy: 'Área de Confección',
      date: '2024-04-06',
      status: 'on_route',
      priority: 'media',
      details: 'Tamaño: 18mm, Color: Plateado',
      estimatedDelivery: '2024-04-07'
    },
    {
      id: 'REQ003',
      material: 'Hilo',
      quantity: '50 carretes',
      requestedBy: 'Área de Producción',
      date: '2024-04-05',
      status: 'delivered',
      priority: 'baja',
      details: 'Color: Blanco, Tipo: Poliéster',
      deliveryDate: '2024-04-06'
    },
    {
      id: 'REQ004',
      material: 'Cierres',
      quantity: '200 unidades',
      requestedBy: 'Área de Confección',
      date: '2024-04-06',
      status: 'in_progress',
      priority: 'alta',
      details: 'Longitud: 20cm, Color: Negro, Tipo: Metal',
      estimatedDelivery: '2024-04-09'
    },
    {
      id: 'REQ005',
      material: 'Tela Mezclilla',
      quantity: '150 metros',
      requestedBy: 'Área de Producción',
      date: '2024-04-05',
      status: 'on_route',
      priority: 'alta',
      details: 'Peso: 14oz, Color: Índigo',
      estimatedDelivery: '2024-04-07'
    },
    {
      id: 'REQ006',
      material: 'Elástico',
      quantity: '300 metros',
      requestedBy: 'Área de Confección',
      date: '2024-04-04',
      status: 'completed',
      priority: 'media',
      details: 'Ancho: 2cm, Color: Blanco'
    },
    {
      id: 'REQ007',
      material: 'Etiquetas',
      quantity: '500 unidades',
      requestedBy: 'Área de Empaque',
      date: '2024-04-06',
      status: 'pending',
      priority: 'baja',
      details: 'Tipo: Tejidas, Tamaño: 3x5cm'
    },
    {
      id: 'REQ008',
      material: 'Agujas',
      quantity: '100 paquetes',
      requestedBy: 'Área de Confección',
      date: '2024-04-05',
      status: 'in_progress',
      priority: 'media',
      details: 'Calibre: 90/14, Tipo: Universal'
    },
    {
      id: 'REQ009',
      material: 'Tela Poliéster',
      quantity: '80 metros',
      requestedBy: 'Área de Producción',
      date: '2024-04-04',
      status: 'returned',
      priority: 'alta',
      details: 'Color incorrecto, se requiere cambio por color azul marino',
      returnReason: 'Error en especificación de color'
    },
    {
      id: 'REQ010',
      material: 'Cremalleras',
      quantity: '300 unidades',
      requestedBy: 'Área de Confección',
      date: '2024-04-03',
      status: 'returned',
      priority: 'media',
      details: 'Tamaño: 15cm, Color: Dorado',
      returnReason: 'Material defectuoso'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: newStatus,
            ...(newStatus === 'delivered' ? { deliveryDate: new Date().toISOString().split('T')[0] } : {})
          }
        : request
    ));
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'on_route':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'returned':
        return 'error';
      case 'pending':
        return 'secondary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'on_route':
        return 'En Ruta';
      case 'in_progress':
        return 'En Proceso';
      case 'returned':
        return 'Devuelto';
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatusFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatusFilter && matchesSearch;
  });

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
                  <ToggleButton value="in_progress">
                    En Proceso
                  </ToggleButton>
                  <ToggleButton value="on_route">
                    En Ruta
                  </ToggleButton>
                  <ToggleButton value="delivered">
                    Entregado
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Box sx={{ 
                width: { xs: '100%', md: '300px' }, 
                mt: { xs: 2, md: 3.5 }
              }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por ID o material..."
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
              {filteredRequests.map((request, index) => (
                <Paper 
                  key={request.id} 
                  elevation={1}
                  sx={{ 
                    mb: 2, 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    borderLeft: `4px solid ${theme.palette[getStatusColor(request.status)].main}`,
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
                            {request.id}
                          </Typography>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                            sx={{ fontWeight: 500, minWidth: '90px', justifyContent: 'center' }}
                          />
                          <Chip
                            label={`Prioridad: ${request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}`}
                            color={request.priority === 'alta' ? 'error' : request.priority === 'media' ? 'warning' : 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body1" component="span" sx={{ fontWeight: 500 }}>
                            {request.material} - {request.quantity}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, md: 3 }, mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Solicitado por:</strong> {request.requestedBy}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Fecha:</strong> {request.date}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color={request.status === 'delivered' ? 'success.main' : 'text.secondary'}
                              sx={{ fontWeight: request.status === 'delivered' ? 500 : 400 }}
                            >
                              {request.status === 'delivered' 
                                ? <><strong>Entregado el:</strong> {request.deliveryDate}</>
                                : <><strong>Entrega estimada:</strong> {request.estimatedDelivery || 'No disponible'}</>}
                            </Typography>
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
                      {request.status === 'in_progress' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          onClick={() => handleStatusChange(request.id, 'on_route')}
                          sx={{ 
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                        >
                          Marcar En Ruta
                        </Button>
                      )}
                      {request.status === 'on_route' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleStatusChange(request.id, 'delivered')}
                          sx={{ 
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 500
                          }}
                        >
                          Marcar Entregado
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleRequestClick(request)}
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
              ))}
              {filteredRequests.length === 0 && (
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
              {filteredRequests.length} solicitudes
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

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        {selectedRequest && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: 2.5
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Detalles de la Solicitud
              </Typography>
              <Chip
                label={getStatusLabel(selectedRequest.status)}
                color={getStatusColor(selectedRequest.status)}
                size="small"
                sx={{ mt: 1 }}
              />
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    {selectedRequest.id} - {selectedRequest.material}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedRequest.quantity}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Solicitado por</Typography>
                  <Typography variant="body1">{selectedRequest.requestedBy}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Fecha de solicitud</Typography>
                  <Typography variant="body1">{selectedRequest.date}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequest.status === 'delivered' ? 'Fecha de entrega' : 'Entrega estimada'}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color={selectedRequest.status === 'delivered' ? 'success.main' : 'inherit'}
                    sx={{ fontWeight: selectedRequest.status === 'delivered' ? 500 : 400 }}
                  >
                    {selectedRequest.status === 'delivered' 
                      ? selectedRequest.deliveryDate 
                      : selectedRequest.estimatedDelivery || 'No disponible'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Detalles adicionales</Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      mt: 1, 
                      backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      borderRadius: '8px' 
                    }}
                  >
                    <Typography variant="body1">{selectedRequest.details}</Typography>
                  </Paper>
                </Grid>
                {selectedRequest.status === 'returned' && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="error">Motivo de retorno</Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mt: 1, 
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        borderColor: 'error.light',
                        borderRadius: '8px' 
                      }}
                    >
                      <Typography variant="body1" color="error.main">{selectedRequest.returnReason}</Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
              {selectedRequest.status === 'in_progress' && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    handleStatusChange(selectedRequest.id, 'on_route');
                    setDetailsOpen(false);
                  }}
                  sx={{ 
                    mr: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Marcar En Ruta
                </Button>
              )}
              {selectedRequest.status === 'on_route' && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    handleStatusChange(selectedRequest.id, 'delivered');
                    setDetailsOpen(false);
                  }}
                  sx={{ 
                    mr: 1,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Marcar Entregado
                </Button>
              )}
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