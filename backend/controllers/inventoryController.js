// controllers/inventoryController.js

import { 
    getAllInventory,
    getInventoryByStore,
    assignInventoryToStore
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
      const storeID = req.user.storeID;
      const data = await getInventoryByStore(storeID);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
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
  
  