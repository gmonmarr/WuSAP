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
  IconButton,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Styled components
// eslint-disable-next-line no-unused-vars
const StyledCard = styled(Card)(({ theme }) => ({
  // `theme` is not used here either, but left for potential theme use
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

// eslint-disable-next-line no-unused-vars
const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  // `theme` is not used here either, but left for potential theme use
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
  showStock = false, // Default to NOT showing stock
  showEditButton = false, // Option to show edit button
  showDeleteButton = false, // Option to show delete button
  editable = false, // If the card should be editable with quantity field
  onEditClick,
  onDeleteClick,
}) => {
  // Format price - handle potential string values or null/undefined
  const formattedPrice = typeof product.price === 'number'
    ? product.price.toFixed(2)
    : parseFloat(product.price || 0).toFixed(2);

  return (
    <StyledCard sx={{
      opacity: product.discontinued ? 0.7 : 1,
      border: product.discontinued ? "2px solid #ff4444" : "1px solid #f0f0f0",
    }}>
      <Box sx={{ position: 'relative' }}>
        <StyledCardMedia
          component="img"
          image={product.image}
          alt={product.name}
          sx={{
            filter: product.discontinued ? "grayscale(100%)" : "none"
          }}
        />
        {product.discontinued && (
          <Chip
            label="Descontinuado"
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontSize: '0.7rem',
              fontWeight: 'bold',
              backgroundColor: '#ff4444',
              color: 'white',
              '& .MuiChip-label': {
                padding: '4px 8px',
              }
            }}
          />
        )}
      </Box>
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
        </ProductHeader>
        
        <ProductDetail>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Unidad: {product.unit || 'unidad'}
            </Typography>
            {showStock && (
              <Chip 
                label={`Stock: ${product.stock || 0}`} 
                color={product.stock > 0 ? "success" : "error"}
                size="small"
                variant="outlined"
                sx={{ height: '20px', fontSize: '0.7rem' }}
              />
            )}
          </Box>
          {editable && product.minOrder && (
            <Typography variant="body2" color="text.secondary">
              Mínimo: {product.minOrder} {product.unit || 'unidad'}
            </Typography>
          )}
        </ProductDetail>
        
        <ProductActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="h6" 
              color="primary" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '1.2rem'
              }}
            >
              ${formattedPrice}/{product.unit || 'unidad'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {showEditButton && (
                <IconButton 
                  color="primary"
                  size="small"
                  onClick={() => onEditClick && onEditClick(product)}
                  data-testid="edit-button"
                  sx={{ 
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.12)',
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              
              {showDeleteButton && (
                <IconButton 
                  color="error"
                  size="small"
                  onClick={() => onDeleteClick && onDeleteClick(product)}
                  data-testid="delete-button"
                  sx={{ 
                    bgcolor: 'rgba(211, 47, 47, 0.08)',
                    '&:hover': {
                      bgcolor: 'rgba(211, 47, 47, 0.12)',
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          
          {editable && (
            <>
              <TextField
                size="small"
                placeholder={`Cantidad (${product.unit || 'unidad'})`}
                type="number"
                value={quantity || ""}
                onChange={(e) => onQuantityChange(product.id, e.target.value)}
                error={!!error}
                helperText={error}
                InputProps={{
                  inputProps: {
                    min: product.minOrder || 1,
                    max: showStock 
                      ? Math.min(product.maxOrder || 10000, product.stock || 0) 
                      : (product.maxOrder || 10000),
                    step: product.increment || 1,
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
            </>
          )}
        </ProductActions>
      </CardContent>
    </StyledCard>
  );
};

export default ProductCard; 