import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  IconButton,
  Alert,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";
import ProductCard from "../../components/ProductCard";
import { inventoryService, salesService, locationService, authService } from "../../services/api";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));



const CartContainer = styled(Paper)(({ theme }) => ({
  minWidth: '280px',
  maxWidth: '350px',
  maxHeight: '500px',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e0e0e0',
}));

const CartItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const SalesPage = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [saleSubmitted, setSaleSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingDetails, setShippingDetails] = useState({
    sucursal: "",
    soldBy: "",
    contactNumber: "",
    notes: "",
  });
  const [user, setUser] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Cargar datos del usuario y sucursal
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = authService.getUser();
        setUser(currentUser);
        
        if (currentUser && currentUser.storeID) {
          const location = await locationService.getLocationById(currentUser.storeID);
          if (location && location.NAME) {
            setStoreName(location.NAME);
            // Prellenar los datos de venta
            setShippingDetails(prev => ({
              ...prev,
              sucursal: location.NAME,
              soldBy: `${currentUser.name || ''} ${currentUser.lastName || ''}`.trim(),
              contactNumber: currentUser.cellphone || ""
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Función para obtener productos de la tienda actual
  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching store inventory with product details...");
      const response = await inventoryService.getStoreInventoryWithProducts();
      
      console.log("📦 Store inventory response:", response);
      console.log("📦 Response data:", response.data);
      
      // La nueva API devuelve datos en formato { success: true, data: [...] }
      let inventoryData = [];
      
      if (response.data && response.data.success && response.data.data) {
        inventoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback para compatibilidad
        inventoryData = response.data;
      } else {
        console.warn("🤔 Estructura de respuesta inesperada:", response.data);
        inventoryData = [];
      }
      
      console.log("📋 Inventory data to transform:", inventoryData);
      
      if (inventoryData && inventoryData.length > 0) {
        // Transformar los datos de la API al formato esperado por el componente
        const transformedProducts = inventoryData
          .filter(item => item.PRODUCTID && item.INVENTORYID) // Filtrar items válidos
          .map(item => ({
            id: item.PRODUCTID,
            inventoryID: item.INVENTORYID, // Importante para las ventas
            name: item.NAME || 'Producto sin nombre',
            image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=500&fit=crop", // Imagen por defecto
            description: `${item.NAME || 'Producto'} - Disponible en tienda`,
            unit: item.UNIT || 'unidad',
            minOrder: 1,
            maxOrder: Math.min(item.QUANTITY || 0, 1000), // Limitar al stock disponible o 1000
            increment: 1,
            stock: parseInt(item.QUANTITY) || 0,
            price: parseFloat(item.SUGGESTEDPRICE) || 0, // Convertir a número
            eta: "Venta inmediata"
          }));
        
        console.log("✅ Transformed products:", transformedProducts);
        setProducts(transformedProducts);
      } else {
        console.warn("⚠️ No inventory data found");
        setProducts([]);
      }
    } catch (error) {
      console.error('❌ Error al obtener productos de la tienda:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  // Función para cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const steps = ["Seleccionar Productos", "Detalles de Venta", "Confirmar Venta"];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleShippingChange = (e) => {
    setShippingDetails({
      ...shippingDetails,
      [e.target.name]: e.target.value,
    });
  };

  const validateQuantity = (product, quantity) => {
    const minQty = product.minOrder || 1;
    const maxQty = product.maxOrder || product.stock;
    return quantity >= minQty && quantity <= maxQty;
  };

  const handleQuantityChange = (productId, value) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    const product = products.find(p => p.id === productId);
    
    if (product && validateQuantity(product, numValue)) {
      setQuantities(prev => ({
        ...prev,
        [productId]: numValue
      }));
      setError(prev => ({ ...prev, [productId]: null }));
    } else {
      setError(prev => ({ 
        ...prev, 
        [productId]: `Cantidad debe estar entre ${product?.minOrder || 1} y ${product?.maxOrder || product?.stock}` 
      }));
    }
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id] || product.minOrder || 1;
    
    if (!validateQuantity(product, quantity)) {
      setError(prev => ({ 
        ...prev, 
        [product.id]: `Cantidad debe estar entre ${product.minOrder || 1} y ${product.maxOrder || product.stock}` 
      }));
      return;
    }

    const existingProductIndex = selectedProducts.findIndex(p => p.id === product.id);
    
    if (existingProductIndex >= 0) {
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        quantity: quantity
      };
      setSelectedProducts(updatedProducts);
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity }]);
    }
    
    // Reset quantity input
    setQuantities(prev => ({ ...prev, [product.id]: product.minOrder || 1 }));
    setError(prev => ({ ...prev, [product.id]: null }));
  };

  const removeFromCart = (productId) => {
    setSelectedProducts(prev => prev.filter(product => product.id !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const renderCart = () => {
    if (selectedProducts.length === 0) {
      return (
        <Box sx={{ 
          p: 3, 
          textAlign: 'center',
          color: 'text.secondary'
        }}>
          <ShoppingCartIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body2">
            Tu carrito está vacío
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          backgroundColor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Carrito de Venta
          </Typography>
          <Typography variant="caption">
            {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Items */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
          },
        }}>
          {selectedProducts.map((product) => (
            <CartItem key={product.id}>
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 500,
                  lineHeight: 1.2,
                  mb: 0.5
                }}>
                  {product.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {product.quantity} × ${product.price.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  ${(product.price * product.quantity).toFixed(2)}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => removeFromCart(product.id)}
                  sx={{ 
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'white'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </CartItem>
          ))}
        </Box>

        {/* Total */}
        <Box sx={{ 
          p: 2, 
          borderTop: '2px solid', 
          borderColor: 'primary.main',
          backgroundColor: 'background.default'
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Total:
            </Typography>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: 'primary.main'
            }}>
              ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            IVA incluido
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter(product => {
    const name = product.name || '';
    const description = product.description || '';
    const searchLower = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(searchLower) ||
           description.toLowerCase().includes(searchLower);
  });

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ 
            display: "flex", 
            height: "100%",
          }}>
            {/* Products Grid */}
            <Box sx={{ 
              flex: 1, 
              pr: 2,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
                '&:hover': {
                  background: '#666',
                },
              },
            }}>
              {loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '200px'
                }}>
                  <CircularProgress />
                </Box>
              ) : filteredProducts.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: 'text.secondary'
                }}>
                  <Typography variant="h6" gutterBottom>
                    No se encontraron productos
                  </Typography>
                  <Typography variant="body2">
                    {searchTerm ? 'Intenta con diferentes términos de búsqueda' : 'No hay productos disponibles en tu tienda'}
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <ProductCard
                        product={product}
                        quantity={quantities[product.id]}
                        error={error[product.id]}
                        onQuantityChange={handleQuantityChange}
                        onAddToCart={addToCart}
                        showStock={true}
                        editable={true}
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
                          {products.length === 0 ? 'No hay productos disponibles en la tienda' : 'No se encontraron productos'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {products.length === 0 ? 'Contacte al administrador para agregar productos al inventario' : 'Intente con otro término de búsqueda'}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              )}
            </Box>

            {/* Cart Sidebar */}
            <Box sx={{ width: '350px', pl: 2 }}>
              <CartContainer>
                {renderCart()}
              </CartContainer>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto', py: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
              Detalles de la Venta
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sucursal"
                  name="sucursal"
                  value={shippingDetails.sucursal}
                  onChange={handleShippingChange}
                  disabled
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendido por"
                  name="soldBy"
                  value={shippingDetails.soldBy}
                  onChange={handleShippingChange}
                  required
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de contacto"
                  name="contactNumber"
                  value={shippingDetails.contactNumber}
                  onChange={handleShippingChange}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas adicionales"
                  name="notes"
                  value={shippingDetails.notes}
                  onChange={handleShippingChange}
                  multiline
                  rows={4}
                  variant="outlined"
                  placeholder="Información adicional sobre la venta..."
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
              Confirmar Venta
            </Typography>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Productos Seleccionados
                  </Typography>
                  {selectedProducts.map((product) => (
                    <Box key={product.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': {
                        borderBottom: 'none'
                      }
                    }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.quantity} × ${product.price.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ${(product.price * product.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Información de Venta
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Sucursal:</Typography>
                    <Typography variant="body1">{shippingDetails.sucursal}</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Vendido por:</Typography>
                    <Typography variant="body1">{shippingDetails.soldBy}</Typography>
                  </Box>
                  {shippingDetails.contactNumber && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Contacto:</Typography>
                      <Typography variant="body1">{shippingDetails.contactNumber}</Typography>
                    </Box>
                  )}
                  {shippingDetails.notes && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Notas:</Typography>
                      <Typography variant="body1">{shippingDetails.notes}</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      if (!user || !user.storeID) {
        throw new Error("No se pudo identificar la información del usuario");
      }

      // Calcular el total de la venta
      const saleTotal = selectedProducts.reduce((total, product) => {
        return total + (product.price * product.quantity);
      }, 0);

      // Preparar datos de la venta
      const saleData = {
        saleDate: new Date(),
        saleTotal: saleTotal,
        comments: shippingDetails.notes || null
      };

      // Preparar items de la venta
      const saleItems = selectedProducts.map(product => ({
        inventoryID: product.inventoryID, // Usar inventoryID para ventas
        quantity: product.quantity,
        itemTotal: product.price * product.quantity
      }));

      console.log("Creating sale with data:", { saleData, saleItems });

      // Crear la venta - El backend espera { sale, saleItems }
      const response = await salesService.createSale(saleData, saleItems);
      
      if (response.data && response.data.success) {
        setSaleSubmitted(true);
        
        // Mostrar mensaje de éxito
        console.log("Sale created successfully with ID:", response.data.saleID);
        
        // Limpiar el carrito y resetear el formulario
        setSelectedProducts([]);
        setQuantities({});
        
        // Resetear solo las notas, mantener los otros datos del usuario
        setShippingDetails(prev => ({
          ...prev,
          notes: ""
        }));
        
        setActiveStep(0);
        
        // Mostrar mensaje de éxito
        setSnackbar({
          open: true,
          message: `¡Venta creada exitosamente! ID de venta: ${response.data.saleID}`,
          severity: 'success'
        });
        
        // Actualizar la lista de productos
        fetchStoreProducts();
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
      
    } catch (error) {
      console.error("Error submitting sale:", error);
      setSnackbar({
        open: true,
        message: `Error al crear la venta: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title="Registrar Ventas" />

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
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              p: 2,
              "& .MuiStepLabel-label": {
                fontSize: "1rem",
                fontWeight: 500,
              },
              "& .MuiStepLabel-label.Mui-active": {
                fontWeight: 600,
              },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
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
                  Productos de la Tienda
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
                  {filteredProducts.length} productos
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: '300px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Buscar productos..."
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
          )}

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
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ 
            display: "flex", 
            justifyContent: "flex-end", 
            mt: 2,
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper"
          }}>
            {activeStep !== 0 && (
              <Button 
                onClick={handleBack} 
                sx={{ 
                  mr: 2,
                  px: 3,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Atrás
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                disabled={selectedProducts.length === 0 || isSubmitting}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {isSubmitting ? "Procesando..." : "Confirmar Venta"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={activeStep === 0 && selectedProducts.length === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                Siguiente
              </Button>
            )}
          </Box>
        </StyledPaper>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SalesPage; 