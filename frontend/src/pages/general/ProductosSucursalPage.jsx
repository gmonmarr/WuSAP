import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  useTheme,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";
import ProductCard from "../../components/ProductCard";
import { inventoryService, productService, locationService, authService } from "../../services/api";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

const ProductosSucursalPage = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [storeName, setStoreName] = useState("Sucursal");

  // Sample placeholder images for products
  const placeholderImages = [
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=500&fit=crop",
  ];

  // State for inventory products
  const [inventoryProducts, setInventoryProducts] = useState([]);
  
  // State for warehouse products modal
  const [openWarehouseModal, setOpenWarehouseModal] = useState(false);
  const [warehouseProducts, setWarehouseProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [assigningInventory, setAssigningInventory] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // User state
  const [user, setUser] = useState(null);
  const [canAssignInventory, setCanAssignInventory] = useState(false);

  // Function to get a random image from the placeholder images
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  // Effect to fetch store name and check user permissions
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = authService.getUser();
        setUser(currentUser);
        
        // Check if user can assign inventory (admin, manager, warehouse_manager, owner, sales)
        if (currentUser && currentUser.role) {
          const allowedRoles = ['admin', 'manager', 'warehouse_manager', 'owner', 'sales'];
          setCanAssignInventory(allowedRoles.includes(currentUser.role));
        }
        
        if (currentUser && currentUser.storeID) {
          const location = await locationService.getLocationById(currentUser.storeID);
          if (location && location.NAME) {
            setStoreName(location.NAME);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Keep default name if error
      }
    };

    fetchUserData();
  }, []);

  // Effect to fetch inventory and products on component mount
  useEffect(() => {
    // Fetch store inventory and available products
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch store inventory
        const inventoryResponse = await inventoryService.getStoreInventory();
        let inventoryData = inventoryResponse.data;
        
        // Fetch all products to get product details
        const productsResponse = await productService.getAllProducts();
        const allProducts = productsResponse.data;
        
        // Create a map of products for easy lookup
        const productMap = {};
        allProducts.forEach(product => {
          productMap[product.PRODUCTID] = product;
        });
        
        // Map inventory data with product details
        inventoryData = inventoryData.map(inventory => {
          const product = productMap[inventory.PRODUCTID];
          return {
            id: inventory.INVENTORYID,
            productID: inventory.PRODUCTID,
            storeID: inventory.STOREID,
            quantity: inventory.QUANTITY,
            name: product?.NAME || 'Producto Desconocido',
            price: typeof product?.SUGGESTEDPRICE === 'string' 
              ? parseFloat(product.SUGGESTEDPRICE) 
              : product?.SUGGESTEDPRICE || 0,
            suggestedPrice: product?.SUGGESTEDPRICE || 0,
            unit: product?.UNIT || 'Pieza',
            discontinued: product?.DISCONTINUED || false,
            image: product?.image || getRandomImage(),
            description: product?.description || `${product?.NAME || 'Producto'} - ${product?.UNIT || 'Pieza'}`,
            stock: inventory.QUANTITY
          };
        });
        
        setInventoryProducts(inventoryData);
        
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        setError("Error al cargar inventario: " + (error.response?.data?.details || error.message));
        setInventoryProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = inventoryProducts.filter((product) =>
    (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Function to fetch products based on user role
  const fetchProductsForModal = async () => {
    setLoadingWarehouse(true);
    try {
      let response;
      let products = [];

      if (user?.role === 'warehouse_manager' || user?.role === 'admin') {
        // Warehouse manager and admin see all active products to assign to stores
        response = await productService.getActiveProducts();
        products = response.data.map(product => ({
          PRODUCTID: product.PRODUCTID,
          NAME: product.NAME,
          SUGGESTEDPRICE: product.SUGGESTEDPRICE,
          UNIT: product.UNIT,
          QUANTITY: 0, // No quantity shown for active products
          isActiveProduct: true
        }));
      } else {
        // Manager, owner, and sales see products from their own store inventory to update quantities
        response = await inventoryService.getStoreInventory();
        const inventoryData = response.data;
        
        // Get product details for inventory items
        const productsResponse = await productService.getAllProducts();
        const allProducts = productsResponse.data;
        
        const productMap = {};
        allProducts.forEach(product => {
          productMap[product.PRODUCTID] = product;
        });
        
        products = inventoryData.map(inventory => {
          const product = productMap[inventory.PRODUCTID];
          return {
            PRODUCTID: inventory.PRODUCTID,
            NAME: product?.NAME || 'Producto Desconocido',
            SUGGESTEDPRICE: product?.SUGGESTEDPRICE || 0,
            UNIT: product?.UNIT || 'Pieza',
            QUANTITY: inventory.QUANTITY,
            INVENTORYID: inventory.INVENTORYID,
            isActiveProduct: false
          };
        });
      }

      setWarehouseProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      const errorMessage = (user?.role === 'warehouse_manager' || user?.role === 'admin')
        ? "Error al cargar productos activos"
        : "Error al cargar inventario de la tienda";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoadingWarehouse(false);
    }
  };

  // Function to open products modal
  const handleOpenWarehouseModal = () => {
    setOpenWarehouseModal(true);
    fetchProductsForModal();
  };

  // Function to close products modal
  const handleCloseWarehouseModal = () => {
    setOpenWarehouseModal(false);
    setSelectedProduct('');
    setQuantity('');
  };

  // Function to assign/update inventory
  const handleAssignInventory = async () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      setSnackbar({
        open: true,
        message: "Por favor seleccione un producto y especifique una cantidad válida",
        severity: 'warning'
      });
      return;
    }

    if (!user || !user.storeID) {
      setSnackbar({
        open: true,
        message: "Error: No se pudo identificar la sucursal",
        severity: 'error'
      });
      return;
    }

    setAssigningInventory(true);
    try {
      const targetStoreID = (user?.role === 'warehouse_manager' || user?.role === 'admin') ? user.storeID : user.storeID;
      
      await inventoryService.assignInventoryToStore(
        selectedProduct,
        targetStoreID,
        parseInt(quantity)
      );

      const successMessage = (user?.role === 'warehouse_manager' || user?.role === 'admin')
        ? "Producto asignado exitosamente"
        : "Inventario actualizado exitosamente";

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });

      // Refresh inventory data
      const fetchData = async () => {
        try {
          const inventoryResponse = await inventoryService.getStoreInventory();
          let inventoryData = inventoryResponse.data;
          
          const productsResponse = await productService.getAllProducts();
          const allProducts = productsResponse.data;
          
          const productMap = {};
          allProducts.forEach(product => {
            productMap[product.PRODUCTID] = product;
          });
          
          inventoryData = inventoryData.map(inventory => {
            const product = productMap[inventory.PRODUCTID];
            return {
              id: inventory.INVENTORYID,
              productID: inventory.PRODUCTID,
              storeID: inventory.STOREID,
              quantity: inventory.QUANTITY,
              name: product?.NAME || 'Producto Desconocido',
              price: typeof product?.SUGGESTEDPRICE === 'string' 
                ? parseFloat(product.SUGGESTEDPRICE) 
                : product?.SUGGESTEDPRICE || 0,
              suggestedPrice: product?.SUGGESTEDPRICE || 0,
              unit: product?.UNIT || 'Pieza',
              discontinued: product?.DISCONTINUED || false,
              image: product?.image || getRandomImage(),
              description: product?.description || `${product?.NAME || 'Producto'} - ${product?.UNIT || 'Pieza'}`,
              stock: inventory.QUANTITY
            };
          });
          
          setInventoryProducts(inventoryData);
        } catch (error) {
          console.error("Error refreshing inventory:", error);
        }
      };

      await fetchData();
      handleCloseWarehouseModal();

    } catch (error) {
      console.error("Error processing inventory:", error);
      const errorMessage = (user?.role === 'warehouse_manager' || user?.role === 'admin')
        ? "Error al asignar producto: "
        : "Error al actualizar inventario: ";
      setSnackbar({
        open: true,
        message: errorMessage + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    } finally {
      setAssigningInventory(false);
    }
  };

  // Function to close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const pageTitle = `Inventario de ${storeName}`;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title={pageTitle} />
      <Box sx={{ 
        flex: 1,
        maxWidth: 1600,
        width: "100%",
        margin: "0 auto", 
        padding: "1.5rem 2rem",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
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
            px: 3, 
            py: 2, 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {pageTitle}
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
                {filteredProducts.length} productos en inventario
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: '300px' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar productos en inventario..."
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
              {canAssignInventory && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenWarehouseModal}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    }
                  }}
                >
                  {(user?.role === 'warehouse_manager' || user?.role === 'admin') ? 'Asignar Productos' : 'Actualizar Valores'}
                </Button>
              )}
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
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '300px' 
              }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }} variant="h6" color="text.secondary">
                  Cargando inventario...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard 
                      product={product} 
                      showStock={true}
                      showEditButton={false}
                      showDeleteButton={false}
                      editable={false}
                    />
                  </Grid>
                ))}
                {filteredProducts.length === 0 && !loading && (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      backgroundColor: 'background.paper',
                      borderRadius: '8px',
                      border: '1px dashed',
                      borderColor: 'divider',
                    }}>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        No se encontraron productos en inventario
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? "Intente con otro término de búsqueda" 
                          : "No hay productos en el inventario de esta sucursal"}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </StyledPaper>
      </Box>

      {/* Warehouse Products Modal */}
      <Dialog 
        open={openWarehouseModal} 
        onClose={handleCloseWarehouseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          pb: 1
        }}>
          <InventoryIcon color="primary" />
          <Typography variant="h6" component="span">
            {(user?.role === 'warehouse_manager' || user?.role === 'admin')
              ? 'Asignar Productos a Sucursal' 
              : 'Actualizar Inventario de Sucursal'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={selectedProduct}
                    label="Producto"
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    disabled={loadingWarehouse}
                  >
                    {loadingWarehouse ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Cargando productos...
                      </MenuItem>
                    ) : (
                      warehouseProducts.map((product) => (
                        <MenuItem key={product.PRODUCTID} value={product.PRODUCTID}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {product.NAME}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                              {product.isActiveProduct ? (
                                // For warehouse manager and admin - show active products
                                <>
                                  <Chip 
                                    label="Producto Activo" 
                                    size="small" 
                                    color="success" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`$${product.SUGGESTEDPRICE}`} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {product.UNIT}
                                  </Typography>
                                </>
                              ) : (
                                // For manager, owner, and sales - show current inventory
                                <>
                                  <Chip 
                                    label={`Stock Actual: ${product.QUANTITY}`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                  <Chip 
                                    label={`$${product.SUGGESTEDPRICE}`} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {product.UNIT}
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 1 }}
                  helperText={(user?.role === 'warehouse_manager' || user?.role === 'admin')
                    ? "Cantidad a asignar a esta sucursal"
                    : "Nueva cantidad en inventario"}
                />
              </Grid>
            </Grid>
            
            {selectedProduct && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Producto seleccionado:
                </Typography>
                {(() => {
                  const product = warehouseProducts.find(p => p.PRODUCTID === selectedProduct);
                  return product ? (
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {product.NAME}
                      </Typography>
                      {product.isActiveProduct ? (
                        // For warehouse manager and admin
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Producto activo disponible para asignación
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Precio sugerido: ${product.SUGGESTEDPRICE}
                          </Typography>
                        </>
                      ) : (
                        // For manager, owner, and sales
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Stock actual en inventario: {product.QUANTITY} {product.UNIT}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Precio sugerido: ${product.SUGGESTEDPRICE}
                          </Typography>
                        </>
                      )}
                    </Box>
                  ) : null;
                })()}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleCloseWarehouseModal}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAssignInventory}
            variant="contained"
            disabled={!selectedProduct || !quantity || quantity <= 0 || assigningInventory}
            startIcon={assigningInventory ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {assigningInventory 
              ? ((user?.role === 'warehouse_manager' || user?.role === 'admin') ? 'Asignando...' : 'Actualizando...')
              : ((user?.role === 'warehouse_manager' || user?.role === 'admin') ? 'Asignar Producto' : 'Actualizar Inventario')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProductosSucursalPage; 