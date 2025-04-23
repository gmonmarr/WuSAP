import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
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

const ProductCard = ({
  product,
  quantity,
  error,
  onQuantityChange,
  onAddToCart,
  showStock = false, // Optional prop to show stock info
}) => {
  return (
    <StyledCard>
      <StyledCardMedia
        component="img"
        image={product.image}
        alt={product.name}
      />
      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Typography
          gutterBottom
          variant="h5"
          component="div"
          sx={{ fontWeight: 600 }}
        >
          {product.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {product.description}
        </Typography>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Unidad: {product.unit}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Pedido mínimo: {product.minOrder} {product.unit}
          </Typography>
          {showStock && (
            <Typography variant="body2" color="success.main" sx={{ mb: 2, fontWeight: 500 }}>
              Disponible: {product.stock} {product.unit}
            </Typography>
          )}
        </Box>
        <Box sx={{ mt: "auto" }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
            ${product.price}/{product.unit}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={`Cantidad (${product.unit})`}
              type="number"
              value={quantity || ""}
              onChange={(e) => onQuantityChange(product.id, e.target.value)}
              error={!!error}
              helperText={error}
              InputProps={{
                inputProps: {
                  min: product.minOrder,
                  max: showStock 
                    ? Math.min(product.maxOrder, product.stock) 
                    : product.maxOrder,
                  step: product.increment,
                },
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
            onClick={() => onAddToCart(product)}
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
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard; 