import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import UndoIcon from '@mui/icons-material/Undo';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Navbar from '../../components/Navbar';
import Header from '../../components/Header';
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";
import { salesService } from '../../services/api';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

const SalesHistory = () => {
  const theme = useTheme();
  
  // State variables
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [saleToReturn, setSaleToReturn] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load sales data on component mount
  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const response = await salesService.getAllSales();
      console.log("Sales data received:", response.data);
      setSales(response.data || []);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar las ventas: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleViewDetails = async (sale) => {
    try {
      console.log("Loading details for sale:", sale.SALEID);
      const response = await salesService.getSaleById(sale.SALEID);
      console.log("Sale details received:", response.data);
      setSelectedSale(response.data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error loading sale details:', error);
      setSnackbar({
        open: true,
        message: 'Error al cargar los detalles de la venta',
        severity: 'error'
      });
    }
  };

  const handleReturnSale = async () => {
    if (!saleToReturn) return;
    
    try {
      await salesService.deleteSale(saleToReturn.SALEID);
      setSnackbar({
        open: true,
        message: `Venta VEN${String(saleToReturn.SALEID).padStart(3, '0')} devuelta exitosamente`,
        severity: 'success'
      });
      setReturnDialogOpen(false);
      setSaleToReturn(null);
      // Reload sales data
      loadSalesData();
    } catch (error) {
      console.error('Error returning sale:', error);
      setSnackbar({
        open: true,
        message: 'Error al procesar la devolución: ' + error.message,
        severity: 'error'
      });
    }
  };

  const openReturnDialog = (sale) => {
    setSaleToReturn(sale);
    setReturnDialogOpen(true);
  };

  const filterSales = () => {
    if (!searchTerm) return sales;
    
    return sales.filter(sale => {
      const saleId = `VEN${String(sale.SALEID).padStart(3, '0')}`;
      return saleId.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const filteredSales = filterSales();

  // Format date to a more readable format
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Format sale ID with VEN prefix
  const formatSaleId = (saleId) => {
    return `VEN${String(saleId).padStart(3, '0')}`;
  };

  // Calculate total items for a sale
  const calculateTotalItems = (saleItems) => {
    if (!saleItems || !Array.isArray(saleItems)) return 0;
    return saleItems.reduce((total, item) => total + (item.QUANTITY || 0), 0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
        <AvisoPerdidaInfo />
        <Navbar />
        <Header title="Historial de Ventas" />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress size={60} />
        </Box>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title="Historial de Ventas" />
      
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
              Consulta y gestiona el historial de todas las ventas realizadas
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                  Ventas Registradas
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ml: 2, 
                    color: 'text.secondary',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {filteredSales.length} ventas
                </Typography>
              </Box>
              
              <Box sx={{ width: '300px' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por ID de venta (ej: VEN001)..."
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
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
            <TableContainer sx={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' }}>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'background.paper' }}>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>ID Venta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Fecha de Venta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Vendedor</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((sale) => (
                      <TableRow 
                        key={sale.SALEID} 
                        hover
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <TableCell sx={{ borderLeft: `4px solid ${theme.palette.primary.main}`, py: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatSaleId(sale.SALEID)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{formatDisplayDate(sale.SALEDATE)}</TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body2">
                            {sale.EMPLOYEENAME || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2, color: theme.palette.primary.main, fontWeight: 500 }}>
                          ${parseFloat(sale.SALETOTAL || 0).toFixed(2)}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleViewDetails(sale)}
                              sx={{ 
                                borderRadius: '8px',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                }
                              }}
                              title="Ver detalles"
                            >
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => openReturnDialog(sale)}
                              sx={{ 
                                borderRadius: '8px',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                }
                              }}
                              title="Procesar devolución"
                            >
                              <UndoIcon />
                            </IconButton>
                          </Box>
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
              Total: {filteredSales.length} ventas
            </Typography>
            <TablePagination
              component="div"
              count={filteredSales.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* Sale Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Detalles de la Venta {selectedSale && formatSaleId(selectedSale.SALEID)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedSale && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Información General
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>ID:</strong> {formatSaleId(selectedSale.SALEID)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Fecha:</strong> {formatDisplayDate(selectedSale.SALEDATE)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Vendedor:</strong> {selectedSale.EMPLOYEENAME || 'N/A'}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Total:</strong> ${parseFloat(selectedSale.SALETOTAL || 0).toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Artículos Vendidos
              </Typography>
              
              {selectedSale.saleItems && selectedSale.saleItems.length > 0 ? (
                <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                  {selectedSale.saleItems.map((item, index) => (
                    <ListItem 
                      key={index} 
                      divider={index < selectedSale.saleItems.length - 1}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <ListItemText
                        primary={item.PRODUCTNAME || `Producto ID: ${item.PRODUCTID || 'N/A'}`}
                        secondary={`Cantidad: ${item.QUANTITY} ${item.PRODUCTUNIT || 'unidades'}`}
                      />
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                        ${parseFloat(item.ITEMTOTAL || 0).toFixed(2)}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No se encontraron artículos para esta venta
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog 
        open={returnDialogOpen} 
        onClose={() => setReturnDialogOpen(false)}
      >
        <DialogTitle>Confirmar Devolución</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas procesar la devolución de la venta{' '}
            <strong>{saleToReturn && formatSaleId(saleToReturn.SALEID)}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Esta acción eliminará la venta y restaurará el inventario. No se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleReturnSale} color="error" variant="contained">
            Confirmar Devolución
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SalesHistory; 