// pages/admin/UserList.jsx

import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import { employeeService, authService, locationService } from '../../services/api';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

const UserList = () => {
  // States
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(5); // Show 5 records initially
  const [loadingMore, setLoadingMore] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    role: 'sales',
    cellphone: '',
    storeID: '',
    isBlocked: false,
    blockReason: '',
    password: '',
    confirmPassword: ''
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [promptBlockReasonOpen, setPromptBlockReasonOpen] = useState(false);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      setError('Error al cargar los empleados: ' + err.message);
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
    } catch (err) {
      console.error('Error al cargar ubicaciones:', err);
      // Don't show error for locations, just log it
    } finally {
      setLoadingLocations(false);
    }
  };

  // Handle search and filters
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setVisibleCount(5); // Reset to show 5 records when searching
  };

  const handleRoleFilterChange = (event, newValue) => {
    if (newValue !== null) {
      setRoleFilter(newValue);
      setVisibleCount(5); // Reset to show 5 records when filtering
    }
  };

  // Infinite scroll functionality
  const loadMoreRecords = useCallback(() => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount(prev => prev + 5);
      setLoadingMore(false);
    }, 300);
  }, [loadingMore]);

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    // Search term filter
    const matchesSearch = 
      !searchTerm ||
      (employee.NAME?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.LASTNAME?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.EMAIL?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Role filter
    const matchesRole = roleFilter === 'all' || 
      (employee.ROLE?.toLowerCase() === roleFilter);
    
    return matchesSearch && matchesRole;
  });

  // Handle scroll event for infinite loading (moved after filteredEmployees definition)
  const handleScroll = useCallback((event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    
    // Debug logs to see what's happening
    console.log('Scroll event:', {
      scrollTop,
      scrollHeight, 
      clientHeight,
      threshold: scrollHeight - scrollTop,
      shouldLoad: scrollHeight - scrollTop <= clientHeight + 50,
      loadingMore,
      visibleCount,
      totalFiltered: filteredEmployees.length
    });
    
    // Load more when user scrolls near the bottom (within 50px instead of 100px)
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loadingMore && visibleCount < filteredEmployees.length) {
      console.log('Loading more records...');
      loadMoreRecords();
    }
  }, [loadMoreRecords, loadingMore, visibleCount, filteredEmployees.length]);

  // Dialog handlers
  const handleOpenDialog = (employee = null) => {
    // Fetch locations when opening dialog
    fetchLocations();
    
    if (employee) {
      setFormData({
        name: employee.NAME || '',
        lastname: employee.LASTNAME || '',
        email: employee.EMAIL || '',
        role: employee.ROLE?.toLowerCase() || 'sales',
        cellphone: employee.CELLPHONE || '',
        storeID: employee.STOREID ? employee.STOREID.toString() : '',
        isBlocked: employee.ISBLOCKED === true,
        blockReason: employee.BLOCKREASON || '',
        password: '',
        confirmPassword: ''
      });
      setBlockReasonInput(employee.BLOCKREASON || '');
      setCurrentEmployee(employee);
    } else {
      setFormData({
        name: '',
        lastname: '',
        email: '',
        role: 'sales',
        cellphone: '',
        storeID: '',
        isBlocked: false,
        blockReason: '',
        password: '',
        confirmPassword: ''
      });
      setBlockReasonInput('');
      setCurrentEmployee(null);
    }
    setDialogOpen(true);
    setValidationError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Form handlers
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSwitchChange = (event) => {
    const isActive = event.target.checked;
    const isBeingBlocked = !isActive; // If not active, it's being blocked
    
    if (isBeingBlocked) {
      // If user is being blocked, prompt for a reason
      setBlockReasonInput('');
      setPromptBlockReasonOpen(true);
    } else {
      // If user is being unblocked, clear block reason
      setFormData(prevData => ({
        ...prevData,
        isBlocked: false,
        blockReason: ''
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('El nombre es obligatorio');
      return false;
    }
    if (!formData.lastname.trim()) {
      setValidationError('El apellido es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setValidationError('El email es obligatorio');
      return false;
    }
    if (!currentEmployee && !formData.password) {
      setValidationError('La contraseña es obligatoria para nuevos empleados');
      return false;
    }
    if (!currentEmployee && formData.password !== formData.confirmPassword) {
      setValidationError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Prepare storeID - convert empty string to null
      const storeID = formData.storeID === '' ? null : parseInt(formData.storeID);
      
      if (currentEmployee) {
        await employeeService.updateEmployee(currentEmployee.EMPLOYEEID, {
          name: formData.name,
          lastname: formData.lastname,
          email: formData.email,
          role: formData.role,
          cellphone: formData.cellphone,
          storeID: storeID,
          isBlocked: formData.isBlocked,
          blockReason: formData.blockReason,
          ...(formData.password ? { password: formData.password } : {})
        });
        setSuccessMessage(`Empleado ${formData.name} actualizado correctamente.`);
      } else {
        await authService.register({
          name: formData.name,
          lastname: formData.lastname,
          email: formData.email,
          role: formData.role,
          cellphone: formData.cellphone,
          storeID: storeID,
          password: formData.password
        });
        setSuccessMessage(`Empleado ${formData.name} creado correctamente.`);
      }
      handleCloseDialog();
      fetchEmployees();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setValidationError(`Error: ${err.message}`);
    }
  };

  // Helper functions
  const getStatusColor = (isBlocked) => {
    return isBlocked === false ? 'success' : 'error';
  };

  const getStatusText = (isBlocked) => {
    return isBlocked === false ? 'Activo' : 'Inactivo';
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'primary';
      case 'manager':
        return 'secondary';
      case 'warehouse_manager':
        return 'success';
      case 'sales':
        return 'info';
      case 'owner':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRoleBorderColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '#1976d2'; // primary
      case 'manager':
        return '#9c27b0'; // secondary
      case 'warehouse_manager':
        return '#2e7d32'; // success
      case 'sales':
        return '#03a9f4'; // info
      case 'owner':
        return '#ed6c02'; // warning
      default:
        return '#757575'; // default
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  const handleBlockReasonConfirm = () => {
    if (!blockReasonInput.trim()) {
      return; // Don't allow empty reasons
    }
    
    setFormData(prevData => ({
      ...prevData,
      isBlocked: true,
      blockReason: blockReasonInput.trim()
    }));
    setPromptBlockReasonOpen(false);
  };

  const handleBlockReasonCancel = () => {
    setPromptBlockReasonOpen(false);
    // Reset switch state because the blocking was canceled
    const switchElement = document.getElementById('active-switch');
    if (switchElement) {
      switchElement.checked = true;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Header title="Administración de Usuarios" />
      <Box sx={{ 
        flex: 1,
        maxWidth: 1600,
        width: "100%",
        margin: "0 auto", 
        padding: "1.5rem 2rem",
        display: "flex",
        flexDirection: "column"
      }}>
        {successMessage && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'success.light',
                color: 'success.contrastText',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">{successMessage}</Typography>
            </Paper>
          </Box>
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
              Gestiona la información de los empleados
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'flex-end' },
              gap: 2.5
            }}>
              <Box sx={{ flex: { md: '1' } }}>
                <Typography variant="subtitle2" gutterBottom sx={{ ml: 0.5 }}>
                  Rol
                </Typography>
                <ToggleButtonGroup
                  value={roleFilter}
                  exclusive
                  onChange={handleRoleFilterChange}
                  aria-label="filtro de rol"
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
                      fontSize: '0.95rem',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                        color: 'white',
                      }
                    }
                  }}
                >
                  <ToggleButton value="all">
                    Todos
                  </ToggleButton>
                  <ToggleButton value="admin">
                    Admin
                  </ToggleButton>
                  <ToggleButton value="manager">
                    Manager
                  </ToggleButton>
                  <ToggleButton value="warehouse_manager">
                    Warehouse Manager
                  </ToggleButton>
                  <ToggleButton value="sales">
                    Sales
                  </ToggleButton>
                  <ToggleButton value="owner">
                    Owner
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box sx={{ 
                width: { xs: '100%', md: '420px' },
                display: 'flex',
                gap: 2.5,
                alignItems: 'center',
                mt: { xs: 1, md: 0 }
              }}>
                <TextField
                  placeholder="Buscar empleado"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      height: '42px',
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '0.95rem',
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
                    py: 1,
                    px: 3,
                    height: '42px',
                    minWidth: '130px',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap',
                    fontWeight: 500
                  }}
                >
                  Nuevo
                </Button>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            flex: 1,
            overflow: "auto",
            p: "1.5rem 2rem",
            minHeight: 0, // Important for flex scrolling
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
          }}
          onScroll={handleScroll}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1">Cargando empleados...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1" color="error">{error}</Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'background.paper' }}>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Rol</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Teléfono</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Ubicación</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEmployees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              No se encontraron empleados con los filtros actuales.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEmployees
                          .slice(0, visibleCount)
                          .map((employee) => (
                            <TableRow 
                              key={employee.EMPLOYEEID} 
                              hover
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                transition: 'background-color 0.2s',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <TableCell 
                                sx={{ 
                                  py: 1.8, 
                                  borderLeft: `4px solid ${getRoleBorderColor(employee.ROLE)}`
                                }}
                              >
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {employee.NAME} {employee.LASTNAME}
                                </Typography>
                              </TableCell>
                              <TableCell sx={{ py: 1.8 }}>{employee.EMAIL}</TableCell>
                              <TableCell sx={{ py: 1.8 }}>
                                <Chip
                                  label={capitalizeFirstLetter(employee.ROLE)}
                                  color={getRoleColor(employee.ROLE)}
                                  size="small"
                                  sx={{ fontWeight: 500, minWidth: '80px', justifyContent: 'center' }}
                                />
                              </TableCell>
                              <TableCell sx={{ py: 1.8 }}>{employee.CELLPHONE || 'N/A'}</TableCell>
                              <TableCell sx={{ py: 1.8 }}>{employee.LOCATION_NAME || 'Sin asignar'}</TableCell>
                              <TableCell sx={{ py: 1.8 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Chip
                                    label={getStatusText(employee.ISBLOCKED)}
                                    color={getStatusColor(employee.ISBLOCKED)}
                                    size="small"
                                    sx={{ fontWeight: 500, minWidth: '80px', justifyContent: 'center' }}
                                  />
                                  {employee.BLOCKREASON && (
                                    <Tooltip 
                                      title={
                                        <Typography variant="body2" sx={{ p: 0.5 }}>
                                          <strong>Motivo de bloqueo:</strong><br />
                                          {employee.BLOCKREASON}
                                        </Typography>
                                      } 
                                      arrow
                                      placement="top"
                                    >
                                      <IconButton 
                                        size="small" 
                                        sx={{ 
                                          ml: 0.5,
                                          backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                          }
                                        }}
                                      >
                                        <InfoIcon fontSize="small" color="info" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ py: 1.8 }}>
                                <IconButton
                                  color="primary"
                                  size="small"
                                  onClick={() => handleOpenDialog(employee)}
                                  sx={{ 
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                    }
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Loading indicator for infinite scroll */}
                {loadingMore && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 3 
                  }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Cargando más empleados...
                    </Typography>
                  </Box>
                )}
                
                {/* Load More Button - Fallback if scroll doesn't work */}
                {!loadingMore && visibleCount < filteredEmployees.length && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 3 
                  }}>
                    <Button
                      variant="outlined"
                      onClick={loadMoreRecords}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500
                      }}
                    >
                      Cargar más empleados ({filteredEmployees.length - visibleCount} restantes)
                    </Button>
                  </Box>
                )}
                
                {/* End of results indicator */}
                {!loadingMore && visibleCount >= filteredEmployees.length && filteredEmployees.length > 5 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    py: 3 
                  }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No hay más empleados para mostrar
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper"
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchEmployees}
                size="small"
                sx={{ textTransform: 'none' }}
              >
                Actualizar
              </Button>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Mostrando {Math.min(visibleCount, filteredEmployees.length)} de {filteredEmployees.length} empleados
            </Typography>
          </Box>
        </StyledPaper>
      </Box>

      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          px: 3,
          py: 2
        }}>
          {currentEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {validationError && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'error.light', borderRadius: 1 }}>
              <Typography color="error.dark">{validationError}</Typography>
            </Box>
          )}

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Apellido"
                name="lastname"
                value={formData.lastname}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="role-label">Rol</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rol"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="warehouse_manager">Warehouse Manager</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="owner">Owner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono"
                name="cellphone"
                value={formData.cellphone}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="location-label">Ubicación</InputLabel>
                <Select
                  labelId="location-label"
                  name="storeID"
                  value={formData.storeID}
                  onChange={handleInputChange}
                  label="Ubicación"
                  disabled={loadingLocations}
                >
                  <MenuItem value="">
                    <em>Sin asignar</em>
                  </MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.STOREID} value={location.STOREID}>
                      {location.NAME}
                    </MenuItem>
                  ))}
                </Select>
                {loadingLocations && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Cargando ubicaciones...
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {currentEmployee && (
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      id="active-switch"
                      checked={!formData.isBlocked}
                      onChange={handleSwitchChange}
                      color="primary"
                    />
                  }
                  label="Usuario Activo"
                  sx={{ mt: 2 }}
                />
                {formData.isBlocked && formData.blockReason && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    Motivo de bloqueo: {formData.blockReason}
                  </Typography>
                )}
              </Grid>
            )}
            <Grid item xs={12} md={6}>
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                required={!currentEmployee}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                helperText={currentEmployee ? "Dejar vacío para mantener la contraseña actual" : ""}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                required={!currentEmployee}
                margin="normal"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid', 
          borderColor: 'divider'
        }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2
            }}
          >
            {currentEmployee ? 'Guardar Cambios' : 'Crear Empleado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Block Reason Dialog */}
      <Dialog 
        open={promptBlockReasonOpen} 
        onClose={handleBlockReasonCancel}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          px: 3,
          py: 2
        }}>
          Razón de bloqueo del usuario
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Por favor, ingresa la razón por la que estás bloqueando este usuario. Esta información será visible para el administrador y el usuario.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Motivo de bloqueo"
            fullWidth
            variant="outlined"
            value={blockReasonInput}
            onChange={(e) => setBlockReasonInput(e.target.value)}
            placeholder="Ej: Inactividad prolongada, Permiso revocado, etc."
            InputLabelProps={{ shrink: true }}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid', 
          borderColor: 'divider'
        }}>
          <Button 
            onClick={handleBlockReasonCancel} 
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleBlockReasonConfirm} 
            variant="contained" 
            color="primary"
            disabled={!blockReasonInput.trim()}
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2
            }}
          >
            Confirmar bloqueo
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserList;
