/**
 * @swagger
 * # ===== INVENTORY ENDPOINTS =====
 * /inventory:
 *   get:
 *     summary: Obtener todo el inventario
 *     description: Retorna todo el inventario de productos del sistema
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filtrar solo productos con stock bajo
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: Filtrar por ID de producto específico
 *     responses:
 *       200:
 *         description: Inventario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear registro de inventario
 *     description: Crea un nuevo registro de cantidad de productos en el inventario. Requiere rol admin, manager, warehouse_manager u owner.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - storeId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               storeId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 50
 *               minimumStock:
 *                 type: integer
 *                 example: 10
 *               maximumStock:
 *                 type: integer
 *                 example: 100
 *               location:
 *                 type: string
 *                 example: "A-001"
 *     responses:
 *       201:
 *         description: Registro de inventario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registro de inventario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar inventario existente
 *     description: Edita la cantidad de inventario existente. Requiere rol admin, manager, warehouse_manager u owner.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - storeId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               storeId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 example: 75
 *               minimumStock:
 *                 type: integer
 *                 example: 15
 *               maximumStock:
 *                 type: integer
 *                 example: 120
 *               location:
 *                 type: string
 *                 example: "A-001"
 *     responses:
 *       200:
 *         description: Inventario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Inventario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /inventory/store:
 *   get:
 *     summary: Obtener inventario de la tienda del usuario
 *     description: Retorna el inventario de la tienda específica del usuario logueado (obtenida del token JWT)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventario de la tienda obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /inventory/store/products:
 *   get:
 *     summary: Obtener inventario de tienda con detalles de productos
 *     description: Retorna el inventario de la tienda del usuario con información detallada de los productos
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventario con detalles de productos obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/InventoryItem'
 *                       - type: object
 *                         properties:
 *                           productDetails:
 *                             $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /inventory/warehouse:
 *   get:
 *     summary: Obtener productos disponibles en el almacén
 *     description: Retorna los productos disponibles en el almacén principal (storeId = 1)
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productos del almacén obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InventoryItem'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /inventory/by-sandp:
 *   get:
 *     summary: Obtener inventario por tienda y producto específico
 *     description: Obtiene un registro específico de inventario filtrado por tienda y producto
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la tienda
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Registro de inventario específico obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/InventoryItem'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * # ===== EMPLOYEE ENDPOINTS =====
 * /employees:
 *   get:
 *     summary: Obtener todos los empleados
 *     description: Retorna lista de empleados del sistema. Solo accesible para administradores.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Actualizar empleado
 *     description: Actualiza la información de un empleado específico. Solo accesible para administradores.
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del empleado a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez Actualizado"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez.new@wusap.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               position:
 *                 type: string
 *                 example: "Vendedor Senior"
 *               department:
 *                 type: string
 *                 example: "Ventas"
 *               salary:
 *                 type: number
 *                 format: float
 *                 example: 40000.00
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Empleado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Empleado actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * # ===== LOCATION ENDPOINTS =====
 * /locations:
 *   get:
 *     summary: Obtener todas las ubicaciones/tiendas
 *     description: Retorna lista de todas las ubicaciones y tiendas. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ubicaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Location'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear nueva ubicación/tienda
 *     description: Crea una nueva ubicación o tienda en el sistema. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - city
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tienda Centro"
 *               address:
 *                 type: string
 *                 example: "Av. Principal 456"
 *               city:
 *                 type: string
 *                 example: "Guadalajara"
 *               state:
 *                 type: string
 *                 example: "Jalisco"
 *               country:
 *                 type: string
 *                 example: "México"
 *               postalCode:
 *                 type: string
 *                 example: "44100"
 *               phone:
 *                 type: string
 *                 example: "+52 33 1234 5678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "centro@wusap.com"
 *               manager:
 *                 type: string
 *                 example: "Ana Rodríguez"
 *               openingHours:
 *                 type: string
 *                 example: "Lun-Dom: 10:00-22:00"
 *     responses:
 *       201:
 *         description: Ubicación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ubicación creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     summary: Obtener ubicación por ID
 *     description: Retorna los detalles de una ubicación específica. Accesible para admin, manager, owner, warehouse_manager y sales.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación
 *     responses:
 *       200:
 *         description: Detalles de la ubicación obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 *   put:
 *     summary: Actualizar ubicación
 *     description: Actualiza la información de una ubicación específica. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Tienda Centro Actualizada"
 *               address:
 *                 type: string
 *                 example: "Av. Principal 456-B"
 *               city:
 *                 type: string
 *                 example: "Guadalajara"
 *               state:
 *                 type: string
 *                 example: "Jalisco"
 *               country:
 *                 type: string
 *                 example: "México"
 *               postalCode:
 *                 type: string
 *                 example: "44100"
 *               phone:
 *                 type: string
 *                 example: "+52 33 1234 5678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "centro.updated@wusap.com"
 *               manager:
 *                 type: string
 *                 example: "Ana Rodríguez"
 *               openingHours:
 *                 type: string
 *                 example: "Lun-Dom: 9:00-23:00"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Ubicación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ubicación actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Location'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar ubicación
 *     description: Elimina una ubicación del sistema. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación a eliminar
 *     responses:
 *       200:
 *         description: Ubicación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ubicación eliminada exitosamente"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: No se puede eliminar la ubicación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "No se puede eliminar la ubicación porque tiene empleados o inventario asociado"
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /locations/{id}/employees:
 *   get:
 *     summary: Obtener empleados por ubicación
 *     description: Retorna la lista de empleados de una ubicación específica. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la ubicación
 *     responses:
 *       200:
 *         description: Empleados de la ubicación obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /locations/check-table:
 *   get:
 *     summary: Verificar estructura de tabla de ubicaciones
 *     description: Endpoint temporal para debugging - verifica la estructura de la tabla de ubicaciones. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estructura de tabla verificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tableStructure:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /locations/create-table:
 *   post:
 *     summary: Crear tabla de ubicaciones
 *     description: Endpoint temporal para setup - crea la tabla de ubicaciones en la base de datos. Solo accesible para administradores.
 *     tags: [Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Tabla creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tabla de ubicaciones creada exitosamente"
 *       400:
 *         description: La tabla ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * # ===== PREDICTION ENDPOINTS =====
 * /predicciones:
 *   get:
 *     summary: Obtener predicciones de ventas
 *     description: Utiliza IA para obtener predicciones de ventas. Solo accesible para admin, owner, manager y warehouse_manager.
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: ID del producto para predicción específica
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Número de días para la predicción
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: integer
 *         description: ID de la tienda (opcional, usa la del usuario si no se especifica)
 *     responses:
 *       200:
 *         description: Predicciones obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/PredictionResponse'
 *                     - type: array
 *                       items:
 *                         $ref: '#/components/schemas/PredictionResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Producto no encontrado"
 *       500:
 *         description: Error interno del servidor o del modelo de IA
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * # ===== TEST ENDPOINTS =====
 * /test:
 *   get:
 *     summary: Endpoint de prueba
 *     description: Endpoint simple para verificar que la API está funcionando
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is working!"
 *       500:
 *         description: Error interno del servidor
 */

/**
 * @swagger
 * /test-hana:
 *   get:
 *     summary: Probar conexión con SAP HANA
 *     description: Endpoint para verificar la conectividad con la base de datos SAP HANA
 *     tags: [Test]
 *     responses:
 *       200:
 *         description: Conexión exitosa con HANA DB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connected to HANA DB"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       "Current Time":
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15 10:30:00.000000000"
 *       500:
 *         description: Error de conexión con HANA DB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error connecting to HANA DB"
 */ 