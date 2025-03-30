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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";

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

const OrderPage = () => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [shippingDetails, setShippingDetails] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const products = [
    {
      id: 1,
      name: "Producto Premium A",
      price: 299.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
      description: "Descripción del producto premium A",
    },
    {
      id: 2,
      name: "Producto Premium B",
      price: 199.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
      description: "Descripción del producto premium B",
    },
    {
      id: 3,
      name: "Producto Premium C",
      price: 399.99,
      image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
      description: "Descripción del producto premium C",
    },
  ];

  const steps = ["Seleccionar Producto", "Detalles de Envío", "Confirmar Pedido"];

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

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
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
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                      ${product.price}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 500,
                      }}
                      onClick={() => {
                        setSelectedProduct(product);
                        handleNext();
                      }}
                    >
                      Seleccionar
                    </Button>
                  </CardContent>
                </ProductCard>
              </Grid>
            ))}
          </Grid>
        );
      case 1:
        return (
          <Box component="form" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Nombre Completo"
                  name="name"
                  value={shippingDetails.name}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Dirección"
                  name="address"
                  value={shippingDetails.address}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Ciudad"
                  name="city"
                  value={shippingDetails.city}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Código Postal"
                  name="postalCode"
                  value={shippingDetails.postalCode}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Teléfono"
                  name="phone"
                  value={shippingDetails.phone}
                  onChange={handleShippingChange}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Cantidad</InputLabel>
                  <Select
                    value={quantity}
                    label="Cantidad"
                    onChange={(e) => setQuantity(e.target.value)}
                    sx={{ borderRadius: "8px" }}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
                  Detalles del Producto
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Producto: {selectedProduct.name}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Cantidad: {quantity}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Precio Unitario: ${selectedProduct.price}
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mt: 2, fontWeight: 600 }}>
                  Total: ${(selectedProduct.price * quantity).toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, fontWeight: 500 }}>
                  Detalles de Envío
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{shippingDetails.name}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>{shippingDetails.address}</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {shippingDetails.city}, {shippingDetails.postalCode}
                </Typography>
                <Typography variant="body1">{shippingDetails.phone}</Typography>
              </Grid>
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <Navbar />
      <Header title="Hacer Pedido" />
      <Box sx={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
        <StyledPaper>
          <Stepper 
            activeStep={activeStep} 
            sx={{ 
              mb: 6,
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

          {renderStepContent(activeStep)}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
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
                  console.log("Order submitted");
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                Confirmar Pedido
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={activeStep === 1 && !shippingDetails.name}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                {activeStep === steps.length - 2 ? "Revisar" : "Siguiente"}
              </Button>
            )}
          </Box>
        </StyledPaper>
      </Box>
    </div>
  );
};

export default OrderPage; 