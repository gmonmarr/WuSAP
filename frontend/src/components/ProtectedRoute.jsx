import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { authService } from '../services/api';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = authService.getToken();
        const user = authService.getUser();

        if (!token || !user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Verificar si el token es válido haciendo una petición al backend
        try {
          // Hacemos una petición simple para verificar el token
          const response = await fetch(`${import.meta.env.VITE_API_SERVER}/api/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            setIsAuthenticated(true);
            
            // Verificar permisos de rol
            if (allowedRoles.length === 0) {
              // Si no hay roles específicos requeridos, permitir acceso
              setHasPermission(true);
            } else {
              // Verificar si el rol del usuario está en los roles permitidos
              const userRole = user.role;
              const hasRole = allowedRoles.includes(userRole);
              setHasPermission(hasRole);
            }
          } else {
            // Token inválido, limpiar datos
            authService.logout();
            setIsAuthenticated(false);
            setHasPermission(false);
          }
        } catch (verifyError) {
          console.error('Error verifying token:', verifyError);
          // En caso de error, limpiar datos por seguridad
          authService.logout();
          setIsAuthenticated(false);
          setHasPermission(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en localStorage para revalidar automáticamente
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [allowedRoles]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Verificando acceso...
        </Typography>
      </Box>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/inicio-sesion" state={{ from: location }} replace />;
  }

  // Si está autenticado pero no tiene permisos, mostrar página de acceso denegado
  if (!hasPermission) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
          px: 3
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          🚫 Acceso Denegado
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No tienes permisos para acceder a esta página
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Tu rol actual no tiene autorización para ver este contenido.
          {allowedRoles.length > 0 && (
            <>
              <br />
              <strong>Roles requeridos:</strong> {allowedRoles.join(', ')}
            </>
          )}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <button 
            onClick={() => window.history.back()} 
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Volver Atrás
          </button>
        </Box>
      </Box>
    );
  }

  // Si todo está bien, renderizar el componente hijo
  return children;
};

export default ProtectedRoute; 