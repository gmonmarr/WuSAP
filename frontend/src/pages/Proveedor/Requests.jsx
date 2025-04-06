// src/pages/Proveedor/Requests.jsx

import React, { useState } from 'react';
import {
  Container,
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
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';

const Requests = () => {
  // Sample data - replace with API call
  const [requests, setRequests] = useState([
    {
      id: 'REQ001',
      material: 'Tela Algodón',
      quantity: '100 metros',
      requestedBy: 'Área de Producción',
      date: '2024-04-06',
      status: 'pending',
      priority: 'alta',
      details: 'Color: Negro, Peso: 150g/m²'
    },
    {
      id: 'REQ002',
      material: 'Botones',
      quantity: '1000 unidades',
      requestedBy: 'Área de Confección',
      date: '2024-04-06',
      status: 'in_progress',
      priority: 'media',
      details: 'Tamaño: 18mm, Color: Plateado'
    },
    {
      id: 'REQ003',
      material: 'Hilo',
      quantity: '50 carretes',
      requestedBy: 'Área de Producción',
      date: '2024-04-05',
      status: 'completed',
      priority: 'baja',
      details: 'Color: Blanco, Tipo: Poliéster'
    },
    {
      id: 'REQ004',
      material: 'Cierres',
      quantity: '200 unidades',
      requestedBy: 'Área de Confección',
      date: '2024-04-06',
      status: 'pending',
      priority: 'alta',
      details: 'Longitud: 20cm, Color: Negro, Tipo: Metal'
    },
    {
      id: 'REQ005',
      material: 'Tela Mezclilla',
      quantity: '150 metros',
      requestedBy: 'Área de Producción',
      date: '2024-04-05',
      status: 'in_progress',
      priority: 'alta',
      details: 'Peso: 14oz, Color: Índigo'
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
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const handlePriorityFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setPriorityFilter(newFilter);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, status: newStatus }
        : request
    ));
  };

  const handleRequestClick = (request) => {
    setSelectedRequest(request);
    setDetailsOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'info';
      case 'returned':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En Proceso';
      case 'pending':
        return 'Pendiente';
      case 'returned':
        return 'Retornado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baja':
        return 'success';
      default:
        return 'default';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatusFilter = filter === 'all' || request.status === filter;
    const matchesPriorityFilter = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesSearch = request.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatusFilter && matchesPriorityFilter && matchesSearch;
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Navbar />
      <Header title="Solicitudes de Material" />
      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: 'calc(100vh - 180px)', // Adjust for navbar and header
            overflow: 'hidden'
          }}
        >
          <Box sx={{ mb: 4, flexShrink: 0 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2C3E73', fontWeight: 600 }}>
              Solicitudes de Material
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Gestiona las solicitudes de material del almacén
            </Typography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom sx={{ ml: 0.5 }}>
                  Buscar
                </Typography>
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
                      borderRadius: 2,
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
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
                      flexWrap: 'wrap',
                      '& .MuiToggleButton-root': {
                        flex: '1 0 auto',
                        borderRadius: '4px !important',
                        mx: 0.2,
                        px: 2,
                        py: 0.5,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          backgroundColor: theme => theme.palette.primary.main,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme => theme.palette.primary.dark,
                          }
                        }
                      }
                    }}
                  >
                    <ToggleButton value="all">
                      Todas
                    </ToggleButton>
                    <ToggleButton value="pending">
                      Pendientes
                    </ToggleButton>
                    <ToggleButton value="in_progress">
                      En Proceso
                    </ToggleButton>
                    <ToggleButton value="completed">
                      Completadas
                    </ToggleButton>
                    <ToggleButton value="returned">
                      Retornadas
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ ml: 0.5 }}>
                    Prioridad
                  </Typography>
                  <ToggleButtonGroup
                    value={priorityFilter}
                    exclusive
                    onChange={handlePriorityFilterChange}
                    aria-label="filtro de prioridad"
                    size="small"
                    sx={{
                      display: 'flex',
                      '& .MuiToggleButton-root': {
                        flex: 1,
                        borderRadius: '4px !important',
                        mx: 0.2,
                        textTransform: 'none',
                        '&.Mui-selected': {
                          color: 'white',
                          '&[value="alta"]': {
                            backgroundColor: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.dark',
                            }
                          },
                          '&[value="media"]': {
                            backgroundColor: 'warning.main',
                            '&:hover': {
                              backgroundColor: 'warning.dark',
                            }
                          },
                          '&[value="baja"]': {
                            backgroundColor: 'success.main',
                            '&:hover': {
                              backgroundColor: 'success.dark',
                            }
                          },
                          '&[value="all"]': {
                            backgroundColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'primary.dark',
                            }
                          }
                        }
                      }
                    }}
                  >
                    <ToggleButton value="all">
                      Todas
                    </ToggleButton>
                    <ToggleButton value="alta">
                      Alta
                    </ToggleButton>
                    <ToggleButton value="media">
                      Media
                    </ToggleButton>
                    <ToggleButton value="baja">
                      Baja
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ 
            flex: 1,
            overflow: 'auto',
            minHeight: 0,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.3)',
              },
            },
          }}>
            <List sx={{ py: 0 }}>
              {filteredRequests.map((request, index) => (
                <React.Fragment key={request.id}>
                  <ListItem
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                            {request.id}
                          </Typography>
                          <Chip
                            label={getStatusLabel(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                          <Chip
                            label={`Prioridad ${request.priority}`}
                            color={getPriorityColor(request.priority)}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" component="span">
                            {request.material} - {request.quantity}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Solicitado por: {request.requestedBy} | Fecha: {request.date}
                          </Typography>
                          {request.status === 'returned' && (
                            <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                              Motivo de retorno: {request.returnReason}
                            </Typography>
                          )}
                        </Box>
                      }
                      sx={{ mr: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {request.status !== 'completed' && request.status !== 'returned' && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => handleStatusChange(request.id, 'in_progress')}
                            startIcon={<PendingIcon />}
                          >
                            En Proceso
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleStatusChange(request.id, 'completed')}
                            startIcon={<CheckCircleIcon />}
                          >
                            Completar
                          </Button>
                        </>
                      )}
                      {request.status === 'completed' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleStatusChange(request.id, 'returned')}
                        >
                          Marcar Retornado
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => handleRequestClick(request)}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < filteredRequests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Box>
        </Paper>
      </Container>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              Detalles de la Solicitud {selectedRequest.id}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Material: {selectedRequest.material}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Cantidad: {selectedRequest.quantity}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Solicitado por: {selectedRequest.requestedBy}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Fecha: {selectedRequest.date}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Estado: {getStatusLabel(selectedRequest.status)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Prioridad: {selectedRequest.priority}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Detalles adicionales: {selectedRequest.details}
                </Typography>
                {selectedRequest.status === 'returned' && (
                  <Typography variant="body1" color="error" gutterBottom>
                    Motivo de retorno: {selectedRequest.returnReason}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>
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