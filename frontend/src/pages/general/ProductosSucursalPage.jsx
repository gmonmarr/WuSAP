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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';
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

  // Function to get a random image from the placeholder images
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  // Effect to fetch store name
  useEffect(() => {
    const fetchStoreName = async () => {
      try {
        const user = authService.getUser();
        if (user && user.storeID) {
          const location = await locationService.getLocationById(user.storeID);
          if (location && location.NAME) {
            setStoreName(location.NAME);
          }
        }
      } catch (error) {
        console.error("Error fetching store name:", error);
        // Keep default name if error
      }
    };

    fetchStoreName();
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
    </div>
  );
};

export default ProductosSucursalPage; 