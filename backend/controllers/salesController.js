// controllers/salesController.js

import {
    getAllSales as getAllSalesService,
    getSaleById as getSaleByIdService,
    postSale as createSaleService,
    // updateSale as updateSaleService,
    deleteSale as deleteSaleService
} from "../services/salesService.js";

export const getAllSales = async (req, res) => {
  try {
    const sales = await getAllSalesService();
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await getSaleByIdService(Number(id));
    if (!sale) return res.status(404).json({ success: false, message: "Sale not found" });
    res.status(200).json(sale);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const postSale = async (req, res) => {
  const { sale, saleItems } = req.body;
  const employeeID = req.user?.employeeID;
  if (!employeeID) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing employee ID" });
  }
  try {
    const result = await createSaleService(sale, saleItems, employeeID);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// export const updateSale = async (req, res) => {
//   const { id } = req.params;
//   const { sale, saleItems } = req.body;
//   const employeeID = req.user?.employeeID;
//   if (!employeeID) {
//     return res.status(401).json({ success: false, message: "Unauthorized: Missing employee ID" });
//   }
//   try {
//     const result = await updateSaleService(Number(id), sale, saleItems, employeeID);
//     res.status(200).json(result);
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

export const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeID = req.user?.employeeID; // <-- take from token

    if (!employeeID) {
      return res.status(401).json({ success: false, message: "No autorizado, falta employeeID." });
    }

    const result = await deleteSaleService(Number(id), employeeID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};