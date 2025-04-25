// src/pages/general/OrderHistory.jsx

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const OrderHistory = () => {
  const theme = useTheme();
  
  // Get current date for sample data
  const currentDate = new Date();
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Generate dates for sample data
  const today = formatDate(currentDate);
  const yesterday = formatDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
  const threeDaysAgo = formatDate(new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000));
  const lastWeek = formatDate(new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000));

  // Sample data with updated statuses
  const [orders] = useState([
    {
      id: 'REQ001',
      date: today,
      status: 'in_progress',
      total: '$1,500.00',
      items: 3,
      estimatedDelivery: formatDate(new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000))
    },
    {
      id: 'REQ002',
      date: today,
      status: 'on_route',
      total: '$2,300.00',
      items: 5,
      estimatedDelivery: formatDate(new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000))
    },
    {
      id: 'REQ003',
      date: yesterday,
      status: 'delivered',
      total: '$800.00',
      items: 2,
      deliveryDate: today
    },
    {
      id: 'REQ004',
      date: threeDaysAgo,
      status: 'delivered',
      total: '$1,200.00',
      items: 4,
      deliveryDate: yesterday
    },
    {
      id: 'REQ005',
      date: lastWeek,
      status: 'delivered',
      total: '$3,500.00',
      items: 7,
      deliveryDate: threeDaysAgo
    }
  ]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setStatusFilter(newValue);
      setPage(0);
    }
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'on_route':
        return 'warning';
      case 'in_progress':
        return 'info';
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
      default:
        return status;
    }
  };

  const filterOrders = () => {
    let filteredOrders = [...orders];

    // Apply status filter
    if (statusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    // Apply time filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today

    switch (timeFilter) {
      case 'today':
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= today;
        });
        break;
      case 'week':
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= lastWeek;
        });
        break;
      case 'month':
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        filteredOrders = filteredOrders.filter(order => {
          const orderDate = new Date(order.date);
          return orderDate >= lastMonth;
        });
        break;
      default:
        break;
    }

    return filteredOrders;
  };

  const filteredOrders = filterOrders();

  // Format date to a more readable format
  const formatDisplayDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title="Historial de Pedidos" />
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
              Consulta el estado de tus pedidos
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
                  value={statusFilter}
                  exclusive
                  onChange={handleStatusFilterChange}
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
                    Todos
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
                width: { xs: '100%', md: '250px' }, 
                mt: { xs: 2, md: 3.5 }
              }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Periodo de Tiempo</InputLabel>
                  <Select
                    value={timeFilter}
                    label="Periodo de Tiempo"
                    onChange={handleTimeFilterChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                    }}
                  >
                    <MenuItem value="all">Todo el historial</MenuItem>
                    <MenuItem value="today">Hoy</MenuItem>
                    <MenuItem value="week">Última semana</MenuItem>
                    <MenuItem value="month">Último mes</MenuItem>
                  </Select>
                </FormControl>
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
            <TableContainer sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.paper' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID Pedido</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Fecha de Solicitud</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Artículos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Fecha de Entrega</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((order) => (
                      <TableRow 
                        key={order.id} 
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell sx={{ borderLeft: `4px solid ${theme.palette[getStatusColor(order.status)].main}`, py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.id}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{formatDisplayDate(order.date)}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={getStatusLabel(order.status)}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 500, minWidth: '90px', justifyContent: 'center' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2, color: theme.palette.primary.main, fontWeight: 500 }}>{order.total}</TableCell>
                        <TableCell sx={{ py: 2 }}>{order.items}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          {order.status === 'delivered' 
                            ? formatDisplayDate(order.deliveryDate)
                            : <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                Estimada: {formatDisplayDate(order.estimatedDelivery)}
                              </Typography>
                          }
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => {/* Handle view details */}}
                            sx={{ 
                              borderRadius: '8px',
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              }
                            }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          
          <Box sx={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper"
          }}>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mr: 2, color: 'text.secondary' }}>
              Total: {filteredOrders.length} pedidos
            </Typography>
            <TablePagination
              component="div"
              count={filteredOrders.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              sx={{
                '.MuiTablePagination-toolbar': {
                  paddingLeft: 2,
                },
                '.MuiTablePagination-selectLabel, .MuiTablePagination-select, .MuiTablePagination-selectIcon, .MuiTablePagination-input, .MuiTablePagination-actions': {
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </StyledPaper>
      </Box>
    </div>
  );
};

export default OrderHistory; 