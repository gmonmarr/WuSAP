import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
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
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  Grid,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { locationService } from '../../services/api';

import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMessage, setShowMessage] = useState({ show: false, type: "", text: "" });
  const [validationError, setValidationError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    isActive: true
  });

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const data = await locationService.getAllLocations();
      setLocations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Error al cargar las ubicaciones: ' + (err.response?.data?.details || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.NAME?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.LOCATION?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingLocation(null);
    setFormData({ name: "", location: "", isActive: true });
    setValidationError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({ 
      name: location.NAME || "", 
      location: location.LOCATION || "", 
      isActive: location.ISACTIVE !== undefined ? location.ISACTIVE : true 
    });
    setValidationError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (location) => {
    setDeletingLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    setValidationError(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setValidationError('El nombre es obligatorio');
      return false;
    }
    if (!formData.location.trim()) {
      setValidationError('La dirección es obligatoria');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location
        await locationService.updateLocation(editingLocation.STOREID, {
          name: formData.name,
          location: formData.location,
          isActive: formData.isActive
        });
        setShowMessage({ show: true, type: "success", text: "Ubicación actualizada correctamente" });
      } else {
        // Create new location
        await locationService.createLocation({
          name: formData.name,
          location: formData.location,
          isActive: formData.isActive
        });
        setShowMessage({ show: true, type: "success", text: "Ubicación creada correctamente" });
      }
      
      setIsDialogOpen(false);
      setFormData({ name: "", location: "", isActive: true });
      await fetchLocations(); // Reload locations from server
      setTimeout(() => setShowMessage({ show: false, type: "", text: "" }), 3000);
    } catch (err) {
      console.error('Error saving location:', err);
      setValidationError(err.response?.data?.details || err.message || 'Error al guardar la ubicación');
    }
  };

  const confirmDelete = async () => {
    try {
      await locationService.deleteLocation(deletingLocation.STOREID);
      setIsDeleteDialogOpen(false);
      setDeletingLocation(null);
      setShowMessage({ show: true, type: "success", text: "Ubicación eliminada correctamente" });
      await fetchLocations(); // Reload locations from server
      setTimeout(() => setShowMessage({ show: false, type: "", text: "" }), 3000);
    } catch (err) {
      console.error('Error deleting location:', err);
      setIsDeleteDialogOpen(false);
      setDeletingLocation(null);
      setShowMessage({ 
        show: true, 
        type: "error", 
        text: err.response?.data?.details || err.message || 'Error al eliminar la ubicación'
      });
      setTimeout(() => setShowMessage({ show: false, type: "", text: "" }), 3000);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Header title="Gestión de Ubicaciones" />
      
      <Box sx={{ 
        flex: 1,
        maxWidth: 1600,
        width: "100%",
        margin: "0 auto", 
        padding: "1.5rem 2rem",
        display: "flex",
        flexDirection: "column"
      }}>
        {showMessage.show && (
          <Box sx={{ mb: 2, width: '100%' }}>
            <Alert 
              severity={showMessage.type}
              onClose={() => setShowMessage({ show: false, type: "", text: "" })}
              sx={{
                borderRadius: 2
              }}
            >
              {showMessage.text}
            </Alert>
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
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2.5,
              mb: 2
            }}>
              <Typography variant="body2" color="text.secondary">
                Gestiona las ubicaciones y sucursales del sistema
              </Typography>
              
              <Box sx={{ 
                width: { xs: '100%', md: '420px' },
                display: 'flex',
                gap: 2.5,
                alignItems: 'center'
              }}>
                <TextField
                  placeholder="Buscar ubicaciones..."
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchQuery}
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
                  variant="outlined"
                  size="medium"
                  onClick={fetchLocations}
                  disabled={loading}
                  sx={{
                    minWidth: '48px',
                    borderRadius: '8px',
                    height: '42px',
                    px: 2,
                  }}
                >
                  <RefreshIcon />
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1">Cargando ubicaciones...</Typography>
              </Box>
            ) : error ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Typography variant="body1" color="error">{error}</Typography>
              </Box>
            ) : (
              <>
                <ui5-table style={{ 
                  width: "100%",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                }}>
                  <ui5-table-header-row slot="headerRow" style={{
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)"
                  }}>
                    <ui5-table-header-cell style={{ 
                      width: "8%",
                      padding: "1rem",
                      color: "#495057",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textAlign: "center",
                      overflow: "visible",
                      whiteSpace: "nowrap"
                    }}>
                      ID
                    </ui5-table-header-cell>
                    <ui5-table-header-cell style={{ 
                      width: "26%",
                      padding: "1rem",
                      color: "#495057",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      overflow: "visible",
                      whiteSpace: "nowrap"
                    }}>
                      Nombre
                    </ui5-table-header-cell>
                    <ui5-table-header-cell style={{ 
                      width: "33%",
                      padding: "1rem",
                      color: "#495057",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      overflow: "visible",
                      whiteSpace: "nowrap"
                    }}>
                      Dirección
                    </ui5-table-header-cell>
                    <ui5-table-header-cell style={{ 
                      width: "13%",
                      padding: "1rem",
                      color: "#495057",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textAlign: "center",
                      overflow: "visible",
                      whiteSpace: "nowrap"
                    }}>
                      Estado
                    </ui5-table-header-cell>
                    <ui5-table-header-cell style={{ 
                      width: "20%",
                      padding: "1rem",
                      color: "#495057",
                      fontWeight: "600",
                      fontSize: "0.9rem",
                      textAlign: "center",
                      overflow: "visible",
                      whiteSpace: "nowrap"
                    }}>
                      Acciones
                    </ui5-table-header-cell>
                  </ui5-table-header-row>
                  
                  {filteredLocations.map((location, index) => (
                    <ui5-table-row 
                      key={location.STOREID}
                      style={{
                        background: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        borderBottom: "1px solid #e9ecef"
                      }}
                    >
                      <ui5-table-cell style={{ 
                        padding: "1rem",
                        fontWeight: "500",
                        color: "#495057"
                      }}>
                        {location.STOREID}
                      </ui5-table-cell>
                      <ui5-table-cell style={{ 
                        padding: "1rem",
                        fontWeight: "500",
                        color: "#212529"
                      }}>
                        {location.NAME}
                      </ui5-table-cell>
                      <ui5-table-cell style={{ 
                        padding: "1rem",
                        color: "#6c757d",
                        fontSize: "0.9rem"
                      }}>
                        {location.LOCATION}
                      </ui5-table-cell>
                      <ui5-table-cell style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                          <Chip
                            label={location.ISACTIVE ? 'Activo' : 'Inactivo'}
                            color={location.ISACTIVE ? 'success' : 'error'}
                            size="small"
                            sx={{ 
                              fontWeight: 500, 
                              minWidth: '80px', 
                              justifyContent: 'center',
                              textAlign: 'center' 
                            }}
                          />
                        </div>
                      </ui5-table-cell>
                      <ui5-table-cell style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(location)}
                            sx={{ 
                              color: 'primary.main',
                              borderRadius: '8px',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(location)}
                            sx={{ 
                              color: 'error.main',
                              borderRadius: '8px',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.08)',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </ui5-table-cell>
                    </ui5-table-row>
                  ))}
                </ui5-table>
                
                {filteredLocations.length === 0 && !loading && (
                  <Box sx={{ 
                    textAlign: "center", 
                    padding: "3rem",
                    color: "#6c757d",
                    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                    borderRadius: "12px",
                    margin: "1rem 0"
                  }}>
                    <SearchIcon sx={{ fontSize: "3rem", marginBottom: "1rem", opacity: "0.5" }} />
                    <Typography variant="h6" sx={{ margin: "0 0 0.5rem 0", color: "#495057" }}>
                      No se encontraron ubicaciones
                    </Typography>
                    <Typography variant="body2" sx={{ margin: "0", fontSize: "0.9rem" }}>
                      {searchQuery ? 'Intenta con diferentes términos de búsqueda' : 'No hay ubicaciones registradas'}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </StyledPaper>
      </Box>

      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
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
          {editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
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
                placeholder="Ingrese el nombre de la ubicación"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Dirección"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                variant="outlined"
                placeholder="Ingrese la dirección completa"
                InputLabelProps={{ shrink: true }}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(event) => handleInputChange({ target: { name: "isActive", type: "checkbox", checked: event.target.checked } })}
                    color="primary"
                  />
                }
                label="Ubicación Activa"
                sx={{ 
                  mt: 2,
                  '& .MuiFormControlLabel-label': {
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }
                }}
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
            onClick={() => setIsDialogOpen(false)} 
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2
            }}
          >
            {editingLocation ? 'Guardar Cambios' : 'Crear Ubicación'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
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
          Confirmar Eliminación
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ¿Está seguro de que desea eliminar la ubicación "{deletingLocation?.NAME}"?
          </Typography>
          <Typography variant="caption" color="error">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid', 
          borderColor: 'divider'
        }}>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)} 
            variant="outlined"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              ml: 2
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Locations; 