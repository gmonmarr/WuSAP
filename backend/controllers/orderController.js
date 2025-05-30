// controllers/orderController.js

import * as orderService from '../services/orderService.js';

export async function getAllOrders(req, res) {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
}

export async function getAllActiveOrders(req, res) {
  try {
    const activeOrders = await orderService.getAllActiveOrders();
    res.json(activeOrders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active orders', details: err.message });
  }
}

export async function getOrderById(req, res) {
  const { id } = req.params;
  try {
    const orderData = await orderService.getOrderById(Number(id));
    if (!orderData.order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(orderData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order', details: err.message });
  }
}

export async function getOrdersByStore(req, res) {
  const storeID = req.user?.storeID;
  if (!storeID) {
    return res.status(401).json({ error: 'Unauthorized: Missing store ID from token' });
  }

  try {
    const orders = await orderService.getOrdersByStore(Number(storeID));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store orders', details: err.message });
  }
}

export async function getOrdersByEmployee(req, res) {
  const employeeID = req.user?.employeeID;
  if (!employeeID) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
  }

  try {
    const orders = await orderService.getOrdersByEmployee(Number(employeeID));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employee orders', details: err.message });
  }
}

export async function createOrder(req, res) {
  const { orderData, orderItems } = req.body;
  const employeeID = req.user?.employeeID;
  const storeID = req.user?.storeID;
  const userRole = req.user?.role;

  if (!employeeID || !storeID || !userRole) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee, store ID, or role from token' });
  }

  try {
    const enrichedOrderData = { ...orderData, storeID }; // Force storeID from token
    const result = await orderService.createOrder(enrichedOrderData, orderItems, employeeID, userRole);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
}

export async function updateOrder(req, res) {
  const { id } = req.params;
  const { updatedOrder, updatedItems } = req.body;
  const employeeID = req.user?.employeeID;
  const userRole = req.user?.role; // Asegúrate de que el JWT o middleware proporcione esto

  if (!employeeID || !userRole) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee ID or role from token' });
  }

  try {
    const result = await orderService.updateOrder(
      Number(id),
      updatedOrder,
      updatedItems,
      employeeID,
      userRole
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order', details: err.message });
  }
}

