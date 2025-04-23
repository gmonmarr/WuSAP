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
import ProductCard from "../../components/ProductCard";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
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

const OrderProvider = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [error, setError] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
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
      price: 299.99,
      image: "https://images.unsplash.com/photo-1535813547-3e2d0ee1566a?w=500&h=500&fit=crop",
      description: "Acero inoxidable de alta calidad para uso industrial",
      unit: "kg",
      minOrder: 1,
      maxOrder: 1000,
      increment: 1,
      eta: "2-3 días hábiles"
    },
    {
      id: 2,
      name: "Tornillos Hexagonales",
      price: 0.99,
      image: "https://images.unsplash.com/photo-1597484662317-9bd7bdda2eb5?w=500&h=500&fit=crop",
      description: "Tornillos hexagonales de acero galvanizado",
      unit: "piezas",
      minOrder: 1,
      maxOrder: 10000,
      increment: 1,
      eta: "1 día hábil"
    },
    {
      id: 3,
      name: "Alambre de Cobre",
      price: 45.99,
      image: "https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?w=500&h=500&fit=crop",
      description: "Alambre de cobre para aplicaciones eléctricas",
      unit: "m",
      minOrder: 1,
      maxOrder: 1000,
      increment: 1,
      eta: "2 días hábiles"
    },
    {
      id: 4,
      name: "Pintura Industrial",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=500&h=500&fit=crop",
      description: "Pintura industrial resistente a la corrosión",
      unit: "L",
      minOrder: 1,
      maxOrder: 200,
      increment: 1,
      eta: "1-2 días hábiles"
    },
    {
      id: 5,
      name: "Resina Epóxica",
      price: 159.99,
      image: "https://images.unsplash.com/photo-1589810264340-0ce27bfbf751?w=500&h=500&fit=crop",
      description: "Resina epóxica de alta resistencia",
      unit: "kg",
      minOrder: 1,
      maxOrder: 50,
      increment: 1,
      eta: "3-4 días hábiles"
    },
    {
      id: 6,
      name: "Tuercas de Seguridad",
      price: 0.49,
      image: "https://images.unsplash.com/photo-1597484662341-b6f46e2e4759?w=500&h=500&fit=crop",
      description: "Tuercas de seguridad autoblocantes",
      unit: "piezas",
      minOrder: 1,
      maxOrder: 20000,
      increment: 1,
      eta: "1 día hábil"
    }
  ];

  const steps = ["Seleccionar Materiales", "Confirmar Pedido"];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateQuantity = (product, quantity) => {
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity)) return "Debe ser un número";
    if (numQuantity < product.minOrder) return `Mínimo ${product.minOrder} ${product.unit}`;
    if (numQuantity > product.maxOrder) return `Máximo ${product.maxOrder} ${product.unit}`;
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
      return total + (product.price * product.quantity);
    }, 0);
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      // Here you would typically make an API call to your backend
      console.log("Order submitted:", {
        products: selectedProducts,
        shippingDetails,
        total: calculateTotal(),
        totalWithTax: calculateTotal() * 1.16
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOrderSubmitted(true);
      // Clear the cart and reset the form
      setSelectedProducts([]);
      setQuantities({});
      setShippingDetails({
        department: "",
        location: "",
        requestedBy: "",
        contactNumber: "",
        notes: "",
      });
      setActiveStep(0);
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                  <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                    ${(product.price * product.quantity).toFixed(2)}
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
          <Typography variant="subtitle1" sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontWeight: 600,
            mb: 1
          }}>
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </Typography>
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
            Revisar Pedido
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
                    <ProductCard
                      product={product}
                      quantity={quantities[product.id]}
                      error={error[product.id]}
                      onQuantityChange={handleQuantityChange}
                      onAddToCart={addToCart}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            {renderCart()}
          </Box>
        );
      case 1:
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                            Cantidad: {product.quantity} {product.unit}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.main', mt: 1 }}>
                            Tiempo estimado de entrega: {product.eta}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          ${product.price}/{product.unit}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          ${(product.price * product.quantity).toFixed(2)}
                        </Typography>
                        <IconButton 
                          color="error" 
                          onClick={() => removeFromCart(product.id)}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Resumen de Precios
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1">${calculateTotal().toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">IVA (16%)</Typography>
                      <Typography variant="body1">${(calculateTotal() * 0.16).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${(calculateTotal() * 1.16).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mt: 2 }}>
                    Notas Adicionales
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Agregue cualquier nota o instrucción especial para su pedido"
                    name="notes"
                    value={shippingDetails.notes}
                    onChange={handleShippingChange}
                    sx={{ 
                      "& .MuiOutlinedInput-root": { 
                        borderRadius: "8px",
                        backgroundColor: 'background.paper'
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.description}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                            Cantidad: {product.quantity} {product.unit}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'primary.main', mt: 1 }}>
                            Tiempo estimado de entrega: {product.eta}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                          ${product.price}/{product.unit}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                          ${(product.price * product.quantity).toFixed(2)}
                        </Typography>
                        <IconButton 
                          color="error" 
                          onClick={() => removeFromCart(product.id)}
                          sx={{ mt: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Resumen de Precios
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1">${calculateTotal().toFixed(2)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">IVA (16%)</Typography>
                      <Typography variant="body1">${(calculateTotal() * 0.16).toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${(calculateTotal() * 1.16).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ 
                    p: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    backgroundColor: 'background.paper'
                  }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                      Detalles de Entrega
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Departamento</Typography>
                        <Typography variant="body1">{shippingDetails.department}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Ubicación</Typography>
                        <Typography variant="body1">{shippingDetails.location}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Solicitado por</Typography>
                        <Typography variant="body1">{shippingDetails.requestedBy}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">Contacto</Typography>
                        <Typography variant="body1">{shippingDetails.contactNumber}</Typography>
                      </Grid>
                      {shippingDetails.notes && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">Notas</Typography>
                          <Typography variant="body1">{shippingDetails.notes}</Typography>
                        </Grid>
                      )}
                    </Grid>
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
      <Header title="Solicitar Material a Proveedor" />
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
                {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
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
                Revisar Pedido
              </Button>
            )}
          </Box>
        </StyledPaper>
      </Box>
    </div>
  );
};

export default OrderProvider; 