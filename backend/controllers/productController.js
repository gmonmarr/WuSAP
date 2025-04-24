import {
    getAllProducts,
    getActiveProductsService,
    addProduct
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
    const { name, suggestedPrice, unit } = req.body;
    const employeeID = req.user.employeeID;
  
    try {
      const result = await addProduct(name, suggestedPrice, unit, employeeID);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error al agregar producto' });
    }
  };
  