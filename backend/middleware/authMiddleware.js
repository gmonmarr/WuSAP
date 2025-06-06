// middleware/authMiddleware.js

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // store user info in request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};

// ✨ NUEVA: Middleware específico para verificación de tokens
export const verifyTokenOnly = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Token no proporcionado" 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Para endpoint de verificación, devolvemos directamente la respuesta
    return res.status(200).json({ 
      success: true, 
      message: "Token válido",
      user: {
        employeeID: decoded.employeeID,
        role: decoded.role,
        name: decoded.name,
        lastName: decoded.lastName,
        email: decoded.email
      }
    });
  } catch (error) {
    return res.status(403).json({ 
      success: false,
      message: "Token inválido o expirado" 
    });
  }
};

// 🚀 SÚPER FLEXIBLE: Un middleware que puede hacer ambas cosas
export const authMiddleware = (options = {}) => {
  const { returnResponse = false, requiredRoles = [] } = options;
  
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const errorMsg = "Token no proporcionado";
      if (returnResponse) {
        return res.status(401).json({ success: false, message: errorMsg });
      }
      return res.status(401).json({ message: errorMsg });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verificar roles si se especificaron
      if (requiredRoles.length > 0) {
        if (!requiredRoles.includes(decoded.role)) {
          const errorMsg = `Acceso denegado: se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}.`;
          if (returnResponse) {
            return res.status(403).json({ success: false, message: errorMsg });
          }
          return res.status(403).json({ message: errorMsg });
        }
      }
      
      // Si solo queremos verificar (para endpoint /verify)
      if (returnResponse) {
        return res.status(200).json({ 
          success: true, 
          message: "Token válido",
          user: {
            employeeID: decoded.employeeID,
            role: decoded.role,
            name: decoded.name,
            lastName: decoded.lastName,
            email: decoded.email
          }
        });
      }
      
      // Para flujo normal, continuar
      req.user = decoded;
      next();
      
    } catch (error) {
      const errorMsg = "Token inválido o expirado";
      if (returnResponse) {
        return res.status(403).json({ success: false, message: errorMsg });
      }
      return res.status(403).json({ message: errorMsg });
    }
  };
};

export const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Acceso denegado: se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`
      });
    }
    next();
  };
};
