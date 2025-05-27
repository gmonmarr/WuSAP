// controllers/employeeController.js

import * as employeeService from '../services/employeeService.js';

export async function getAllEmployees(req, res) {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  }
}

export async function updateEmployee(req, res) {
  const { id } = req.params;
  const employeeData = req.body;
  const updatedByID = req.user?.employeeID;

  if (!updatedByID) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
  }

  try {
    // Validar rol si está presente
    if (employeeData.role) {
      const validRoles = ["admin", "manager", "sales", "owner", "warehouse_manager"];
      if (!validRoles.includes(employeeData.role)) {
        return res.status(400).json({ error: 'Validation error', details: 'El rol debe ser admin, manager, sales, owner o warehouse_manager' });
      }
    }

    const result = await employeeService.updateEmployee(Number(id), employeeData, updatedByID);
    res.json(result);
  } catch (err) {
    // Detectar error de validación específico
    if (err.message.includes('El rol debe ser')) {
      return res.status(400).json({ error: 'Validation error', details: err.message });
    }
    res.status(500).json({ error: 'Failed to update employee', details: err.message });
  }
} 