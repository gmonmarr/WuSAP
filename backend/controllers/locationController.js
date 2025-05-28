import * as locationService from '../services/locationService.js';

/**
 * Get all locations
 */
export async function getAllLocations(req, res) {
  try {
    const locations = await locationService.getAllLocations();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations', details: err.message });
  }
}

/**
 * Get location by ID
 */
export async function getLocationById(req, res) {
  const { id } = req.params;
  
  try {
    const location = await locationService.getLocationById(Number(id));
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch location', details: err.message });
  }
}

/**
 * Create a new location
 */
export async function createLocation(req, res) {
  const locationData = req.body;
  const createdByID = req.user?.employeeID;

  if (!createdByID) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
  }

  // Validation
  if (!locationData.name || !locationData.location) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: 'Name and location are required fields' 
    });
  }

  if (locationData.name.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: 'Location name cannot be empty' 
    });
  }

  if (locationData.location.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: 'Location address cannot be empty' 
    });
  }

  try {
    const result = await locationService.createLocation(locationData, createdByID);
    res.status(201).json(result);
  } catch (err) {
    // Handle duplicate entry errors
    if (err.message.includes('duplicate') || err.message.includes('unique')) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'A location with this name already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to create location', details: err.message });
  }
}

/**
 * Update a location
 */
export async function updateLocation(req, res) {
  const { id } = req.params;
  const locationData = req.body;
  const updatedByID = req.user?.employeeID;

  if (!updatedByID) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
  }

  // Validation
  if (locationData.name !== undefined && locationData.name.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: 'Location name cannot be empty' 
    });
  }

  if (locationData.location !== undefined && locationData.location.trim().length === 0) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: 'Location address cannot be empty' 
    });
  }

  try {
    const result = await locationService.updateLocation(Number(id), locationData, updatedByID);
    res.json(result);
  } catch (err) {
    if (err.message === 'Location not found') {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Handle duplicate entry errors
    if (err.message.includes('duplicate') || err.message.includes('unique')) {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: 'A location with this name already exists' 
      });
    }
    
    res.status(500).json({ error: 'Failed to update location', details: err.message });
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(req, res) {
  const { id } = req.params;
  const deletedByID = req.user?.employeeID;

  if (!deletedByID) {
    return res.status(401).json({ error: 'Unauthorized: Missing employee ID from token' });
  }

  try {
    const result = await locationService.deleteLocation(Number(id), deletedByID);
    res.json(result);
  } catch (err) {
    if (err.message === 'Location not found') {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Handle employees assigned error
    if (err.message.includes('tiene empleados asignados')) {
      return res.status(400).json({ 
        error: 'Cannot delete location', 
        details: err.message
      });
    }
    
    // Handle foreign key constraint errors
    if (err.message.includes('foreign key') || err.message.includes('constraint')) {
      return res.status(400).json({ 
        error: 'Cannot delete location', 
        details: 'This location is being used by other records and cannot be deleted' 
      });
    }
    
    res.status(500).json({ error: 'Failed to delete location', details: err.message });
  }
}

/**
 * Check table structure (temporary for debugging)
 */
export async function checkTable(req, res) {
  try {
    const result = await locationService.checkLocationsTable();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check table', details: err.message });
  }
}

/**
 * Create table (temporary for setup)
 */
export async function createTable(req, res) {
  try {
    const result = await locationService.createLocationsTable();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create table', details: err.message });
  }
}

/**
 * Get employees by location (temporary for testing)
 */
export async function getEmployeesByLocation(req, res) {
  const { id } = req.params;
  
  try {
    const employees = await locationService.getEmployeesByLocation(Number(id));
    const hasEmployees = await locationService.checkLocationHasEmployees(Number(id));
    
    res.json({
      locationId: Number(id),
      hasEmployees,
      employeeCount: employees.length,
      employees
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get employees by location', details: err.message });
  }
} 