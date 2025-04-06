// src/pages/general/OrderHistory.jsx

import React, { useState } from 'react';
import {
  Container,
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
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';

const OrderHistory = () => {
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
  const twoWeeksAgo = formatDate(new Date(currentDate.getTime() - 14 * 24 * 60 * 60 * 1000));
  const lastMonth = formatDate(new Date(currentDate.getTime() - 25 * 24 * 60 * 60 * 1000));

  // Sample data with realistic dates
  const [orders] = useState([
    {
      id: '001',
      date: today,
      status: 'Pendiente',
      total: '$1,500.00',
      items: 3,
    },
    {
      id: '002',
      date: today,
      status: 'En proceso',
      total: '$2,300.00',
      items: 5,
    },
    {
      id: '003',
      date: yesterday,
      status: 'Completado',
      total: '$800.00',
      items: 2,
    },
    {
      id: '004',
      date: threeDaysAgo,
      status: 'Completado',
      total: '$1,200.00',
      items: 4,
    },
    {
      id: '005',
      date: lastWeek,
      status: 'Completado',
      total: '$3,500.00',
      items: 7,
    },
    {
      id: '006',
      date: twoWeeksAgo,
      status: 'Completado',
      total: '$950.00',
      items: 2,
    },
    {
      id: '007',
      date: lastMonth,
      status: 'Completado',
      total: '$4,200.00',
      items: 8,
    },
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

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completado':
        return 'success';
      case 'En proceso':
        return 'warning';
      case 'Pendiente':
        return 'info';
      default:
        return 'default';
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
    <div>
      <Navbar />
      <Header title="Historial de Pedidos" />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#2C3E73', fontWeight: 600 }}>
              Historial de Pedidos
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Consulta y da seguimiento a tus pedidos anteriores
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado del Pedido</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Estado del Pedido"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    <MenuItem value="Completado">Completado</MenuItem>
                    <MenuItem value="En proceso">En proceso</MenuItem>
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Periodo de Tiempo</InputLabel>
                  <Select
                    value={timeFilter}
                    label="Periodo de Tiempo"
                    onChange={handleTimeFilterChange}
                  >
                    <MenuItem value="all">Todo el historial</MenuItem>
                    <MenuItem value="today">Hoy</MenuItem>
                    <MenuItem value="week">Última semana</MenuItem>
                    <MenuItem value="month">Último mes</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID Pedido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Artículos</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{formatDisplayDate(order.date)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {/* Handle view details */}}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      </Container>
    </div>
  );
};

export default OrderHistory; 