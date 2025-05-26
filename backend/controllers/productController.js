import {
    getAllProducts,
    getActiveProductsService,
    addProduct,
    updateProduct,
    deleteProduct
  } from '../services/productService.js';
  
  export const getProducts = async (req, res) => {
    try {
      const data = await getAllProducts();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getActiveProducts = async (req, res) => {
    try {
      const data = await getActiveProductsService();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  export const postProduct = async (req, res) => {
    const { name, suggestedPrice, unit, discontinued } = req.body;
    const employeeID = req.user.employeeID;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Product name is required' 
      });
    }

    if (!suggestedPrice || isNaN(Number(suggestedPrice)) || Number(suggestedPrice) <= 0) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Valid suggested price is required' 
      });
    }

    if (!unit || !unit.trim()) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Unit is required' 
      });
    }
  
    try {
      const result = await addProduct(name, suggestedPrice, unit, discontinued || false, employeeID);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ 
        error: 'Error al agregar producto',
        details: error.message 
      });
    }
  };

  /**
   * Update a product
   */
  export const putProduct = async (req, res) => {
    const { id } = req.params;
    const productData = req.body;
    const updatedByID = req.user?.employeeID;

    if (!updatedByID) {
      return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
    }

    // Validation
    if (productData.name !== undefined && !productData.name.trim()) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Product name cannot be empty' 
      });
    }

    if (productData.suggestedPrice !== undefined && (isNaN(productData.suggestedPrice) || productData.suggestedPrice < 0)) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'Suggested price must be a valid positive number' 
      });
    }

    try {
      const result = await updateProduct(Number(id), productData, updatedByID);
      res.json(result);
    } catch (err) {
      if (err.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.status(500).json({ error: 'Failed to update product', details: err.message });
    }
  };

  /**
   * Delete a product
   */
  export const deleteProductController = async (req, res) => {
    const { id } = req.params;
    const deletedByID = req.user?.employeeID;

    if (!deletedByID) {
      return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
    }

    try {
      const result = await deleteProduct(Number(id), deletedByID);
      res.json(result);
    } catch (err) {
      if (err.message === 'Product not found') {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Handle usage in orders error
      if (err.message.includes('está siendo usado en órdenes')) {
        return res.status(400).json({ 
          error: 'Cannot delete product', 
          details: err.message
        });
      }
      
      res.status(500).json({ error: 'Failed to delete product', details: err.message });
    }
  };
  