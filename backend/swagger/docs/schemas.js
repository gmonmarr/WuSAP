/**
 * @swagger
 * components:
 *   schemas:
 *     # ===== AUTHENTICATION SCHEMAS =====
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@wusap.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login exitoso"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *     
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *         - storeId
 *       properties:
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan.perez@wusap.com"
 *         password:
 *           type: string
 *           format: password
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: ["admin", "owner", "manager", "warehouse_manager", "sales"]
 *           example: "manager"
 *         storeId:
 *           type: integer
 *           example: 1
 *     
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan.perez@wusap.com"
 *         role:
 *           type: string
 *           example: "manager"
 *         storeId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     # ===== PRODUCT SCHEMAS =====
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Laptop Dell XPS 13"
 *         description:
 *           type: string
 *           example: "Laptop ultrabook de alta gama"
 *         price:
 *           type: number
 *           format: float
 *           example: 1299.99
 *         category:
 *           type: string
 *           example: "Electronics"
 *         brand:
 *           type: string
 *           example: "Dell"
 *         sku:
 *           type: string
 *           example: "DELL-XPS13-001"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *     
 *     ProductCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *         - sku
 *       properties:
 *         name:
 *           type: string
 *           example: "Laptop Dell XPS 13"
 *         description:
 *           type: string
 *           example: "Laptop ultrabook de alta gama"
 *         price:
 *           type: number
 *           format: float
 *           example: 1299.99
 *         category:
 *           type: string
 *           example: "Electronics"
 *         brand:
 *           type: string
 *           example: "Dell"
 *         sku:
 *           type: string
 *           example: "DELL-XPS13-001"
 *     
 *     # ===== INVENTORY SCHEMAS =====
 *     InventoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         productId:
 *           type: integer
 *           example: 1
 *         storeId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 50
 *         minimumStock:
 *           type: integer
 *           example: 10
 *         maximumStock:
 *           type: integer
 *           example: 100
 *         location:
 *           type: string
 *           example: "A-001"
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     
 *     # ===== ORDER SCHEMAS =====
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         orderNumber:
 *           type: string
 *           example: "ORD-2024-001"
 *         customerId:
 *           type: integer
 *           example: 1
 *         storeId:
 *           type: integer
 *           example: 1
 *         employeeId:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: ["Pendiente", "Aprobada", "Confirmada", "Entregada", "Cancelada"]
 *           example: "Pendiente"
 *         totalAmount:
 *           type: number
 *           format: float
 *           example: 2599.98
 *         orderDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         deliveryDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T10:30:00Z"
 *         notes:
 *           type: string
 *           example: "Entrega urgente"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *     
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         orderId:
 *           type: integer
 *           example: 1
 *         productId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 2
 *         unitPrice:
 *           type: number
 *           format: float
 *           example: 1299.99
 *         subtotal:
 *           type: number
 *           format: float
 *           example: 2599.98
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     
 *     OrderCreateRequest:
 *       type: object
 *       required:
 *         - customerId
 *         - items
 *       properties:
 *         customerId:
 *           type: integer
 *           example: 1
 *         notes:
 *           type: string
 *           example: "Entrega urgente"
 *         deliveryDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-20T10:30:00Z"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               unitPrice:
 *                 type: number
 *                 format: float
 *                 example: 1299.99
 *     
 *     # ===== SALES SCHEMAS =====
 *     Sale:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         saleNumber:
 *           type: string
 *           example: "SALE-2024-001"
 *         customerId:
 *           type: integer
 *           example: 1
 *         employeeId:
 *           type: integer
 *           example: 1
 *         storeId:
 *           type: integer
 *           example: 1
 *         totalAmount:
 *           type: number
 *           format: float
 *           example: 2599.98
 *         saleDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         paymentMethod:
 *           type: string
 *           enum: ["cash", "card", "transfer", "check"]
 *           example: "card"
 *         status:
 *           type: string
 *           enum: ["completed", "cancelled", "refunded"]
 *           example: "completed"
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *     
 *     SaleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         saleId:
 *           type: integer
 *           example: 1
 *         productId:
 *           type: integer
 *           example: 1
 *         quantity:
 *           type: integer
 *           example: 2
 *         unitPrice:
 *           type: number
 *           format: float
 *           example: 1299.99
 *         subtotal:
 *           type: number
 *           format: float
 *           example: 2599.98
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     
 *     # ===== EMPLOYEE SCHEMAS =====
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         email:
 *           type: string
 *           example: "juan.perez@wusap.com"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         position:
 *           type: string
 *           example: "Vendedor"
 *         department:
 *           type: string
 *           example: "Ventas"
 *         storeId:
 *           type: integer
 *           example: 1
 *         hireDate:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         salary:
 *           type: number
 *           format: float
 *           example: 35000.00
 *         isActive:
 *           type: boolean
 *           example: true
 *     
 *     # ===== LOCATION SCHEMAS =====
 *     Location:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Tienda Principal"
 *         address:
 *           type: string
 *           example: "Av. Principal 123"
 *         city:
 *           type: string
 *           example: "Ciudad de México"
 *         state:
 *           type: string
 *           example: "CDMX"
 *         country:
 *           type: string
 *           example: "México"
 *         postalCode:
 *           type: string
 *           example: "12345"
 *         phone:
 *           type: string
 *           example: "+52 55 1234 5678"
 *         email:
 *           type: string
 *           example: "tienda@wusap.com"
 *         isActive:
 *           type: boolean
 *           example: true
 *         manager:
 *           type: string
 *           example: "María García"
 *         openingHours:
 *           type: string
 *           example: "Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00"
 *     
 *     # ===== DASHBOARD SCHEMAS =====
 *     DashboardData:
 *       type: object
 *       properties:
 *         kpis:
 *           type: object
 *           properties:
 *             totalSales:
 *               type: number
 *               format: float
 *               example: 125000.50
 *             totalOrders:
 *               type: integer
 *               example: 245
 *             totalCustomers:
 *               type: integer
 *               example: 89
 *             averageOrderValue:
 *               type: number
 *               format: float
 *               example: 510.20
 *         salesByMonth:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 example: "2024-01"
 *               sales:
 *                 type: number
 *                 format: float
 *                 example: 25000.00
 *         topProducts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               productName:
 *                 type: string
 *                 example: "Laptop Dell XPS 13"
 *               quantity:
 *                 type: integer
 *                 example: 15
 *               revenue:
 *                 type: number
 *                 format: float
 *                 example: 19499.85
 *         employeeSales:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               employeeId:
 *                 type: integer
 *                 example: 1
 *               employeeName:
 *                 type: string
 *                 example: "Juan Pérez"
 *               totalSales:
 *                 type: number
 *                 format: float
 *                 example: 45000.00
 *               salesCount:
 *                 type: integer
 *                 example: 28
 *     
 *     # ===== PREDICTION SCHEMAS =====
 *     PredictionRequest:
 *       type: object
 *       required:
 *         - productId
 *         - days
 *       properties:
 *         productId:
 *           type: integer
 *           example: 1
 *         days:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           example: 30
 *         storeId:
 *           type: integer
 *           example: 1
 *     
 *     PredictionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         prediction:
 *           type: object
 *           properties:
 *             productId:
 *               type: integer
 *               example: 1
 *             productName:
 *               type: string
 *               example: "Laptop Dell XPS 13"
 *             predictedSales:
 *               type: number
 *               format: float
 *               example: 125.5
 *             periodDays:
 *               type: integer
 *               example: 30
 *             confidence:
 *               type: number
 *               format: float
 *               example: 0.85
 *             generatedAt:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00Z"
 *     
 *     # ===== COMMON SCHEMAS =====
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operación exitosa"
 *         data:
 *           type: object
 *           description: "Datos de respuesta específicos del endpoint"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Mensaje de error"
 *         details:
 *           type: object
 *           description: "Detalles adicionales del error"
 *     
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 100
 *             pages:
 *               type: integer
 *               example: 10
 */ 