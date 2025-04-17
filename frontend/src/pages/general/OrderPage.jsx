// pages/general/OrderPage.jsx

import React, { useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  borderRadius: "12px",
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: "240px",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const CartItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'start',
  padding: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const CartContainer = styled(Paper)(({ theme }) => ({
  width: '300px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
}));

const OrderPage = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState({});
  const [shippingDetails, setShippingDetails] = useState({
    department: "",
    location: "",
    requestedBy: "",
    contactNumber: "",
    notes: "",
  });

  const products = [
    {
      id: 1,
      name: "Acero Inoxidable",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=500&fit=crop",
      description: "Láminas de acero inoxidable de alta calidad",
      unit: "kg",
      minOrder: 1,
      maxOrder: 1000,
      increment: 1,
      stock: 2000,
      eta: "2-3 días hábiles"
    },
    {
      id: 2,
      name: "Tornillos Hexagonales",
      image: "https://images.unsplash.com/photo-1581094794329-c8112c4e1f1c?w=500&h=500&fit=crop",
      description: "Tornillos de grado industrial",
      unit: "piezas",
      minOrder: 1,
      maxOrder: 10000,
      increment: 1,
      stock: 50000,
      eta: "1 día hábil"
    },
    {
      id: 3,
      name: "Alambre de Cobre",
      image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&h=500&fit=crop",
      description: "Alambre de cobre para instalaciones eléctricas",
      unit: "metros",
      minOrder: 1,
      maxOrder: 1000,
      increment: 1,
      stock: 5000,
      eta: "2 días hábiles"
    },
    {
      id: 4,
      name: "Pintura Industrial",
      image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=500&h=500&fit=crop",
      description: "Pintura resistente para uso industrial",
      unit: "litros",
      minOrder: 1,
      maxOrder: 100,
      increment: 1,
      stock: 500,
      eta: "1-2 días hábiles"
    },
    {
      id: 5,
      name: "Resina Epóxica",
      image: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=500&fit=crop",
      description: "Resina epóxica para recubrimientos",
      unit: "kg",
      minOrder: 1,
      maxOrder: 100,
      increment: 1,
      stock: 300,
      eta: "3-4 días hábiles"
    },
    {
      id: 6,
      name: "Tuercas de Seguridad",
      image: "https://images.unsplash.com/photo-1581094794329-c8112c4e1f1c?w=500&h=500&fit=crop",
      description: "Tuercas con sistema de seguridad",
      unit: "piezas",
      minOrder: 1,
      maxOrder: 5000,
      increment: 1,
      stock: 20000,
      eta: "1 día hábil"
    }
  ];

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

  const renderCart = () => {
    return (
      <CartContainer>
        <Box sx={{ 
          p: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ShoppingCartIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Carrito
          </Typography>
          <Typography variant="body2" sx={{ ml: 'auto' }}>
            {selectedProducts.length} items
          </Typography>
        </Box>
        
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "3px",
            "&:hover": {
              background: "#666",
            },
          },
        }}>
          {selectedProducts.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body1">
                El carrito está vacío
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Agregue productos para comenzar
              </Typography>
            </Box>
          ) : (
            selectedProducts.map((product) => (
              <CartItem key={product.id}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.quantity} {product.unit}
                  </Typography>
                </Box>
                <IconButton 
                  size="small"
                  color="error"
                  onClick={() => removeFromCart(product.id)}
                  sx={{ mt: -0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CartItem>
            ))
          )}
        </Box>
        
        <Box sx={{ 
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            disabled={selectedProducts.length === 0}
            onClick={handleNext}
            sx={{
              py: 1,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Continuar
          </Button>
        </Box>
      </CartContainer>
    );
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Grid container spacing={4}>
                {products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <ProductCard>
                      <StyledCardMedia
                        component="img"
                        image={product.image}
                        alt={product.name}
                      />
                      <CardContent sx={{ p: 3, flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {product.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Unidad: {product.unit}
                        </Typography>
                        <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
                          Disponible: {product.stock} {product.unit}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            fullWidth
                            label={`Cantidad (${product.unit})`}
                            type="number"
                            value={quantities[product.id] || ''}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            error={!!error[product.id]}
                            helperText={error[product.id]}
                            InputProps={{
                              inputProps: { 
                                min: product.minOrder,
                                max: Math.min(product.maxOrder, product.stock),
                                step: product.increment
                              }
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                          />
                        </Box>
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                          startIcon={<AddShoppingCartIcon />}
                          onClick={() => addToCart(product)}
                          sx={{
                            py: 1.5,
                            borderRadius: "8px",
                            textTransform: "none",
                            fontSize: "1rem",
                            fontWeight: 500,
                          }}
                        >
                          Agregar al Pedido
                        </Button>
                      </CardContent>
                    </ProductCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
            {renderCart()}
          </Box>
        );
      case 1:
        return (
          <Box component="form" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Departamento o Área"
                  name="department"
                  value={shippingDetails.department}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Ubicación/Piso"
                  name="location"
                  value={shippingDetails.location}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Solicitado por"
                  name="requestedBy"
                  value={shippingDetails.requestedBy}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Número de Contacto"
                  name="contactNumber"
                  value={shippingDetails.contactNumber}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notas Adicionales"
                  name="notes"
                  value={shippingDetails.notes}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Resumen del Pedido
            </Typography>
            <Divider sx={{ my: 3 }} />
            {selectedProducts.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No hay productos seleccionados. Por favor, seleccione al menos un producto.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                    Materiales Solicitados
                  </Typography>
                  {selectedProducts.map((product) => (
                    <Box key={product.id} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      mb: 2
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          Cantidad: {product.quantity} {product.unit}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'primary.main', mt: 1 }}>
                          Tiempo estimado de entrega: {product.eta}
                        </Typography>
                      </Box>
                      <IconButton 
                        color="error" 
                        onClick={() => removeFromCart(product.id)}
                        sx={{ ml: 2 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                    Detalles de Entrega
                  </Typography>
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Departamento: {shippingDetails.department}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Ubicación: {shippingDetails.location}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Solicitado por: {shippingDetails.requestedBy}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Contacto: {shippingDetails.contactNumber}
                    </Typography>
                    {shippingDetails.notes && (
                      <Typography variant="body1" sx={{ mt: 2 }}>
                        Notas: {shippingDetails.notes}
                      </Typography>
                    )}
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

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title="Solicitar Materiales del Almacén" />
      <Box sx={{ 
        flex: 1,
        maxWidth: 1400,
        width: "100%",
        margin: "0 auto", 
        padding: "2rem",
        display: "flex",
        flexDirection: "column"
      }}>
        <StyledPaper sx={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 180px)",
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

          <Box sx={{ 
            flex: 1,
            overflow: "auto",
            p: 2,
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
                onClick={() => {
                  // Handle order submission
                  console.log("Order submitted", {
                    products: selectedProducts,
                    shipping: shippingDetails
                  });
                }}
                disabled={selectedProducts.length === 0}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                Confirmar Solicitud
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && selectedProducts.length === 0) ||
                  (activeStep === 1 && (!shippingDetails.department || !shippingDetails.location || !shippingDetails.requestedBy || !shippingDetails.contactNumber))
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
    </div>
  );
};

export default OrderPage; 