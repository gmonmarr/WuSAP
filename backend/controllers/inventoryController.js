// controllers/inventoryController.js

import {
  getAllInventory,
  getInventoryByStore,
  assignInventoryToStore,
  getWarehouseProducts,
  editInventory,
  getInventoryByStoreByProduct,
  getStoreInventoryWithProducts
} from '../services/inventoryService.js';
  
  export const getInventory = async (req, res) => {
    try {
      const data = await getAllInventory();
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  export const getStoreInventory = async (req, res) => {
    try {
      const storeID = req.body.storeID || req.user?.storeID;
      if (!storeID) {
        return res.status(400).json({ message: 'Store ID not provided.' });
      }
  
      const data = await getInventoryByStore(storeID);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };  
  
  // Nueva función para obtener productos del almacén
  export const getWarehouseProductsController = async (req, res) => {
    try {
      const data = await getWarehouseProducts();
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  };
  
  export const postInventory = async (req, res) => {
    const { productID, storeID, quantity } = req.body;
    const employeeID = req.user.employeeID;
  
    try {
      const result = await assignInventoryToStore(productID, storeID, quantity, employeeID);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Error al asignar inventario' });
    }
  };
  
export const updateInventory = async (req, res) => {
  const { inventoryID, quantity } = req.body;
  const employeeID = req.user?.employeeID;

  if (!inventoryID || quantity == null || employeeID == null) {
    return res.status(400).json({ message: 'inventoryID, quantity y employeeID son requeridos.' });
  }

  try {
    const result = await editInventory(inventoryID, quantity, employeeID);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInventoryByStoreAndProduct = async (req, res) => {
  const { storeID, productID } = req.query;

  if (!storeID || !productID) {
    return res.status(400).json({ message: 'storeID y productID son requeridos.' });
  }

  try {
    const data = await getInventoryByStoreByProduct(storeID, productID);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Nueva función para obtener inventario de tienda con detalles de productos
export const getStoreInventoryWithProductsController = async (req, res) => {
  try {
    const storeID = req.user?.storeID;
    if (!storeID) {
      return res.status(400).json({ message: 'Store ID not found in token.' });
    }

    const data = await getStoreInventoryWithProducts(storeID);
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};
