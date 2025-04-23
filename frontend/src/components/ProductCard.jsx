import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "all 0.3s ease",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #f0f0f0",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: "180px",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const ProductHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginBottom: theme.spacing(2),
}));

const ProductDetail = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(2),
}));

const ProductActions = styled(Box)(({ theme }) => ({
  marginTop: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
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
      <CardContent sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <ProductHeader>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600, 
              fontSize: "1.1rem",
              mb: 0.5
            }}
          >
            {product.name}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              lineHeight: '1.4em',
              height: '2.8em'
            }}
          >
            {product.description}
          </Typography>
        </ProductHeader>
        
        <ProductDetail>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Unidad: {product.unit}
            </Typography>
            {showStock && (
              <Chip 
                label={`Stock: ${product.stock}`} 
                color="success" 
                size="small"
                variant="outlined"
                sx={{ height: '20px', fontSize: '0.7rem' }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Mínimo: {product.minOrder} {product.unit}
          </Typography>
        </ProductDetail>
        
        <ProductActions>
          <Typography 
            variant="h6" 
            color="primary" 
            sx={{ 
              fontWeight: 600, 
              textAlign: 'right',
              fontSize: '1.2rem'
            }}
          >
            ${product.price}/{product.unit}
          </Typography>
          
          <TextField
            size="small"
            placeholder={`Cantidad (${product.unit})`}
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
            sx={{ 
              "& .MuiOutlinedInput-root": { 
                borderRadius: "6px",
                fontSize: "0.9rem"
              }
            }}
          />
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="medium"
            startIcon={<AddShoppingCartIcon />}
            onClick={() => onAddToCart(product)}
            sx={{
              py: 1,
              borderRadius: "6px",
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
            }}
          >
            Agregar
          </Button>
        </ProductActions>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard; 