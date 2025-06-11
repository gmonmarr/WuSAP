/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Obtener datos completos del dashboard
 *     description: Retorna todos los datos necesarios para el dashboard principal, incluyendo KPIs, gráficos y métricas. Solo accesible para admin, owner, manager y warehouse_manager.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: ["today", "week", "month", "quarter", "year"]
 *           default: "month"
 *         description: Período de tiempo para los datos del dashboard
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio personalizada (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin personalizada (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Datos del dashboard obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardData'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /dashboard/kpis:
 *   get:
 *     summary: Obtener KPIs del dashboard
 *     description: Retorna solo los indicadores clave de rendimiento (KPIs) para una vista rápida. Solo accesible para admin, owner, manager y warehouse_manager.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: ["today", "week", "month", "quarter", "year"]
 *           default: "month"
 *         description: Período de tiempo para los KPIs
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio personalizada (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin personalizada (YYYY-MM-DD)
 *       - in: query
 *         name: compareWithPrevious
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir comparación con período anterior
 *     responses:
 *       200:
 *         description: KPIs obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSales:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                           format: float
 *                           example: 125000.50
 *                         previous:
 *                           type: number
 *                           format: float
 *                           example: 110000.25
 *                         change:
 *                           type: number
 *                           format: float
 *                           example: 13.64
 *                         changeType:
 *                           type: string
 *                           enum: ["increase", "decrease", "stable"]
 *                           example: "increase"
 *                     totalOrders:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 245
 *                         previous:
 *                           type: integer
 *                           example: 220
 *                         change:
 *                           type: number
 *                           format: float
 *                           example: 11.36
 *                         changeType:
 *                           type: string
 *                           example: "increase"
 *                     totalCustomers:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: integer
 *                           example: 89
 *                         previous:
 *                           type: integer
 *                           example: 78
 *                         change:
 *                           type: number
 *                           format: float
 *                           example: 14.10
 *                         changeType:
 *                           type: string
 *                           example: "increase"
 *                     averageOrderValue:
 *                       type: object
 *                       properties:
 *                         current:
 *                           type: number
 *                           format: float
 *                           example: 510.20
 *                         previous:
 *                           type: number
 *                           format: float
 *                           example: 500.00
 *                         change:
 *                           type: number
 *                           format: float
 *                           example: 2.04
 *                         changeType:
 *                           type: string
 *                           example: "increase"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /dashboard/employees:
 *   get:
 *     summary: Obtener rendimiento de ventas por empleado
 *     description: Retorna las estadísticas de ventas agrupadas por empleado para análisis de rendimiento. Solo accesible para admin, owner, manager y warehouse_manager.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: ["today", "week", "month", "quarter", "year"]
 *           default: "month"
 *         description: Período de tiempo para las estadísticas
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio personalizada (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin personalizada (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Número máximo de empleados a retornar
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ["totalSales", "salesCount", "averageSale"]
 *           default: "totalSales"
 *         description: Campo por el cual ordenar los resultados
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Estadísticas de empleados obtenidas exitosamente
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
 *                     type: object
 *                     properties:
 *                       employeeId:
 *                         type: integer
 *                         example: 1
 *                       employeeName:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       employeePosition:
 *                         type: string
 *                         example: "Vendedor Senior"
 *                       totalSales:
 *                         type: number
 *                         format: float
 *                         example: 45000.00
 *                       salesCount:
 *                         type: integer
 *                         example: 28
 *                       averageSale:
 *                         type: number
 *                         format: float
 *                         example: 1607.14
 *                       topProduct:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                             example: 5
 *                           productName:
 *                             type: string
 *                             example: "Smartphone iPhone 15"
 *                           quantity:
 *                             type: integer
 *                             example: 12
 *                       performanceRank:
 *                         type: integer
 *                         example: 1
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalEmployees:
 *                       type: integer
 *                       example: 15
 *                     totalSalesAmount:
 *                       type: number
 *                       format: float
 *                       example: 325000.00
 *                     averageSalesPerEmployee:
 *                       type: number
 *                       format: float
 *                       example: 21666.67
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 