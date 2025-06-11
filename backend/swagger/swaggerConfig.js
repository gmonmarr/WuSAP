import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WuSAP API Documentation',
      version: '1.0.0',
      description: 'Documentación completa de la API WuSAP - Sistema de gestión empresarial integrado con SAP HANA',
      contact: {
        name: 'WuSAP Team',
        email: 'NOHAYCONTACTO@wusap.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /auth/login'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Token de acceso inválido o faltante',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Token no válido'
                  }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado - Rol insuficiente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Acceso denegado'
                  }
                }
              }
            }
          }
        },
        NotFoundError: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Recurso no encontrado'
                  }
                }
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación en los datos enviados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        field: {
                          type: 'string',
                          example: 'email'
                        },
                        message: {
                          type: 'string',
                          example: 'El email es requerido'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints de autenticación y autorización'
      },
      {
        name: 'Products',
        description: 'Gestión de productos'
      },
      {
        name: 'Inventory',
        description: 'Control de inventario'
      },
      {
        name: 'Orders',
        description: 'Gestión de pedidos'
      },
      {
        name: 'Sales',
        description: 'Registro y gestión de ventas'
      },
      {
        name: 'Employees',
        description: 'Gestión de empleados'
      },
      {
        name: 'Locations',
        description: 'Gestión de ubicaciones y tiendas'
      },
      {
        name: 'Dashboard',
        description: 'Datos y métricas del dashboard'
      },
      {
        name: 'Predictions',
        description: 'Predicciones de ventas con IA'
      },
      {
        name: 'Test',
        description: 'Endpoints de prueba y diagnóstico'
      }
    ]
  },
  apis: [
    path.join(__dirname, './docs/**/*.js'),
    path.join(__dirname, '../routes/*.js')
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 