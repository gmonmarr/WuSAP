// pages/general/OrderPage.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  IconButton,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import ProductCard from "../../components/ProductCard";
import { inventoryService, orderService, locationService, authService } from "../../services/api";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

// eslint-disable-next-line no-unused-vars
const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: "240px",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
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

const OrderPage = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingDetails, setShippingDetails] = useState({
    sucursal: "",
    requestedBy: "",
    contactNumber: "",
    notes: "",
  });
  const [user, setUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
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
            // Prellenar los datos de envío
            setShippingDetails(prev => ({
              ...prev,
              sucursal: location.NAME,
              requestedBy: `${currentUser.name || ''} ${currentUser.lastName || ''}`.trim(),
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

  // Función para obtener productos del almacén
  useEffect(() => {
    const fetchWarehouseProducts = async () => {
      try {
        setLoading(true);
        const response = await inventoryService.getWarehouseProducts();
        
        if (response.data && response.data.success) {
          // Transformar los datos de la API al formato esperado por el componente
          const transformedProducts = response.data.data.map(item => ({
            id: item.PRODUCTID,
            name: item.NAME,
            image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=500&fit=crop", // Imagen por defecto
            description: `${item.NAME} - Disponible en almacén`,
            unit: item.UNIT,
            minOrder: 1,
            maxOrder: Math.min(item.QUANTITY, 1000), // Limitar al stock disponible o 1000
            increment: 1,
            stock: item.QUANTITY,
            price: item.SUGGESTEDPRICE,
            eta: "1-2 días hábiles"
          }));
          
          setProducts(transformedProducts);
        } else {
          console.error('Error en la respuesta de la API:', response.data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error al obtener productos del almacén:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouseProducts();
  }, []);

  // Función para cerrar snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const steps = ["Seleccionar Materiales", "Detalles de Envío", "Confirmar Pedido"];

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
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity)) return "Debe ser un número";
    if (numQuantity < product.minOrder) return `Mínimo ${product.minOrder} ${product.unit}`;
    if (numQuantity > product.maxOrder) return `Máximo ${product.maxOrder} ${product.unit}`;
    if (numQuantity > product.stock) return `Solo hay ${product.stock} ${product.unit} disponibles`;
    if (numQuantity % product.increment !== 0) return `Incrementos de ${product.increment} ${product.unit}`;
    return null;
  };

  const handleQuantityChange = (productId, value) => {
    const product = products.find(p => p.id === productId);
    const validationError = validateQuantity(product, value);
    
    setError(prev => ({
      ...prev,
      [productId]: validationError
    }));

    setQuantities(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id];
    const validationError = validateQuantity(product, quantity);
    
    if (!quantity || validationError) {
      setError(prev => ({
        ...prev,
        [product.id]: validationError || "Cantidad requerida"
      }));
      return;
    }

    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: Number(quantity) }
            : p
        );
      }
      return [...prev, { ...product, quantity: Number(quantity) }];
    });

    setError(prev => ({
      ...prev,
      [product.id]: null
    }));
  };

  const removeFromCart = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
    setError(prev => {
      const newErrors = { ...prev };
      delete newErrors[productId];
      return newErrors;
    });
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => {
      // Si el producto no tiene precio, asumimos un valor por defecto de 0
      const price = product.price || 0;
      return total + (price * product.quantity);
    }, 0);
  };

  const renderCart = () => {
    return (
      <CartContainer>
        <Box sx={{ 
          p: 1.5, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ShoppingCartIcon fontSize="small" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Carrito
          </Typography>
          <Typography variant="caption" sx={{ ml: 'auto', backgroundColor: 'rgba(255,255,255,0.2)', px: 1, py: 0.5, borderRadius: '12px' }}>
            {selectedProducts.length} items
          </Typography>
        </Box>
        
        <Box sx={{ 
          maxHeight: '350px',
          overflow: 'auto',
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#bbb",
            borderRadius: "4px",
            "&:hover": {
              background: "#999",
            },
          },
        }}>
          {selectedProducts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                El carrito está vacío
              </Typography>
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                Agregue productos para comenzar
              </Typography>
            </Box>
          ) : (
            selectedProducts.map((product) => (
              <CartItem key={product.id}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {product.quantity} {product.unit}
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                      ${(product.price * product.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  size="small"
                  color="error"
                  onClick={() => removeFromCart(product.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CartItem>
            ))
          )}
        </Box>
        
        {selectedProducts.length > 0 && (
          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="subtitle2">Total</Typography>
              <Typography variant="subtitle1" color="primary.main" sx={{ fontWeight: 600 }}>
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleNext}
              sx={{
                py: 1,
                borderRadius: "6px",
                textTransform: "none",
                fontSize: "0.9rem",
                fontWeight: 500,
              }}
            >
              Continuar
            </Button>
          </Box>
        )}
      </CartContainer>
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              {loading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  minHeight: '400px' 
                }}>
                  <CircularProgress size={60} />
                  <Typography variant="h6" sx={{ ml: 2 }}>
                    Cargando productos del almacén...
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
                          {products.length === 0 ? 'No hay productos disponibles en el almacén' : 'No se encontraron productos'}
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
            <Box sx={{ minWidth: '280px', maxWidth: '350px', alignSelf: 'flex-start', position: 'sticky', top: 0 }}>
              {renderCart()}
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box component="form" sx={{ mt: 2, maxWidth: '800px', mx: 'auto' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Detalles de Envío
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sucursal"
                  name="sucursal"
                  value={shippingDetails.sucursal}
                  disabled
                  helperText="Sucursal asignada automáticamente según tu perfil"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Solicitado por"
                  name="requestedBy"
                  value={shippingDetails.requestedBy}
                  disabled
                  helperText="Información obtenida de tu perfil"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de Contacto"
                  name="contactNumber"
                  value={shippingDetails.contactNumber}
                  disabled
                  helperText="Número de contacto de tu perfil"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notas Adicionales"
                  name="notes"
                  value={shippingDetails.notes}
                  onChange={handleShippingChange}
                  multiline
                  rows={4}
                  placeholder="Agrega cualquier información adicional sobre tu pedido..."
                  helperText="Campo opcional para instrucciones especiales o comentarios"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Resumen del Pedido
            </Typography>
            <Divider sx={{ mb: 4 }} />
            {selectedProducts.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No hay productos seleccionados. Por favor, seleccione al menos un producto.
              </Alert>
            ) : (
              <Grid container spacing={4}>
                <Grid item xs={12} lg={7}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                    Materiales Solicitados
                  </Typography>
                  {selectedProducts.map((product) => (
                    <Box key={product.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 3 }}>
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Box sx={{ display: 'flex', mt: 1, gap: 4 }}>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                              Cantidad: {product.quantity} {product.unit}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'primary.main' }}>
                              Tiempo estimado de entrega: {product.eta}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          color="error" 
                          onClick={() => removeFromCart(product.id)}
                          sx={{ ml: 2 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12} lg={5}>
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    mb: 3,
                    position: 'sticky',
                    top: 0
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Detalles de Envío
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Sucursal
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {shippingDetails.sucursal}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Solicitado por
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {shippingDetails.requestedBy}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        Contacto
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {shippingDetails.contactNumber}
                      </Typography>
                      
                      {shippingDetails.notes && (
                        <>
                          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                            Notas
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {shippingDetails.notes}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}
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

      // Calcular el total de la orden
      const orderTotal = selectedProducts.reduce((total, product) => {
        return total + (product.price * product.quantity);
      }, 0);

      // Preparar datos de la orden
      const orderData = {
        orderTotal: orderTotal,
        status: "Pending", // Estado inicial
        comments: shippingDetails.notes || null,
        storeID: user.storeID // Se obtiene del token JWT en el backend
      };

      // Preparar items de la orden
      const orderItems = selectedProducts.map(product => ({
        productID: product.id,
        source: "warehouse", // Viene del almacén
        quantity: product.quantity,
        itemTotal: product.price * product.quantity
      }));

      console.log("Creating order with data:", { orderData, orderItems });

      // Crear la orden
      const response = await orderService.createOrder(orderData, orderItems);
      
      if (response.data && response.data.success) {
        setOrderSubmitted(true);
        
        // Mostrar mensaje de éxito
        console.log("Order created successfully with ID:", response.data.orderID);
        
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
          message: `¡Pedido creado exitosamente! ID de orden: ${response.data.orderID}`,
          severity: 'success'
        });
        
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
      
    } catch (error) {
      console.error("Error submitting order:", error);
      setSnackbar({
        open: true,
        message: `Error al crear el pedido: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <Header title="Solicitar Materiales del Almacén" />

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
                  Catálogo de Productos
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
                {isSubmitting ? "Procesando..." : "Confirmar Solicitud"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && selectedProducts.length === 0)
                  // Los campos de envío se llenan automáticamente, no necesitan validación
                }
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {activeStep === 1 ? "Revisar Solicitud" : "Continuar"}
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

export default OrderPage;