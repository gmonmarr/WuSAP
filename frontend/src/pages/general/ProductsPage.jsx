import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  useTheme,
  IconButton,
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
  FormControlLabel,
  Switch,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Navbar from "../../components/Navbar";
import Header from "../../components/Header";
import AvisoPerdidaInfo from "../../components/AvisoPerdidaInfo";
import ProductCard from "../../components/ProductCard";
import { productService } from "../../services/api";

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  background: "#ffffff",
}));

// eslint-disable-next-line no-unused-vars
const StyledCard = styled(Paper)(({ theme }) => ({
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
const StyledCardMedia = styled(Paper)(({ theme }) => ({
  height: "180px",
  objectFit: "cover",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const ProductsPage = () => {
  // eslint-disable-next-line no-unused-vars
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New state variables for product creation
  const [openProductDialog, setOpenProductDialog] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [productImage, setProductImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: "",
    suggestedPrice: "",
    unit: "Pieza",
    discontinued: false,
  });
  const [productFormErrors, setProductFormErrors] = useState({});

  // Edit and delete states
  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Sample placeholder images for products
  const placeholderImages = [
    "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=500&h=500&fit=crop",
  ];

  // State for products
  const [products, setProducts] = useState([]);

  // Function to get a random image from the placeholder images
  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * placeholderImages.length);
    return placeholderImages[randomIndex];
  };

  // Effect to fetch products on component mount
  useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAllProducts();
        let data = response.data;
        
        // Map API response fields to the format expected by the UI
        data = data.map(product => ({
          id: product.PRODUCTID,
          name: product.NAME,
          price: typeof product.SUGGESTEDPRICE === 'string' 
            ? parseFloat(product.SUGGESTEDPRICE) 
            : product.SUGGESTEDPRICE || 0,
          suggestedPrice: product.SUGGESTEDPRICE,
          unit: product.UNIT,
          discontinued: product.DISCONTINUED,
          // Use a random image since the API doesn't provide images
          image: product.image || getRandomImage(),
          // Generate description from name and unit
          description: product.description || `${product.NAME} - ${product.UNIT}`,
          // Default stock to 0 if missing
          stock: product.stock || 0
        }));
        
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error al cargar productos: " + (error.response?.data?.details || error.message));
        // In case of error, keep the UI working with empty array
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) =>
    (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (product.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  // Product creation handlers
  const handleOpenProductDialog = () => {
    setIsEditMode(false);
    setEditingProduct(null);
    setOpenProductDialog(true);
  };

  const handleCloseProductDialog = () => {
    setOpenProductDialog(false);
    setIsEditMode(false);
    setEditingProduct(null);
    setProductImage(null);
    setImagePreview(null);
    setProductFormData({
      name: "",
      suggestedPrice: "",
      unit: "Pieza",
      discontinued: false,
    });
    setProductFormErrors({});
    setError("");
    setSuccessMessage(null);
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setProductFormErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductImage(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setImagePreview(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const validateProductForm = () => {
    const errors = {};
    if (!productFormData.name.trim()) {
      errors.name = "El nombre es requerido";
    }
    if (!productFormData.suggestedPrice.trim()) {
      errors.suggestedPrice = "El precio es requerido";
    } else if (isNaN(Number(productFormData.suggestedPrice)) || Number(productFormData.suggestedPrice) <= 0) {
      errors.suggestedPrice = "El precio debe ser un número positivo";
    }
    if (!productFormData.unit) {
      errors.unit = "La unidad es requerida";
    }
    return errors;
  };

  const handleCreateProduct = async () => {
    const errors = validateProductForm();
    if (Object.keys(errors).length > 0) {
      setProductFormErrors(errors);
      return;
    }

    setCreatingProduct(true);
    setError("");
    
    try {
      // Create product data object
      const productData = {
        name: productFormData.name,
        suggestedPrice: productFormData.suggestedPrice,
        unit: productFormData.unit,
        discontinued: productFormData.discontinued,
      };

      let result;
      if (isEditMode && editingProduct) {
        // Update existing product
        result = await productService.updateProduct(editingProduct.id, productData);
        setSuccessMessage(`Producto "${productData.name}" actualizado correctamente.`);
      } else {
        // Create new product
        result = await productService.createProduct(productData);
        setSuccessMessage(`Producto "${productData.name}" creado correctamente.`);
      }
      
      handleCloseProductDialog();
      
      // Refresh the product list
      await refreshProductList();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error.response?.data?.details || error.response?.data?.message || error.message;
      setError("Error al guardar el producto: " + errorMessage);
    } finally {
      setCreatingProduct(false);
    }
  };

  // Delete product handler
  const handleDeleteProduct = async (product) => {
    if (window.confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        setSuccessMessage(`Producto "${product.name}" eliminado correctamente.`);
        await refreshProductList();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error("Error deleting product:", error);
        const errorMessage = error.response?.data?.details || error.response?.data?.message || error.message;
        setError("Error al eliminar producto: " + errorMessage);
      }
    }
  };

  // Helper function to refresh product list
  const refreshProductList = async () => {
    try {
      const refreshedProducts = await productService.getAllProducts();
      
      // Map API response fields to the format expected by the UI
      const processedProducts = refreshedProducts.data.map(product => ({
        id: product.PRODUCTID,
        name: product.NAME,
        price: typeof product.SUGGESTEDPRICE === 'string' 
          ? parseFloat(product.SUGGESTEDPRICE) 
          : product.SUGGESTEDPRICE || 0,
        suggestedPrice: product.SUGGESTEDPRICE,
        unit: product.UNIT,
        discontinued: product.DISCONTINUED,
        image: product.image || getRandomImage(),
        description: product.description || `${product.NAME} - ${product.UNIT}`,
        stock: product.stock || 0
      }));
      
      setProducts(processedProducts);
    } catch (refreshError) {
      console.error("Error refreshing products:", refreshError);
      setError("Error al actualizar la lista de productos");
    }
  };

  // Edit product handler
  const handleEditProduct = (product) => {
    setIsEditMode(true);
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      suggestedPrice: product.suggestedPrice.toString(),
      unit: product.unit,
      discontinued: product.discontinued || false,
    });
    setImagePreview(product.image);
    setOpenProductDialog(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <AvisoPerdidaInfo />
      <Navbar />
      <Header title="Gestión de Productos" />
      <Box sx={{ 
        flex: 1,
        maxWidth: 1600,
        width: "100%",
        margin: "0 auto", 
        padding: "1.5rem 2rem",
        display: "flex",
        flexDirection: "column"
      }}>
        {/* Success Message */}
        {successMessage && (
          <Box sx={{ mb: 2 }}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: '#e8f5e8',
                border: '1px solid #4caf50',
                borderRadius: 2
              }}
            >
              <Typography variant="body1">{successMessage}</Typography>
            </Paper>
          </Box>
        )}
        
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
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenProductDialog}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                Agregar Producto
              </Button>
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
                  Cargando productos...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard 
                      product={product} 
                      showStock={false}
                      showEditButton={true}
                      showDeleteButton={true}
                      editable={false}
                      onEditClick={handleEditProduct}
                      onDeleteClick={handleDeleteProduct}
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
                        No se encontraron productos
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm 
                          ? "Intente con otro término de búsqueda" 
                          : "Agregue un nuevo producto para comenzar"}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </StyledPaper>
      </Box>
      
      {/* Product Creation Dialog */}
      <Dialog 
        open={openProductDialog} 
        onClose={handleCloseProductDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{isEditMode ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Producto"
                name="name"
                value={productFormData.name}
                onChange={handleProductFormChange}
                error={!!productFormErrors.name}
                helperText={productFormErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Precio Sugerido"
                name="suggestedPrice"
                type="number"
                value={productFormData.suggestedPrice}
                onChange={handleProductFormChange}
                error={!!productFormErrors.suggestedPrice}
                helperText={productFormErrors.suggestedPrice}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!productFormErrors.unit}>
                <InputLabel id="unit-select-label">Unidad</InputLabel>
                <Select
                  labelId="unit-select-label"
                  id="unit-select"
                  name="unit"
                  value={productFormData.unit}
                  label="Unidad"
                  onChange={handleProductFormChange}
                >
                  <MenuItem value="Pieza">Pieza</MenuItem>
                  <MenuItem value="Kg">Kilogramo (Kg)</MenuItem>
                  <MenuItem value="g">Gramo (g)</MenuItem>
                  <MenuItem value="L">Litro (L)</MenuItem>
                  <MenuItem value="mL">Mililitro (mL)</MenuItem>
                  <MenuItem value="m">Metro (m)</MenuItem>
                  <MenuItem value="cm">Centímetro (cm)</MenuItem>
                  <MenuItem value="m²">Metro cuadrado (m²)</MenuItem>
                  <MenuItem value="m³">Metro cúbico (m³)</MenuItem>
                  <MenuItem value="Paquete">Paquete</MenuItem>
                  <MenuItem value="Caja">Caja</MenuItem>
                  <MenuItem value="Rollo">Rollo</MenuItem>
                </Select>
                {productFormErrors.unit && (
                  <FormHelperText>{productFormErrors.unit}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={productFormData.discontinued}
                    onChange={(e) => handleProductFormChange({ target: { name: 'discontinued', value: e.target.checked } })}
                  />
                }
                label="Producto Descontinuado"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Imagen del Producto (Opcional)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    ...(imagePreview && {
                      backgroundImage: `url(${imagePreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    })
                  }}
                >
                  {!imagePreview && (
                    <Typography variant="body2" color="text.secondary" align="center">
                      Vista previa
                    </Typography>
                  )}
                  {imagePreview && (
                    <Box sx={{ position: 'absolute', bottom: 4, right: 4 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setProductImage(null);
                          setImagePreview(null);
                        }}
                        sx={{ bgcolor: 'rgba(255,255,255,0.8)', width: 22, height: 22 }}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    fullWidth
                    sx={{ mb: 1 }}
                  >
                    {imagePreview ? "Cambiar Imagen" : "Seleccionar Imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    Formatos: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateProduct}
            disabled={creatingProduct}
            startIcon={creatingProduct ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {creatingProduct ? (isEditMode ? "Actualizando..." : "Creando...") : (isEditMode ? "Actualizar Producto" : "Crear Producto")}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProductsPage; 